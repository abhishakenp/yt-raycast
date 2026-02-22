import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { buffer } from 'micro';

const router = express.Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
async function getOrCreateCustomer(userId, email) {
  // Try to find an existing Stripe customer ID stored in the user record
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new Stripe customer and store the ID
  const customer = await stripe.customers.create({
    email,
    metadata: { userId: userId.toString() },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

async function createSubscription(userId, priceId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const customerId = await getOrCreateCustomer(userId, user.email);

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
    metadata: { userId: userId.toString() },
  });

  // Persist subscription in our DB
  await prisma.subscription.create({
    data: {
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceId,
    },
  });

  return subscription;
}

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// Create a Stripe Checkout Session for a given plan
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId, planId } = req.body;

    // Validate input
    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing userId or planId' });
    }

    // Get the plan and its Stripe price ID
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { stripePriceId: true, name: true },
    });

    if (!plan?.stripePriceId) {
      return res.status(404).json({ error: 'Plan not found or not configured for Stripe' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customerId = await getOrCreateCustomer(userId, user.email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook endpoint
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

// -----------------------------------------------------------------------------
// Event Handlers
// -----------------------------------------------------------------------------
async function handleCheckoutSessionCompleted(session) {
  const userId = parseInt(session.metadata.userId, 10);
  const planId = parseInt(session.metadata.planId, 10);
  const subscriptionId = session.subscription;

  // Retrieve the subscription to get price details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });

  const priceId = subscription.items.data[0].price.id;

  // Upsert subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscriptionId },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceId,
    },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceId,
    },
  });

  // Optionally send a welcome email here using your email service
  // await sendWelcomeEmail(userId);
}

async function handleInvoicePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'active',
    },
  });
}

async function handleInvoicePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'past_due',
    },
  });
}

async function handleSubscriptionUpdated(subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
    },
  });
}

// -----------------------------------------------------------------------------
// Export Router
// -----------------------------------------------------------------------------
export default router;