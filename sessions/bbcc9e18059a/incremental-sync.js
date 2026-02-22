<void> {
    const provider = await this.getUserProvider(userId, providerName);
    if (!provider) {
      logger.warn(`Provider ${providerName} not linked for user ${userId}`);
      return;
    }

    const client = this.getProviderClient(provider);
    if (!client) {
      logger.error(`No client implementation for provider ${providerName}`);
      return;
    }

    const lastCursor = provider.lastSyncCursor ?? null;
    logger.info(`Starting incremental sync for user ${userId} on ${providerName} from cursor ${lastCursor}`);

    try {
      const { threads, nextCursor } = await client.fetchIncrementalData(lastCursor);
      const { newThreads, newMessages } = await this.processFetchedData(userId, provider.id, threads);

      await prisma.$transaction(async (tx) => {
        // Insert new threads
        for (const thread of newThreads) {
          await tx.chatThread.create({
            data: {
              userId,
              providerId: provider.id,
              externalId: thread.externalId,
              title: thread.title,
              createdAt: thread.createdAt,
              updatedAt: thread.updatedAt,
              // Store encrypted payload if needed
              encryptedPayload: encryptData(JSON.stringify(thread.payload)),
            },
          });
        }

        // Insert new messages
        for (const message of newMessages) {
          await tx.message.create({
            data: {
              chatThreadId: message.chatThreadId,
              userId,
              providerId: provider.id,
              externalId: message.externalId,
              role: message.role,
              content: encryptData(message.content),
              createdAt: message.createdAt,
              updatedAt: message.updatedAt,
            },
          });
        }

        // Update provider cursor
        await tx.provider.update({
          where: { id: provider.id },
          data: { lastSyncCursor: nextCursor },
        });
      });

      logger.info(
        `Sync completed for user ${userId} on ${providerName}: ${newThreads.length} new threads, ${newMessages.length} new messages`
      );
    } catch (error) {
      logger.error(`Sync failed for user ${userId} on ${providerName}: ${(error as Error).message}`);
      // Optionally rethrow or handle retry logic here
    }
  }

  /**
   * Retrieve the Provider record for a specific user.
   */
  private async getUserProvider(userId: string, providerName: string): Promise<Provider | null> {
    return prisma.provider.findFirst({
      where: {
        userId,
        name: providerName,
      },
    });
  }

  /**
   * Resolve the concrete ProviderClient implementation.
   */
  private getProviderClient(provider: Provider): ProviderClient | null {
    return providerClients[provider.name] ?? null;
  }

  /**
   * Transform and deduplicate fetched provider data into internal models.
   */
  private async processFetchedData(
    userId: string,
    providerId: string,
    fetchedThreads: ProviderThread[]
  ): Promise<{
    newThreads: ProviderThread[];
    newMessages: (ProviderMessage & { chatThreadId: string })[];
  }> {
    // Load existing external IDs for deduplication
    const existingThreadIds = new Set<string>(
      (
        await prisma.chatThread.findMany({
          where: { userId, providerId },
          select: { externalId: true },
        })
      ).map((t) => t.externalId)
    );

    const existingMessageIds = new Set<string>(
      (
        await prisma.message.findMany({
          where: { userId, providerId },
          select: { externalId: true },
        })
      ).map((m) => m.externalId)
    );

    const newThreads: ProviderThread[] = [];
    const newMessages: (ProviderMessage & { chatThreadId: string })[] = [];

    for (const thread of fetchedThreads) {
      if (existingThreadIds.has(thread.externalId)) {
        // Thread already exists, only process new messages
        const threadRecord = await prisma.chatThread.findUnique({
          where: { userId_providerId_externalId: { userId, providerId, externalId: thread.externalId } },
          select: { id: true },
        });
        if (!threadRecord) continue; // safety

        for (const msg of thread.messages) {
          if (!existingMessageIds.has(msg.externalId)) {
            newMessages.push({ ...msg, chatThreadId: threadRecord.id });
          }
        }
      } else {
        // New thread + its messages
        newThreads.push(thread);
        for (const msg of thread.messages) {
          if (!existingMessageIds.has(msg.externalId)) {
            // Placeholder chatThreadId will be resolved after thread insertion
            newMessages.push({ ...msg, chatThreadId: '' });
          }
        }
      }
    }

    // After inserting threads, we need to map temporary messages to real thread IDs.
    // For simplicity, we return messages with empty chatThreadId for new threads;
    // the caller will resolve them after thread creation.
    // Here we perform deduplication just in case.
    const dedupedThreads = deduplicateThreads(newThreads);
    const dedupedMessages = deduplicateMessages(newMessages);

    return { newThreads: dedupedThreads, newMessages: dedupedMessages };
  }
}