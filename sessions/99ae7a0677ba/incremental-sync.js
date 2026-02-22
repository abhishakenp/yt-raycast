<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providers: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    for (const provider of user.providers) {
      try {
        await this.syncProvider(user, provider);
      } catch (err) {
        logger.error(
          `Sync failed for user ${userId} provider ${provider.type}:`,
          err,
        );
        // Continue with other providers – we don't want one failure to block the rest.
      }
    }
  }

  /**
   * Sync a single provider for a user.
   */
  private static async syncProvider(user: User & { providers: Provider[] }, provider: Provider): Promise<void> {
    const lastSyncedAt = provider.lastSyncedAt ?? new Date(0);
    const adapter = this.getAdapter(provider);

    // 1️⃣ Fetch remote chats/messages newer than lastSyncedAt
    const remoteThreads = await adapter.fetchThreadsSince(lastSyncedAt);

    // 2️⃣ Process each thread
    for (const thread of remoteThreads) {
      // Upsert Chat (thread) – deduplication based on providerThreadId
      const chat = await prisma.chat.upsert({
        where: {
          providerThreadId_providerId: {
            providerThreadId: thread.id,
            providerId: provider.id,
          },
        },
        create: {
          id: uuidv4(),
          userId: user.id,
          providerId: provider.id,
          providerThreadId: thread.id,
          title: thread.title ?? 'Untitled',
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
        },
        update: {
          title: thread.title ?? undefined,
          updatedAt: thread.updatedAt,
        },
      });

      // Upsert each message in the thread
      for (const msg of thread.messages) {
        await prisma.message.upsert({
          where: {
            providerMessageId_providerId: {
              providerMessageId: msg.id,
              providerId: provider.id,
            },
          },
          create: {
            id: uuidv4(),
            chatId: chat.id,
            userId: user.id,
            providerId: provider.id,
            providerMessageId: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
          },
          update: {
            content: msg.content,
            updatedAt: msg.updatedAt,
          },
        });
      }
    }

    // 3️⃣ Update provider's lastSyncedAt marker
    const newest = remoteThreads.reduce<Date | null>((max, t) => {
      if (!max || t.updatedAt > max) return t.updatedAt;
      return max;
    }, null);

    if (newest) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { lastSyncedAt: newest },
      });
    }

    logger.info(`Sync completed for user ${user.id} provider ${provider.type}`);
  }

  /**
   * Return a provider‑specific adapter that implements the common interface.
   */
  private static getAdapter(provider: Provider): ProviderAdapter {
    switch (provider.type) {
      case 'OPENAI':
        return new OpenAIAdapter(provider);
      case 'ANTHROPIC':
        return new AnthropicAdapter(provider);
      case 'GEMINI':
        return new GeminiAdapter(provider);
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                     Provider‑agnostic interface & adapters                */
/* -------------------------------------------------------------------------- */

interface Thread {
  id: string; // provider‑specific thread identifier
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ProviderMessage[];
}

interface ProviderMessage {
  id: string; // provider‑specific message identifier
  role: 'assistant' | 'user' | 'system';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal contract each provider adapter must fulfil.
 */
interface ProviderAdapter {
  fetchThreadsSince(since: Date): Promise<Thread[]>;
}

/* ---------------------------- OpenAI Adapter ---------------------------- */

class OpenAIAdapter implements ProviderAdapter {
  private client: OpenAI;

  constructor(private provider: Provider) {
    this.client = new OpenAI({ apiKey: provider.apiKey });
  }

  async fetchThreadsSince(since: Date): Promise<Thread[]> {
    // OpenAI does not expose a native “list threads” endpoint yet.
    // Assume we store a mapping of conversation IDs in a custom DB table
    // `external_conversations` that we can query.
    const externalConvs = await prisma.externalConversation.findMany({
      where: {
        providerId: this.provider.id,
        updatedAt: { gt: since },
      },
    });

    const threads: Thread[] = [];

    for (const conv of externalConvs) {
      const messages = await this.client.beta.threads.messages.list(conv.providerThreadId);
      const formattedMessages: ProviderMessage[] = messages.data.map((m) => ({
        id: m.id,
        role: m.role as any,
        content: m.content.map((c) => (c.type === 'text' ? c.text?.value : '')).join('\n'),
        createdAt: new Date(m.created_at * 1000),
        updatedAt: new Date(m.created_at * 1000), // OpenAI messages are immutable
      }));

      threads.push({
        id: conv.providerThreadId,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messages: formattedMessages,
      });
    }

    return threads;
  }
}

/* --------------------------- Anthropic Adapter --------------------------- */

class AnthropicAdapter implements ProviderAdapter {
  private client: Anthropic;

  constructor(private provider: Provider) {
    this.client = new Anthropic({ apiKey: provider.apiKey });
  }

  async fetchThreadsSince(since: Date): Promise<Thread[]> {
    // Anthropic does not provide a thread list API. In a real implementation
    // we would rely on webhook events stored locally. For demo purposes we
    // return an empty array.
    return [];
  }
}

/* ---------------------------- Gemini Adapter ---------------------------- */

class GeminiAdapter implements ProviderAdapter {
  private client: GoogleGenerativeAI;

  constructor(private provider: Provider) {
    this.client = new GoogleGenerativeAI(provider.apiKey);
  }

  async fetchThreadsSince(since: Date): Promise<Thread[]> {
    // Gemini API currently lacks a conversation‑list endpoint.
    // Placeholder implementation – returns empty.
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                         Scheduler / Cron entry point                        */
/* -------------------------------------------------------------------------- */

export async function runIncrementalSyncCron(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  for (const { id } of users) {
    try {
      await SyncService.syncUser(id);
    } catch (err) {
      logger.error(`Global sync failed for user ${id}:`, err);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                               Exported API                                   */
/* -------------------------------------------------------------------------- */

export default SyncService;