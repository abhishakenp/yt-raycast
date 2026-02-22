import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Tag, Message } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new tag.
 * Body: { name: string, color?: string }
 */
export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required.' });
    }

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'Tag with this name already exists.' });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color ?? '#f59e0b', // default accent orange
      },
    });

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all tags for the authenticated user.
 */
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a tag (and optionally detach it from all messages).
 * Params: { tagId }
 */
export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { tagId } = req.params;

    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    // Detach from messages
    await prisma.messageTag.deleteMany({
      where: { tagId: tag.id },
    });

    await prisma.tag.delete({
      where: { id: tag.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Attach a tag to a message.
 * Params: { messageId }
 * Body: { tagId }
 */
export const addTagToMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;
    const { tagId } = req.body;

    // Verify ownership of message and tag
    const [message, tag] = await Promise.all([
      prisma.message.findFirst({ where: { id: messageId, userId } }),
      prisma.tag.findFirst({ where: { id: tagId, userId } }),
    ]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    // Prevent duplicate linking
    const existing = await prisma.messageTag.findUnique({
      where: {
        messageId_tagId: {
          messageId: message.id,
          tagId: tag.id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Tag already attached to this message.' });
    }

    const link = await prisma.messageTag.create({
      data: {
        messageId: message.id,
        tagId: tag.id,
      },
    });

    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a tag from a message.
 * Params: { messageId, tagId }
 */
export const removeTagFromMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messageId, tagId } = req.params;

    // Verify ownership
    const [message, tag] = await Promise.all([
      prisma.message.findFirst({ where: { id: messageId, userId } }),
      prisma.tag.findFirst({ where: { id: tagId, userId } }),
    ]);

    if (!message || !tag) {
      return res.status(404).json({ error: 'Message or Tag not found.' });
    }

    await prisma.messageTag.delete({
      where: {
        messageId_tagId: {
          messageId: message.id,
          tagId: tag.id,
        },
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Get all tags attached to a specific message.
 * Params: { messageId }
 */
export const getTagsForMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;

    const message = await prisma.message.findFirst({
      where: { id: messageId, userId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    const tags = message.tags.map((mt) => mt.tag);
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

/**
 * Search tags by name (case‑insensitive, partial match).
 * Query: ?q=searchTerm
 */
export const searchTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const q = (req.query.q as string) ?? '';

    const tags = await prisma.tag.findMany({
      where: {
        userId,
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(tags);
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to validate tag payload (used in routes that accept tag creation/updating).
 */
export const validateTagPayload = (req: Request, res: Response, next: NextFunction) => {
  const { name, color } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Tag name must be a non‑empty string.' });
  }
  if (color && typeof color !== 'string') {
    return res.status(400).json({ error: 'Tag color must be a string (hex code).' });
  }
  next();
};

/**
 * Exported router (to be mounted in the main app)
 */
import { Router } from 'express';
const router = Router();

router.post('/', validateTagPayload, createTag);
router.get('/', getTags);
router.get('/search', searchTags);
router.delete('/:tagId', deleteTag);
router.post('/:messageId/tags', validateTagPayload, addTagToMessage);
router.delete('/:messageId/tags/:tagId', removeTagFromMessage);
router.get('/:messageId/tags', getTagsForMessage);

export default router;