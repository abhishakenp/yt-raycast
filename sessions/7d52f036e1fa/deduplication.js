<Message | null> {
    const hash = this.generateMessageHash(dto);
    const duplicate = await this.prisma.message.findFirst({
      where: {
        threadId,
        contentHash: hash,
        // In case the same content appears from different providers we still
        // treat it as a duplicate if the hash matches.
        // Provider specific check can be added if needed:
        // OR: [{ providerId: dto.providerId }, { providerMessageId: dto.providerMessageId }]
      },
    });
    return duplicate;
  }

  /**
   * Persists a new message while ensuring deduplication.
   * If a duplicate is found, merges tags and attachments and returns the existing record.
   */
  async upsertMessage(dto: MessageCreateDto, threadId: string): Promise<Message> {
    const existing = await this.findDuplicate(dto, threadId);
    if (existing) {
      this.logger.debug(`Duplicate message detected (id=${existing.id}) – merging metadata`);
      await this.mergeMetadata(existing.id, dto);
      return existing;
    }

    const hash = this.generateMessageHash(dto);
    const created = await this.prisma.message.create({
      data: {
        threadId,
        providerId: dto.providerId,
        providerMessageId: dto.providerMessageId,
        role: dto.role,
        content: dto.content,
        contentHash: hash,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
        // optional fields
        metadata: dto.metadata ?? undefined,
      },
    });

    // Attachments and tags are added after the message is persisted
    if (dto.attachments?.length) {
      await this.attachmentService.createManyForMessage(created.id, dto.attachments);
    }
    if (dto.tags?.length) {
      await this.tagService.addTagsToMessage(created.id, dto.tags);
    }

    return created;
  }

  /**
   * Merges tags and attachments from a duplicate payload into the existing message.
   */
  private async mergeMetadata(messageId: string, dto: MessageCreateDto): Promise<void> {
    // Merge tags
    if (dto.tags?.length) {
      await this.tagService.addTagsToMessage(messageId, dto.tags);
    }

    // Merge attachments – avoid re‑creating identical files
    if (dto.attachments?.length) {
      const existingAttachments = await this.prisma.attachment.findMany({
        where: { messageId },
        select: { checksum: true },
      });
      const existingChecksums = new Set(existingAttachments.map(a => a.checksum));

      const newAttachments = dto.attachments.filter(att => !existingChecksums.has(att.checksum));
      if (newAttachments.length) {
        await this.attachmentService.createManyForMessage(messageId, newAttachments);
      }
    }
  }

  /**
   * Runs deduplication across an entire thread.
   * Useful for historic data migrations.
   */
  async deduplicateThread(threadId: string): Promise<{ removed: number; kept: number }> {
    const messages = await this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });

    const hashMap = new Map<string, Message>();
    let removed = 0;

    for (const msg of messages) {
      if (hashMap.has(msg.contentHash)) {
        // Duplicate – merge metadata then delete
        const original = hashMap.get(msg.contentHash)!;
        await this.mergeMetadata(original.id, {
          providerId: msg.providerId,
          providerMessageId: msg.providerMessageId,
          role: msg.role,
          content: msg.content,
          attachments: [], // attachments already handled via mergeMetadata
          tags: [], // tags already handled via mergeMetadata
          createdAt: msg.createdAt,
          metadata: msg.metadata,
        });
        await this.prisma.message.delete({ where: { id: msg.id } });
        removed++;
      } else {
        hashMap.set(msg.contentHash, msg);
      }
    }

    return { removed, kept: hashMap.size };
  }
}