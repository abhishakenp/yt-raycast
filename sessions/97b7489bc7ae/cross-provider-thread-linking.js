<Thread> {
    if (!chatIds || chatIds.length < 2) {
      throw new BadRequestException('At least two chat IDs are required to link.');
    }

    // Load chats and verify ownership
    const chats = await this.prisma.chat.findMany({
      where: {
        id: { in: chatIds },
        userId,
      },
      include: { thread: true },
    });

    if (chats.length !== chatIds.length) {
      const foundIds = chats.map((c) => c.id);
      const missing = chatIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Chats not found or not owned by user: ${missing.join(', ')}`);
    }

    // Determine if any chat already belongs to a thread
    const existingThreadIds = chats
      .filter((c) => c.threadId !== null)
      .map((c) => c.threadId) as string[];

    let thread: Thread | null = null;

    if (existingThreadIds.length > 0) {
      // Use the first existing thread as the target
      const targetThreadId = existingThreadIds[0];
      thread = await this.prisma.thread.findUnique({ where: { id: targetThreadId } });

      // Ensure all other existing threads are merged into the target
      const otherThreadIds = Array.from(new Set(existingThreadIds)).filter(
        (id) => id !== targetThreadId,
      );

      for (const otherId of otherThreadIds) {
        await this.mergeThreads(targetThreadId, otherId);
      }
    } else {
      // No existing thread – create a new one
      thread = await this.prisma.thread.create({
        data: {
          id: uuidv4(),
          userId,
          title: this.generateThreadTitle(chats),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Assign all chats to the resolved thread
    await this.prisma.chat.updateMany({
      where: {
        id: { in: chatIds },
        userId,
      },
      data: {
        threadId: thread.id,
        updatedAt: new Date(),
      },
    });

    // Optionally deduplicate and re‑order messages across chats
    await this.deduplicateAndOrderMessages(thread.id, userId);

    return thread;
  }

  /**
   * Merges sourceThread into targetThread.
   * All chats belonging to sourceThread are reassigned to targetThread.
   * Messages are deduplicated and re‑ordered.
   *
   * @param targetThreadId ID of the thread that will remain.
   * @param sourceThreadId ID of the thread to be merged and removed.
   */
  private async mergeThreads(targetThreadId: string, sourceThreadId: string): Promise<void> {
    // Reassign chats
    await this.prisma.chat.updateMany({
      where: { threadId: sourceThreadId },
      data: { threadId: targetThreadId },
    });

    // Delete the source thread record
    await this.prisma.thread.delete({ where: { id: sourceThreadId } });
  }

  /**
   * Generates a human‑readable title for a new thread based on the involved chats.
   * Uses the most recent chat title or a fallback.
   */
  private generateThreadTitle(chats: Chat[]): string {
    const recentChat = chats.reduce((prev, curr) =>
      new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr,
    );
    return recentChat.title ?? `Thread ${new Date().toISOString()}`;
  }

  /**
   * Deduplicates messages across all chats belonging to a thread and orders them chronologically.
   * This ensures a seamless view when rendering a cross‑provider conversation.
   */
  private async deduplicateAndOrderMessages(threadId: string, userId: string): Promise<void> {
    // Fetch all messages for the thread
    const messages = await this.prisma.message.findMany({
      where: {
        chat: {
          threadId,
          userId,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Build a map to detect duplicates (by providerMessageId + providerId)
    const seen = new Map<string, string>(); // key -> messageId
    const duplicates: string[] = [];

    for (const msg of messages) {
      const key = `${msg.providerId}:${msg.providerMessageId}`;
      if (seen.has(key)) {
        duplicates.push(msg.id);
      } else {
        seen.set(key, msg.id);
      }
    }

    // Delete duplicate messages
    if (duplicates.length > 0) {
      await this.prisma.message.deleteMany({
        where: { id: { in: duplicates } },
      });
    }

    // No need to reorder physically; ordering is handled at query time.
    // However, we update the thread's updatedAt to reflect the change.
    await this.prisma.thread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Retrieves a thread with its associated chats and ordered messages.
   *
   * @param userId   ID of the user.
   * @param threadId ID of the thread.
   */
  async getThreadDetail(userId: string, threadId: string) {
    const thread = await this.prisma.thread.findFirst({
      where: { id: threadId, userId },
      include: {
        chats: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found.');
    }

    // Flatten messages while preserving chat boundaries if needed
    const orderedMessages = thread.chats
      .flatMap((chat) => chat.messages.map((msg) => ({ ...msg, chatId: chat.id })))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      ...thread,
      messages: orderedMessages,
    };
  }
}