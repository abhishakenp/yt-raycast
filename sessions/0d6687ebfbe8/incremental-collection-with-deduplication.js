<{
    content: string;
    role: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    attachments?: Array<{
      filename: string;
      mimeType: string;
      size: number;
      url: string; // temporary location; will be moved to permanent storage later
    }>;
  }>
) {
  // 1️⃣ Ensure the provider exists and belongs to the user
  const provider = await prisma.provider.findFirst({
    where: { id: providerId, userId },
  });
  if (!provider) {
    throw new Error('Provider not found or does not belong to the user.');
  }

  // 2️⃣ Find or create the ChatThread that corresponds to the externalThreadId.
  //    Threads are uniquely identified per user + provider + externalThreadId.
  const thread = await prisma.chatThread.upsert({
    where: {
      userId_providerId_externalThreadId: {
        userId,
        providerId,
        externalThreadId,
      },
    },
    update: {},
    create: {
      userId,
      providerId,
      externalThreadId,
      title: null,
      // The `order` field (if you have one) will be managed later.
    },
    include: { messages: true },
  });

  // 3️⃣ Build a map of existing message hashes for fast lookup.
  const existingHashes = new Set<string>();
  for (const msg of thread.messages) {
    if (msg.hash) {
      existingHashes.add(msg.hash);
    }
  }

  // 4️⃣ Prepare new messages (deduplication + attachment handling)
  const messagesToCreate: PrismaClient['message']['create'][] = [];
  const attachmentsToCreate: PrismaClient['attachment']['create'][] = [];

  for (const raw of incomingMessages) {
    const hash = generateMessageHash({
      content: raw.content,
      role: raw.role,
      timestamp: raw.timestamp,
      attachments: raw.attachments?.map(a => ({ id: a.url })), // using URL as temporary id
    });

    // Skip if we already have this exact message
    if (existingHashes.has(hash)) {
      continue;
    }

    // Prepare attachment records (if any)
    const attachmentIds: string[] = [];
    if (raw.attachments && raw.attachments.length) {
      for (const att of raw.attachments) {
        const attachment = await prisma.attachment.create({
          data: {
            filename: att.filename,
            mimeType: att.mimeType,
            size: att.size,
            // In a real implementation you would move the file from the temporary URL
            // to your permanent storage (e.g., S3, local disk) and store the final URL.
            url: att.url,
            userId,
          },
        });
        attachmentIds.push(attachment.id);
        attachmentsToCreate.push(attachment);
      }
    }

    messagesToCreate.push({
      content: raw.content,
      role: raw.role,
      timestamp: raw.timestamp,
      metadata: raw.metadata ? JSON.stringify(raw.metadata) : undefined,
      hash,
      chatThreadId: thread.id,
      providerId,
      userId,
      // Prisma relation – will be linked after creation
      attachments: {
        connect: attachmentIds.map(id => ({ id })),
      },
    });
  }

  // 5️⃣ Bulk insert new messages (if any)
  if (messagesToCreate.length) {
    await prisma.message.createMany({
      data: messagesToCreate.map(m => ({
        content: m.content,
        role: m.role,
        timestamp: m.timestamp,
        metadata: m.metadata,
        hash: m.hash,
        chatThreadId: m.chatThreadId,
        providerId: m.providerId,
        userId: m.userId,
      })),
      skipDuplicates: true, // safety net – Prisma will ignore duplicate unique constraints
    });

    // Attachments need a separate step because `createMany` cannot handle relations.
    // We already created attachments above, now we just need to link them.
    for (const msg of messagesToCreate) {
      if (msg.attachments?.connect?.length) {
        await prisma.message.update({
          where: {
            // Assuming a unique composite key (userId, chatThreadId, timestamp, hash)
            // Adjust according to your schema.
            id: (await prisma.message.findFirst({
              where: {
                userId,
                chatThreadId: msg.chatThreadId,
                hash: msg.hash,
              },
              select: { id: true },
            }))?.id!,
          },
          data: {
            attachments: {
              connect: msg.attachments.connect,
            },
          },
        });
      }
    }
  }

  // 6️⃣ Re‑order messages within the thread to preserve chronological order.
  //    This step is optional if you always query with ORDER BY timestamp.
  //    If you store an explicit `position` column, recompute it here.
  // Example (assuming `position` column exists):
  // const ordered = await prisma.message.findMany({
  //   where: { chatThreadId: thread.id },
  //   orderBy: { timestamp: 'asc' },
  // });
  // for (let i = 0; i < ordered.length; i++) {
  //   await prisma.message.update({
  //     where: { id: ordered[i].id },
  //     data: { position: i },
  //   });
  // }

  // 7️⃣ Return the up‑to‑date thread (including newly added messages)
  const updatedThread = await prisma.chatThread.findUnique({
    where: { id: thread.id },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' },
        include: { attachments: true },
      },
    },
  });

  return updatedThread;
}

/**
 * Utility to clean up duplicate messages that might have slipped through
 * (e.g., after a schema change). This can be run as a background job.
 */
export async function deduplicateThread(threadId: string) {
  const msgs = await prisma.message.findMany({
    where: { chatThreadId: threadId },
    orderBy: { timestamp: 'asc' },
  });

  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const msg of msgs) {
    if (msg.hash && seen.has(msg.hash)) {
      duplicates.push(msg.id);
    } else if (msg.hash) {
      seen.add(msg.hash);
    }
  }

  if (duplicates.length) {
    await prisma.message.deleteMany({
      where: { id: { in: duplicates } },
    });
  }

  return { removed: duplicates.length };
}