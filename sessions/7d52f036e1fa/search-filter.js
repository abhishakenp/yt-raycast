import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

/**
 * Query parameters schema for search & filter endpoint
 * 
 * - q: free‑text search term (optional)
 * - providerId: filter by Provider ID (optional)
 * - tagIds: comma‑separated list of Tag IDs (optional)
 * - threadId: filter messages belonging to a specific ChatThread (optional)
 * - startDate / endDate: ISO date strings to filter by message creation date (optional)
 * - page: pagination page number (default 1)
 * - limit: items per page (default 20, max 100)
 */
const searchSchema = z.object({
  q: z.string().optional(),
  providerId: z.string().uuid().optional(),
  tagIds: z.string().optional(),
  threadId: z.string().uuid().optional(),
  startDate: z.string().refine((d) => !d || !isNaN(Date.parse(d)), {
    message: 'Invalid startDate',
  }).optional(),
  endDate: z.string().refine((d) => !d || !isNaN(Date.parse(d)), {
    message: 'Invalid endDate',
  }).optional(),
  page: z.string().optional().default('1').transform((s) => parseInt(s, 10)),
  limit: z.string().optional().default('20').transform((s) => {
    const n = parseInt(s, 10);
    return n > 100 ? 100 : n;
  }),
});

/**
 * GET /api/search
 * 
 * Returns a paginated list of messages (and their parent threads) matching the supplied filters.
 * The response shape:
 * {
 *   total: number,
 *   page: number,
 *   limit: number,
 *   results: [
 *     {
 *       message: { id, content, createdAt, ... },
 *       thread: { id, title, ... },
 *       provider: { id, name, ... },
 *       tags: [{ id, name, ... }, ...]
 *     },
 *     ...
 *   ]
 * }
 */
router.get(
  '/search',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = searchSchema.parse(req.query);

      const {
        q,
        providerId,
        tagIds,
        threadId,
        startDate,
        endDate,
        page,
        limit,
      } = parsed;

      const where: Prisma.MessageWhereInput = {
        // Base filter: only messages belonging to the authenticated user
        // (Assuming auth middleware sets req.user.id)
        userId: (req as any).user?.id,
      };

      if (threadId) {
        where.chatThreadId = threadId;
      }

      if (providerId) {
        where.providerId = providerId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      if (q) {
        // Simple ILIKE search; for production consider full‑text search with tsvector
        where.content = {
          contains: q,
          mode: 'insensitive',
        };
      }

      if (tagIds) {
        const ids = tagIds.split(',').map((id) => id.trim()).filter(Boolean);
        if (ids.length) {
          where.tags = {
            some: {
              id: { in: ids },
            },
          };
        }
      }

      const total = await prisma.message.count({ where });

      const messages = await prisma.message.findMany({
        where,
        include: {
          chatThread: true,
          provider: true,
          tags: true,
          attachments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const results = messages.map((msg) => ({
        message: {
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        },
        thread: {
          id: msg.chatThread?.id,
          title: msg.chatThread?.title,
          createdAt: msg.chatThread?.createdAt,
        },
        provider: {
          id: msg.provider?.id,
          name: msg.provider?.name,
        },
        tags: msg.tags?.map((t) => ({
          id: t.id,
          name: t.name,
        })),
        attachments: msg.attachments?.map((a) => ({
          id: a.id,
          filename: a.filename,
          mimeType: a.mimeType,
        })),
      }));

      res.json({
        total,
        page,
        limit,
        results,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid query parameters', details: err.errors });
      } else {
        next(err);
      }
    }
  },
);

export default router;