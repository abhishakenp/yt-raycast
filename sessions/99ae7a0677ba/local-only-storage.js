import { PrismaClient, Prisma } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const DB_PATH = path.resolve(process.cwd(), 'data', 'chat-collector.db');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_local_key_32bytes!!'; // 32 bytes for AES-256
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long for AES-256 encryption.');
}

// -----------------------------------------------------------------------------
// Helper: AES‑256‑GCM encryption / decryption (used for end‑to‑end encryption)
// -----------------------------------------------------------------------------
function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(cipherText: string): string {
  const data = Buffer.from(cipherText, 'base64');
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

// -----------------------------------------------------------------------------
// Prisma client (SQLite) – local‑only storage
// -----------------------------------------------------------------------------
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${DB_PATH}`,
    },
  },
});

// -----------------------------------------------------------------------------
// Data Access Layer
// -----------------------------------------------------------------------------
export const storage = {
  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  // ---------------------------------------------------------------------------
  // Chats
  // ---------------------------------------------------------------------------
  async createChat(data: Prisma.ChatCreateInput) {
    // encrypt title & description before persisting
    const encrypted = {
      ...data,
      title: data.title ? encrypt(data.title) : undefined,
      description: data.description ? encrypt(data.description) : undefined,
    };
    return prisma.chat.create({ data: encrypted });
  },

  async getChatById(id: string) {
    const chat = await prisma.chat.findUnique({ where: { id } });
    if (!chat) return null;
    return {
      ...chat,
      title: chat.title ? decrypt(chat.title) : undefined,
      description: chat.description ? decrypt(chat.description) : undefined,
    };
  },

  async listChatsByUser(userId: string, skip = 0, take = 50) {
    const chats = await prisma.chat.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return chats.map(c => ({
      ...c,
      title: c.title ? decrypt(c.title) : undefined,
      description: c.description ? decrypt(c.description) : undefined,
    }));
  },

  async updateChat(id: string, data: Prisma.ChatUpdateInput) {
    const encrypted = {
      ...data,
      title: data.title ? encrypt(data.title as string) : undefined,
      description: data.description ? encrypt(data.description as string) : undefined,
    };
    const chat = await prisma.chat.update({ where: { id }, data: encrypted });
    return {
      ...chat,
      title: chat.title ? decrypt(chat.title) : undefined,
      description: chat.description ? decrypt(chat.description) : undefined,
    };
  },

  async deleteChat(id: string) {
    // cascade delete messages, attachments, tags etc.
    return prisma.chat.delete({ where: { id } });
  },

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------
  async createMessage(data: Prisma.MessageCreateInput) {
    const encrypted = {
      ...data,
      content: encrypt(data.content as string),
    };
    return prisma.message.create({ data: encrypted });
  },

  async getMessageById(id: string) {
    const msg = await prisma.message.findUnique({ where: { id } });
    if (!msg) return null;
    return {
      ...msg,
      content: decrypt(msg.content),
    };
  },

  async listMessagesByChat(chatId: string, skip = 0, take = 100) {
    const msgs = await prisma.message.findMany({
      where: { chatId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    });
    return msgs.map(m => ({
      ...m,
      content: decrypt(m.content),
    }));
  },

  async deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } });
  },

  // ---------------------------------------------------------------------------
  // Providers
  // ---------------------------------------------------------------------------
  async upsertProvider(data: Prisma.ProviderCreateInput & { userId: string }) {
    return prisma.provider.upsert({
      where: { userId_name: { userId: data.userId, name: data.name } },
      create: data,
      update: data,
    });
  },

  async getProvidersByUser(userId: string) {
    return prisma.provider.findMany({ where: { userId } });
  },

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------
  async addTagToChat(chatId: string, tagName: string) {
    // ensure tag exists
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });
    return prisma.chatTag.create({
      data: {
        chatId,
        tagId: tag.id,
      },
    });
  },

  async removeTagFromChat(chatId: string, tagName: string) {
    const tag = await prisma.tag.findUnique({ where: { name: tagName } });
    if (!tag) return null;
    return prisma.chatTag.deleteMany({
      where: { chatId, tagId: tag.id },
    });
  },

  async listTagsForChat(chatId: string) {
    const tags = await prisma.chatTag.findMany({
      where: { chatId },
      include: { tag: true },
    });
    return tags.map(ct => ct.tag);
  },

  // ---------------------------------------------------------------------------
  // Attachments
  // ---------------------------------------------------------------------------
  async addAttachment(data: Prisma.AttachmentCreateInput) {
    // Store file on disk (local only) and keep path in DB
    const attachmentsDir = path.resolve(process.cwd(), 'data', 'attachments');
    if (!existsSync(attachmentsDir)) {
      require('fs').mkdirSync(attachmentsDir, { recursive: true });
    }

    const fileBuffer = Buffer.from(data.base64, 'base64');
    const fileName = `${crypto.randomUUID()}_${data.filename}`;
    const filePath = path.join(attachmentsDir, fileName);
    writeFileSync(filePath, fileBuffer);

    return prisma.attachment.create({
      data: {
        messageId: data.messageId,
        filename: data.filename,
        mimeType: data.mimeType,
        size: fileBuffer.length,
        path: filePath,
      },
    });
  },

  async getAttachment(id: string) {
    const att = await prisma.attachment.findUnique({ where: { id } });
    if (!att) return null;
    const content = readFileSync(att.path);
    return {
      ...att,
      base64: content.toString('base64'),
    };
  },

  async deleteAttachment(id: string) {
    const att = await prisma.attachment.findUnique({ where: { id } });
    if (att && existsSync(att.path)) {
      require('fs').unlinkSync(att.path);
    }
    return prisma.attachment.delete({ where: { id } });
  },

  // ---------------------------------------------------------------------------
  // Audit Log (archived items)
  // ---------------------------------------------------------------------------
  async logAudit(event: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data: event });
  },

  async getAuditLogByUser(userId: string, skip = 0, take = 100) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  // ---------------------------------------------------------------------------
  // Graceful shutdown
  // ---------------------------------------------------------------------------
  async disconnect() {
    await prisma.$disconnect();
  },
};

// -----------------------------------------------------------------------------
// Export for use in route handlers / services
// -----------------------------------------------------------------------------
export default storage;