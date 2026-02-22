<void> {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId, userId },
    });

    if (!provider) {
      throw new Error('Provider not found or does not belong to user');
    }

    const client = getProviderClient(provider.type as ProviderClient['type']);
    const lastSync = provider.lastSyncedAt ?? new Date(0);

    logger.info(`Starting incremental sync for user=${userId} provider=${provider.type} since=${lastSync.toISOString()}`);

    const externalMessages = await client.fetchMessagesSince(lastSync);

    if (externalMessages.length === 0) {
      logger.info('No new messages to sync.');
      await prisma.provider.update({
        where: { id: providerId },
        data: { lastSyncedAt: new Date() },
      });
      return;
    }

    // Process each external message
    for (const extMsg of externalMessages) {
      await this.processExternalMessage(userId, provider, extMsg);
    }

    // Update provider's last sync timestamp
    await prisma.provider.update({
      where: { id: providerId },
      data: { lastSyncedAt: new Date() },
    });

    logger.info(`Incremental sync completed for provider=${provider.type}, ${externalMessages.length} messages processed.`);
  }

  /**
   * Process a single external message: deduplicate, create thread if needed,
   * store encrypted content, handle attachments.
   */
  private async processExternalMessage(
    userId: string,
    provider: Provider,
    extMsg: ExternalMessage,
  ): Promise<void> {
    // Deduplication: check if a message with the same externalId already exists
    const existing = await prisma.message.findFirst({
      where: {
        externalId: extMsg.id,
        providerId: provider.id,
      },
    });

    if (existing) {
      logger.debug(`Skipping duplicate message externalId=${extMsg.id}`);
      return;
    }

    // Find or create a ChatThread based on conversation identifier
    const thread = await this.findOrCreateThread(userId, provider, extMsg);

    // Encrypt message content
    const encryptedContent = encrypt(extMsg.content);

    // Create the Message record
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        userId,
        providerId: provider.id,
        chatThreadId: thread.id,
        externalId: extMsg.id,
        role: extMsg.role,
        content: encryptedContent,
        createdAt: extMsg.createdAt,
        updatedAt: new Date(),
      },
    });

    // Handle attachments if any
    if (extMsg.attachments && extMsg.attachments.length > 0) {
      await this.storeAttachments(message.id, extMsg.attachments);
    }

    logger.debug(`Stored message id=${message.id} externalId=${extMsg.id}`);
  }

  /**
   * Find an existing thread that matches the external conversation ID,
   * otherwise create a new one.
   */
  private async findOrCreateThread(
    userId: string,
    provider: Provider,
    extMsg: ExternalMessage,
  ): Promise<ChatThread> {
    // Many providers expose a conversationId; fallback to a hash of participants+timestamp
    const conversationKey = extMsg.conversationId ?? this.generateConversationKey(extMsg);

    const existingThread = await prisma.chatThread.findFirst({
      where: {
        userId,
        providerId: provider.id,
        externalConversationId: conversationKey,
      },
    });

    if (existingThread) {
      return existingThread;
    }

    // Create a new thread
    const newThread = await prisma.chatThread.create({
      data: {
        id: uuidv4(),
        userId,
        providerId: provider.id,
        externalConversationId: conversationKey,
        title: extMsg.threadTitle ?? 'Untitled Conversation',
        createdAt: extMsg.createdAt,
        updatedAt: new Date(),
      },
    });

    logger.debug(`Created new thread id=${newThread.id} for conversationKey=${conversationKey}`);
    return newThread;
  }

  /**
   * Generate a deterministic conversation key when the provider does not expose one.
   * This simple implementation hashes the sorted participant IDs and the day of the message.
   */
  private generateConversationKey(extMsg: ExternalMessage): string {
    const participants = (extMsg.participants ?? []).sort().join('|');
    const day = extMsg.createdAt.toISOString().split('T')[0];
    return `${participants}-${day}`;
  }

  /**
   * Store attachments linked to a message.
   */
  private async storeAttachments(messageId: string, attachments: ExternalAttachment[]): Promise<void> {
    for (const extAtt of attachments) {
      // Download the binary payload (implementation depends on provider client)
      const dataBuffer = await this.downloadAttachment(extAtt);

      // Encrypt the binary data
      const encryptedData = encrypt(dataBuffer);

      await prisma.attachment.create({
        data: {
          id: uuidv4(),
          messageId,
          filename: extAtt.filename,
          mimeType: extAtt.mimeType,
          size: dataBuffer.byteLength,
          data: encryptedData,
          createdAt: new Date(),
        },
      });

      logger.debug(`Stored attachment for messageId=${messageId} filename=${extAtt.filename}`);
    }
  }

  /**
   * Download attachment binary data using the provider client.
   * This is a thin wrapper that can be expanded per provider.
   */
  private async downloadAttachment(extAtt: ExternalAttachment): Promise<Buffer> {
    // Provider-specific download logic is abstracted in the client
    const client = getProviderClient(extAtt.providerType);
    return client.downloadAttachment(extAtt);
  }
}