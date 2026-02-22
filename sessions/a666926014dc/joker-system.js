< amount) {
          throw new Error('Insufficient jokers');
        }

        const updatedJoker = await tx.joker.update({
          where: { userId },
          data: { count: { decrement: amount } },
        });

        // Record the usage as a transaction (optional, for audit)
        await tx.transaction.create({
          data: {
            userId,
            type: TransactionType.JOKER_USAGE as any,
            amount: -amount,
            description: `Used ${amount} joker${amount > 1 ? 's' : ''}`,
          },
        });

        return updatedJoker;
      });

      res.json({ balance: result.count });
    } catch (error: any) {
      if (error.message === 'Insufficient jokers') {
        return res.status(400).json({ error: 'Not enough jokers' });
      }
      console.error('Error using jokers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /joker/purchase
 * Increments the user's joker count by the purchased amount and creates a payment transaction.
 * Body: { amount: number, paymentMethodId: string }
 *
 * NOTE: This endpoint only records the purchase; actual payment processing
 * should be handled elsewhere (e.g., Braintree webhook). Here we assume the
 * payment has already been verified.
 */
router.post(
  '/purchase',
  ensureAuth,
  body('amount')
    .isInt({ gt: 0 })
    .withMessage('Amount must be a positive integer'),
  body('paymentMethodId')
    .isString()
    .notEmpty()
    .withMessage('Payment method identifier is required'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req.user as any).id;
    const amount = parseInt(req.body.amount, 10);
    const paymentMethodId = req.body.paymentMethodId;

    try {
      // In a real implementation you would verify the payment with Braintree here.
      // For this example we assume verification succeeded.

      const result = await prisma.$transaction(async (tx) => {
        // Upsert Joker record
        const joker = await tx.joker.upsert({
          where: { userId },
          update: { count: { increment: amount } },
          create: { userId, count: amount },
        });

        // Record the purchase transaction
        await tx.transaction.create({
          data: {
            userId,
            type: TransactionType.JOKER_PURCHASE as any,
            amount,
            description: `Purchased ${amount} joker${amount > 1 ? 's' : ''}`,
            metadata: {
              paymentMethodId,
            },
          },
        });

        return joker;
      });

      res.json({ balance: result.count });
    } catch (error) {
      console.error('Error purchasing jokers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;