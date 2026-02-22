<ThreadLink> {
    if (primaryThreadId === secondaryThreadId) {
      throw new BadRequestError('Cannot link a thread to itself.');
    }

    // Verify ownership and existence of both threads
    const [primaryThread, secondaryThread] = await Promise.all([
      prisma.chatThread.findUnique({
        where: { id: primaryThreadId },
        select: { id: true, userId: true, providerId: true },
      }),
      prisma.chatThread.findUnique({
        where: { id: secondaryThreadId },
        select: { id: true, userId: true, providerId: true },
      }),
    ]);

    if (!primaryThread) {
      throw new NotFoundError('Primary thread not found.');
    }
    if (!secondaryThread) {
      throw new NotFoundError('Secondary thread not found.');
    }
    if (primaryThread.userId !== userId || secondaryThread.userId !== userId) {
      throw new ForbiddenError('You can only link your own threads.');
    }

    // Prevent linking threads from the same provider (optional business rule)
    if (primaryThread.providerId === secondaryThread.providerId) {
      throw new BadRequestError(
        'Linking threads from the same provider is not required.',
      );
    }

    // Check if a link already exists (symmetrical check)
    const existingLink = await prisma.threadLink.findFirst({
      where: {
        OR: [
          {
            primaryThreadId,
            secondaryThreadId,
          },
          {
            primaryThreadId: secondaryThreadId,
            secondaryThreadId: primaryThreadId,
          },
        ],
      },
    });

    if (existingLink) {
      throw new BadRequestError('These threads are already linked.');
    }

    // Create the link
    const link = await prisma.threadLink.create({
      data: {
        userId,
        primaryThreadId,
        secondaryThreadId,
      },
    });

    return link;
  }

  /**
   * Retrieve all threads linked to a given thread (including the original thread).
   *
   * @param userId   ID of the requesting user
   * @param threadId ID of the thread whose linked group is requested
   * @returns Array of ChatThread objects (including the original thread)
   */
  static async getLinkedThreads(
    userId: string,
    threadId: string,
  ): Promise<ChatThread[]> {
    // Verify the thread belongs to the user
    const baseThread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { id: true, userId: true },
    });

    if (!baseThread) {
      throw new NotFoundError('Thread not found.');
    }
    if (baseThread.userId !== userId) {
      throw new ForbiddenError('Access denied.');
    }

    // Find all links where the thread appears either as primary or secondary
    const links = await prisma.threadLink.findMany({
      where: {
        OR: [
          { primaryThreadId: threadId },
          { secondaryThreadId: threadId },
        ],
        userId,
      },
    });

    // Collect the IDs of linked threads
    const linkedThreadIds = new Set<string>();
    linkedThreadIds.add(threadId); // include the original thread

    for (const link of links) {
      linkedThreadIds.add(link.primaryThreadId);
      linkedThreadIds.add(link.secondaryThreadId);
    }

    // Fetch full thread records
    const threads = await prisma.chatThread.findMany({
      where: {
        id: { in: Array.from(linkedThreadIds) },
        userId,
      },
      include: {
        provider: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1, // optional: preview only the first message
        },
        tags: true,
      },
    });

    return threads;
  }

  /**
   * Remove an existing link between two threads.
   *
   * @param userId            ID of the user performing the operation
   * @param primaryThreadId   ID of one thread in the link
   * @param secondaryThreadId ID of the other thread in the link
   * @returns The deleted ThreadLink record
   * @throws NotFoundError if the link does not exist or does not belong to the user
   */
  static async removeLink(
    userId: string,
    primaryThreadId: string,
    secondaryThreadId: string,
  ): Promise<ThreadLink> {
    // Find the link (symmetrical)
    const link = await prisma.threadLink.findFirst({
      where: {
        OR: [
          {
            primaryThreadId,
            secondaryThreadId,
          },
          {
            primaryThreadId: secondaryThreadId,
            secondaryThreadId: primaryThreadId,
          },
        ],
        userId,
      },
    });

    if (!link) {
      throw new NotFoundError('Link not found.');
    }

    const deleted = await prisma.threadLink.delete({
      where: { id: link.id },
    });

    return deleted;
  }

  /**
   * Helper to retrieve the full linked group as a graph structure.
   * Useful for UI components that need to display a thread cluster.
   *
   * @param userId   ID of the requesting user
   * @param threadId Any thread ID within the desired cluster
   * @returns Object where keys are thread IDs and values are arrays of directly linked thread IDs
   */
  static async getLinkGraph(
    userId: string,
    threadId: string,
  ): Promise<Record<string, string[]>> {
    const threads = await this.getLinkedThreads(userId, threadId);
    const threadIds = threads.map((t) => t.id);

    const links = await prisma.threadLink.findMany({
      where: {
        OR: [
          { primaryThreadId: { in: threadIds } },
          { secondaryThreadId: { in: threadIds } },
        ],
        userId,
      },
    });

    const graph: Record<string, Set<string>> = {};

    for (const id of threadIds) {
      graph[id] = new Set<string>();
    }

    for (const link of links) {
      graph[link.primaryThreadId].add(link.secondaryThreadId);
      graph[link.secondaryThreadId].add(link.primaryThreadId);
    }

    // Convert Set to array for JSON‑serializable output
    const result: Record<string, string[]> = {};
    for (const [key, set] of Object.entries(graph)) {
      result[key] = Array.from(set);
    }

    return result;
  }
}

/* -------------------------------------------------------------------------- */
/* Prisma schema snippet (for reference – add to schema.prisma)               */
/* -------------------------------------------------------------------------- */
/*
model ThreadLink {
  id               String   @id @default(uuid())
  userId           String
  primaryThreadId  String
  secondaryThreadId String
  createdAt        DateTime @default(now())

  user             User     @relation(fields: [userId], references: [id])
  primaryThread    ChatThread @relation("PrimaryLinks", fields: [primaryThreadId], references: [id])
  secondaryThread  ChatThread @relation("SecondaryLinks", fields: [secondaryThreadId], references: [id])

  @@unique([primaryThreadId, secondaryThreadId])
}
*/

export default ThreadLinkService;