<string, unknown>;
}

/**
 * Compute a deterministic hash for a message.
 * The hash is based on providerMessageId, content and providerCreatedAt.
 * This helps to detect duplicates even when the provider ID is missing.
 */
function computeMessageHash(msg: IncomingMessage): string {
  const hash = crypto.createHash('sha256');
  hash.update(msg.providerMessageId);
  hash.update(msg.content);
  hash.update(msg.providerCreatedAt.toISOString());
  return hash.digest('hex');
}

/**
 * Deduplicate a batch of incoming messages.
 *
 * The algorithm works in three steps:
 * 1. Compute a hash for each incoming message.
 * 2. Query the DB for any existing messages that share the same hash or providerMessageId.
 * 3. Return only the messages that are not present in the DB.
 *
 * @param messages Array of messages fetched from a provider.
 * @returns Array of messages that are new and should be persisted.
 */
export async function deduplicateMessages(
  messages: IncomingMessage[]
): Promise<IncomingMessage[]> {
  if (messages.length === 0) {
    return [];
  }

  // Step 1 – compute hashes
  const messagesWithHash = messages.map((msg) => ({
    ...msg,
    hash: computeMessageHash(msg),
  }));

  // Step 2 – fetch existing messages that could clash
  const providerIds = messagesWithHash.map((m) => m.providerMessageId);
  const hashes = messagesWithHash.map((m) => m.hash);

  const existing = await prisma.message.findMany({
    where: {
      OR: [
        { providerMessageId: { in: providerIds } },
        { hash: { in: hashes } },
      ],
    },
    select: {
      providerMessageId: true,
      hash: true,
    },
  });

  const existingProviderIds = new Set(existing.map((e) => e.providerMessageId));
  const existingHashes = new Set(existing.map((e) => e.hash));

  // Step 3 – filter out duplicates
  const uniqueMessages = messagesWithHash.filter(
    (msg) =>
      !existingProviderIds.has(msg.providerMessageId) &&
      !existingHashes.has(msg.hash)
  );

  // Strip the temporary hash before returning
  return uniqueMessages.map(({ hash, ...rest }) => rest);
}

/**
 * Persist a batch of deduplicated messages.
 *
 * This helper inserts the messages and stores the computed hash for future deduplication.
 *
 * @param messages Array of messages that have already passed deduplication.
 * @returns The created Prisma Message records.
 */
export async function storeMessages(
  messages: IncomingMessage[]
): Promise<Message[]> {
  if (messages.length === 0) {
    return [];
  }

  const data = messages.map((msg) => ({
    providerMessageId: msg.providerMessageId,
    chatId: msg.chatId,
    content: msg.content,
    role: msg.role ?? 'assistant',
    metadata: msg.metadata ? JSON.stringify(msg.metadata) : undefined,
    providerCreatedAt: msg.providerCreatedAt,
    hash: computeMessageHash(msg),
  }));

  // Prisma bulk create (transactional)
  const created = await prisma.$transaction(
    data.map((d) =>
      prisma.message.create({
        data: d,
      })
    )
  );

  return created;
}

/**
 * High‑level helper that deduplicates and stores a batch in one call.
 *
 * @param incoming Array of raw messages from a provider.
 * @returns The messages that were newly stored.
 */
export async function deduplicateAndStore(
  incoming: IncomingMessage[]
): Promise<Message[]> {
  const newMessages = await deduplicateMessages(incoming);
  return storeMessages(newMessages);
}