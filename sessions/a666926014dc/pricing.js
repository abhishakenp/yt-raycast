<PricingPlan[]> {
    return await getRepository(PricingPlan).find({ order: { price: 'ASC' } });
  }

  static async getPlanById(id: number): Promise<PricingPlan | undefined> {
    return await getRepository(PricingPlan).findOne(id);
  }

  static async createSubscription(
    userId: number,
    paymentMethodNonce: string,
    planId: number,
  ): Promise<braintree.Subscription> {
    const plan = await this.getPlanById(planId);
    if (!plan) throw new Error('Pricing plan not found');

    // Create or fetch a Braintree customer
    const customerResult = await gateway.customer.find(userId.toString()).catch(() => null);
    let customerId: string;
    if (customerResult) {
      customerId = customerResult.id;
    } else {
      const createCust = await gateway.customer.create({
        id: userId.toString(),
        firstName: 'User',
        // In a real app you would pass proper user data here
      });
      if (!createCust.success) throw new Error('Failed to create Braintree customer');
      customerId = createCust.customer.id;
    }

    // Add payment method to the customer
    const paymentResult = await gateway.paymentMethod.create({
      customerId,
      paymentMethodNonce,
      options: { makeDefault: true },
    });
    if (!paymentResult.success) throw new Error('Failed to add payment method');

    // Create subscription
    const subscriptionResult = await gateway.subscription.create({
      paymentMethodToken: paymentResult.paymentMethod.token,
      planId: `plan_${plan.id}`, // Braintree plan identifier must match your Braintree dashboard
      price: plan.price.toString(),
    });

    if (!subscriptionResult.success) throw new Error('Subscription creation failed');
    return subscriptionResult.subscription;
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['bt-signature'] as string;
      const payload = req.body; // raw body string (express must be configured with raw parser for Braintree)

      const webhookNotification = await gateway.webhookNotification.parse(
        signature,
        payload,
      );

      // Process different kinds of webhook events
      switch (webhookNotification.kind) {
        case braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully:
          // Update your DB: mark subscription as active / record transaction
          break;
        case braintree.WebhookNotification.Kind.SubscriptionCanceled:
          // Update DB: mark subscription as canceled
          break;
        // Add more cases as needed
        default:
          break;
      }

      res.status(200).send('Webhook received');
    } catch (err) {
      next(err);
    }
  }
}

// ---------- Router ----------
export const pricingRouter = Router();

// GET /pricing/plans - list all available plans
pricingRouter.get('/plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await PricingService.listPlans();
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

// POST /pricing/subscribe - create a subscription for a user
// Expected body: { userId: number, paymentMethodNonce: string, planId: number }
pricingRouter.post('/subscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, paymentMethodNonce, planId } = req.body;
    if (!userId || !paymentMethodNonce || !planId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subscription = await PricingService.createSubscription(
      Number(userId),
      paymentMethodNonce,
      Number(planId),
    );

    // Persist subscription info to your DB (not shown here)
    res.status(201).json({ subscriptionId: subscription.id, status: subscription.status });
  } catch (err) {
    next(err);
  }
});

// POST /pricing/webhook - Braintree webhook endpoint
pricingRouter.post('/webhook', express.raw({ type: '*/*' }), PricingService.handleWebhook);

// Export for inclusion in main app
export default pricingRouter;