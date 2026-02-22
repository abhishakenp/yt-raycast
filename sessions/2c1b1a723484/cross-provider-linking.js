<string> {
    const thread = await this._assertThreadOwnership(userId, threadId);

    // If the thread is already linked, just return its existing groupId
    if (thread.groupId) {
      return thread.groupId;
    }

    const group = await prisma.conversationGroup.create({
      data: {
        ownerId: userId,
        threads: {
          connect: { id: thread.id },
        },
      },
    });

    // Update the thread with the new groupId
    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { groupId: group.id },
    });

    return group.id;
  }

  /**
   * Add a thread to an existing conversation group.
   */
  async addThread(
    userId: string,
    groupId: string,
    threadId: string,
  ): Promise<void> {
    const [group, thread] = await Promise.all([
      this._assertGroupOwnership(userId, groupId),
      this._assertThreadOwnership(userId, threadId),
    ]);

    // Prevent adding a thread that's already in a (different) group
    if (thread.groupId && thread.groupId !== group.id) {
      throw new ConflictError(
        `Thread ${threadId} already belongs to another group (${thread.groupId})`,
      );
    }

    // Optional: enforce different providers
    const existingProviderIds = await prisma.chatThread.findMany({
      where: { groupId: group.id },
      select: { providerId: true },
    });
    if (existingProviderIds.some(p => p.providerId === thread.providerId)) {
      // Allow same provider if you want, otherwise uncomment:
      // throw new ConflictError('Thread from the same provider already linked.');
    }

    // Connect the thread to the group
    await prisma.conversationGroup.update({
      where: { id: group.id },
      data: {
        threads: {
          connect: { id: thread.id },
        },
      },
    });

    // Update thread's foreign key
    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { groupId: group.id },
    });
  }

  /**
   * Retrieve the full conversation group for a given thread.
   * Returns null if the thread is not linked.
   */
  async getGroupForThread(
    userId: string,
    threadId: string,
  ): Promise<Prisma.ConversationGroupGetPayload<{
    include: { threads: true };
  }> | null> {
    const thread = await this._assertThreadOwnership(userId, threadId);
    if (!thread.groupId) {
      return null;
    }

    const group = await prisma.conversationGroup.findUnique({
      where: { id: thread.groupId },
      include: { threads: true },
    });

    // Safety check – the group should belong to the user
    if (group?.ownerId !== userId) {
      throw new UnauthorizedError('Group does not belong to the user');
    }

    return group;
  }

  /**
   * Remove a thread from its conversation group.
   * If the group ends up with a single thread, the group is deleted.
   */
  async removeThread(userId: string, threadId: string): Promise<void> {
    const thread = await this._assertThreadOwnership(userId, threadId);
    if (!thread.groupId) {
      // Nothing to do
      return;
    }

    const groupId = thread.groupId;

    // Disconnect thread from group
    await prisma.conversationGroup.update({
      where: { id: groupId },
      data: {
        threads: {
          disconnect: { id: thread.id },
        },
      },
    });

    // Clear groupId on the thread
    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { groupId: null },
    });

    // If only one thread remains, delete the group and clear its groupId
    const remainingThreads = await prisma.chatThread.findMany({
      where: { groupId },
      select: { id: true },
    });

    if (remainingThreads.length <= 1) {
      if (remainingThreads.length === 1) {
        await prisma.chatThread.update({
          where: { id: remainingThreads[0].id },
          data: { groupId: null },
        });
      }
      await prisma.conversationGroup.delete({ where: { id: groupId } });
    }
  }

  /**
   * Merge two distinct groups into a single group.
   * All threads from `sourceGroupId` are moved into `targetGroupId`.
   */
  async mergeGroups(
    userId: string,
    targetGroupId: string,
    sourceGroupId: string,
  ): Promise<void> {
    if (targetGroupId === sourceGroupId) {
      return;
    }

    const [targetGroup, sourceGroup] = await Promise.all([
      this._assertGroupOwnership(userId, targetGroupId),
      this._assertGroupOwnership(userId, sourceGroupId),
    ]);

    // Move all threads from source to target
    const sourceThreads = await prisma.chatThread.findMany({
      where: { groupId: sourceGroup.id },
      select: { id: true },
    });

    await prisma.conversationGroup.update({
      where: { id: targetGroup.id },
      data: {
        threads: {
          connect: sourceThreads.map(t => ({ id: t.id })),
        },
      },
    });

    // Update each moved thread's groupId
    await prisma.chatThread.updateMany({
      where: { id: { in: sourceThreads.map(t => t.id) } },
      data: { groupId: targetGroup.id },
    });

    // Delete the now‑empty source group
    await prisma.conversationGroup.delete({ where: { id: sourceGroup.id } });
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async _assertThreadOwnership(
    userId: string,
    threadId: string,
  ): Promise<Prisma.ChatThreadGetPayload<{ include: { provider: true } }>> {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { provider: true },
    });

    if (!thread) {
      throw new NotFoundError(`ChatThread ${threadId} not found`);
    }

    if (thread.ownerId !== userId) {
      throw new UnauthorizedError('Thread does not belong to the user');
    }

    return thread;
  }

  private async _assertGroupOwnership(
    userId: string,
    groupId: string,
  ): Promise<Prisma.ConversationGroupGetPayload<{ include: { threads: true } }>> {
    const group = await prisma.conversationGroup.findUnique({
      where: { id: groupId },
      include: { threads: true },
    });

    if (!group) {
      throw new NotFoundError(`ConversationGroup ${groupId} not found`);
    }

    if (group.ownerId !== userId) {
      throw new UnauthorizedError('Group does not belong to the user');
    }

    return group;
  }
}

/* -------------------------------------------------------------------------
   Prisma schema additions (for reference – not part of the generated file)
   -------------------------------------------------------------------------

model ConversationGroup {
  id        String   @id @default(cuid())
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  threads   ChatThread[] @relation("GroupThreads")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
}

model ChatThread {
  id           String   @id @default(cuid())
  ownerId      String
  owner        User     @relation(fields: [ownerId], references: [id])
  providerId   String
  provider     Provider @relation(fields: [providerId], references: [id])
  externalId   String   // ID from the external provider
  groupId      String?  // Nullable FK to ConversationGroup
  group        ConversationGroup? @relation("GroupThreads", fields: [groupId], references: [id])
  // … other fields (title, createdAt, etc.)
}
   ------------------------------------------------------------------------- */