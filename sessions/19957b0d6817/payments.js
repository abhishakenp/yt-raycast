import express, { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { prisma } from "../prisma/client"; // Prisma client instance
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const DOMAIN = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Create or retrieve a Stripe Customer for the authenticated user.
 */
async function getOrCreateCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * POST /payments/create-checkout-session
 * Body: { priceId: string } // Stripe Price ID for the plan
 * Returns a Stripe Checkout Session URL.
 */
router.post(
  "/create-checkout-session",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { priceId } = req.body;
      if (!priceId) {
        return res.status(400).json({ error: "priceId is required" });
      }

      const userId = (req as any).user.id;
      const customerId = await getOrCreateCustomer(userId);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${DOMAIN}/pricing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}/pricing?canceled=true`,
        metadata: { userId },
      });

      res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /payments/create-portal-session
 * Returns a Stripe Billing Portal URL for the user to manage subscription.
 */
router.post(
  "/create-portal-session",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });

      if (!user?.stripeCustomerId) {
        return res
          .status(400)
          .json({ error: "No Stripe customer linked to this user" });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${DOMAIN}/account`,
      });

      res.json({ url: portalSession.url });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Stripe webhook endpoint to handle subscription lifecycle events.
 * Must be configured in Stripe Dashboard.
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      if (!sig) throw new Error("Missing Stripe signature");
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err);
      return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (session.subscription && userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              plan: "paid", // you may map priceId to a plan enum
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId:
                event.type === "customer.subscription.deleted"
                  ? null
                  : subscription.id,
              plan:
                event.type === "customer.subscription.deleted"
                  ? "free"
                  : "paid",
            },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

/**
 * GET /payments/status
 * Returns the current subscription status for the authenticated user.
 */
router.get(
  "/status",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          stripeSubscriptionId: true,
          plan: true,
        },
      });

      if (!user?.stripeSubscriptionId) {
        return res.json({ plan: "free", active: false });
      }

      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      res.json({
        plan: user.plan,
        active: subscription.status === "active",
        currentPeriodEnd: subscription.current_period_end,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;