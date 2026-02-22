<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providers: true },
    });
    if (!user) throw new Error(`User ${userId} not found`);

    // Process each provider linked to the user
    for (const provider of user.providers) {
      await this.collectFromProvider(user, provider);
    }
  }

  /**
   * Collect new messages from a single provider.
   * @param user   The user owning the provider.
   * @param provider The provider configuration.
   */
  private async collectFromProvider(user: User & { providers: Provider[] }, provider: Provider): Promise<void> {
    const api = ProviderAPI.getInstance(provider.type, provider.credentials);
    const lastCursor = await this.getProviderCursor(user.id, provider.id);

    // Fetch new messages incrementally
    const { messages, nextCursor } = await api.fetchMessages({
      afterCursor: lastCursor,
      limit: 500,
    });

    if (messages.length === 0) {
      // Nothing new – just update cursor if needed
      await this.updateProviderCursor(user.id, provider.id, nextCursor);
      return;
    }

    // Process each message
    for (const rawMsg of messages) {
      await this.processMessage(user.id, provider.id, rawMsg);
    }

    // Persist the new cursor for next run
    await this.updateProviderCursor(user.id, provider.id, nextCursor);
  }

  /**
   * Retrieve the last processed cursor for a provider/user pair.
   */
  private async getProviderCursor(userId: string, providerId: string): Promise<string | null> {
    const cursor = await prisma.providerCursor.findUnique({
      where: { userId_providerId: { userId, providerId } },
    });
    return cursor?.cursor ?? null;
  }

  /**
   * Persist the latest cursor after a successful fetch.
   */
  private async updateProviderCursor(userId: string, providerId: string, cursor: string | null): Promise<void> {
    await prisma.providerCursor.upsert({
      where: { userId_providerId: { userId, providerId } },
      update: { cursor },
      create: { userId, providerId, cursor },
    });
  }

  /**
   * Process a single raw message from a provider.
   * Handles deduplication, chat linking, attachment handling and tag creation.
   */
  private async processMessage(userId: string, providerId: string, rawMsg: ProviderMessage): Promise<void> {
    // Compute deterministic hash for deduplication (content + timestamp + provider)
    const hash = this.computeMessageHash(rawMsg, providerId);

    // Check if we already have this message
    const existing = await prisma.message.findUnique({
      where: { contentHash: hash },
    });
    if (existing) {
      // Message already stored – possibly update metadata (e.g., read status)
      await prisma.message.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      });
      return;
    }

    // Determine the chat this message belongs to (cross‑provider linking)
    const chat = await this.findOrCreateChat(userId, rawMsg, providerId);

    // Persist the message
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: chat.id,
        providerId,
        userId,
        role: rawMsg.role,
        content: rawMsg.content,
        contentHash: hash,
        createdAt: rawMsg.createdAt,
        metadata: rawMsg.metadata ?? {},
        // Attachments are stored as JSON; actual files are saved elsewhere (e.g., S3 or local storage)
        attachments: rawMsg.attachments ?? [],
      },
    });

    // Apply tags if any
    if (rawMsg.tags && rawMsg.tags.length > 0) {
      await this.applyTagsToMessage(message.id, rawMsg.tags);
    }
  }

  /**
   * Compute a SHA‑256 hash for a message to enable deduplication.
   */
  private computeMessageHash(msg: ProviderMessage, providerId: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(providerId);
    hash.update(msg.role);
    hash.update(msg.content);
    hash.update(msg.createdAt.toISOString());
    if (msg.metadata) {
      hash.update(JSON.stringify(msg.metadata));
    }
    return hash.digest('hex');
  }

  /**
   * Find an existing chat that matches the incoming message or create a new one.
   * Matching is based on:
   *   - Provider‑specific conversation ID (if supplied)
   *   - Heuristic: same participants and close timestamps (within 5 min)
   */
  private async findOrCreateChat(userId: string, msg: ProviderMessage, providerId: string): Promise<Chat> {
    // Prefer explicit conversation identifier from provider
    if (msg.conversationId) {
      const existing = await prisma.chat.findFirst({
        where: {
          userId,
          providerId,
          externalConversationId: msg.conversationId,
        },
      });
      if (existing) return existing;

      // No chat yet – create one linked to the external ID
      return await prisma.chat.create({
        data: {
          id: uuidv4(),
          userId,
          providerId,
          externalConversationId: msg.conversationId,
          title: msg.title ?? 'Untitled Chat',
          createdAt: msg.createdAt,
        },
      });
    }

    // Fallback heuristic: look for recent chat with same participants
    const recentChat = await prisma.chat.findFirst({
      where: {
        userId,
        providerId,
        createdAt: {
          gte: new Date(msg.createdAt.getTime() - 5 * 60 * 1000), // 5 min window
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recentChat) return recentChat;

    // No match – create a brand‑new chat
    return await prisma.chat.create({
      data: {
        id: uuidv4(),
        userId,
        providerId,
        title: msg.title ?? 'New Chat',
        createdAt: msg.createdAt,
      },
    });
  }

  /**
   * Attach tags to a message, creating any missing tags on‑the‑fly.
   */
  private async applyTagsToMessage(messageId: string, tagNames: string[]): Promise<void> {
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const normalized = name.trim().toLowerCase();
      let tag = await prisma.tag.findUnique({ where: { name: normalized } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: { id: uuidv4(), name: normalized, color: '#3b82f6' }, // default blue accent
        });
      }
      tagIds.push(tag.id);
    }

    await prisma.messageTag.createMany({
      data: tagIds.map(tagId => ({
        messageId,
        tagId,
      })),
      skipDuplicates: true,
    });
  }
}

/**
 * Scheduler entry point – can be called by a cron job or background worker.
 * Example usage:
 *
 *   const collector = new IncrementalCollector();
 *   await collector.collectForUser('user-123');
 */
export async function runIncrementalCollectionForAllUsers(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: { providers: true },
  });

  const collector = new IncrementalCollector();

  for (const user of users) {
    try {
      await collector.collectForUser(user.id);
    } catch (err) {
      console.error(`Failed incremental collection for user ${user.id}:`, err);
    }
  }
}