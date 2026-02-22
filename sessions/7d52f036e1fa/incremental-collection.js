<IncrementalFetchResult> {
    // 1️⃣ Load provider configuration & ensure it belongs to the user
    const provider = await this.prisma.provider.findFirstOrThrow({
      where: { id: providerId, userId },
    });

    // 2️⃣ Determine the "cursor" – the timestamp of the most recent stored message
    const lastFetchedAt = await this.getLastFetchedAt(providerId, threadId);

    // 3️⃣ Ask the provider SDK to fetch messages newer than `lastFetchedAt`
    const rawMessages = await this.providerService.fetchMessages({
      provider,
      after: lastFetchedAt,
      threadId,
    });

    if (!rawMessages.length) {
      this.logger.debug(
        `No new messages for provider ${providerId} (thread ${threadId ?? 'all'}).`,
      );
      return { newMessages: [], lastFetchedAt };
    }

    // 4️⃣ Deduplicate – filter out messages already stored (by providerMessageId)
    const deduped = await this.filterExistingMessages(
      providerId,
      rawMessages.map((m) => m.providerMessageId),
    );

    // 5️⃣ Persist the new messages (and related entities)
    const persisted = await this.persistMessages(
      userId,
      provider,
      deduped,
      threadId,
    );

    // 6️⃣ Update sync status dashboard
    await this.syncStatusService.recordSuccess({
      userId,
      providerId,
      threadId,
      fetchedAt: new Date(),
      newMessageCount: persisted.length,
    });

    // 7️⃣ Return result
    const newLastFetchedAt = persisted.reduce<Date | null>((max, msg) => {
      const created = msg.createdAt;
      return max === null || created > max ? created : max;
    }, null) ?? lastFetchedAt;

    return { newMessages: persisted, lastFetchedAt: newLastFetchedAt };
  }

  /**
   * Retrieves the timestamp of the most recent message we have for the given
   * provider/thread. If none exist, returns epoch start.
   */
  private async getLastFetchedAt(
    providerId: string,
    threadId?: string,
  ): Promise<Date> {
    const where: any = { providerId };
    if (threadId) where.chatThreadId = threadId;

    const latest = await this.prisma.message.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return latest?.createdAt ?? new Date(0); // epoch start as fallback
  }

  /**
   * Filters out messages that already exist in the DB.
   *
   * @param providerId Provider identifier.
   * @param providerMessageIds List of external message IDs.
   * @returns Subset of IDs that are not yet stored.
   */
  private async filterExistingMessages(
    providerId: string,
    providerMessageIds: string[],
  ): Promise<string[]> {
    const existing = await this.prisma.message.findMany({
      where: {
        providerId,
        providerMessageId: { in: providerMessageIds },
      },
      select: { providerMessageId: true },
    });

    const existingSet = new Set(existing.map((m) => m.providerMessageId));
    return providerMessageIds.filter((id) => !existingSet.has(id));
  }

  /**
   * Persists a batch of new messages (including attachments & tags).
   *
   * @param userId   Owner of the messages.
   * @param provider Provider metadata.
   * @param newProviderMessageIds IDs of messages to persist.
   * @param threadId Optional thread to associate with.
   */
  private async persistMessages(
    userId: string,
    provider: Provider,
    newProviderMessageIds: string[],
    threadId?: string,
  ): Promise<Message[]> {
    // Fetch raw payloads for the IDs we need to store
    const rawPayloads = await this.providerService.getMessagesByIds(
      provider,
      newProviderMessageIds,
    );

    const createdMessages: Message[] = [];

    // Use a transaction to guarantee atomicity per batch
    await this.prisma.$transaction(async (tx) => {
      for (const raw of rawPayloads) {
        // Ensure the thread exists (create if missing)
        const thread = await this.ensureThreadExists(
          tx,
          userId,
          raw.threadExternalId,
          threadId,
        );

        // Create the message record
        const msg = await tx.message.create({
          data: {
            userId,
            providerId: provider.id,
            chatThreadId: thread.id,
            providerMessageId: raw.providerMessageId,
            role: raw.role,
            content: raw.content,
            createdAt: raw.createdAt,
            // optional fields like metadata can be added here
          },
        });

        // Persist attachments if any
        if (raw.attachments?.length) {
          await tx.attachment.createMany({
            data: raw.attachments.map((att) => ({
              messageId: msg.id,
              providerAttachmentId: att.id,
              filename: att.filename,
              mimeType: att.mimeType,
              size: att.size,
              url: att.url,
            })),
          });
        }

        // Persist tags if any
        if (raw.tags?.length) {
          // Ensure tags exist globally, then link
          const tagIds = await this.ensureTagsExist(tx, raw.tags);
          await tx.messageTag.createMany({
            data: tagIds.map((tagId) => ({
              messageId: msg.id,
              tagId,
            })),
          });
        }

        createdMessages.push(msg);
      }
    });

    return createdMessages;
  }

  /**
   * Guarantees a ChatThread exists for the given external thread identifier.
   * If `explicitThreadId` is supplied we use that; otherwise we look up/create by
   * the provider's external thread ID.
   */
  private async ensureThreadExists(
    tx: any,
    userId: string,
    externalThreadId: string,
    explicitThreadId?: string,
  ): Promise<ChatThread> {
    if (explicitThreadId) {
      const thread = await tx.chatThread.findUnique({
        where: { id: explicitThreadId },
      });
      if (!thread) {
        throw new Error(`Thread ${explicitThreadId} not found`);
      }
      return thread;
    }

    // Find or create by external ID + provider
    let thread = await tx.chatThread.findFirst({
      where: {
        userId,
        externalThreadId,
        providerId: tx.providerId,
      },
    });

    if (!thread) {
      thread = await tx.chatThread.create({
        data: {
          userId,
          providerId: tx.providerId,
          externalThreadId,
          title: `Thread ${externalThreadId}`,
        },
      });
    }

    return thread;
  }

  /**
   * Ensures that each tag name exists in the DB and returns their IDs.
   */
  private async ensureTagsExist(
    tx: any,
    tagNames: string[],
  ): Promise<string[]> {
    const existing = await tx.tag.findMany({
      where: { name: { in: tagNames } },
      select: { id: true, name: true },
    });

    const existingMap = new Map(existing.map((t) => [t.name, t.id]));
    const toCreate = tagNames.filter((n) => !existingMap.has(n));

    const created = await tx.tag.createMany({
      data: toCreate.map((name) => ({ name })),
      skipDuplicates: true,
    });

    // Re‑fetch all tags to get IDs for newly created ones
    const allTags = await tx.tag.findMany({
      where: { name: { in: tagNames } },
      select: { id: true, name: true },
    });

    return allTags.map((t) => t.id);
  }
}