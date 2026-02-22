<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * POST /payments/create-checkout-session
 * Body: { userId: string, priceId: string }
 * Creates a Stripe Checkout Session for a subscription.
 */
router.post(
  '/create-checkout-session',
  body('userId').isString(),
  body('priceId').isString(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, priceId } = req.body;

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId,
        priceId,
      },
    });

    // Store a pending subscription record
    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: '',
        stripeCustomerId: '',
        status: SubscriptionStatus.PENDING,
        priceId,
        nextBillingDate: null,
      },
    });

    res.json({ url: session.url });
  })
);

/**
 * POST /payments/webhook
 * Stripe webhook endpoint to handle subscription lifecycle events.
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed.', err);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, priceId } = session.metadata as {
          userId: string;
          priceId: string;
        };

        // Retrieve the subscription created by the Checkout Session
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        // Update subscription record
        await prisma.subscription.updateMany({
          where: {
            userId,
            priceId,
            status: SubscriptionStatus.PENDING,
          },
          data: {
            stripeSubscriptionId,
            stripeCustomerId,
            status: SubscriptionStatus.ACTIVE,
            nextBillingDate: new Date(
              (await stripe.subscriptions.retrieve(stripeSubscriptionId)).current_period_end *
                1000
            ),
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            nextBillingDate: new Date(invoice.next_payment_attempt! * 1000),
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: SubscriptionStatus.PAST_DUE },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: SubscriptionStatus.CANCELED },
        });
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  })
);

/**
 * GET /payments/subscription/:userId
 * Returns the current subscription status for a user.
 */
router.get(
  '/subscription/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    res.json({
      status: subscription.status,
      priceId: subscription.priceId,
      nextBillingDate: subscription.nextBillingDate,
    });
  })
);

/**
 * POST /payments/cancel
 * Body: { userId: string }
 * Cancels an active subscription.
 */
router.post(
  '/cancel',
  body('userId').isString(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Active subscription not found' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.CANCELING },
    });

    res.json({ message: 'Subscription will cancel at period end' });
  })
);

export default router;