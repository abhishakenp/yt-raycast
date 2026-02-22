import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Event, Category } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format',
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format',
  }),
  location: z.string().optional(),
});

/**
 * GET /categories/:slug/events
 * Browse events belonging to a specific category.
 * Supports pagination, date range filtering, and location filtering.
 */
router.get(
  '/categories/:slug/events',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const { page, limit, startDate, endDate, location } = querySchema.parse(
        req.query
      );

      // Find the category by slug
      const category: Category | null = await prisma.category.findUnique({
        where: { slug },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Build where clause for events
      const eventWhere: any = {
        categoryId: category.id,
        isDeleted: false,
        isPublished: true,
      };

      if (startDate) {
        eventWhere.startDate = { gte: new Date(startDate) };
      }

      if (endDate) {
        eventWhere.endDate = {
          ...(eventWhere.endDate || {}),
          lte: new Date(endDate),
        };
      }

      if (location) {
        // Assuming Event has a `location` field (string) that can be matched partially
        eventWhere.location = {
          contains: location,
          mode: 'insensitive',
        };
      }

      const [total, events] = await Promise.all([
        prisma.event.count({ where: eventWhere }),
        prisma.event.findMany({
          where: eventWhere,
          include: {
            creator: {
              select: { id: true, username: true, avatarUrl: true },
            },
            category: true,
          },
          orderBy: { startDate: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        events: events.map((e: Event & { creator: any; category: any }) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
          location: e.location,
          thumbnailUrl: e.thumbnailUrl,
          creator: e.creator,
          category: {
            id: e.category.id,
            name: e.category.name,
            slug: e.category.slug,
          },
          participantCount: e.participantCount,
          price: e.price,
          isFree: e.isFree,
        })),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      next(err);
    }
  }
);

export default router;