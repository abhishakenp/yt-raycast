<string, any>;

interface CreateMessageParams {
  userId: string;
  chatId: string;
  providerId: string;
  content: string;
  metadata?: Metadata;
  // files can be a ReadStream (e.g., from Multer) or Buffer with original filename
  attachments?: Array<{
    stream: ReadStream | Buffer;
    originalName: string;
    mimeType: string;
  }>;
}

/**
 * Saves a file to the local attachment storage and returns the relative path.
 */
async function storeAttachmentFile(
  stream: ReadStream | Buffer,
  originalName: string
): Promise<string> {
  const uploadsDir = path.resolve(__dirname, '../../uploads/attachments');
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(originalName);
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  if (stream instanceof Buffer) {
    await fs.writeFile(filePath, stream);
  } else {
    const writeStream = (await import('fs')).createWriteStream(filePath);
    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on('error', reject);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  // Return path relative to the project root for DB storage
  return path.relative(path.resolve(__dirname, '../../'), filePath);
}

/**
 * Persists a message together with its metadata and any attachments.
 */
export async function createMessage({
  userId,
  chatId,
  providerId,
  content,
  metadata = {},
  attachments = [],
}: CreateMessageParams): Promise<Message & { attachments: Attachment[] }> {
  // Begin a transaction to guarantee atomicity
  return await prisma.$transaction(async (tx) => {
    // Create the message first (without attachments)
    const message = await tx.message.create({
      data: {
        userId,
        chatId,
        providerId,
        content,
        metadata: metadata as any, // Prisma JSON field
        // The `createdAt` and `updatedAt` timestamps are handled by Prisma defaults
      },
    });

    // Process each attachment
    const attachmentRecords: Attachment[] = [];
    for (const file of attachments) {
      const storedPath = await storeAttachmentFile(file.stream, file.originalName);
      const attachment = await tx.attachment.create({
        data: {
          messageId: message.id,
          filename: file.originalName,
          mimeType: file.mimeType,
          path: storedPath,
          size: (file.stream instanceof Buffer ? file.stream.length : undefined) ?? null,
        },
      });
      attachmentRecords.push(attachment);
    }

    // Update the message with a reference to its attachments (optional, if you keep a relation)
    // Prisma automatically populates `message.attachments` via relation when queried.

    // Return the enriched message object
    return {
      ...message,
      attachments: attachmentRecords,
    };
  });
}

/**
 * Retrieves a message together with its metadata and attachment info.
 */
export async function getMessageWithAttachments(
  messageId: string
): Promise<(Message & { attachments: Attachment[] }) | null> {
  return await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      attachments: true,
    },
  });
}

/**
 * Utility to deduplicate attachments based on hash (optional enhancement).
 * This function can be called before `storeAttachmentFile` to avoid storing identical files.
 */
import crypto from 'crypto';

async function calculateHash(
  stream: ReadStream | Buffer
): Promise<string> {
  const hash = crypto.createHash('sha256');
  if (stream instanceof Buffer) {
    hash.update(stream);
    return hash.digest('hex');
  }

  return await new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Example wrapper that checks for existing attachment by hash before storing.
 */
export async function createMessageWithDeduplication(params: CreateMessageParams) {
  const attachmentHashes = new Map<string, Attachment>();

  // Pre‑scan attachments for existing hashes
  for (const file of params.attachments ?? []) {
    const hash = await calculateHash(file.stream);
    const existing = await prisma.attachment.findFirst({
      where: { hash },
    });
    if (existing) {
      attachmentHashes.set(hash, existing);
    } else {
      // Store file and create attachment later
      attachmentHashes.set(hash, null as any);
    }
  }

  // Create message and attach existing or new files
  return await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        userId: params.userId,
        chatId: params.chatId,
        providerId: params.providerId,
        content: params.content,
        metadata: (params.metadata ?? {}) as any,
      },
    });

    const attachmentRecords: Attachment[] = [];

    for (const file of params.attachments ?? []) {
      const hash = await calculateHash(file.stream);
      let attachment = attachmentHashes.get(hash);
      if (!attachment) {
        const storedPath = await storeAttachmentFile(file.stream, file.originalName);
        attachment = await tx.attachment.create({
          data: {
            messageId: message.id,
            filename: file.originalName,
            mimeType: file.mimeType,
            path: storedPath,
            size: file.stream instanceof Buffer ? file.stream.length : null,
            hash,
          },
        });
      } else {
        // Link existing attachment to this message (many‑to‑many could be used; here we duplicate relation)
        attachment = await tx.attachment.create({
          data: {
            messageId: message.id,
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            path: attachment.path,
            size: attachment.size,
            hash: attachment.hash,
          },
        });
      }
      attachmentRecords.push(attachment);
    }

    return {
      ...message,
      attachments: attachmentRecords,
    };
  });
}

/**
 * Clean‑up utility: delete an attachment file from storage when the DB record is removed.
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });
  if (!attachment) return;

  const absolutePath = path.resolve(__dirname, '../../', attachment.path);
  await fs.unlink(absolutePath).catch(() => {
    // ignore if file already missing
  });

  await prisma.attachment.delete({
    where: { id: attachmentId },
  });
}