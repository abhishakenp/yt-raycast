<string, any>;
    messages: Array<{
      providerMessageId?: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      createdAt: string; // ISO string
      metadata?: Record<string, any>;
      attachments?: Array<{
        filename: string;
        mimeType: string;
        size: number;
        url: string; // temporary upload location; will be moved to permanent storage
      }>;
      tags?: string[]; // tag names
    }>;
  }
) {
  // 1️⃣ Ensure the user owns the provider
  const provider = await prisma.provider.findFirst({
    where: { id: providerId, userId },
  });
  if (!provider) {
    throw new Error('Provider not found or not owned by user');
  }

  // 2️⃣ Upsert the ChatThread (idempotent on externalThreadId + provider)
  const thread = await prisma.chatThread.upsert({
    where: {
      externalThreadId_providerId: {
        externalThreadId: threadPayload.externalThreadId,
        providerId,
      },
    },
    update: {
      title: threadPayload.title ?? undefined,
      metadata: threadPayload.metadata as Prisma.JsonObject,
      updatedAt: new Date(),
    },
    create: {
      id: uuidv4(),
      userId,
      providerId,
      externalThreadId: threadPayload.externalThreadId,
      title: threadPayload.title ?? undefined,
      metadata: threadPayload.metadata as Prisma.JsonObject,
    },
  });

  // 3️⃣ Fetch existing message hashes for this thread to avoid duplicates
  const existingMessages = await prisma.message.findMany({
    where: { chatThreadId: thread.id },
    select: { id: true, hash: true },
  });
  const existingHashes = new Set(existingMessages.map((m) => m.hash));

  // 4️⃣ Process incoming messages in order
  const messagesToCreate: Prisma.MessageCreateManyInput[] = [];
  const attachmentsToCreate: Prisma.AttachmentCreateManyInput[] = [];
  const tagConnectOrCreate: { [msgHash: string]: Prisma.TagCreateManyInput[] } = {};

  for (const msg of threadPayload.messages) {
    const createdAt = new Date(msg.createdAt);
    const hash = generateMessageHash({
      providerMessageId: msg.providerMessageId,
      content: msg.content,
      createdAt,
    });

    // Skip if already stored (deduplication)
    if (existingHashes.has(hash)) continue;

    const messageId = uuidv4();

    messagesToCreate.push({
      id: messageId,
      chatThreadId: thread.id,
      providerMessageId: msg.providerMessageId ?? null,
      role: msg.role,
      content: msg.content,
      createdAt,
      metadata: msg.metadata as Prisma.JsonObject,
      hash,
      order: createdAt.getTime(), // simple numeric ordering; can be refined
    });

    // Attachments
    if (msg.attachments && msg.attachments.length > 0) {
      for (const att of msg.attachments) {
        attachmentsToCreate.push({
          id: uuidv4(),
          messageId,
          filename: att.filename,
          mimeType: att.mimeType,
          size: att.size,
          url: att.url, // In a real system, move to permanent storage and replace URL
        });
      }
    }

    // Tags (connect or create)
    if (msg.tags && msg.tags.length > 0) {
      tagConnectOrCreate[hash] = msg.tags.map((name) => ({
        id: uuidv4(),
        name,
        createdAt: new Date(),
      }));
    }
  }

  // 5️⃣ Bulk insert messages
  if (messagesToCreate.length > 0) {
    await prisma.message.createMany({
      data: messagesToCreate,
    });
  }

  // 6️⃣ Bulk insert attachments
  if (attachmentsToCreate.length > 0) {
    await prisma.attachment.createMany({
      data: attachmentsToCreate,
    });
  }

  // 7️⃣ Upsert tags and connect them to messages
  for (const [hash, tags] of Object.entries(tagConnectOrCreate)) {
    // Find the message we just created (by hash)
    const msg = await prisma.message.findFirst({
      where: { chatThreadId: thread.id, hash },
      select: { id: true },
    });
    if (!msg) continue;

    for (const tag of tags) {
      // Upsert tag globally for the user
      const upsertedTag = await prisma.tag.upsert({
        where: {
          userId_name: {
            userId,
            name: tag.name,
          },
        },
        update: {},
        create: {
          id: tag.id,
          userId,
          name: tag.name,
          createdAt: tag.createdAt,
        },
      });

      // Connect tag to message (many‑to‑many)
      await prisma.messageTag.create({
        data: {
          messageId: msg.id,
          tagId: upsertedTag.id,
        },
      });
    }
  }

  // 8️⃣ Return the refreshed thread with messages (ordered)
  const refreshedThread = await prisma.chatThread.findUnique({
    where: { id: thread.id },
    include: {
      messages: {
        orderBy: { order: 'asc' },
        include: {
          attachments: true,
          tags: {
            include: { tag: true },
          },
        },
      },
    },
  });

  return refreshedThread;
}

/**
 * Check‑out workflow
 * Retrieves a thread together with its ordered messages, metadata, attachments and tags.
 *
 * @param userId   ID of the requesting user
 * @param threadId ID of the thread to check out
 * @returns        Full thread payload ready for export or UI consumption
 */
export async function checkOutThread(userId: string, threadId: string) {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId },
    include: {
      provider: true,
      messages: {
        orderBy: { order: 'asc' },
        include: {
          attachments: true,
          tags: {
            include: { tag: true },
          },
        },
      },
    },
  });

  if (!thread) {
    throw new Error('Thread not found or access denied');
  }

  // Transform to a clean export format
  const exportPayload = {
    externalThreadId: thread.externalThreadId,
    title: thread.title,
    metadata: thread.metadata,
    provider: {
      id: thread.provider.id,
      name: thread.provider.name,
    },
    messages: thread.messages.map((msg) => ({
      providerMessageId: msg.providerMessageId,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      metadata: msg.metadata,
      attachments: msg.attachments.map((att) => ({
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
        url: att.url,
      })),
      tags: msg.tags.map((mt) => mt.tag.name),
    })),
  };

  return exportPayload;
}

/**
 * Optional helper: clean up dangling attachments after a failed check‑in.
 * This can be called in a catch block of `checkInThread`.
 */
export async function cleanupOrphanAttachments(messageIds: string[]) {
  await prisma.attachment.deleteMany({
    where: {
      messageId: { in: messageIds },
    },
  });
}