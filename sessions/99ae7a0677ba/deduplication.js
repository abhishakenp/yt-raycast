<string, string>(); // messageId -> hash

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  /**
   * Compute a SHA‑256 hash for a message. The hash includes the raw content,
   * role (user/assistant), and optionally the attachment IDs to ensure that
   * messages with different attachments are not considered duplicates.
   *
   * @param message Message entity
   * @returns Hex string of the hash
   */
  private computeHash(message: Message): string {
    const hash = crypto.createHash('sha256');
    hash.update(message.content ?? '');
    hash.update(message.role ?? '');
    if (message.attachments?.length) {
      const attachmentIds = message.attachments
        .map((a) => a.id)
        .sort()
        .join(',');
      hash.update(attachmentIds);
    }
    return hash.digest('hex');
  }

  /**
   * Populate an in‑memory cache of message hashes for a given set of messages.
   * This reduces DB round‑trips when processing large batches.
   *
   * @param messages Array of Message entities
   */
  private cacheHashes(messages: Message[]): void {
    for (const msg of messages) {
      if (!this.hashCache.has(msg.id)) {
        this.hashCache.set(msg.id, this.computeHash(msg));
      }
    }
  }

  /**
   * Find duplicate messages within a specific chat. Duplicates are defined as
   * messages that share the same hash and whose timestamps are within the
   * `timeWindowMs` tolerance (default 5 seconds). The earliest message is kept.
   *
   * @param chatId ID of the chat to scan
   * @param timeWindowMs Time window tolerance in milliseconds
   * @returns Array of message IDs that should be removed
   */
  async findDuplicatesInChat(
    chatId: string,
    timeWindowMs = 5000,
  ): Promise<string[]> {
    const messages = await this.messageRepo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
      relations: ['attachments'],
    });

    if (messages.length === 0) {
      return [];
    }

    this.cacheHashes(messages);

    const groups = new Map<string, Message[]>();
    for (const msg of messages) {
      const hash = this.hashCache.get(msg.id)!;
      const bucket = groups.get(hash) ?? [];
      bucket.push(msg);
      groups.set(hash, bucket);
    }

    const duplicates: string[] = [];

    for (const [, msgs] of groups) {
      if (msgs.length < 2) continue;

      // Sort by createdAt (already sorted globally, but ensure per bucket)
      msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      let keep = msgs[0];
      for (let i = 1; i < msgs.length; i++) {
        const cur = msgs[i];
        const diff = cur.createdAt.getTime() - keep.createdAt.getTime();
        if (diff <= timeWindowMs) {
          duplicates.push(cur.id);
        } else {
          // New base message after the time window
          keep = cur;
        }
      }
    }

    return duplicates;
  }

  /**
   * Remove duplicate messages for a given chat. This method performs a soft‑delete
   * (sets `deletedAt`) to preserve auditability. If hard deletion is required,
   * replace the `softDelete` call with `remove`.
   *
   * @param chatId ID of the chat to deduplicate
   * @param timeWindowMs Optional time window tolerance
   * @returns Number of messages removed
   */
  async deduplicateChat(
    chatId: string,
    timeWindowMs = 5000,
  ): Promise<number> {
    const duplicateIds = await this.findDuplicatesInChat(chatId, timeWindowMs);
    if (duplicateIds.length === 0) {
      this.logger.log(`No duplicates found for chat ${chatId}`);
      return 0;
    }

    await this.messageRepo.softDelete({ id: In(duplicateIds) });
    this.logger.log(
      `Deduplicated chat ${chatId}: removed ${duplicateIds.length} messages`,
    );
    // Clean cache
    duplicateIds.forEach((id) => this.hashCache.delete(id));
    return duplicateIds.length;
  }

  /**
   * Global deduplication across all chats for a specific user. This is a more
   * expensive operation and should be scheduled (e.g., nightly) or triggered
   * manually by the user.
   *
   * @param userId ID of the user whose data should be deduplicated
   * @param timeWindowMs Optional time window tolerance
   * @returns Mapping of chatId → number of messages removed
   */
  async deduplicateUser(
    userId: string,
    timeWindowMs = 5000,
  ): Promise<Record<string, number>> {
    const chats = await this.chatRepo.find({
      where: { user: { id: userId } },
      select: ['id'],
    });

    const result: Record<string, number> = {};

    for (const chat of chats) {
      const removed = await this.deduplicateChat(chat.id, timeWindowMs);
      if (removed > 0) {
        result[chat.id] = removed;
      }
    }

    this.logger.log(
      `User ${userId} deduplication completed. Affected chats: ${Object.keys(
        result,
      ).length}`,
    );

    return result;
  }
}