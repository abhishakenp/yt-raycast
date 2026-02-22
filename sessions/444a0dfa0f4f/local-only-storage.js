<string, any> = {}): Promise<PrismaChat> {
  const encryptedMeta = encrypt(JSON.stringify(metadata));
  return prisma.chat.create({
    data: {
      userId,
      title,
      metadata: encryptedMeta,
    },
  });
}

export async function getChat(chatId: string): Promise<PrismaChat & { metadata: Record<string, any> }> {
  const chat = await prisma.chat.findUniqueOrThrow({ where: { id: chatId } });
  const decrypted = decrypt(chat.metadata);
  return {
    ...chat,
    metadata: JSON.parse(decrypted.toString()),
  };
}

/* -------------------------------------------------------------------------- */
/* Message Operations                                                         */
/* -------------------------------------------------------------------------- */

export async function addMessage(
  chatId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata: Record<string, any> = {}
): Promise<PrismaMessage> {
  const encryptedMeta = encrypt(JSON.stringify(metadata));
  const encryptedContent = encrypt(content);
  return prisma.message.create({
    data: {
      chatId,
      role,
      content: encryptedContent,
      metadata: encryptedMeta,
    },
  });
}

export async function getMessages(chatId: string): Promise<Array<PrismaMessage & { content: string; metadata: Record<string, any> }>> {
  const msgs = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: 'asc' } });
  return msgs.map(m => ({
    ...m,
    content: decrypt(m.content).toString(),
    metadata: JSON.parse(decrypt(m.metadata).toString()),
  }));
}

/* -------------------------------------------------------------------------- */
/* Tag Operations                                                             */
/* -------------------------------------------------------------------------- */

export async function addTag(chatId: string, name: string): Promise<PrismaTag> {
  return prisma.tag.create({
    data: {
      chatId,
      name,
    },
  });
}

export async function getTags(chatId: string): Promise<PrismaTag[]> {
  return prisma.tag.findMany({ where: { chatId } });
}

/* -------------------------------------------------------------------------- */
/* Attachment Operations                                                      */
/* -------------------------------------------------------------------------- */

export async function addAttachment(
  messageId: string,
  filename: string,
  mimeType: string,
  data: Buffer
): Promise<PrismaAttachment> {
  const encryptedData = encrypt(data);
  return prisma.attachment.create({
    data: {
      messageId,
      filename,
      mimeType,
      data: encryptedData,
    },
  });
}

export async function getAttachment(attachmentId: string): Promise<{
  filename: string;
  mimeType: string;
  data: Buffer;
}> {
  const att = await prisma.attachment.findUniqueOrThrow({ where: { id: attachmentId } });
  const decrypted = decrypt(att.data);
  return {
    filename: att.filename,
    mimeType: att.mimeType,
    data: decrypted,
  };
}

/* -------------------------------------------------------------------------- */
/* Stream Helpers (optional)                                                  */
/* -------------------------------------------------------------------------- */

export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/* -------------------------------------------------------------------------- */
/* Cleanup                                                                      */
/* -------------------------------------------------------------------------- */

export async function deleteChat(chatId: string): Promise<void> {
  // Cascade delete messages, tags, attachments (assumes Prisma schema cascade rules)
  await prisma.chat.delete({ where: { id: chatId } });
}

/* -------------------------------------------------------------------------- */
/* Exported Prisma client for other modules                                    */
/* -------------------------------------------------------------------------- */

export { prisma };