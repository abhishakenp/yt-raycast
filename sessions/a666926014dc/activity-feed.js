import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * Activity Feed Endpoint
 * GET /api/feed
 * Query Params:
 *   - limit (default 20, max 50)
 *   - cursor (optional, activity ID for pagination)
 *
 * Returns a paginated list of activities relevant to the authenticated user.
 * Each activity includes the actor, target entity (event, comment, etc.) and a
 * human‑readable description.
 *
 * Authentication middleware must populate req.user.id.
 */
router.get(
  '/feed',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const cursor = req.query.cursor ? { id: Number(req.query.cursor) } : undefined;

      // Fetch activities that are either:
      // - Performed by users the current user follows
      // - Involving events the user participates in
      // - Directly related to the user (e.g., friend requests, mentions)
      const activities = await prisma.activity.findMany({
        where: {
          OR: [
            // Activities by followed users
            {
              actorId: {
                in: prisma.follow.findMany({
                  where: { followerId: userId },
                  select: { followingId: true },
                }).then(f => f.map(f => f.followingId)),
              },
            },
            // Activities on events the user is a participant of
            {
              targetType: 'EVENT',
              targetId: {
                in: prisma.eventParticipant.findMany({
                  where: { userId },
                  select: { eventId: true },
                }).then(p => p.map(p => p.eventId)),
              },
            },
            // Direct activities (friend request accepted, mention, etc.)
            {
              targetType: 'USER',
              targetId: userId,
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1, // fetch one extra to know if there is a next page
        cursor,
        include: {
          actor: {
            select: { id: true, username: true, avatarUrl: true },
          },
          event: {
            select: { id: true, title: true, slug: true },
          },
          comment: {
            select: { id: true, content: true, eventId: true },
          },
          photo: {
            select: { id: true, url: true, eventId: true },
          },
        },
      });

      const hasNextPage = activities.length > limit;
      const slicedActivities = hasNextPage ? activities.slice(0, -1) : activities;

      const formatted = slicedActivities.map((a) => ({
        id: a.id,
        type: a.type as ActivityType,
        actor: a.actor,
        createdAt: a.createdAt,
        // Resolve target based on type
        target: (() => {
          switch (a.type) {
            case 'EVENT_CREATED':
            case 'EVENT_JOINED':
            case 'EVENT_LEFT':
              return a.event ? { type: 'EVENT', data: a.event } : null;
            case 'COMMENT_ADDED':
              return a.comment ? { type: 'COMMENT', data: a.comment } : null;
            case 'PHOTO_UPLOADED':
              return a.photo ? { type: 'PHOTO', data: a.photo } : null;
            case 'FRIEND_ADDED':
            case 'FOLLOWED':
              return { type: 'USER', data: { id: a.targetId } };
            default:
              return null;
          }
        })(),
        // Human readable message
        message: (() => {
          const actorName = a.actor.username;
          switch (a.type) {
            case 'EVENT_CREATED':
              return `${actorName} created a new event "${a.event?.title}"`;
            case 'EVENT_JOINED':
              return `${actorName} joined the event "${a.event?.title}"`;
            case 'EVENT_LEFT':
              return `${actorName} left the event "${a.event?.title}"`;
            case 'COMMENT_ADDED':
              return `${actorName} commented on "${a.event?.title}"`;
            case 'PHOTO_UPLOADED':
              return `${actorName} added a photo to "${a.event?.title}"`;
            case 'FRIEND_ADDED':
              return `${actorName} is now friends with you`;
            case 'FOLLOWED':
              return `${actorName} started following you`;
            case 'JOKER_USED':
              return `${actorName} used a Joker`;
            case 'TRANSACTION_MADE':
              return `${actorName} made a transaction`;
            default:
              return `${actorName} performed an action`;
          }
        })(),
      }));

      res.json({
        activities: formatted,
        pagination: {
          nextCursor: hasNextPage ? slicedActivities[slicedActivities.length - 1].id : null,
          hasNextPage,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * Helper: Record a new activity.
 * Call this from other services (event creation, comment, follow, etc.).
 */
export async function recordActivity(params: {
  type: ActivityType;
  actorId: number;
  targetId?: number;
  targetType?: 'USER' | 'EVENT' | 'COMMENT' | 'PHOTO' | null;
}) {
  const { type, actorId, targetId, targetType } = params;
  await prisma.activity.create({
    data: {
      type,
      actorId,
      targetId: targetId ?? null,
      targetType: targetType ?? null,
    },
  });
}

export default router;