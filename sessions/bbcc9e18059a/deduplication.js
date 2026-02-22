<Message[]> {
  // Pre‑compute hashes for all incoming messages
  const messagesWithHash = incoming.map((msg) => ({
    ...msg,
    hash: computeMessageHash(msg),
  }));

  // Fetch any existing messages that share a hash with the incoming batch
  const existingMessages = await prisma.message.findMany({
    where: {
      userId,
      hash: {
        in: messagesWithHash.map((m) => m.hash),
      },
    },
    include: {
      tags: true,
      attachments: true,
    },
  });

  // Index existing messages by hash for quick lookup
  const existingByHash = new Map<string, Message>();
  for (const em of existingMessages) {
    existingByHash.set(em.hash, em);
  }

  const results: Message[] = [];

  for (const msg of messagesWithHash) {
    const duplicate = existingByHash.get(msg.hash);
    if (duplicate) {
      // Merge tags if new ones are supplied
      if (msg.tagIds && msg.tagIds.length > 0) {
        const newTagIds = msg.tagIds.filter(
          (tid) => !duplicate.tags?.some((t) => t.id === tid)
        );
        if (newTagIds.length > 0) {
          await prisma.message.update({
            where: { id: duplicate.id },
            data: {
              tags: {
                connect: newTagIds.map((id) => ({ id })),
              },
            },
          });
        }
      }

      // Merge attachments if any new ones are supplied
      if (msg.attachments && msg.attachments.length > 0) {
        const existingAttachmentUrls = duplicate.attachments?.map((a) => a.url) ?? [];
        const newAttachments = msg.attachments.filter(
          (a) => !existingAttachmentUrls.includes(a.url)
        );
        if (newAttachments.length > 0) {
          await prisma.message.update({
            where: { id: duplicate.id },
            data: {
              attachments: {
                create: newAttachments.map((a) => ({
                  url: a.url,
                  filename: a.filename,
                  mimeType: a.mimeType,
                  size: a.size,
                })),
              },
            },
          });
        }
      }

      results.push(duplicate);
      continue;
    }

    // No duplicate – create a fresh Message record
    const created = await prisma.message.create({
      data: {
        user: { connect: { id: userId } },
        chatThread: { connect: { id: msg.chatThreadId } },
        provider: { connect: { id: msg.provider.id } },
        providerMessageId: msg.providerMessageId,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        hash: msg.hash,
        tags: msg.tagIds
          ? {
              connect: msg.tagIds.map((id) => ({ id })),
            }
          : undefined,
        attachments: msg.attachments
          ? {
              create: msg.attachments.map((a) => ({
                url: a.url,
                filename: a.filename,
                mimeType: a.mimeType,
                size: a.size,
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
        attachments: true,
      },
    });

    results.push(created);
  }

  return results;
}

/**
 * Utility to run deduplication for a specific provider sync.
 *
 * This wrapper can be used by the provider‑specific sync jobs.
 *
 * @param userId ID of the user.
 * @param providerId ID of the provider (e.g., 'openai', 'anthropic').
 * @param fetchFn Function that fetches raw messages from the provider API.
 */
export async function runProviderSyncDeduplication(
  userId: string,
  providerId: string,
  fetchFn: () => Promise<IncomingMessage[]>
): Promise<Message[]> {
  const provider = await prisma.provider.findUniqueOrThrow({
    where: { id: providerId },
  });

  const rawMessages = await fetchFn();

  // Attach provider object to each incoming message
  const incoming = rawMessages.map((msg) => ({
    ...msg,
    provider,
  }));

  return deduplicateMessages(userId, incoming);
}