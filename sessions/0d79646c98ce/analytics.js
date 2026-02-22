<= endDate;
        d = new Date(d.getTime() + dayMs)
      ) {
        const dayStr = d.toISOString().split('T')[0];
        const dayPayments = payments.find(
          (p) => p.createdAt.toISOString().split('T')[0] === dayStr
        );
        dailyRevenue.push({
          date: dayStr,
          amount: (dayPayments?._sum.amountCents ?? 0) / 100,
        });
      }

      res.json({ start: startDate, end: endDate, dailyRevenue });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/analytics/users?period=30d|7d|24h
 * Returns new user sign‑ups per day for the selected period.
 */
router.get(
  '/users',
  verifyJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period = '30d' } = req.query as { period?: string };
      const daysMap: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30 };
      const days = daysMap[period] ?? 30;

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const signups = await prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      });

      const dailySignups: { date: string; count: number }[] = [];

      const dayMs = 24 * 60 * 60 * 1000;
      for (
        let d = new Date(startDate);
        d <= new Date();
        d = new Date(d.getTime() + dayMs)
      ) {
        const dayStr = d.toISOString().split('T')[0];
        const dayData = signups.find(
          (s) => s.createdAt.toISOString().split('T')[0] === dayStr
        );
        dailySignups.push({
          date: dayStr,
          count: dayData?._count.id ?? 0,
        });
      }

      res.json({ period, dailySignups });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/analytics/plan-usage
 * Returns the number of active subscriptions per plan.
 */
router.get(
  '/plan-usage',
  verifyJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usage = await prisma.subscription.groupBy({
        by: ['planId'],
        where: { status: 'ACTIVE' },
        _count: { planId: true },
      });

      const result = await Promise.all(
        usage.map(async (g) => {
          const plan = await prisma.plan.findUnique({
            where: { id: g.planId },
            select: { name: true },
          });
          return {
            planId: g.planId,
            planName: plan?.name ?? 'Unknown',
            activeSubscriptions: g._count.planId,
          };
        })
      );

      res.json({ planUsage: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;