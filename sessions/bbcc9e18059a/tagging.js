import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Tag, ChatThread, Message } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to handle validation results
 */
const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * GET /tags
 * Retrieve all tags for the authenticated user (optional auth)
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id; // optional auth
      const where = userId ? { userId } : {};
      const tags = await prisma.tag.findMany({ where });
      res.json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /tags
 * Create a new tag
 */
router.post(
  '/',
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters'),
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const userId = (req as any).user?.id; // optional auth

      // Ensure uniqueness per user (or globally if no auth)
      const existing = await prisma.tag.findFirst({
        where: {
          name,
          ...(userId ? { userId } : {}),
        },
      });
      if (existing) {
        return res.status(409).json({ error: 'Tag already exists' });
      }

      const tag = await prisma.tag.create({
        data: {
          name,
          ...(userId ? { userId } : {}),
        },
      });
      res.status(201).json(tag);
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PATCH /tags/:id
 * Update a tag's name
 */
router.patch(
  '/:id',
  param('id').isInt().toInt(),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters'),
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = (req as any).user?.id;

      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      if (userId && tag.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updated = await prisma.tag.update({
        where: { id },
        data: { name },
      });
      res.json(updated);
    } catch (error) {
      console.error('Error updating tag:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /tags/:id
 * Delete a tag and detach it from all messages/threads
 */
router.delete(
  '/:id',
  param('id').isInt().toInt(),
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      if (userId && tag.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Detach from messages and threads (Prisma will cascade if set up)
      await prisma.$transaction([
        prisma.messageTag.deleteMany({ where: { tagId: id } }),
        prisma.chatThreadTag.deleteMany({ where: { tagId: id } }),
        prisma.tag.delete({ where: { id } }),
      ]);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /tags/:id/attach/message/:messageId
 * Attach a tag to a message
 */
router.post(
  '/:id/attach/message/:messageId',
  param('id').isInt().toInt(),
  param('messageId').isInt().toInt(),
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { id, messageId } = req.params;
      const userId = (req as any).user?.id;

      const [tag, message] = await Promise.all([
        prisma.tag.findUnique({ where: { id } }),
        prisma.message.findUnique({ where: { id: Number(messageId) } }),
      ]);

      if (!tag || !message) {
        return res.status(404).json({ error: 'Tag or Message not found' });
      }
      if (userId && (tag.userId !== userId || message.userId !== userId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.messageTag.create({
        data: {
          tagId: tag.id,
          messageId: message.id,
        },
      });

      res.status(200).json({ message: 'Tag attached to message' });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        // Unique constraint violation – already attached
        return res.status(409).json({ error: 'Tag already attached to this message' });
      }
      console.error('Error attaching tag to message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /tags/:id/attach/thread/:threadId
 * Attach a tag to a chat thread
 */
router.post(
  '/:id/attach/thread/:threadId',
  param('id').isInt().toInt(),
  param('threadId').isInt().toInt(),
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { id, threadId } = req.params;
      const userId = (req as any).user?.id;

      const [tag, thread] = await Promise.all([
        prisma.tag.findUnique({ where: { id } }),
        prisma.chatThread.findUnique({ where: { id: Number(threadId) } }),
      ]);

      if (!tag || !thread) {
        return res.status(404).json({ error: 'Tag or Thread not found' });
      }
      if (userId && (tag.userId !== userId || thread.userId !== userId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.chatThreadTag.create({
        data: {
          tagId: tag.id,
          chatThreadId: thread.id,
        },
      });

      res.status(200).json({ message: 'Tag attached to thread' });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Tag already attached to this thread' });
      }
      console.error('Error attaching tag to thread:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /tags/:id/messages
 * Retrieve all messages that have a given tag (with optional pagination)
 */
router.get(
  '/:id/messages',
  param('id').isInt().toInt(),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { skip = '0', take = '50' } = req.query;
      const userId = (req as any).user?.id;

      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      if (userId && tag.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const messages = await prisma.message.findMany({
        where: {
          tags: {
            some: { tagId: tag.id },
          },
          ...(userId ? { userId } : {}),
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { createdAt: 'desc' },
      });

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages for tag:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /tags/:id/threads
 * Retrieve all chat threads that have a given tag
 */
router.get(
  '/:id/threads',
  param('id').isInt().toInt(),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { skip = '0', take = '50' } = req.query;
      const userId = (req as any).user?.id;

      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      if (userId && tag.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const threads = await prisma.chatThread.findMany({
        where: {
          tags: {
            some: { tagId: tag.id },
          },
          ...(userId ? { userId } : {}),
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { updatedAt: 'desc' },
      });

      res.json(threads);
    } catch (error) {
      console.error('Error fetching threads for tag:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;