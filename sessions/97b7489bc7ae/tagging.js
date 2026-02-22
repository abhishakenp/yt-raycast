import { Router, Request, Response } from 'express';
import { PrismaClient, Tag, Chat } from '@prisma/client';
import { body, param, query, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to handle validation results
 */
const handleValidation = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * GET /tags
 * List all tags belonging to the authenticated user
 */
router.get(
  '/tags',
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    res.json(tags);
  }
);

/**
 * POST /tags
 * Create a new tag
 */
router.post(
  '/tags',
  body('name').isString().trim().isLength({ min: 1, max: 50 }),
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name } = req.body;

    // Ensure uniqueness per user
    const existing = await prisma.tag.findFirst({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Tag with this name already exists.' });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        user: { connect: { id: userId } },
      },
    });
    res.status(201).json(tag);
  }
);

/**
 * PUT /tags/:id
 * Rename a tag
 */
router.put(
  '/tags/:id',
  param('id').isInt(),
  body('name').isString().trim().isLength({ min: 1, max: 50 }),
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tagId = Number(req.params.id);
    const { name } = req.body;

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag || tag.userId !== userId) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    const duplicate = await prisma.tag.findFirst({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' },
        NOT: { id: tagId },
      },
    });
    if (duplicate) {
      return res.status(409).json({ error: 'Another tag with this name already exists.' });
    }

    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: { name },
    });
    res.json(updated);
  }
);

/**
 * DELETE /tags/:id
 * Delete a tag (also disconnect from chats)
 */
router.delete(
  '/tags/:id',
  param('id').isInt(),
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tagId = Number(req.params.id);

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag || tag.userId !== userId) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    // Disconnect from all chats first
    await prisma.chat.updateMany({
      where: {
        userId,
        tags: { some: { id: tagId } },
      },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });

    await prisma.tag.delete({ where: { id: tagId } });
    res.status(204).send();
  }
);

/**
 * POST /chats/:chatId/tags
 * Assign one or multiple tags to a chat
 */
router.post(
  '/chats/:chatId/tags',
  param('chatId').isInt(),
  body('tagIds').isArray({ min: 1 }).custom((arr) => arr.every((id) => Number.isInteger(id))),
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const chatId = Number(req.params.chatId);
    const { tagIds } = req.body as { tagIds: number[] };

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { tags: true },
    });
    if (!chat || chat.userId !== userId) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

    // Verify all tags belong to the user
    const validTags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, userId },
    });
    if (validTags.length !== tagIds.length) {
      return res.status(400).json({ error: 'One or more tags are invalid.' });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: { tags: true },
    });

    res.json(updatedChat);
  }
);

/**
 * DELETE /chats/:chatId/tags/:tagId
 * Remove a tag from a chat
 */
router.delete(
  '/chats/:chatId/tags/:tagId',
  param('chatId').isInt(),
  param('tagId').isInt(),
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const chatId = Number(req.params.chatId);
    const tagId = Number(req.params.tagId);

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { tags: true },
    });
    if (!chat || chat.userId !== userId) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag || tag.userId !== userId) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
      include: { tags: true },
    });

    res.json(updatedChat);
  }
);

/**
 * GET /chats
 * Optional query param `tag` (tag name) to filter chats by tag
 */
router.get(
  '/chats',
  query('tag').optional().isString(),
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tagName = req.query.tag as string | undefined;

    const whereClause: any = { userId };
    if (tagName) {
      whereClause.tags = {
        some: {
          name: { equals: tagName, mode: 'insensitive' },
        },
      };
    }

    const chats = await prisma.chat.findMany({
      where: whereClause,
      include: { tags: true },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(chats);
  }
);

export default router;