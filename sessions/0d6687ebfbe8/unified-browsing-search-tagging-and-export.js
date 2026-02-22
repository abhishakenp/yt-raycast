import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Thread, Message, Tag } from '@prisma/client';
import { Parser as Json2CsvParser } from 'json2csv';
import { Readable } from 'stream';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Middleware to fetch the authenticated user.
 * Assumes that authentication middleware has set req.userId.
 */
async function loadUser(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    (req as any).user = user;
    next();
  } catch (e) {
    next(e);
  }
}

/**
 * GET /threads
 * Unified browsing of chat threads.
 * Query params:
 *   - page (default 1)
 *   - limit (default 20)
 *   - tag (optional, filter by tag name)
 *   - provider (optional, filter by provider name)
 */
router.get(
  '/threads',
  loadUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const tagFilter = req.query.tag as string | undefined;
    const providerFilter = req.query.provider as string | undefined;

    try {
      const where: any = { userId };
      if (providerFilter) {
        where.provider = { name: providerFilter };
      }
      if (tagFilter) {
        where.tags = {
          some: { name: tagFilter },
        };
      }

      const [threads, total] = await Promise.all([
        prisma.thread.findMany({
          where,
          include: {
            provider: true,
            tags: true,
            _count: { select: { messages: true } },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.thread.count({ where }),
      ]);

      res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: threads.map((t) => ({
          id: t.id,
          title: t.title,
          provider: t.provider?.name,
          tagNames: t.tags.map((tg) => tg.name),
          messageCount: t._count?.messages ?? 0,
          updatedAt: t.updatedAt,
        })),
      });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * GET /threads/:threadId/messages
 * Paginated fetch of messages within a thread.
 * Query params:
 *   - page (default 1)
 *   - limit (default 50)
 */
router.get(
  '/threads/:threadId/messages',
  loadUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const threadId = req.params.threadId;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    try {
      const thread = await prisma.thread.findFirst({
        where: { id: threadId, userId },
      });
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { threadId },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
          include: { attachments: true },
        }),
        prisma.message.count({ where: { threadId } }),
      ]);

      res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          attachments: m.attachments.map((a) => ({
            id: a.id,
            filename: a.filename,
            mimeType: a.mimeType,
          })),
        })),
      });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * GET /search
 * Full‑text search across messages.
 * Query params:
 *   - q (required) search term
 *   - tag (optional) filter by tag name
 *   - provider (optional) filter by provider name
 *   - page, limit (pagination)
 */
router.get(
  '/search',
  loadUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const q = (req.query.q as string)?.trim();
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const tagFilter = req.query.tag as string | undefined;
    const providerFilter = req.query.provider as string | undefined;

    try {
      const where: any = {
        thread: { userId },
        OR: [
          { content: { contains: q, mode: 'insensitive' } },
          { role: { contains: q, mode: 'insensitive' } },
        ],
      };
      if (tagFilter) {
        where.thread.tags = { some: { name: tagFilter } };
      }
      if (providerFilter) {
        where.thread.provider = { name: providerFilter };
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          include: {
            thread: { include: { provider: true, tags: true } },
            attachments: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.message.count({ where }),
      ]);

      res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: messages.map((m) => ({
          id: m.id,
          threadId: m.threadId,
          threadTitle: m.thread.title,
          provider: m.thread.provider?.name,
          tags: m.thread.tags.map((t) => t.name),
          role: m.role,
          snippet: m.content.slice(0, 200),
          createdAt: m.createdAt,
        })),
      });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * POST /threads/:threadId/tags
 * Add tags to a thread.
 * Body: { tags: string[] }
 */
router.post(
  '/threads/:threadId/tags',
  loadUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const threadId = req.params.threadId;
    const tags: string[] = req.body.tags;
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags array required' });
    }

    try {
      const thread = await prisma.thread.findFirst({
        where: { id: threadId, userId },
      });
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Upsert tags and connect
      const connectOrCreate = tags.map((name) => ({
        where: { name_userId: { name, userId } },
        create: { name, userId },
      }));

      const updated = await prisma.thread.update({
        where: { id: threadId },
        data: {
          tags: {
            connectOrCreate,
          },
        },
        include: { tags: true },
      });

      res.json({ tags: updated.tags.map((t) => t.name) });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * DELETE /threads/:threadId/tags
 * Remove tags from a thread.
 * Body: { tags: string[] }
 */
router.delete(
  '/threads/:threadId/tags',
  loadUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const threadId = req.params.threadId;
    const tags: string[] = req.body.tags;
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags array required' });
    }

    try {
      const thread = await prisma.thread.findFirst({
        where: { id: threadId, userId },
        include: { tags: true },
      });
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const disconnect = thread.tags
        .filter((t) => tags.includes(t.name))
        .map((t) => ({ id: t.id }));

      const updated = await prisma.thread.update({
        where: { id: threadId },
        data: {
          tags: { disconnect },
        },
        include: { tags: true },
      });

      res.json({ tags: updated.tags.map((t) => t.name) });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * GET /threads/:threadId/export
 * Export a thread (JSON or CSV).
 * Query param: format=json|csv (default json)
 */
router.get(
  '/threads/:threadId/export',
  loadUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const threadId = req.params.threadId;
    const format = (req.query.format as string) === 'csv' ? 'csv' : 'json';

    try {
      const thread = await prisma.thread.findFirst({
        where: { id: threadId, userId },
        include: {
          provider: true,
          tags: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { attachments: true },
          },
        },
      });
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const exportData = {
        id: thread.id,
        title: thread.title,
        provider: thread.provider?.name,
        tags: thread.tags.map((t) => t.name),
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        messages: thread.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          attachments: m.attachments.map((a) => ({
            filename: a.filename,
            mimeType: a.mimeType,
            // Note: we do NOT embed binary data; only metadata is exported.
          })),
        })),
      };

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${thread.title || 'thread'}_${thread.id}.json"`
        );
        res.send(JSON.stringify(exportData, null, 2));
      } else {
        // CSV flattening: one row per message
        const fields = [
          'messageId',
          'role',
          'content',
          'createdAt',
          'attachmentFilenames',
        ];
        const csvData = thread.messages.map((m) => ({
          messageId: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          attachmentFilenames: m.attachments.map((a) => a.filename).join(';'),
        }));
        const parser = new Json2CsvParser({ fields });
        const csv = parser.parse(csvData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${thread.title || 'thread'}_${thread.id}.csv"`
        );
        res.send(csv);
      }
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Global error handler for the router.
 */
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default router;