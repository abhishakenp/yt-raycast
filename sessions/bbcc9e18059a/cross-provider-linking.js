<ChatThread> {
    if (primaryThreadId === secondaryThreadId) {
      throw new BadRequestException('Cannot link a thread to itself.');
    }

    // Fetch both threads and ensure they belong to the user
    const [primaryThread, secondaryThread] = await Promise.all([
      this.prisma.chatThread.findFirst({
        where: { id: primaryThreadId, userId },
        include: { messages: true },
      }),
      this.prisma.chatThread.findFirst({
        where: { id: secondaryThreadId, userId },
        include: { messages: true },
      }),
    ]);

    if (!primaryThread) {
      throw new NotFoundException('Primary thread not found.');
    }
    if (!secondaryThread) {
      throw new NotFoundException('Secondary thread not found.');
    }

    // Prevent linking threads that are already linked together
    if (primaryThread.linkedThreadId && primaryThread.linkedThreadId === secondaryThread.linkedThreadId) {
      throw new BadRequestException('Threads are already linked.');
    }

    // Determine the unified linkedThreadId (reuse existing if any, otherwise generate new)
    const unifiedLinkedThreadId = primaryThread.linkedThreadId ?? secondaryThread.linkedThreadId ?? uuidv4();

    // Update both threads to reference the unified linkedThreadId
    await this.prisma.chatThread.updateMany({
      where: {
        id: { in: [primaryThreadId, secondaryThreadId] },
        userId,
      },
      data: {
        linkedThreadId: unifiedLinkedThreadId,
        // Optionally mark secondary as archived or hidden in UI
        isArchived: Prisma.sql`CASE WHEN id = ${secondaryThreadId} THEN true ELSE isArchived END`,
      },
    });

    // Re‑associate messages to the unified thread for easier querying
    await this.prisma.message.updateMany({
      where: {
        chatThreadId: { in: [primaryThreadId, secondaryThreadId] },
        userId,
      },
      data: {
        unifiedThreadId: unifiedLinkedThreadId,
      },
    });

    // Return the refreshed primary thread
    return this.prisma.chatThread.findUniqueOrThrow({
      where: { id: primaryThreadId },
      include: { messages: true },
    });
  }

  /**
   * Retrieves a unified view of a linked thread, aggregating messages from all
   * provider‑specific threads that share the same linkedThreadId.
   *
   * @param userId   ID of the user
   * @param threadId ID of any thread belonging to the linked group
   * @returns        An object containing the unified thread metadata and ordered messages
   */
  async getUnifiedThread(
    userId: string,
    threadId: string,
  ): Promise<{
    linkedThreadId: string;
    threads: ChatThread[];
    messages: (Message & { provider: Provider })[];
  }> {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: threadId, userId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found.');
    }

    const linkedThreadId = thread.linkedThreadId ?? thread.id;

    // Fetch all threads that belong to this linked group
    const threads = await this.prisma.chatThread.findMany({
      where: {
        OR: [{ id: threadId }, { linkedThreadId }],
        userId,
      },
      include: { provider: true },
    });

    // Gather all messages belonging to any of the threads in the group
    const messages = await this.prisma.message.findMany({
      where: {
        chatThreadId: { in: threads.map(t => t.id) },
        userId,
      },
      include: {
        provider: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      linkedThreadId,
      threads,
      messages,
    };
  }

  /**
   * Unlinks a secondary thread from its unified group.
   *
   * @param userId          ID of the user
   * @param secondaryThreadId ID of the thread to detach
   * @returns               The detached thread
   */
  async unlinkThread(userId: string, secondaryThreadId: string): Promise<ChatThread> {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id: secondaryThreadId, userId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found.');
    }

    if (!thread.linkedThreadId) {
      throw new BadRequestException('Thread is not linked to any group.');
    }

    // Remove linking metadata from the secondary thread
    await this.prisma.chatThread.update({
      where: { id: secondaryThreadId },
      data: {
        linkedThreadId: null,
        isArchived: false,
      },
    });

    // Detach its messages from the unifiedThreadId
    await this.prisma.message.updateMany({
      where: {
        chatThreadId: secondaryThreadId,
        userId,
      },
      data: {
        unifiedThreadId: null,
      },
    });

    return this.prisma.chatThread.findUniqueOrThrow({
      where: { id: secondaryThreadId },
    });
  }
}