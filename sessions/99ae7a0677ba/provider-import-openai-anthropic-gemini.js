<{ newChats: number; newMessages: number }> {
  switch (provider) {
    case 'openai':
      return await importFromOpenAI(options);
    case 'anthropic':
      return await importFromAnthropic(options);
    case 'gemini':
      return await importFromGemini(options);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                               OpenAI Import                               */
/* -------------------------------------------------------------------------- */

async function importFromOpenAI({
  userId,
  accessToken,
  since,
}: ImportOptions): Promise<{ newChats: number; newMessages: number }> {
  const baseUrl = 'https://api.openai.com/v1';
  let nextCursor: string | null = null;
  let newChats = 0;
  let newMessages = 0;

  // Ensure provider record exists
  await upsertProvider(userId, 'openai', accessToken);

  do {
    const url = new URL(`${baseUrl}/threads`);
    if (nextCursor) url.searchParams.append('after', nextCursor);
    if (since) url.searchParams.append('modified_since', since.toISOString());

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${err}`);
    }

    const data: {
      data: Array<{
        id: string;
        object: string;
        created_at: number;
        metadata: Record<string, any>;
        // messages are not included directly; we need a second call per thread
      }>;
      has_more: boolean;
      last_id?: string;
    } = await res.json();

    for (const thread of data.data) {
      const { created, messagesCreated } = await importOpenAIThread(
        userId,
        thread.id,
        accessToken,
        since,
      );
      newChats += created ? 1 : 0;
      newMessages += messagesCreated;
    }

    nextCursor = data.has_more ? data.last_id ?? null : null;
  } while (nextCursor);

  return { newChats, newMessages };
}

/**
 * Imports a single OpenAI thread (chat) and its messages.
 * Returns whether a new chat was created and how many new messages were added.
 */
async function importOpenAIThread(
  userId: string,
  threadId: string,
  accessToken: string,
  since?: Date,
): Promise<{ created: boolean; messagesCreated: number }> {
  // Check if chat already exists (deduplication)
  const existingChat = await prisma.chat.findFirst({
    where: { providerId: threadId, provider: Provider.OPENAI, userId },
  });

  let chat: PrismaChat;
  let chatCreated = false;

  if (!existingChat) {
    chat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        userId,
        provider: Provider.OPENAI,
        providerId: threadId,
        title: `OpenAI Thread ${threadId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    chatCreated = true;
  } else {
    chat = existingChat;
  }

  // Fetch messages for the thread
  const messagesUrl = `https://api.openai.com/v1/threads/${threadId}/messages`;
  const res = await fetch(messagesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch OpenAI messages: ${res.status} ${err}`);
  }

  const msgData: {
    data: Array<{
      id: string;
      object: string;
      created_at: number;
      role: 'assistant' | 'user' | string;
      content: Array<{
        type: 'text' | string;
        text?: { value: string };
        // other content types omitted for brevity
      }>;
      file_ids?: string[];
    }>;
  } = await res.json();

  let newMessageCount = 0;

  for (const msg of msgData.data) {
    const createdAt = new Date(msg.created_at * 1000);
    if (since && createdAt <= since) continue;

    // Deduplication based on provider message ID
    const exists = await prisma.message.findFirst({
      where: { providerMessageId: msg.id, provider: Provider.OPENAI, chatId: chat.id },
    });
    if (exists) continue;

    const textContent = msg.content
      .filter((c) => c.type === 'text' && c.text?.value)
      .map((c) => c.text!.value)
      .join('\n');

    await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: chat.id,
        userId,
        role: msg.role,
        content: textContent,
        provider: Provider.OPENAI,
        providerMessageId: msg.id,
        createdAt,
        updatedAt: new Date(),
      },
    });
    newMessageCount++;
  }

  // Update chat's last activity timestamp
  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  return { created: chatCreated, messagesCreated: newMessageCount };
}

/* -------------------------------------------------------------------------- */
/*                              Anthropic Import                              */
/* -------------------------------------------------------------------------- */

async function importFromAnthropic({
  userId,
  accessToken,
  since,
}: ImportOptions): Promise<{ newChats: number; newMessages: number }> {
  const baseUrl = 'https://api.anthropic.com/v1';
  let cursor: string | null = null;
  let newChats = 0;
  let newMessages = 0;

  await upsertProvider(userId, 'anthropic', accessToken);

  do {
    const url = new URL(`${baseUrl}/messages`);
    if (cursor) url.searchParams.append('cursor', cursor);
    if (since) url.searchParams.append('since', since.toISOString());

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Anthropic-Version': '2023-06-01',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error: ${res.status} ${err}`);
    }

    const data: {
      messages: Array<{
        id: string;
        created_at: string; // ISO
        role: 'assistant' | 'user';
        content: string;
        thread_id: string;
      }>;
      next_cursor?: string;
    } = await res.json();

    // Group messages by thread_id to create chats
    const threadsMap = new Map<string, typeof data.messages[0][]>();
    for (const msg of data.messages) {
      if (since && new Date(msg.created_at) <= since) continue;
      if (!threadsMap.has(msg.thread_id)) threadsMap.set(msg.thread_id, []);
      threadsMap.get(msg.thread_id)!.push(msg);
    }

    for (const [threadId, msgs] of threadsMap.entries()) {
      const { created, messagesCreated } = await importAnthropicThread(
        userId,
        threadId,
        msgs,
        accessToken,
        since,
      );
      newChats += created ? 1 : 0;
      newMessages += messagesCreated;
    }

    cursor = data.next_cursor ?? null;
  } while (cursor);

  return { newChats, newMessages };
}

async function importAnthropicThread(
  userId: string,
  threadId: string,
  messages: Array<{
    id: string;
    created_at: string;
    role: string;
    content: string;
    thread_id: string;
  }>,
  _accessToken: string,
  _since?: Date,
): Promise<{ created: boolean; messagesCreated: number }> {
  const existingChat = await prisma.chat.findFirst({
    where: { providerId: threadId, provider: Provider.ANTHROPIC, userId },
  });

  let chat: PrismaChat;
  let chatCreated = false;

  if (!existingChat) {
    chat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        userId,
        provider: Provider.ANTHROPIC,
        providerId: threadId,
        title: `Anthropic Thread ${threadId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    chatCreated = true;
  } else {
    chat = existingChat;
  }

  let newMessageCount = 0;

  for (const msg of messages) {
    const createdAt = new Date(msg.created_at);
    const exists = await prisma.message.findFirst({
      where: { providerMessageId: msg.id, provider: Provider.ANTHROPIC, chatId: chat.id },
    });
    if (exists) continue;

    await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: chat.id,
        userId,
        role: msg.role,
        content: msg.content,
        provider: Provider.ANTHROPIC,
        providerMessageId: msg.id,
        createdAt,
        updatedAt: new Date(),
      },
    });
    newMessageCount++;
  }

  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  return { created: chatCreated, messagesCreated: newMessageCount };
}

/* -------------------------------------------------------------------------- */
/*                               Gemini Import                                */
/* -------------------------------------------------------------------------- */

async function importFromGemini({
  userId,
  accessToken,
  since,
}: ImportOptions): Promise<{ newChats: number; newMessages: number }> {
  const baseUrl = 'https://generativelanguage.googleapis.com/v1';
  let pageToken: string | null = null;
  let newChats = 0;
  let newMessages = 0;

  await upsertProvider(userId, 'gemini', accessToken);

  do {
    const url = new URL(`${baseUrl}/projects/${userId}/conversations`);
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    if (since) url.searchParams.append('updatedAfter', since.toISOString());

    const res = await fetch(`${url.toString()}&key=${accessToken}`, {
      method: 'GET',
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${err}`);
    }

    const data: {
      conversations: Array<{
        name: string; // e.g. projects/{projectId}/conversations/{conversationId}
        createTime: string;
        updateTime: string;
        // messages are nested
        messages: Array<{
          name: string;
          createTime: string;
          author: { role: 'user' | 'model' };
          content: { parts: Array<{ text?: string }> };
        }>;
      }>;
      nextPageToken?: string;
    } = await res.json();

    for (const conv of data.conversations) {
      const convId = conv.name.split('/').pop()!;
      const { created, messagesCreated } = await importGeminiConversation(
        userId,
        convId,
        conv,
        since,
      );
      newChats += created ? 1 : 0;
      newMessages += messagesCreated;
    }

    pageToken = data.nextPageToken ?? null;
  } while (pageToken);

  return { newChats, newMessages };
}

async function importGeminiConversation(
  userId: string,
  conversationId: string,
  rawConv: {
    name: string;
    createTime: string;
    updateTime: string;
    messages: Array<{
      name: string;
      createTime: string;
      author: { role: string };
      content: { parts: Array<{ text?: string }> };
    }>;
  },
  since?: Date,
): Promise<{ created: boolean; messagesCreated: number }> {
  const existingChat = await prisma.chat.findFirst({
    where: { providerId: conversationId, provider: Provider.GEMINI, userId },
  });

  let chat: PrismaChat;
  let chatCreated = false;

  if (!existingChat) {
    chat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        userId,
        provider: Provider.GEMINI,
        providerId: conversationId,
        title: `Gemini Conversation ${conversationId}`,
        createdAt: new Date(rawConv.createTime),
        updatedAt: new Date(rawConv.updateTime),
      },
    });
    chatCreated = true;
  } else {
    chat = existingChat;
  }

  let newMessageCount = 0;

  for (const msg of rawConv.messages) {
    const createdAt = new Date(msg.createTime);
    if (since && createdAt <= since) continue;

    const exists = await prisma.message.findFirst({
      where: { providerMessageId: msg.name, provider: Provider.GEMINI, chatId: chat.id },
    });
    if (exists) continue;

    const text = msg.content.parts
      .map((p) => p.text ?? '')
      .filter(Boolean)
      .join('\n');

    await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId: chat.id,
        userId,
        role: msg.author.role,
        content: text,
        provider: Provider.GEMINI,
        providerMessageId: msg.name,
        createdAt,
        updatedAt: new Date(),
      },
    });
    newMessageCount++;
  }

  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  return { created: chatCreated, messagesCreated: newMessageCount };
}

/* -------------------------------------------------------------------------- */
/*                         Helper / Shared Functions                         */
/* -------------------------------------------------------------------------- */

async function upsertProvider(userId: string, name: ProviderName, token: string) {
  await prisma.provider.upsert({
    where: { userId_name: { userId, name } },
    update: { accessToken: token, updatedAt: new Date() },
    create: {
      id: uuidv4(),
      userId,
      name,
      accessToken: token,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Simple deduplication helper – can be expanded to hash content for cross‑provider
 * duplicate detection.
 */
export async function isDuplicateMessage(
  provider: Provider,
  providerMessageId: string,
  chatId: string,
): Promise<boolean> {
  const msg = await prisma.message.findFirst({
    where: { providerMessageId, provider, chatId },
    select: { id: true },
  });
  return !!msg;
}

/* -------------------------------------------------------------------------- */
/*                               Exported Types                               */
/* -------------------------------------------------------------------------- */

export type { ProviderName, ImportOptions };