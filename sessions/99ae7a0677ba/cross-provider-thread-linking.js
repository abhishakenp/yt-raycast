< 2) {
      throw new BadRequestError('At least two chat IDs must be provided for linking.');
    }

    // 1️⃣ Fetch chats and validate ownership
    const chats = await prisma.chat.findMany({
      where: {
        id: { in: chatIds },
        userId,
      },
      select: { id: true, threadId: true },
    });

    if (chats.length !== chatIds.length) {
      const foundIds = chats.map(c => c.id);
      const missing = chatIds.filter(id => !foundIds.includes(id));
      throw new NotFoundError(`Chats not found or not owned by user: ${missing.join(', ')}`);
    }

    // 2️⃣ Determine existing threads among the chats
    const existingThreadIds = Array.from(
      new Set(chats.filter(c => c.threadId).map(c => c.threadId as string))
    );

    // 3️⃣ Decide which thread to keep (oldest by creation date)
    let targetThreadId: string | null = null;
    if (existingThreadIds.length > 0) {
      const threads = await prisma.thread.findMany({
        where: { id: { in: existingThreadIds } },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      targetThreadId = threads[0].id;
    } else {
      // No existing thread – create a new one
      const newThread = await prisma.thread.create({
        data: {
          userId,
          createdAt: new Date(),
        },
        select: { id: true },
      });
      targetThreadId = newThread.id;
    }

    // 4️⃣ Upsert ThreadChat relations for all chats
    const upsertOps: Prisma.PrismaPromise<any>[] = chatIds.map(chatId =>
      prisma.threadChat.upsert({
        where: {
          threadId_chatId: {
            threadId: targetThreadId!,
            chatId,
          },
        },
        update: {},
        create: {
          threadId: targetThreadId!,
          chatId,
        },
      })
    );

    // 5️⃣ Remove chats from any other threads (if they existed)
    const threadsToDelete = existingThreadIds.filter(id => id !== targetThreadId);
    if (threadsToDelete.length) {
      upsertOps.push(
        prisma.threadChat.deleteMany({
          where: {
            threadId: { in: threadsToDelete },
            chatId: { in: chatIds },
          },
        })
      );
    }

    // 6️⃣ Execute all DB operations in a transaction
    await prisma.$transaction(upsertOps);

    // 7️⃣ Clean up any now‑empty threads
    if (threadsToDelete.length) {
      await ThreadLinkingService.cleanupEmptyThreads(threadsToDelete);
    }

    logger.info(`User ${userId} linked chats [${chatIds.join(', ')}] into thread ${targetThreadId}`);
    return { threadId: targetThreadId };
  }

  /**
   * Retrieve the thread (if any) that a given chat belongs to.
   *
   * @returns `null` if the chat is not linked to any thread.
   */
  static async getThreadByChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { threadId: true, userId: true },
    });

    if (!chat) {
      throw new NotFoundError(`Chat ${chatId} not found`);
    }
    if (chat.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (!chat.threadId) {
      return null;
    }

    const thread = await prisma.thread.findUnique({
      where: { id: chat.threadId },
      include: {
        chats: {
          select: {
            chat: {
              select: {
                id: true,
                providerId: true,
                title: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    return thread;
  }

  /**
   * Unlink a single chat from its thread.
   *
   * If the thread ends up empty after removal, it is deleted.
   *
   * @throws NotFoundError – if the chat is not part of any thread.
   */
  static async unlinkChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { threadId: true, userId: true },
    });

    if (!chat) {
      throw new NotFoundError(`Chat ${chatId} not found`);
    }
    if (chat.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }
    if (!chat.threadId) {
      throw new BadRequestError('Chat is not linked to any thread');
    }

    await prisma.threadChat.delete({
      where: {
        threadId_chatId: {
          threadId: chat.threadId,
          chatId,
        },
      },
    });

    // Clean up thread if empty
    await ThreadLinkingService.cleanupEmptyThreads([chat.threadId]);

    logger.info(`User ${userId} unlinked chat ${chatId} from thread ${chat.threadId}`);
    return { success: true };
  }

  /**
   * Delete any threads that have no associated chats.
   */
  private static async cleanupEmptyThreads(threadIds: string[]) {
    const emptyThreads = await prisma.thread.findMany({
      where: {
        id: { in: threadIds },
        chats: { none: {} },
      },
      select: { id: true },
    });

    if (emptyThreads.length) {
      await prisma.thread.deleteMany({
        where: { id: { in: emptyThreads.map(t => t.id) } },
      });
      logger.info(`Cleaned up empty threads: ${emptyThreads.map(t => t.id).join(', ')}`);
    }
  }
}