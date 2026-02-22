import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Transaction, TransactionStatus, TransactionType } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import braintree from 'braintree';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

// Braintree gateway configuration (replace with real env vars)
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
});

/**
 * Middleware to handle validation results
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * Create a new transaction (e.g., user purchases Lids or pays for an event)
 */
router.post(
  '/',
  [
    body('userId').isUUID(),
    body('type').isIn(Object.values(TransactionType)),
    body('amount').isFloat({ gt: 0 }),
    body('currency').isString().isLength({ min: 3, max: 3 }),
    body('metadata').optional().isObject(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { userId, type, amount, currency, metadata } = req.body;

    // Generate a unique reference for the transaction
    const reference = `txn_${uuidv4()}`;

    // Create a pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        id: reference,
        userId,
        type,
        amount: Number(amount),
        currency,
        status: TransactionStatus.PENDING,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    // If the transaction requires external payment (e.g., buying Lids)
    if (type === TransactionType.PURCHASE) {
      try {
        const result = await gateway.transaction.sale({
          amount: amount.toString(),
          paymentMethodNonce: 'fake-valid-nonce', // In production, receive nonce from client
          options: {
            submitForSettlement: true,
          },
        });

        if (result.success) {
          // Update transaction as completed
          await prisma.transaction.update({
            where: { id: reference },
            data: {
              status: TransactionStatus.COMPLETED,
              externalId: result.transaction.id,
            },
          });

          // Credit user's Lids balance (assuming a separate Credit model)
          await prisma.credit.upsert({
            where: { userId },
            update: {
              balance: { increment: Number(amount) }, // 1:1 conversion for demo
            },
            create: {
              userId,
              balance: Number(amount),
            },
          });

          return res.status(201).json({ transaction: { ...transaction, status: TransactionStatus.COMPLETED } });
        } else {
          // Mark transaction as failed
          await prisma.transaction.update({
            where: { id: reference },
            data: { status: TransactionStatus.FAILED, failureReason: result.message },
          });
          return res.status(400).json({ error: result.message });
        }
      } catch (err) {
        await prisma.transaction.update({
          where: { id: reference },
          data: { status: TransactionStatus.FAILED, failureReason: (err as Error).message },
        });
        return res.status(500).json({ error: 'Payment processing error' });
      }
    }

    // For non‑payment transactions (e.g., internal transfers)
    await prisma.transaction.update({
      where: { id: reference },
      data: { status: TransactionStatus.COMPLETED },
    });

    res.status(201).json({ transaction });
  }
);

/**
 * Get a single transaction by its ID (admin or owner)
 */
router.get(
  '/:id',
  [param('id').isString()],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id; // Assuming auth middleware attaches user

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Owner or admin can view
    if (transaction.userId !== userId && !(req as any).user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ transaction });
  }
);

/**
 * List transactions for the authenticated user (paginated)
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      transactions,
    });
  }
);

/**
 * Braintree webhook endpoint to handle asynchronous events (e.g., settlement)
 */
router.post(
  '/webhook',
  body('bt_signature').isString(),
  body('bt_payload').isString(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { bt_signature, bt_payload } = req.body;

    try {
      const webhookNotification = await gateway.webhookNotification.parse(
        bt_signature,
        bt_payload
      );

      if (webhookNotification.kind === braintree.WebhookNotification.Kind.TransactionSettled) {
        const braintreeTxn = webhookNotification.transaction;
        const txn = await prisma.transaction.findFirst({
          where: { externalId: braintreeTxn.id },
        });

        if (txn && txn.status !== TransactionStatus.COMPLETED) {
          await prisma.transaction.update({
            where: { id: txn.id },
            data: { status: TransactionStatus.COMPLETED },
          });
        }
      }

      // Respond with 200 OK to acknowledge receipt
      res.sendStatus(200);
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.sendStatus(500);
    }
  }
);

/**
 * Admin endpoint to manually update transaction status (e.g., for refunds)
 */
router.patch(
  '/:id/status',
  [
    param('id').isString(),
    body('status').isIn(Object.values(TransactionStatus)),
    body('reason').optional().isString(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    if (!(req as any).user?.isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status,
        failureReason: reason ?? transaction.failureReason,
      },
    });

    res.json({ transaction: updated });
  }
);

export default router;