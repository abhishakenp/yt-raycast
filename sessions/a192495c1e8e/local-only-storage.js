<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, 100_000, KEY_LENGTH, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Encrypt a plaintext Buffer with a given key.
 * Returns a Buffer containing: iv || ciphertext || authTag
 */
export function encrypt(plaintext: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, authTag]);
}

/**
 * Decrypt a buffer produced by `encrypt`.
 */
export function decrypt(encrypted: Buffer, key: Buffer): Buffer {
  const iv = encrypted.slice(0, IV_LENGTH);
  const authTag = encrypted.slice(encrypted.length - TAG_LENGTH);
  const ciphertext = encrypted.slice(IV_LENGTH, encrypted.length - TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext;
}

// -----------------------------------------------------------------------------
// User helpers (key management)
// -----------------------------------------------------------------------------
export async function getUserKey(userId: string, passphrase: string): Promise<Buffer> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { encryptionSalt: true } });
  const salt = Buffer.from(user.encryptionSalt, 'hex');
  return deriveKey(passphrase, salt);
}

// -----------------------------------------------------------------------------
// Chat CRUD (encrypted storage)
// -----------------------------------------------------------------------------
export async function createChat(userId: string, title: string, providerId: string, passphrase: string) {
  const key = await getUserKey(userId, passphrase);
  const encryptedTitle = encrypt(Buffer.from(title, 'utf-8'), key).toString('hex');

  return prisma.chat.create({
    data: {
      userId,
      title: encryptedTitle,
      providerId,
    },
  });
}

export async function getChat(chatId: string, userId: string, passphrase: string) {
  const key = await getUserKey(userId, passphrase);
  const chat = await prisma.chat.findFirstOrThrow({
    where: { id: chatId, userId },
    include: { messages: true, tags: true, attachments: true },
  });

  const decryptedTitle = decrypt(Buffer.from(chat.title, 'hex'), key).toString('utf-8');
  const decryptedMessages = chat.messages.map(m => ({
    ...m,
    content: decrypt(Buffer.from(m.content, 'hex'), key).toString('utf-8'),
  }));

  return {
    ...chat,
    title: decryptedTitle,
    messages: decryptedMessages,
  };
}

export async function addMessage(chatId: string, userId: string, content: string, role: 'user' | 'assistant', passphrase: string) {
  const key = await getUserKey(userId, passphrase);
  const encryptedContent = encrypt(Buffer.from(content, 'utf-8'), key).toString('hex');

  return prisma.message.create({
    data: {
      chatId,
      userId,
      role,
      content: encryptedContent,
    },
  });
}

// -----------------------------------------------------------------------------
// Tag CRUD (stored in plaintext – tags are not sensitive)
// -----------------------------------------------------------------------------
export async function addTagToChat(chatId: string, userId: string, tagName: string) {
  // Ensure tag exists or create it
  const tag = await prisma.tag.upsert({
    where: { name_userId: { name: tagName, userId } },
    update: {},
    create: { name: tagName, userId },
  });

  // Link tag to chat
  return prisma.chat.update({
    where: { id: chatId },
    data: { tags: { connect: { id: tag.id } } },
  });
}

// -----------------------------------------------------------------------------
// Attachment handling (binary data stored encrypted on disk)
// -----------------------------------------------------------------------------
import * as fs from 'fs';
import * as path from 'path';
const ATTACHMENTS_ROOT = path.resolve(process.cwd(), 'data', 'attachments');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(ATTACHMENTS_ROOT);

export async function storeAttachment(
  chatId: string,
  userId: string,
  filename: string,
  stream: Readable,
  passphrase: string
) {
  const key = await getUserKey(userId, passphrase);
  const attachmentId = crypto.randomUUID();
  const destPath = path.join(ATTACHMENTS_ROOT, `${attachmentId}.enc`);
  const writeStream = fs.createWriteStream(destPath);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  writeStream.write(iv); // prepend IV

  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(cipher)
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });

  const attachment = await prisma.attachment.create({
    data: {
      id: attachmentId,
      chatId,
      userId,
      filename,
      path: destPath,
    },
  });

  return attachment;
}

export async function retrieveAttachment(attachmentId: string, userId: string, passphrase: string): Promise<Readable> {
  const key = await getUserKey(userId, passphrase);
  const attachment = await prisma.attachment.findFirstOrThrow({
    where: { id: attachmentId, userId },
  });

  const readStream = fs.createReadStream(attachment.path);
  const iv = Buffer.alloc(IV_LENGTH);
  await new Promise<void>((resolve, reject) => {
    readStream.read(IV_LENGTH, (err, bytesRead, buffer) => {
      if (err) reject(err);
      else {
        buffer.copy(iv);
        resolve();
      }
    });
  });

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decryptedStream = readStream.pipe(decipher);
  return decryptedStream;
}

// -----------------------------------------------------------------------------
// Provider CRUD (metadata only, no secrets)
// -----------------------------------------------------------------------------
export async function addProvider(userId: string, name: string, type: string, config: Record<string, any>) {
  // config is stored encrypted because it may contain API keys
  const key = await getUserKey(userId, config.passphrase);
  const encryptedConfig = encrypt(Buffer.from(JSON.stringify(config), 'utf-8'), key).toString('hex');

  return prisma.provider.create({
    data: {
      userId,
      name,
      type,
      config: encryptedConfig,
    },
  });
}

export async function getProvider(providerId: string, userId: string, passphrase: string) {
  const key = await getUserKey(userId, passphrase);
  const provider = await prisma.provider.findFirstOrThrow({
    where: { id: providerId, userId },
  });

  const decryptedConfig = JSON.parse(
    decrypt(Buffer.from(provider.config, 'hex'), key).toString('utf-8')
  );

  return { ...provider, config: decryptedConfig };
}

// -----------------------------------------------------------------------------
// Export utilities (JSON, markdown, PDF)
// -----------------------------------------------------------------------------
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function exportChatAsJSON(chatId: string, userId: string, passphrase: string) {
  const chat = await getChat(chatId, userId, passphrase);
  return JSON.stringify(chat, null, 2);
}

export async function exportChatAsMarkdown(chatId: string, userId: string, passphrase: string) {
  const chat = await getChat(chatId, userId, passphrase);
  const lines = chat.messages.map((msg: any) => `### ${msg.role}\n\n${msg.content}`);
  return `# ${chat.title}\n\n${lines.join('\n\n')}`;
}

export async function exportChatAsPDF(chatId: string, userId: string, passphrase: string) {
  const chat = await getChat(chatId, userId, passphrase);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  let y = height - 40;

  const drawText = (text: string) => {
    const wrapped = font.wrap(text, width - 80);
    wrapped.forEach(line => {
      if (y < 40) {
        page = pdfDoc.addPage();
        y = height - 40;
      }
      page.drawText(line, { x: 40, y, size: fontSize, font });
      y -= fontSize + 4;
    });
    y -= fontSize; // extra spacing after block
  };

  drawText(`# ${chat.title}`);
  for (const msg of chat.messages) {
    drawText(`## ${msg.role}`);
    drawText(msg.content);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// -----------------------------------------------------------------------------
// Cleanup – ensure Prisma disconnect on process exit
// -----------------------------------------------------------------------------
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});