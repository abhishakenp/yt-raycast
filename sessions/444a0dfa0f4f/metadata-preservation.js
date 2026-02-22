<T>(data: T): string {
  const iv = randomBytes(12); // 96‑bit nonce for GCM
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(data));
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store iv + authTag + ciphertext as base64
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypt a previously encrypted metadata string.
 */
function decryptMetadata<T>(payload: string): T {
  const data = Buffer.from(payload, 'base64');
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString()) as T;
}

/**
 * Generic helper to persist encrypted metadata on any Prisma model that
 * contains a `metadata` field of type `String?`.
 */
async function upsertMetadata(
  model: 'Chat' | 'Message' | 'Attachment',
  id: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const encrypted = encryptMetadata(metadata);
  switch (model) {
    case 'Chat':
      await prisma.chat.update({
        where: { id },
        data: { metadata: encrypted },
      });
      break;
    case 'Message':
      await prisma.message.update({
        where: { id },
        data: { metadata: encrypted },
      });
      break;
    case 'Attachment':
      await prisma.attachment.update({
        where: { id },
        data: { metadata: encrypted },
      });
      break;
  }
}

/**
 * Generic helper to retrieve and decrypt metadata.
 */
async function fetchMetadata<T>(model: 'Chat' | 'Message' | 'Attachment', id: string): Promise<T | null> {
  let record: { metadata: string | null } | null = null;
  switch (model) {
    case 'Chat':
      record = await prisma.chat.findUnique({ where: { id }, select: { metadata: true } });
      break;
    case 'Message':
      record = await prisma.message.findUnique({ where: { id }, select: { metadata: true } });
      break;
    case 'Attachment':
      record = await prisma.attachment.findUnique({ where: { id }, select: { metadata: true } });
      break;
  }

  if (!record?.metadata) {
    return null;
  }

  return decryptMetadata<T>(record.metadata);
}

/* -------------------------------------------------------------------------- */
/* Exported API for the rest of the application                               */
/* -------------------------------------------------------------------------- */

export async function preserveChatMetadata(chatId: string, metadata: Record<string, unknown>): Promise<void> {
  await upsertMetadata('Chat', chatId, metadata);
}

export async function getChatMetadata<T = Record<string, unknown>>(chatId: string): Promise<T | null> {
  return fetchMetadata<T>('Chat', chatId);
}

export async function preserveMessageMetadata(messageId: string, metadata: Record<string, unknown>): Promise<void> {
  await upsertMetadata('Message', messageId, metadata);
}

export async function getMessageMetadata<T = Record<string, unknown>>(messageId: string): Promise<T | null> {
  return fetchMetadata<T>('Message', messageId);
}

export async function preserveAttachmentMetadata(
  attachmentId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await upsertMetadata('Attachment', attachmentId, metadata);
}

export async function getAttachmentMetadata<T = Record<string, unknown>>(
  attachmentId: string
): Promise<T | null> {
  return fetchMetadata<T>('Attachment', attachmentId);
}

/* -------------------------------------------------------------------------- */
/* Optional: Cleanup – close Prisma connection when the process exits          */
/* -------------------------------------------------------------------------- */
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});