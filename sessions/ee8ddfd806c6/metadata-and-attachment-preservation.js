<Attachment> {
  await ensureStorageDir();

  const fileBuffer = file.buffer ?? (await fs.readFile(file.path));
  const hash = computeHash(fileBuffer);

  // Check if an identical attachment already exists (same hash)
  const existing = await prisma.attachment.findUnique({
    where: { hash },
  });

  if (existing) {
    // Link the existing attachment to the new message (many‑to‑many could be used;
    // for simplicity we just create a new record pointing to the same file)
    return await prisma.attachment.create({
      data: {
        messageId,
        filename: existing.filename,
        mimeType: existing.mimeType,
        size: existing.size,
        hash: existing.hash,
        path: existing.path,
      },
    });
  }

  // Generate a unique filename to avoid collisions
  const ext = path.extname(file.originalname);
  const storedFilename = `${hash}${ext}`;
  const storedPath = path.join(ATTACHMENTS_ROOT, storedFilename);

  // Persist the file to disk
  await fs.writeFile(storedPath, fileBuffer);

  // Create DB record with full metadata
  const attachment = await prisma.attachment.create({
    data: {
      messageId,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      hash,
      path: storedPath,
    },
  });

  return attachment;
}

// Retrieve attachment metadata and binary data
export async function getAttachment(
  attachmentId: string
): Promise<{ metadata: Attachment; data: Buffer }> {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  const data = await fs.readFile(attachment.path);
  return { metadata: attachment, data };
}

// Delete an attachment (removes DB record and, if no other references exist, the file)
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  // Remove the DB entry
  await prisma.attachment.delete({
    where: { id: attachmentId },
  });

  // Check if any other attachments reference the same file (by hash)
  const remaining = await prisma.attachment.findFirst({
    where: { hash: attachment.hash },
  });

  // If no other references, delete the file from disk
  if (!remaining) {
    try {
      await fs.unlink(attachment.path);
    } catch (err) {
      // Log but don't fail the whole operation
      console.warn(`Failed to delete attachment file ${attachment.path}:`, err);
    }
  }
}

// Middleware for handling multipart uploads (using Multer)
// This is a thin wrapper that can be used in Express routes
export function attachmentUploadHandler(fieldName: string) {
  const multer = require('multer');
  const storage = multer.memoryStorage(); // keep file in memory for hashing before persisting
  const upload = multer({ storage });

  return upload.single(fieldName);
}

// Example Express route usage (to be placed in your router file)
/*
import express from 'express';
import {
  saveAttachment,
  getAttachment,
  deleteAttachment,
  attachmentUploadHandler,
} from '../services/attachmentService';

const router = express.Router();

router.post(
  '/messages/:msgId/attachments',
  attachmentUploadHandler('file'),
  async (req: Request, res) => {
    try {
      const { msgId } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const attachment = await saveAttachment(msgId, req.file);
      res.status(201).json(attachment);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to save attachment' });
    }
  }
);

router.get('/attachments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { metadata, data } = await getAttachment(id);
    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${metadata.filename}"`
    );
    res.send(data);
  } catch (e) {
    console.error(e);
    res.status(404).json({ error: 'Attachment not found' });
  }
});

router.delete('/attachments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAttachment(id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(404).json({ error: 'Attachment not found' });
  }
});

export default router;
*/