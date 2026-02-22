<Prisma.UserUpdateInput>) {
    return prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  /* -----------------------------------------------------------------------
   * Provider
   * --------------------------------------------------------------------- */
  async upsertProvider(userId: string, name: string, config: Prisma.JsonValue) {
    return prisma.provider.upsert({
      where: { userId_name: { userId, name } },
      update: { config },
      create: {
        id: randomUUID(),
        userId,
        name,
        config,
      },
    });
  }

  async getProvidersByUser(userId: string) {
    return prisma.provider.findMany({ where: { userId } });
  }

  async deleteProvider(id: string) {
    return prisma.provider.delete({ where: { id } });
  }

  /* -----------------------------------------------------------------------
   * ChatThread
   * --------------------------------------------------------------------- */
  async createChatThread(
    userId: string,
    title: string,
    providerId: string,
    metadata?: Prisma.JsonValue,
  ) {
    return prisma.chatThread.create({
      data: {
        id: randomUUID(),
        userId,
        title,
        providerId,
        metadata,
      },
    });
  }

  async getChatThreadById(id: string) {
    return prisma.chatThread.findUnique({
      where: { id },
      include: { messages: true, tags: true, attachments: true },
    });
  }

  async getChatThreadsByUser(userId: string) {
    return prisma.chatThread.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateChatThread(id: string, data: Partial<Prisma.ChatThreadUpdateInput>) {
    return prisma.chatThread.update({ where: { id }, data });
  }

  async deleteChatThread(id: string) {
    return prisma.chatThread.delete({ where: { id } });
  }

  /* -----------------------------------------------------------------------
   * Message
   * --------------------------------------------------------------------- */
  async addMessage(
    threadId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Prisma.JsonValue,
  ) {
    return prisma.message.create({
      data: {
        id: randomUUID(),
        threadId,
        role,
        content,
        metadata,
      },
    });
  }

  async getMessagesByThread(threadId: string, limit = 100, cursor?: string) {
    const args: Prisma.MessageFindManyArgs = {
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }
    return prisma.message.findMany(args);
  }

  async deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } });
  }

  /* -----------------------------------------------------------------------
   * Tag
   * --------------------------------------------------------------------- */
  async addTagToThread(threadId: string, name: string) {
    // Ensure tag exists globally for the user
    const thread = await this.getChatThreadById(threadId);
    if (!thread) throw new Error('Thread not found');

    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId: thread.userId, name } },
      update: {},
      create: {
        id: randomUUID(),
        userId: thread.userId,
        name,
      },
    });

    // Link tag to thread (many‑to‑many)
    return prisma.chatThread.update({
      where: { id: threadId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
    });
  }

  async removeTagFromThread(threadId: string, tagId: string) {
    return prisma.chatThread.update({
      where: { id: threadId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });
  }

  async getTagsByUser(userId: string) {
    return prisma.tag.findMany({ where: { userId } });
  }

  /* -----------------------------------------------------------------------
   * Attachment
   * --------------------------------------------------------------------- */
  async addAttachment(
    threadId: string,
    filename: string,
    mimeType: string,
    data: Buffer,
  ) {
    return prisma.attachment.create({
      data: {
        id: randomUUID(),
        threadId,
        filename,
        mimeType,
        data,
      },
    });
  }

  async getAttachmentsByThread(threadId: string) {
    return prisma.attachment.findMany({ where: { threadId } });
  }

  async deleteAttachment(id: string) {
    return prisma.attachment.delete({ where: { id } });
  }

  /* -----------------------------------------------------------------------
   * Utility / Cleanup
   * --------------------------------------------------------------------- */
  async disconnect() {
    await prisma.$disconnect();
  }
}

/**
 * Export a singleton instance for easy import throughout the codebase.
 */
export const localStorage = new LocalStorage();