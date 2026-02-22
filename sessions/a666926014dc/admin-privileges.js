<Event>;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: event });
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    await prisma.event.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [userCount, eventCount, transactionCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.transaction.count(),
    ]);

    const totalRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    res.json({
      data: {
        users: userCount,
        events: eventCount,
        transactions: transactionCount,
        revenue: totalRevenue._sum.amount ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Router – all routes are protected by `requireAdmin`.
 */
const adminRouter = Router();

adminRouter.use(requireAdmin);

// User management
adminRouter.get('/users', listUsers);
adminRouter.patch('/users/:id/role', updateUserRole);
adminRouter.delete('/users/:id', deleteUser);

// Event management
adminRouter.get('/events', listEvents);
adminRouter.patch('/events/:id', updateEvent);
adminRouter.delete('/events/:id', deleteEvent);

// Platform statistics
adminRouter.get('/stats', getStats);

export default adminRouter;