<string> {
    const user = await UserModel.findById(userId).select('braintreeCustomerId').lean();
    const tokenRequest: braintree.ClientTokenRequest = {};

    if (user?.braintreeCustomerId) {
      tokenRequest.customerId = user.braintreeCustomerId;
    }

    const { clientToken } = await gateway.clientToken.generate(tokenRequest);
    return clientToken;
  }

  /**
   * Creates a Braintree customer if one does not exist yet.
   */
  static async ensureCustomer(userId: string, email: string): Promise<string> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.braintreeCustomerId) return user.braintreeCustomerId;

    const result = await gateway.customer.create({
      email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    if (!result.success) {
      throw new Error(`Braintree customer creation failed: ${result.message}`);
    }

    user.braintreeCustomerId = result.customer.id;
    await user.save();
    return result.customer.id;
  }

  /**
   * Processes a transaction using a payment method nonce.
   * It creates a Transaction document, updates user credits, and sends a notification.
   */
  static async processTransaction(
    userId: string,
    eventId: string,
    amount: string,
    paymentMethodNonce: string,
    options?: { submitForSettlement?: boolean }
  ) {
    // Ensure the user has a Braintree customer record
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const customerId = await this.ensureCustomer(userId, user.email);

    // Create the transaction in Braintree
    const saleRequest: braintree.TransactionSaleRequest = {
      amount,
      paymentMethodNonce,
      customerId,
      options: {
        submitForSettlement: options?.submitForSettlement ?? true,
        storeInVaultOnSuccess: true,
      },
    };

    const result = await gateway.transaction.sale(saleRequest);

    if (!result.success) {
      // You may want to log result.errors for debugging
      throw new Error(`Transaction failed: ${result.message}`);
    }

    const btTransaction = result.transaction!;

    // Persist transaction in our DB
    const transaction = await TransactionModel.create({
      user: userId,
      event: eventId,
      braintreeId: btTransaction.id,
      amount: parseFloat(btTransaction.amount),
      status: btTransaction.status,
      createdAt: new Date(btTransaction.createdAt),
    });

    // Update user's virtual currency (Lids) if the transaction is successful
    if (btTransaction.status === 'submitted_for_settlement' || btTransaction.status === 'settling') {
      const creditAmount = parseFloat(btTransaction.amount);
      await CreditModel.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: creditAmount } },
        { upsert: true, new: true }
      );

      // Notify the user
      await NotificationService.send({
        userId,
        title: 'Payment Successful',
        message: `Your payment of $${creditAmount.toFixed(2)} was processed successfully.`,
        type: 'payment',
        data: { transactionId: transaction._id, eventId },
      });
    }

    return transaction;
  }

  /**
   * Handles Braintree webhook notifications.
   * This method should be wired to an Express route that receives POST requests from Braintree.
   */
  static async handleWebhook(req: Request) {
    const signature = req.headers['bt-signature'] as string;
    const payload = req.body.bt_payload as string;

    const webhookNotification = await gateway.webhookNotification.parse(
      signature,
      payload
    );

    // Example handling of transaction settlement
    if (webhookNotification.kind === braintree.WebhookNotification.Kind.TransactionSettled) {
      const btTx = webhookNotification.transaction!;
      const transaction = await TransactionModel.findOneAndUpdate(
        { braintreeId: btTx.id },
        { status: btTx.status },
        { new: true }
      );

      if (transaction) {
        // Possibly credit the user again if settlement was delayed
        // (In many cases we already credited on submitForSettlement)
        // Here we just ensure the status is up‑to‑date.
      }
    }

    // Add handling for other webhook kinds as needed (dispute, subscription, etc.)

    return { received: true };
  }
}

// src/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BraintreeService } from '../services/braintree.service';
import { EventModel } from '../models/event.model';

export class PaymentController {
  /**
   * GET /api/payments/token/:userId
   * Returns a client token for the front‑end Braintree SDK.
   */
  static async getClientToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const token = await BraintreeService.generateClientToken(userId);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payments/checkout
   * Body: { userId, eventId, amount, paymentMethodNonce }
   */
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, eventId, amount, paymentMethodNonce } = req.body;

      // Basic validation
      if (!userId || !eventId || !amount || !paymentMethodNonce) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Ensure the event exists and is joinable
      const event = await EventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const transaction = await BraintreeService.processTransaction(
        userId,
        eventId,
        amount,
        paymentMethodNonce
      );

      res.json({ success: true, transaction });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payments/webhook
   * Braintree will POST webhook notifications to this endpoint.
   */
  static async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BraintreeService.handleWebhook(req);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

// src/routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// Client token endpoint (authenticated route in real app)
router.get('/token/:userId', PaymentController.getClientToken);

// Checkout endpoint (expects authenticated user)
router.post('/checkout', PaymentController.checkout);

// Braintree webhook endpoint (no auth, but must verify signature inside service)
router.post('/webhook', PaymentController.webhook);

export default router;

// src/models/transaction.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ITransaction extends Document {
  user: string;
  event: string;
  braintreeId: string;
  amount: number;
  status: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  braintreeId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);

// src/models/credit.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ICredit extends Document {
  user: string;
  balance: number; // Lids balance
  updatedAt: Date;
}

const CreditSchema = new Schema<ICredit>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

CreditSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const CreditModel = model<ICredit>('Credit', CreditSchema);

// src/services/notification.service.ts
import { NotificationModel } from '../models/notification.model';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}

export class NotificationService {
  static async send(payload: NotificationPayload) {
    await NotificationModel.create({
      user: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      data: payload.data,
      read: false,
      createdAt: new Date(),
    });
    // In a real app you would also push via websockets, email, etc.
  }
}

// src/models/notification.model.ts
import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  user: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const NotificationModel = model<INotification>('Notification', NotificationSchema);

// src/app.ts (excerpt showing integration)
import express from 'express';
import bodyParser from 'body-parser';
import paymentRoutes from './routes/payment.routes';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register payment routes under /api/payments
app.use('/api/payments', paymentRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;