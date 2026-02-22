<void> {
    this.logger.log(`Starting deduplication for user ${userId}`);

    // 1️⃣ Load all messages for the user (including needed relations)
    const messages = await this.prisma.message.findMany({
      where: { userId },
      include: {
        tags: true,
        attachments: true,
        chat: true,
      },
    });

    // 2️⃣ Compute a deterministic hash for each message
    const hashMap = new Map<string, Message[]>();
    for (const msg of messages) {
      const hash = this.computeMessageHash(msg);
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash)!.push(msg);
    }

    // 3️⃣ Process each hash group that has more than one entry (duplicates)
    for (const [hash, group] of hashMap.entries()) {
      if (group.length < 2) continue; // no duplicates

      // Sort by createdAt ascending – the first one will be the canonical message
      group.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const canonical = group[0];
      const duplicates = group.slice(1);

      this.logger.debug(
        `Found ${duplicates.length} duplicates for message hash ${hash} (canonical id ${canonical.id})`,
      );

      // 3️⃣ Merge tags
      const tagIds = new Set<string>();
      for (const msg of group) {
        for (const tag of msg.tags) {
          tagIds.add(tag.id);
        }
      }
      await this.prisma.message.update({
        where: { id: canonical.id },
        data: {
          tags: {
            set: Array.from(tagIds).map((id) => ({ id })),
          },
        },
      });

      // 4️⃣ Re‑link chats (if a duplicate belongs to a different chat)
      for (const dup of duplicates) {
        if (dup.chatId && dup.chatId !== canonical.chatId) {
          // Attach the canonical message to the other chat as well
          await this.prisma.chat.update({
            where: { id: dup.chatId },
            data: {
              messages: {
                connect: { id: canonical.id },
              },
            },
          });
        }
      }

      // 5️⃣ Delete duplicate messages (cascade will remove join rows)
      const duplicateIds = duplicates.map((d) => d.id);
      await this.prisma.message.deleteMany({
        where: { id: { in: duplicateIds } },
      });

      this.logger.debug(
        `Deleted duplicate message IDs: ${duplicateIds.join(', ')}`,
      );
    }

    this.logger.log(`Deduplication completed for user ${userId}`);
  }

  /**
   * Compute a stable SHA‑256 hash for a message.
   * The hash includes:
   *   - Normalised text content (trimmed, collapsed whitespace)
   *   - Provider identifier (to avoid cross‑provider collisions on identical text)
   *   - Attachments metadata (filename + size + mime)
   *
   * @param msg Message record from Prisma
   */
  private computeMessageHash(msg: Message & {
    attachments?: { filename: string; size: number; mimeType: string }[];
  }): string {
    const normalizedContent = msg.content
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

    const providerPart = msg.providerId ?? 'unknown';

    const attachmentPart = (msg.attachments ?? [])
      .map((a) => `${a.filename}|${a.size}|${a.mimeType}`)
      .sort()
      .join(';');

    const raw = `${normalizedContent}|${providerPart}|${attachmentPart}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Optional helper to deduplicate chats themselves.
   * Two chats are considered duplicates if they have the same title
   * and contain the exact same set of message hashes.
   *
   * @param userId The user whose chats should be deduplicated.
   */
  async deduplicateUserChats(userId: string): Promise<void> {
    this.logger.log(`Starting chat deduplication for user ${userId}`);

    const chats = await this.prisma.chat.findMany({
      where: { userId },
      include: {
        messages: {
          include: {
            attachments: true,
          },
        },
      },
    });

    // Build a map: title -> list of chats
    const titleMap = new Map<string, Chat[]>();
    for (const chat of chats) {
      const title = chat.title?.trim().toLowerCase() ?? '';
      if (!titleMap.has(title)) titleMap.set(title, []);
      titleMap.get(title)!.push(chat);
    }

    for (const [title, chatGroup] of titleMap.entries()) {
      if (chatGroup.length < 2) continue; // no possible duplicates

      // Compute a fingerprint for each chat based on its messages' hashes
      const fingerprintMap = new Map<string, Chat[]>();
      for (const chat of chatGroup) {
        const msgHashes = chat.messages
          .map((msg) => this.computeMessageHash(msg as any))
          .sort()
          .join('|');
        const fingerprint = crypto
          .createHash('sha256')
          .update(msgHashes)
          .digest('hex');

        if (!fingerprintMap.has(fingerprint)) fingerprintMap.set(fingerprint, []);
        fingerprintMap.get(fingerprint)!.push(chat);
      }

      // Merge chats that share the same fingerprint
      for (const [fp, dupChats] of fingerprintMap.entries()) {
        if (dupChats.length < 2) continue;

        // Keep the oldest chat as canonical
        dupChats.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const canonicalChat = dupChats[0];
        const redundantChats = dupChats.slice(1);

        // Re‑link any tags from redundant chats onto the canonical chat
        const tagIds = new Set<string>();
        for (const c of dupChats) {
          const tags = await this.prisma.chat
            .findUnique({ where: { id: c.id } })
            .tags();
          for (const t of tags) tagIds.add(t.id);
        }
        await this.prisma.chat.update({
          where: { id: canonicalChat.id },
          data: {
            tags: {
              set: Array.from(tagIds).map((id) => ({ id })),
            },
          },
        });

        // Delete redundant chats (messages are already deduped at message level)
        const redundantIds = redundantChats.map((c) => c.id);
        await this.prisma.chat.deleteMany({
          where: { id: { in: redundantIds } },
        });

        this.logger.debug(
          `Merged ${redundantIds.length} duplicate chats into chat ${canonicalChat.id} (title="${title}")`,
        );
      }
    }

    this.logger.log(`Chat deduplication completed for user ${userId}`);
  }
}