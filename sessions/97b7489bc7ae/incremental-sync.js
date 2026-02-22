<ExternalChat[]>;
};

type ExternalChat = {
  externalId: string; // provider‑specific chat/thread identifier
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ExternalMessage[];
};

type ExternalMessage = {
  externalId: string; // provider‑specific message identifier
  role: 'assistant' | 'user' | 'system';
  content: string;
  createdAt: Date;
  attachments?: ExternalAttachment[];
};

type ExternalAttachment = {
  url: string;
  mimeType: string;
  size: number;
};

export class IncrementalSyncService {
  private prisma: PrismaClient;
  private providerClients: Record<Provider, ProviderClient>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.providerClients = {
      [Provider.OPENAI]: new OpenAIClient(),
      [Provider.ANTHROPIC]: new AnthropicClient(),
      [Provider.GEMINI]: new GeminiClient(),
    };
  }

  /**
   * Sync all enabled providers for a given user.
   */
  async syncAllProviders(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { providers: true },
    });

    for (const userProvider of user.providers) {
      const client = this.providerClients[userProvider.provider as Provider];
      if (!client) continue; // unsupported provider

      const lastSync = userProvider.lastSyncedAt;
      const externalChats = await client.fetchNewChats(user, lastSync);

      for (const extChat of externalChats) {
        await this.upsertChat(user.id, userProvider.provider, extChat);
      }

      // Update the provider's last sync timestamp
      await this.prisma.userProvider.update({
        where: { id: userProvider.id },
        data: { lastSyncedAt: new Date() },
      });
    }
  }

  /**
   * Insert or update a chat and its messages, handling deduplication.
   */
  private async upsertChat(
    userId: string,
    provider: string,
    extChat: ExternalChat,
  ): Promise<void> {
    // Find existing chat by externalId + provider
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        userId,
        provider,
        externalId: extChat.externalId,
      },
      include: { messages: true },
    });

    const chatData = {
      userId,
      provider,
      externalId: extChat.externalId,
      title: extChat.title,
      createdAt: extChat.createdAt,
      updatedAt: extChat.updatedAt,
    };

    let chatRecord: Chat;
    if (existingChat) {
      chatRecord = await this.prisma.chat.update({
        where: { id: existingChat.id },
        data: {
          title: extChat.title,
          updatedAt: extChat.updatedAt,
        },
      });
    } else {
      chatRecord = await this.prisma.chat.create({
        data: {
          ...chatData,
          id: uuidv4(),
        },
      });
    }

    // Deduplicate messages based on externalId
    const existingMessageIds = new Set(
      (existingChat?.messages ?? []).map((m) => m.externalId),
    );

    const messagesToCreate = extChat.messages
      .filter((msg) => !existingMessageIds.has(msg.externalId))
      .map((msg) => ({
        id: uuidv4(),
        chatId: chatRecord.id,
        userId,
        externalId: msg.externalId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        updatedAt: msg.createdAt,
        // Attachments will be handled separately
      }));

    if (messagesToCreate.length > 0) {
      await this.prisma.message.createMany({
        data: messagesToCreate,
        skipDuplicates: true,
      });
    }

    // Process attachments for newly created messages
    for (const msg of extChat.messages) {
      if (!msg.attachments?.length) continue;
      const dbMessage = await this.prisma.message.findFirst({
        where: {
          chatId: chatRecord.id,
          externalId: msg.externalId,
        },
      });
      if (!dbMessage) continue; // should not happen

      const existingAttachmentUrls = new Set(
        (
          await this.prisma.attachment.findMany({
            where: { messageId: dbMessage.id },
          })
        ).map((a) => a.url),
      );

      const attachmentsToCreate = msg.attachments
        .filter((att) => !existingAttachmentUrls.has(att.url))
        .map((att) => ({
          id: uuidv4(),
          messageId: dbMessage.id,
          url: att.url,
          mimeType: att.mimeType,
          size: att.size,
          createdAt: new Date(),
        }));

      if (attachmentsToCreate.length > 0) {
        await this.prisma.attachment.createMany({
          data: attachmentsToCreate,
          skipDuplicates: true,
        });
      }
    }
  }
}