<ImportResult> {
    const result: ImportResult = { chatsCreated: 0, messagesCreated: 0, errors: [] };

    try {
      const providerRecord = await this.prisma.provider.findFirst({
        where: { userId, type: provider },
      });

      if (!providerRecord) {
        throw new Error(`Provider ${provider} not linked for user ${userId}`);
      }

      const lastSync = providerRecord.lastSyncedAt ?? new Date(0);

      let importFn: (p: Provider, since: Date) => Promise<ImportResult>;

      switch (provider) {
        case ProviderType.OPENAI:
          importFn = this.importOpenAI.bind(this);
          break;
        case ProviderType.ANTHROPIC:
          importFn = this.importAnthropic.bind(this);
          break;
        case ProviderType.GEMINI:
          importFn = this.importGemini.bind(this);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const importRes = await importFn(providerRecord, lastSync);
      result.chatsCreated += importRes.chatsCreated;
      result.messagesCreated += importRes.messagesCreated;
      result.errors.push(...importRes.errors);

      // Update last sync timestamp
      await this.prisma.provider.update({
        where: { id: providerRecord.id },
        data: { lastSyncedAt: new Date() },
      });
    } catch (e) {
      result.errors.push((e as Error).message);
    }

    return result;
  }

  /**
   * Import chats from OpenAI.
   * Uses the OpenAI “List Threads” endpoint (v1/threads) and “List Messages” for each thread.
   */
  private async importOpenAI(provider: Provider, since: Date): Promise<ImportResult> {
    const result: ImportResult = { chatsCreated: 0, messagesCreated: 0, errors: [] };
    const baseUrl = 'https://api.openai.com/v1';
    const headers = {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      // 1️⃣ Fetch threads (treated as chats)
      const threadsRes = await fetch(`${baseUrl}/threads?limit=100`, { headers });
      if (!threadsRes.ok) throw new Error(`OpenAI threads fetch failed: ${threadsRes.statusText}`);
      const threadsData = await threadsRes.json();

      for (const thread of threadsData.data) {
        const threadCreated = new Date(thread.created_at * 1000);
        if (threadCreated <= since) continue; // incremental sync

        // Deduplication – check if chat already exists
        const existingChat = await this.prisma.chat.findFirst({
          where: { providerId: provider.id, externalId: thread.id },
        });
        if (existingChat) continue;

        const chat = await this.prisma.chat.create({
          data: {
            id: uuidv4(),
            userId: provider.userId,
            providerId: provider.id,
            externalId: thread.id,
            title: thread.metadata?.title ?? `OpenAI Thread ${thread.id}`,
            createdAt: threadCreated,
            updatedAt: threadCreated,
          },
        });
        result.chatsCreated++;

        // 2️⃣ Fetch messages for the thread
        const msgsRes = await fetch(`${baseUrl}/threads/${thread.id}/messages?limit=100`, { headers });
        if (!msgsRes.ok) {
          result.errors.push(`Failed to fetch messages for thread ${thread.id}: ${msgsRes.statusText}`);
          continue;
        }
        const msgsData = await msgsRes.json();

        for (const msg of msgsData.data) {
          const msgCreated = new Date(msg.created_at * 1000);
          if (msgCreated <= since) continue;

          // Deduplication – check if message already exists
          const exists = await this.prisma.message.findFirst({
            where: { chatId: chat.id, externalId: msg.id },
          });
          if (exists) continue;

          await this.prisma.message.create({
            data: {
              id: uuidv4(),
              chatId: chat.id,
              providerId: provider.id,
              externalId: msg.id,
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
              createdAt: msgCreated,
            },
          });
          result.messagesCreated++;
        }
      }
    } catch (e) {
      result.errors.push((e as Error).message);
    }

    return result;
  }

  /**
   * Import chats from Anthropic.
   * Anthropic does not expose a public “history” endpoint, so we rely on a webhook‑based
   * archive that the user configures. For the purpose of this demo we assume a simple
   * GET endpoint returning an array of conversations.
   */
  private async importAnthropic(provider: Provider, since: Date): Promise<ImportResult> {
    const result: ImportResult = { chatsCreated: 0, messagesCreated: 0, errors: [] };
    const baseUrl = provider.apiBaseUrl ?? 'https://api.anthropic.com/v1';
    const headers = {
      'x-api-key': provider.apiKey,
      'Content-Type': 'application/json',
    };

    try {
      const convRes = await fetch(`${baseUrl}/conversations?since=${since.toISOString()}`, { headers });
      if (!convRes.ok) throw new Error(`Anthropic conversations fetch failed: ${convRes.statusText}`);
      const conversations = await convRes.json();

      for (const conv of conversations) {
        const convCreated = new Date(conv.created_at);
        if (convCreated <= since) continue;

        const existingChat = await this.prisma.chat.findFirst({
          where: { providerId: provider.id, externalId: conv.id },
        });
        if (existingChat) continue;

        const chat = await this.prisma.chat.create({
          data: {
            id: uuidv4(),
            userId: provider.userId,
            providerId: provider.id,
            externalId: conv.id,
            title: conv.title ?? `Anthropic Conversation ${conv.id}`,
            createdAt: convCreated,
            updatedAt: convCreated,
          },
        });
        result.chatsCreated++;

        for (const msg of conv.messages) {
          const msgCreated = new Date(msg.timestamp);
          if (msgCreated <= since) continue;

          const exists = await this.prisma.message.findFirst({
            where: { chatId: chat.id, externalId: msg.id },
          });
          if (exists) continue;

          await this.prisma.message.create({
            data: {
              id: uuidv4(),
              chatId: chat.id,
              providerId: provider.id,
              externalId: msg.id,
              role: msg.role,
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
              createdAt: msgCreated,
            },
          });
          result.messagesCreated++;
        }
      }
    } catch (e) {
      result.errors.push((e as Error).message);
    }

    return result;
  }

  /**
   * Import chats from Google Gemini.
   * Gemini provides a “list chats” endpoint under the Generative AI API.
   */
  private async importGemini(provider: Provider, since: Date): Promise<ImportResult> {
    const result: ImportResult = { chatsCreated: 0, messagesCreated: 0, errors: [] };
    const baseUrl = provider.apiBaseUrl ?? 'https://generativelanguage.googleapis.com/v1';
    const headers = {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const chatsRes = await fetch(`${baseUrl}/projects/${provider.projectId}/chats?filter=updatedAfter:${since.toISOString()}`, {
        headers,
      });
      if (!chatsRes.ok) throw new Error(`Gemini chats fetch failed: ${chatsRes.statusText}`);
      const chatsData = await chatsRes.json();

      for (const chat of chatsData.chats) {
        const chatCreated = new Date(chat.createTime);
        if (chatCreated <= since) continue;

        const existingChat = await this.prisma.chat.findFirst({
          where: { providerId: provider.id, externalId: chat.name },
        });
        if (existingChat) continue;

        const newChat = await this.prisma.chat.create({
          data: {
            id: uuidv4(),
            userId: provider.userId,
            providerId: provider.id,
            externalId: chat.name,
            title: chat.displayName ?? `Gemini Chat ${chat.name}`,
            createdAt: chatCreated,
            updatedAt: new Date(chat.updateTime),
          },
        });
        result.chatsCreated++;

        // Gemini messages are stored under `messages` array
        for (const msg of chat.messages ?? []) {
          const msgCreated = new Date(msg.createTime);
          if (msgCreated <= since) continue;

          const exists = await this.prisma.message.findFirst({
            where: { chatId: newChat.id, externalId: msg.name },
          });
          if (exists) continue;

          await this.prisma.message.create({
            data: {
              id: uuidv4(),
              chatId: newChat.id,
              providerId: provider.id,
              externalId: msg.name,
              role: msg.author?.role ?? 'assistant',
              content: typeof msg.content?.parts?.[0] === 'string' ? msg.content.parts[0] : JSON.stringify(msg.content),
              createdAt: msgCreated,
            },
          });
          result.messagesCreated++;
        }
      }
    } catch (e) {
      result.errors.push((e as Error).message);
    }

    return result;
  }
}