import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Tag, Message, ChatThread } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new tag for the authenticated user.
 * Body: { name: string }
 */
export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Tag name is required.' });
    }

    const existing = await prisma.tag.findFirst({
      where: { name: name.trim(), userId },
    });

    if (existing) {
      return res.status(409).json({ error: 'Tag already exists.' });
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
}

/**
 * Assign one or more tags to a message.
 * Params: messageId
 * Body: { tagIds: string[] }
 */
export async function addTagsToMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;
    const { tagIds } = req.body as { tagIds: string[] };

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({ error: 'tagIds array is required.' });
    }

    // Verify ownership of the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chatThread: true },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    if (message.chatThread.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    // Verify tags belong to the user
    const validTags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, userId },
    });

    if (validTags.length !== tagIds.length) {
      return res.status(400).json({ error: 'One or more tags are invalid.' });
    }

    // Connect tags
    await prisma.message.update({
      where: { id: messageId },
      data: {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });

    const updatedMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: { tags: true },
    });

    res.json(updatedMessage);
  } catch (err) {
    next(err);
  }
}

/**
 * Remove tags from a message.
 * Params: messageId
 * Body: { tagIds: string[] }
 */
export async function removeTagsFromMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;
    const { tagIds } = req.body as { tagIds: string[] };

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({ error: 'tagIds array is required.' });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chatThread: true },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    if (message.chatThread.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        tags: {
          disconnect: tagIds.map((id) => ({ id })),
        },
      },
    });

    const updatedMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: { tags: true },
    });

    res.json(updatedMessage);
  } catch (err) {
    next(err);
  }
}

/**
 * Get all tags for the authenticated user.
 */
export async function listUserTags(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    res.json(tags);
  } catch (err) {
    next(err);
  }
}

/**
 * Get all messages that have a specific tag.
 * Params: tagId
 */
export async function getMessagesByTag(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { tagId } = req.params;

    // Verify tag belongs to user
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag || tag.userId !== userId) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    const messages = await prisma.message.findMany({
      where: {
        tags: {
          some: { id: tagId },
        },
        chatThread: {
          userId,
        },
      },
      include: {
        tags: true,
        chatThread: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a tag (and optionally remove it from all messages).
 * Params: tagId
 * Query: ?cascade=true
 */
export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { tagId } = req.params;
    const cascade = req.query.cascade === 'true';

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag || tag.userId !== userId) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    if (cascade) {
      // Disconnect from all messages first
      await prisma.message.updateMany({
        where: {
          tags: { some: { id: tagId } },
        },
        data: {
          tags: {
            disconnect: [{ id: tagId }],
          },
        },
      });
    }

    await prisma.tag.delete({
      where: { id: tagId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to validate tag existence for routes that need it.
 */
export async function validateTagExists(req: Request, res: Response, next: NextFunction) {
  const { tagId } = req.params;
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found.' });
  }
  (req as any).tag = tag;
  next();
}

/**
 * Export route definitions for easy integration.
 */
import { Router } from 'express';
const router = Router();

router.post('/', createTag);
router.get('/', listUserTags);
router.delete('/:tagId', deleteTag);
router.get('/:tagId/messages', getMessagesByTag);

export default router;