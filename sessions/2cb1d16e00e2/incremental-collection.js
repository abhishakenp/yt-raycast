<number> {
    // Verify ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { user: true, provider: true },
    });
    if (!chat) throw new Error('Chat not found');
    if (chat.userId !== userId) throw new Error('Unauthorized');
    if (chat.providerId !== providerId) throw new Error('Provider mismatch');

    // Get provider configuration
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new Error('Provider not found');

    // Determine the cursor (last known message timestamp or id)
    const lastMessage = await prisma.message.findFirst({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
    });
    const cursor = lastMessage?.externalId ?? null;

    // Fetch new messages from the external API
    const fetched = await this.fetchFromProvider(provider, chat.externalThreadId, cursor);

    // Deduplicate and store
    const newMessages = await this.storeMessages(chat, fetched);

    // Update chat metadata (e.g., lastSyncedAt)
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastSyncedAt: new Date() },
    });

    return newMessages.length;
  }

  /**
   * Calls the external provider API to retrieve messages.
   *
   * @param provider          Provider configuration.
   * @param externalThreadId  Thread identifier used by the provider.
   * @param cursor            External ID of the last known message (for incremental fetch).
   * @returns                 Array of raw provider messages.
   */
  private static async fetchFromProvider(
    provider: Provider,
    externalThreadId: string,
    cursor: string | null,
  ): Promise<any[]> {
    // Example generic request – each provider may need its own adapter.
    const endpointMap: Record<string, string> = {
      openai: `https://api.openai.com/v1/threads/${externalThreadId}/messages`,
      anthropic: `https://api.anthropic.com/v1/threads/${externalThreadId}/messages`,
      gemini: `https://generativelanguage.googleapis.com/v1beta2/threads/${externalThreadId}/messages`,
    };

    const url = endpointMap[provider.type];
    if (!url) throw new Error(`Unsupported provider type: ${provider.type}`);

    const params: any = {};
    if (cursor) params.after = cursor; // provider‑specific pagination token

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      params,
    });

    // Assume response data is an array of messages
    return response.data.messages || [];
  }

  /**
   * Stores fetched messages after deduplication.
   *
   * @param chat    Chat entity to associate messages with.
   * @param rawMsgs Raw messages from the provider.
   * @returns       Array of newly created Message records.
   */
  private static async storeMessages(chat: Chat, rawMsgs: any[]): Promise<Message[]> {
    const created: Message[] = [];

    for (const raw of rawMsgs) {
      // Compute a deterministic hash for deduplication (e.g., based on provider ID + external ID)
      const externalId = raw.id?.toString();
      if (!externalId) continue; // skip malformed entries

      const existing = await prisma.message.findUnique({
        where: { externalId },
        select: { id: true },
      });
      if (existing) continue; // already stored

      // Prepare message payload
      const messageData: PrismaClient['message']['create']['data'] = {
        chatId: chat.id,
        userId: chat.userId,
        providerId: chat.providerId,
        externalId,
        role: raw.role ?? 'assistant',
        content: raw.content?.text ?? '',
        createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
        metadata: raw.metadata ?? {},
      };

      // Create the message
      const message = await prisma.message.create({ data: messageData });
      created.push(message);

      // Handle attachments if present
      if (raw.attachments && Array.isArray(raw.attachments)) {
        await this.storeAttachments(message.id, raw.attachments);
      }

      // Handle tags if present
      if (raw.tags && Array.isArray(raw.tags)) {
        await this.linkTags(message.id, raw.tags);
      }
    }

    return created;
  }

  /**
   * Stores attachment records and optionally persists files.
   *
   * @param messageId   ID of the parent message.
   * @param attachments Array of attachment objects from provider.
   */
  private static async storeAttachments(messageId: string, attachments: any[]): Promise<void> {
    for (const att of attachments) {
      // Compute a hash of the attachment content to avoid duplicates
      const contentBuffer = Buffer.from(att.data, 'base64');
      const hash = crypto.createHash('sha256').update(contentBuffer).digest('hex');

      const existing = await prisma.attachment.findUnique({
        where: { hash },
        select: { id: true },
      });

      if (existing) {
        // Link existing attachment to the new message
        await prisma.message.update({
          where: { id: messageId },
          data: {
            attachments: {
              connect: { id: existing.id },
            },
          },
        });
        continue;
      }

      // Store the attachment record (file storage handling is abstracted)
      const attachment = await prisma.attachment.create({
        data: {
          messageId,
          filename: att.filename ?? 'attachment.bin',
          mimeType: att.mime_type ?? 'application/octet-stream',
          size: contentBuffer.length,
          hash,
          // In a real app, you'd upload the buffer to S3/Blob storage and store the URL.
          url: `attachment://${hash}`,
        },
      });

      // Connect to message (Prisma auto‑connects via relation)
    }
  }

  /**
   * Links tags to a message, creating tags on‑the‑fly if needed.
   *
   * @param messageId ID of the message.
   * @param tagNames  Array of tag strings.
   */
  private static async linkTags(messageId: string, tagNames: string[]): Promise<void> {
    const connectOrCreate = tagNames.map((name) => ({
      where: { name },
      create: { name },
    }));

    await prisma.message.update({
      where: { id: messageId },
      data: {
        tags: {
          connectOrCreate,
        },
      },
    });
  }
}

/**
 * Example usage (e.g., in an Express route):
 *
 * app.post('/api/chats/:chatId/collect', async (req, res) => {
 *   const userId = req.user.id; // assume auth middleware
 *   const { chatId } = req.params;
 *   const { providerId } = req.body;
 *
 *   try {
 *     const added = await IncrementalCollectionService.collectNewMessages(userId, chatId, providerId);
 *     res.json({ added });
 *   } catch (e) {
 *     console.error(e);
 *     res.status(500).json({ error: e.message });
 *   }
 * });
 */