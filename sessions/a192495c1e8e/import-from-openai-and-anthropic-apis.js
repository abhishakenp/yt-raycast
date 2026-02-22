<string, any>;
};

type OpenAIMessage = {
  id: string;
  object: string;
  created_at: number;
  role: 'assistant' | 'user' | 'system';
  content: { type: string; text: { value: string } }[];
  file_ids?: string[];
  metadata?: Record<string, any>;
};

type AnthropicMessage = {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  created_at: string; // ISO string
  metadata?: Record<string, any>;
};

type AnthropicConversation = {
  id: string;
  title?: string;
  messages: AnthropicMessage[];
  created_at: string;
  updated_at: string;
};

export class ImportService {
  /**
   * Import all chats and messages from a provider (OpenAI or Anthropic) for a given user.
   * The provider must already be linked to the user and contain a valid API key.
   */
  static async importFromProvider(userId: string, providerId: string): Promise<ImportResult> {
    const result: ImportResult = { chatsCreated: 0, messagesCreated: 0, errors: [] };

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: { user: true },
    });

    if (!provider) {
      result.errors.push('Provider not found');
      return result;
    }

    if (provider.userId !== userId) {
      result.errors.push('Provider does not belong to the user');
      return result;
    }

    try {
      if (provider.type === 'OPENAI') {
        await this.importFromOpenAI(provider, result);
      } else if (provider.type === 'ANTHROPIC') {
        await this.importFromAnthropic(provider, result);
      } else {
        result.errors.push(`Unsupported provider type: ${provider.type}`);
      }
    } catch (e: any) {
      result.errors.push(`Unexpected error: ${e.message}`);
    }

    return result;
  }

  /** -----------------------------------------------------------------------
   *  OpenAI import implementation
   *  --------------------------------------------------------------------- */
  private static async importFromOpenAI(provider: Provider & { user: User }, result: ImportResult) {
    const baseUrl = 'https://api.openai.com/v1';
    const headers = {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    };

    // 1️⃣ Fetch all threads (each thread = a chat)
    let nextUrl: string | null = `${baseUrl}/threads?limit=100`;
    while (nextUrl) {
      const threadsResp = await fetch(nextUrl, { headers });
      if (!threadsResp.ok) {
        result.errors.push(`Failed to fetch OpenAI threads: ${threadsResp.statusText}`);
        return;
      }
      const threadsData = (await threadsResp.json()) as { data: OpenAIThread[]; object: string; has_more: boolean; url?: string };
      for (const thread of threadsData.data) {
        const chat = await this.upsertChatFromOpenAI(provider, thread);
        if (chat) {
          result.chatsCreated += 1;
          await this.importMessagesFromOpenAIThread(provider, chat, result);
        }
      }
      nextUrl = threadsData.has_more ? `${baseUrl}/threads?limit=100&after=${threadsData.data[threadsData.data.length - 1].id}` : null;
    }
  }

  private static async upsertChatFromOpenAI(provider: Provider, thread: OpenAIThread): Promise<Chat | null> {
    // Deduplication based on externalId (OpenAI thread id)
    const existing = await prisma.chat.findFirst({
      where: { externalId: thread.id, providerId: provider.id },
    });
    if (existing) return null;

    const chat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        userId: provider.userId,
        providerId: provider.id,
        externalId: thread.id,
        title: thread.metadata?.title ?? `OpenAI Thread ${thread.id}`,
        createdAt: new Date(thread.created_at * 1000),
        updatedAt: new Date(),
      },
    });
    return chat;
  }

  private static async importMessagesFromOpenAIThread(provider: Provider, chat: Chat, result: ImportResult) {
    const baseUrl = 'https://api.openai.com/v1';
    const headers = {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    };

    // OpenAI provides a "list messages" endpoint per thread
    let nextUrl: string | null = `${baseUrl}/threads/${chat.externalId}/messages?limit=100`;
    while (nextUrl) {
      const msgsResp = await fetch(nextUrl, { headers });
      if (!msgsResp.ok) {
        result.errors.push(`Failed to fetch messages for thread ${chat.externalId}: ${msgsResp.statusText}`);
        return;
      }
      const msgsData = (await msgsResp.json()) as {
        data: OpenAIMessage[];
        object: string;
        has_more: boolean;
      };
      for (const msg of msgsData.data) {
        const created = await this.upsertMessageFromOpenAI(provider, chat, msg);
        if (created) result.messagesCreated += 1;
      }
      nextUrl = msgsData.has_more
        ? `${baseUrl}/threads/${chat.externalId}/messages?limit=100&after=${msgsData.data[msgsData.data.length - 1].id}`
        : null;
    }
  }

  private static async upsertMessageFromOpenAI(provider: Provider, chat: Chat, msg: OpenAIMessage): Promise<boolean> {
    // Deduplication by externalId (OpenAI message id)
    const exists = await prisma.message.findFirst({
      where: { externalId: msg.id, chatId: chat.id },
    });
    if (exists) return false;

    const contentText = msg.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as any).text.value)
      .join('\n');

    await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: chat.id,
        providerId: provider.id,
        externalId: msg.id,
        role: msg.role,
        content: contentText,
        createdAt: new Date(msg.created_at * 1000),
        updatedAt: new Date(),
      },
    });
    return true;
  }

  /** -----------------------------------------------------------------------
   *  Anthropic import implementation
   *  --------------------------------------------------------------------- */
  private static async importFromAnthropic(provider: Provider & { user: User }, result: ImportResult) {
    const baseUrl = 'https://api.anthropic.com/v1';
    const headers = {
      'x-api-key': provider.apiKey,
      'Content-Type': 'application/json',
    };

    // Anthropic does not expose a public "list conversations" endpoint.
    // For this example we assume a custom endpoint exists for the user’s account:
    // GET /conversations?limit=100&cursor=...
    let cursor: string | null = null;
    do {
      const url = new URL(`${baseUrl}/conversations`);
      url.searchParams.append('limit', '100');
      if (cursor) url.searchParams.append('cursor', cursor);

      const convResp = await fetch(url.toString(), { headers });
      if (!convResp.ok) {
        result.errors.push(`Failed to fetch Anthropic conversations: ${convResp.statusText}`);
        return;
      }
      const convData = (await convResp.json()) as {
        conversations: AnthropicConversation[];
        next_cursor?: string;
      };

      for (const conv of convData.conversations) {
        const chat = await this.upsertChatFromAnthropic(provider, conv);
        if (chat) {
          result.chatsCreated += 1;
          await this.importMessagesFromAnthropicConversation(provider, chat, conv, result);
        }
      }

      cursor = convData.next_cursor ?? null;
    } while (cursor);
  }

  private static async upsertChatFromAnthropic(provider: Provider, conv: AnthropicConversation): Promise<Chat | null> {
    const existing = await prisma.chat.findFirst({
      where: { externalId: conv.id, providerId: provider.id },
    });
    if (existing) return null;

    const chat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        userId: provider.userId,
        providerId: provider.id,
        externalId: conv.id,
        title: conv.title ?? `Anthropic Conversation ${conv.id}`,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
      },
    });
    return chat;
  }

  private static async importMessagesFromAnthropicConversation(
    provider: Provider,
    chat: Chat,
    conv: AnthropicConversation,
    result: ImportResult,
  ) {
    for (const msg of conv.messages) {
      const created = await this.upsertMessageFromAnthropic(provider, chat, msg);
      if (created) result.messagesCreated += 1;
    }
  }

  private static async upsertMessageFromAnthropic(
    provider: Provider,
    chat: Chat,
    msg: AnthropicMessage,
  ): Promise<boolean> {
    const exists = await prisma.message.findFirst({
      where: { externalId: msg.id, chatId: chat.id },
    });
    if (exists) return false;

    await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: chat.id,
        providerId: provider.id,
        externalId: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.created_at),
        updatedAt: new Date(),
      },
    });
    return true;
  }
}

// Export a ready‑to‑use instance for DI frameworks if needed
export const importService = new ImportService();