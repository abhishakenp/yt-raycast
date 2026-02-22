// src/services/paymentService.ts
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

export interface CheckoutSessionParams {
  userId: string;
  priceId: string; // Stripe Price ID for the selected plan
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout Session for a subscription.
 */
export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: CheckoutSessionParams) {
  // Ensure the user exists and fetch/create Stripe customer
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create the Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { userId },
  });

  return session.url;
}

/**
 * Creates a Stripe Billing Portal Session so users can manage their subscription.
 */
export async function createPortalSession(userId: string, returnUrl: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user.stripeCustomerId) {
    throw new Error('User does not have a Stripe customer ID');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return portalSession.url;
}

/**
 * Retrieves the current subscription status for a user.
 */
export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!user.stripeSubscriptionId) {
    return { status: 'inactive' };
  }

  const subscription = await stripe.subscriptions.retrieve(
    user.stripeSubscriptionId
  );

  // Keep local DB in sync
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: subscription.status,
      stripeSubscriptionId: subscription.id,
    },
  });

  return { status: subscription.status };
}

// src/routes/paymentRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
} from '../services/paymentService';

const router = Router();

/**
 * POST /api/payments/checkout
 * Body: { priceId: string, successUrl: string, cancelUrl: string }
 * Requires authenticated user (req.user.id)
 */
router.post(
  '/checkout',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;
      const userId = (req as any).user.id; // Assuming auth middleware attaches user

      const sessionUrl = await createCheckoutSession({
        userId,
        priceId,
        successUrl,
        cancelUrl,
      });

      res.json({ url: sessionUrl });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/payments/portal?returnUrl=...
 * Returns a URL to the Stripe Billing Portal.
 */
router.get(
  '/portal',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const returnUrl = req.query.returnUrl as string;
      const userId = (req as any).user.id;

      const portalUrl = await createPortalSession(userId, returnUrl);
      res.json({ url: portalUrl });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/payments/status
 * Returns current subscription status.
 */
router.get(
  '/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const status = await getSubscriptionStatus(userId);
      res.json(status);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

// src/webhooks/stripeWebhook.ts
import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

/**
 * Stripe webhook handler.
 * Configure the endpoint in Stripe Dashboard and set the secret in STRIPE_WEBHOOK_SECRET.
 */
export async function stripeWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const rawBody = (req as any).rawBody; // Ensure raw body is captured by middleware
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find the user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          },
        });
      }
      break;
    }

    // Add more event types as needed (e.g., invoice.payment_failed)
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
}

// src/middleware/rawBodyMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import getRawBody from 'raw-body';

/**
 * Middleware to capture the raw request body for Stripe webhook verification.
 * Must be placed before any body parsers for the webhook route.
 */
export function rawBodyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.originalUrl === '/api/webhooks/stripe') {
    getRawBody(
      req,
      {
        encoding: true,
      },
      (err, string) => {
        if (err) return next(err);
        (req as any).rawBody = string;
        next();
      }
    );
  } else {
    next();
  }
}

// src/app.ts (excerpt showing integration)
import express from 'express';
import paymentRoutes from './routes/paymentRoutes';
import { stripeWebhookHandler } from './webhooks/stripeWebhook';
import { rawBodyMiddleware } from './middleware/rawBodyMiddleware';

const app = express();

// JSON parser for normal routes
app.use(express.json());

// Raw body parser for Stripe webhook
app.use(rawBodyMiddleware);

// Payment routes (protected by auth middleware elsewhere)
app.use('/api/payments', paymentRoutes);

// Stripe webhook endpoint (no auth)
app.post('/api/webhooks/stripe', stripeWebhookHandler);

export default app;