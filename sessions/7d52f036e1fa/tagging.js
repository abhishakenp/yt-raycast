import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Tag, ChatThread, Message } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to handle validation results
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * CREATE a new tag
 * POST /tags
 * Body: { name: string, color?: string }
 */
router.post(
  '/',
  body('name').isString().trim().isLength({ min: 1, max: 50 }),
  body('color').optional().isHexColor(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { name, color } = req.body;
    try {
      const existing = await prisma.tag.findUnique({ where: { name } });
      if (existing) {
        return res.status(409).json({ error: 'Tag with this name already exists.' });
      }

      const tag = await prisma.tag.create({
        data: {
          name,
          color: color ?? '#FFFFFF',
        },
      });

      res.status(201).json(tag);
    } catch (error) {
      console.error('Create tag error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * LIST all tags (optionally filtered by user)
 * GET /tags?userId=...
 */
router.get('/', async (req: Request, res: Response) => {
  const { userId } = req.query;
  try {
    const where = userId ? { userId: String(userId) } : undefined;
    const tags = await prisma.tag.findMany({ where });
    res.json(tags);
  } catch (error) {
    console.error('List tags error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET a single tag by id
 * GET /tags/:id
 */
router.get(
  '/:id',
  param('id').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found.' });
      }
      res.json(tag);
    } catch (error) {
      console.error('Get tag error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * UPDATE a tag (name / color)
 * PATCH /tags/:id
 */
router.patch(
  '/:id',
  param('id').isUUID(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('color').optional().isHexColor(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, color } = req.body;
    try {
      const tag = await prisma.tag.update({
        where: { id },
        data: { name, color },
      });
      res.json(tag);
    } catch (error) {
      console.error('Update tag error:', error);
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Tag not found.' });
      }
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * DELETE a tag
 * DELETE /tags/:id
 */
router.delete(
  '/:id',
  param('id').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.tag.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      console.error('Delete tag error:', error);
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Tag not found.' });
      }
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * ASSOCIATE a tag with a ChatThread
 * POST /tags/:tagId/threads/:threadId
 */
router.post(
  '/:tagId/threads/:threadId',
  param('tagId').isUUID(),
  param('threadId').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { tagId, threadId } = req.params;
    try {
      // Ensure both exist
      const [tag, thread] = await Promise.all([
        prisma.tag.findUnique({ where: { id: tagId } }),
        prisma.chatThread.findUnique({ where: { id: threadId } }),
      ]);
      if (!tag) return res.status(404).json({ error: 'Tag not found.' });
      if (!thread) return res.status(404).json({ error: 'Chat thread not found.' });

      // Create relation (many‑to‑many through TagOnChatThread)
      await prisma.tagOnChatThread.create({
        data: {
          tagId,
          chatThreadId: threadId,
        },
      });

      res.status(201).json({ message: 'Tag attached to thread.' });
    } catch (error) {
      console.error('Attach tag to thread error:', error);
      if ((error as any).code === 'P2002') {
        // Unique constraint violation – already attached
        return res.status(409).json({ error: 'Tag already attached to this thread.' });
      }
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * REMOVE a tag from a ChatThread
 * DELETE /tags/:tagId/threads/:threadId
 */
router.delete(
  '/:tagId/threads/:threadId',
  param('tagId').isUUID(),
  param('threadId').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { tagId, threadId } = req.params;
    try {
      await prisma.tagOnChatThread.delete({
        where: {
          tagId_chatThreadId: {
            tagId,
            chatThreadId: threadId,
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Detach tag from thread error:', error);
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Tag‑thread association not found.' });
      }
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * LIST tags for a specific ChatThread
 * GET /threads/:threadId/tags
 */
router.get(
  '/threads/:threadId/tags',
  param('threadId').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { threadId } = req.params;
    try {
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: { tags: true },
      });
      if (!thread) return res.status(404).json({ error: 'Chat thread not found.' });

      // `tags` is an array of TagOnChatThread; map to Tag
      const tags = thread.tags.map((rel) => rel.tag);
      res.json(tags);
    } catch (error) {
      console.error('List tags for thread error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

/**
 * SAME operations for Message level tagging (optional)
 * POST /tags/:tagId/messages/:messageId
 * DELETE /tags/:tagId/messages/:messageId
 * GET /messages/:messageId/tags
 */
router.post(
  '/:tagId/messages/:messageId',
  param('tagId').isUUID(),
  param('messageId').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { tagId, messageId } = req.params;
    try {
      const [tag, message] = await Promise.all([
        prisma.tag.findUnique({ where: { id: tagId } }),
        prisma.message.findUnique({ where: { id: messageId } }),
      ]);
      if (!tag) return res.status(404).json({ error: 'Tag not found.' });
      if (!message) return res.status(404).json({ error: 'Message not found.' });

      await prisma.tagOnMessage.create({
        data: {
          tagId,
          messageId,
        },
      });

      res.status(201).json({ message: 'Tag attached to message.' });
    } catch (error) {
      console.error('Attach tag to message error:', error);
      if ((error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Tag already attached to this message.' });
      }
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

router.delete(
  '/:tagId/messages/:messageId',
  param('tagId').isUUID(),
  param('messageId').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { tagId, messageId } = req.params;
    try {
      await prisma.tagOnMessage.delete({
        where: {
          tagId_messageId: {
            tagId,
            messageId,
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Detach tag from message error:', error);
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Tag‑message association not found.' });
      }
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

router.get(
  '/messages/:messageId/tags',
  param('messageId').isUUID(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { messageId } = req.params;
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: { tags: true },
      });
      if (!message) return res.status(404).json({ error: 'Message not found.' });

      const tags = message.tags.map((rel) => rel.tag);
      res.json(tags);
    } catch (error) {
      console.error('List tags for message error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

export default router;