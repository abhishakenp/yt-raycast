<number> {
    const credit = await prisma.credit.findUnique({
      where: { userId },
    });
    return credit?.balance ?? 0;
  }

  /**
   * Add Lids to a user's balance (e.g., after successful purchase).
   */
  static async addCredits(userId: string, amount: number, description?: string, referenceId?: string) {
    if (amount <= 0) throw new BadRequestError('Amount must be positive');

    await prisma.$transaction(async (tx) => {
      const credit = await tx.credit.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount,
          type: TransactionType.PURCHASE,
          referenceId,
          description: description ?? 'Lids purchase',
        },
      });
    });
  }

  /**
   * Deduct Lids from a user's balance (e.g., buying a Joker).
   */
  static async spendCredits(userId: string, amount: number, description?: string, referenceId?: string) {
    if (amount <= 0) throw new BadRequestError('Amount must be positive');

    await prisma.$transaction(async (tx) => {
      const credit = await tx.credit.findUnique({ where: { userId } });
      const currentBalance = credit?.balance ?? 0;

      if (currentBalance < amount) {
        throw new BadRequestError('Insufficient Lids balance');
      }

      await tx.credit.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: -amount,
          type: TransactionType.SPEND,
          referenceId,
          description: description ?? 'Lids spent',
        },
      });
    });
  }

  /**
   * Process a Braintree payment and credit the user upon success.
   */
  static async purchaseCredits(userId: string, nonce: string, amountInCents: number) {
    // amountInCents is the amount the user pays (e.g., $5.00 => 500)
    const result = await BraintreeGateway.transaction.sale({
      amount: (amountInCents / 100).toFixed(2),
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    });

    if (!result.success) {
      throw new BadRequestError('Payment failed');
    }

    // Convert payment amount to Lids (1 cent = 1 Lid for simplicity)
    const lidsToCredit = amountInCents; // 1:1 mapping; adjust as needed

    await this.addCredits(userId, lidsToCredit, 'Purchase via Braintree', result.transaction.id);
    return {
      transactionId: result.transaction.id,
      lidsCredited: lidsToCredit,
    };
  }

  /**
   * Retrieve paginated transaction history.
   */
  static async getTransactions(userId: string, skip = 0, take = 20) {
    const [total, records] = await Promise.all([
      prisma.transaction.count({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { total, records };
  }
}

// -------------------------------------------------



// src/controllers/creditController.ts
// -------------------------------------------------
import { Request, Response, NextFunction } from 'express';
import { CreditService } from '../services/creditService';
import { asyncHandler } from '../utils/asyncHandler';

export const getBalance = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const balance = await CreditService.getBalance(userId);
  res.json({ balance });
});

export const purchaseCredits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { paymentMethodNonce, amountInCents } = req.body;

  if (!paymentMethodNonce || typeof amountInCents !== 'number') {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const result = await CreditService.purchaseCredits(userId, paymentMethodNonce, amountInCents);
  res.json({ message: 'Purchase successful', ...result });
});

export const spendCredits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { amount, description, referenceId } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  await CreditService.spendCredits(userId, amount, description, referenceId);
  res.json({ message: 'Lids deducted successfully' });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 20;

  const data = await CreditService.getTransactions(userId, skip, take);
  res.json(data);
});

// -------------------------------------------------



// src/routes/creditRoutes.ts
// -------------------------------------------------
import { Router } from 'express';
import {
  getBalance,
  purchaseCredits,
  spendCredits,
  getTransactions,
} from '../controllers/creditController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // all routes require authentication

router.get('/balance', getBalance);
router.post('/purchase', purchaseCredits);
router.post('/spend', spendCredits);
router.get('/transactions', getTransactions);

export default router;

// -------------------------------------------------



// src/utils/braintree.ts
// -------------------------------------------------
import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: process.env.BRAINTREE_ENV === 'Production' ? braintree.Environment.Production : braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
});

export const BraintreeGateway = {
  transaction: {
    sale: (options: braintree.TransactionSaleRequest) => gateway.transaction.sale(options),
    // add other needed methods (refund, find, etc.) as needed
  },
  clientToken: {
    generate: (options?: braintree.ClientTokenGenerateRequest) => gateway.clientToken.generate(options),
  },
};

export default gateway;

// -------------------------------------------------



// src/utils/asyncHandler.ts
// -------------------------------------------------
import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// -------------------------------------------------



// src/utils/errors.ts
// -------------------------------------------------
export class BadRequestError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// -------------------------------------------------



// src/middleware/auth.ts
// -------------------------------------------------
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UnauthorizedError } from '../utils/errors';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing token'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedError('User not found');

    (req as AuthenticatedRequest).user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid token'));
  }
};

// -------------------------------------------------



// src/app.ts
// -------------------------------------------------
import express from 'express';
import creditRoutes from './routes/creditRoutes';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use('/api/credits', creditRoutes);

// Global error handler
app.use(errorHandler);

export default app;

// -------------------------------------------------



// src/middleware/errorHandler.ts
// -------------------------------------------------
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
};

// -------------------------------------------------



// src/server.ts
// -------------------------------------------------
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

// -------------------------------------------------



// .env.example
// -------------------------------------------------
# Server
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lidmi

# Braintree
BRAINTREE_ENV=Sandbox
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key

// -------------------------------------------------



// README.md (excerpt for virtual currency)
// -------------------------------------------------
# Virtual Currency (Lids) API

## Endpoints

| Method | Path                     | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | `/api/credits/balance`   | Get current Lids balance for the user    |
| POST   | `/api/credits/purchase` | Purchase Lids via Braintree (payload: `paymentMethodNonce`, `amountInCents`) |
| POST   | `/api/credits/spend`    | Spend Lids (payload: `amount`, optional `description`, `referenceId`) |
| GET    | `/api/credits/transactions` | Paginated transaction history (`skip`, `take` query params) |

All routes require a valid JWT `Authorization: Bearer <token>` header.

## Business Rules

- **1 cent = 1 Lid** (adjustable in `CreditService.purchaseCredits`).
- Users cannot spend more Lids than they have.
- Every credit change creates a `Transaction` record.
- Purchases are processed through Braintree; only successful settlements credit the user.

## Running Locally

```bash
cp .env.example .env
# edit .env with your credentials
npm install
npx prisma migrate dev --name init
npm run dev
```

## Testing Purchase Flow

1. Obtain a client token from Braintree (frontend integration).
2. Generate a payment nonce using the client SDK.
3. POST to `/api/credits/purchase` with `{ "paymentMethodNonce": "...", "amountInCents": 500 }`.

Successful response:

```json
{
  "message": "Purchase successful",
  "transactionId": "the_braintree_tx_id",
  "lidsCredited": 500
}
```

---

// -------------------------------------------------