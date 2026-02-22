<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * POST /links
 * Body: { threadIds: string[] }
 * Creates a cross‑provider link between the supplied chat threads.
 * Generates a new conversationId and assigns it to each thread.
 */
router.post(
  '/links',
  asyncHandler(async (req: Request, res: Response) => {
    const { threadIds } = req.body;

    if (!Array.isArray(threadIds) || threadIds.length < 2) {
      return res.status(400).json({
        error: 'You must provide an array of at least two threadIds to link.',
      });
    }

    // Verify all threads exist and belong to the requesting user (auth omitted for brevity)
    const threads = await prisma.chatThread.findMany({
      where: { id: { in: threadIds } },
      select: { id: true, linkedConversationId: true },
    });

    if (threads.length !== threadIds.length) {
      return res.status(404).json({ error: 'One or more threadIds not found.' });
    }

    // If any thread is already linked, reject (or you could allow merging)
    const alreadyLinked = threads.filter((t) => t.linkedConversationId !== null);
    if (alreadyLinked.length > 0) {
      return res.status(409).json({
        error: 'One or more threads are already linked to another conversation.',
        threads: alreadyLinked.map((t) => t.id),
      });
    }

    const conversationId = uuidv4();

    // Update all threads with the new conversationId
    await prisma.$transaction(
      threadIds.map((id) =>
        prisma.chatThread.update({
          where: { id },
          data: { linkedConversationId: conversationId },
        })
      )
    );

    res.status(201).json({ conversationId, linkedThreadIds: threadIds });
  })
);

/**
 * GET /threads/:id/linked
 * Returns all threads that share the same linkedConversationId as the given thread.
 */
router.get(
  '/threads/:id/linked',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const thread = await prisma.chatThread.findUnique({
      where: { id },
      select: { linkedConversationId: true },
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found.' });
    }

    if (!thread.linkedConversationId) {
      return res.status(200).json({ linkedThreads: [] });
    }

    const linkedThreads = await prisma.chatThread.findMany({
      where: {
        linkedConversationId: thread.linkedConversationId,
        NOT: { id },
      },
      select: {
        id: true,
        providerId: true,
        externalThreadId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ linkedConversationId: thread.linkedConversationId, linkedThreads });
  })
);

/**
 * DELETE /links/:conversationId
 * Unlinks all threads belonging to the specified conversationId.
 */
router.delete(
  '/links/:conversationId',
  asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    const threads = await prisma.chatThread.findMany({
      where: { linkedConversationId: conversationId },
      select: { id: true },
    });

    if (threads.length === 0) {
      return res.status(404).json({ error: 'No linked threads found for this conversationId.' });
    }

    await prisma.$transaction(
      threads.map((t) =>
        prisma.chatThread.update({
          where: { id: t.id },
          data: { linkedConversationId: null },
        })
      )
    );

    res.status(200).json({
      message: 'Threads successfully unlinked.',
      unlinkedThreadIds: threads.map((t) => t.id),
    });
  })
);

/**
 * Error handling middleware (must be added after all routes)
 */
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Cross‑provider linking error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

export default router;