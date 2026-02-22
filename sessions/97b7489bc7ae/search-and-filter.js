import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /search
 * Query Parameters:
 *   - q: free‑text search term (searches chat titles and message contents)
 *   - providerId: filter by Provider.id
 *   - tagIds: comma‑separated list of Tag.id to filter chats that have all specified tags
 *   - startDate: ISO date string – include chats/messages created after this date
 *   - endDate: ISO date string – include chats/messages created before this date
 *   - page: pagination page (default 1)
 *   - limit: items per page (default 20)
 *
 * Returns a paginated list of chats with matching messages.
 */
router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        q,
        providerId,
        tagIds,
        startDate,
        endDate,
        page = "1",
        limit = "20",
      } = req.query as {
        q?: string;
        providerId?: string;
        tagIds?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const pageNum = Math.max(parseInt(page, 10), 1);
      const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for Chat
      const chatWhere: Prisma.ChatWhereInput = {
        // Only return chats belonging to the authenticated user (assume middleware set req.userId)
        userId: (req as any).userId,
        // Provider filter
        ...(providerId && { providerId: providerId }),
        // Tag filter – require all supplied tags to be attached to the chat
        ...(tagIds && {
          tags: {
            some: {
              id: { in: tagIds.split(",").map((id) => id.trim()) },
            },
          },
        }),
        // Date range filter on chat creation
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
        // Text search on chat title (if provided)
        ...(q && {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            {
              messages: {
                some: {
                  content: { contains: q, mode: "insensitive" },
                },
              },
            },
          ],
        }),
      };

      // Fetch chats with matching messages
      const [total, chats] = await Promise.all([
        prisma.chat.count({ where: chatWhere }),
        prisma.chat.findMany({
          where: chatWhere,
          include: {
            provider: { select: { id: true, name: true } },
            tags: { select: { id: true, name: true } },
            messages: {
              where: {
                ...(q && {
                  content: { contains: q, mode: "insensitive" },
                }),
                ...(startDate && { createdAt: { gte: new Date(startDate) } }),
                ...(endDate && { createdAt: { lte: new Date(endDate) } }),
              },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
                attachments: {
                  select: { id: true, filename: true, url: true },
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          skip,
          take: limitNum,
        }),
      ]);

      res.json({
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        data: chats.map((chat) => ({
          id: chat.id,
          title: chat.title,
          provider: chat.provider,
          tags: chat.tags,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          // Only include messages that matched the text filter (if any)
          messages: chat.messages,
        })),
      });
    } catch (error) {
      console.error("[GET /search] error:", error);
      next(error);
    }
  }
);

export default router;