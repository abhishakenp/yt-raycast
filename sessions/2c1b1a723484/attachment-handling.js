import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient, Attachment } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';

// Configuration
const ATTACHMENTS_ROOT = path.resolve(__dirname, '../../storage/attachments');
const ALGORITHM = 'aes-256-gcm';
const KEY_DERIVATION_SALT = 'chat-collector-attachment-salt';

// Ensure storage directory exists
await fs.mkdir(ATTACHMENTS_ROOT, { recursive: true });

const prisma = new PrismaClient();
const router = express.Router();

// Multer setup – store file in memory for encryption before persisting
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MiB limit

// Helper: derive encryption key from a per‑user secret (could be a user‑specific master key)
function deriveKey(userSecret: string): Buffer {
  return scryptSync(userSecret, KEY_DERIVATION_SALT, 32);
}

// Helper: encrypt buffer, returns { iv, authTag, data }
function encryptBuffer(buffer: Buffer, key: Buffer): { iv: Buffer; authTag: Buffer; data: Buffer } {
  const iv = randomBytes(12); // GCM recommended 12‑byte IV
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv, authTag, data: encrypted };
}

// Helper: decrypt buffer
function decryptBuffer(encrypted: Buffer, key: Buffer, iv: Buffer, authTag: Buffer): Buffer {
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// POST /attachments – upload and attach to a message
router.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id; // set by authenticate middleware
      const { messageId } = req.body;
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      if (!messageId) {
        return res.status(400).json({ error: 'messageId is required' });
      }

      // Verify message belongs to the user
      const message = await prisma.message.findUnique({
        where: { id: Number(messageId) },
        include: { chatThread: true },
      });
      if (!message || message.chatThread?.userId !== userId) {
        return res.status(404).json({ error: 'Message not found or access denied' });
      }

      // Derive per‑user encryption key (in a real app, use a stronger key management strategy)
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.encryptionSecret) {
        return res.status(500).json({ error: 'User encryption secret missing' });
      }
      const key = deriveKey(user.encryptionSecret);

      // Encrypt file buffer
      const { iv, authTag, data } = encryptBuffer(req.file.buffer, key);

      // Persist encrypted file to disk
      const attachmentId = randomBytes(16).toString('hex');
      const filePath = path.join(ATTACHMENTS_ROOT, `${attachmentId}.enc`);
      const metaBuffer = Buffer.concat([iv, authTag, data]); // store iv|authTag|ciphertext
      await fs.writeFile(filePath, metaBuffer);

      // Create DB record
      const attachment: Attachment = await prisma.attachment.create({
        data: {
          id: attachmentId,
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: filePath,
          message: { connect: { id: Number(messageId) } },
        },
      });

      res.status(201).json({ attachmentId: attachment.id, filename: attachment.filename });
    } catch (err) {
      next(err);
    }
  },
);

// GET /attachments/:id – download (decrypted on the fly)
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const attachmentId = req.params.id;

      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId },
        include: { message: { include: { chatThread: true } } },
      });

      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      // Verify ownership
      if (attachment.message?.chatThread?.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Load encrypted file
      const encryptedBlob = await fs.readFile(attachment.path);
      const iv = encryptedBlob.slice(0, 12);
      const authTag = encryptedBlob.slice(12, 28);
      const ciphertext = encryptedBlob.slice(28);

      // Derive key
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.encryptionSecret) {
        return res.status(500).json({ error: 'User encryption secret missing' });
      }
      const key = deriveKey(user.encryptionSecret);

      // Decrypt
      const plaintext = decryptBuffer(ciphertext, key, iv, authTag);

      // Stream back to client
      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
      res.send(plaintext);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /attachments/:id – remove attachment
router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const attachmentId = req.params.id;

      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId },
        include: { message: { include: { chatThread: true } } },
      });

      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      if (attachment.message?.chatThread?.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete file from storage
      await fs.unlink(attachment.path).catch(() => { /* ignore if missing */ });

      // Delete DB record
      await prisma.attachment.delete({ where: { id: attachmentId } });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;