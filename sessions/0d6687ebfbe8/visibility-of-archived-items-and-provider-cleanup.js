import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Provider, ChatThread, Message } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to validate request and forward errors
 */
function validate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}

/**
 * GET /archive/:providerId
 * Returns all archived chat threads and their messages for the authenticated user
 * belonging to the specified provider.
 *
 * Visibility rules:
 *  - Only threads owned by the requesting user are returned.
 *  - Only threads marked as `archived: true` are included.
 *  - Provider must belong to the user (or be a global provider the user has access to).
 */
router.get(
  '/archive/:providerId',
  [
    param('providerId').isString().withMessage('providerId must be a string'),
    validate,
  ],
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { providerId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      // Verify provider belongs to the user (or is public)
      const provider = await prisma.provider.findFirst({
        where: {
          id: providerId,
          OR: [{ ownerId: userId }, { isPublic: true }],
        },
      });

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found or inaccessible' });
      }

      // Fetch archived threads with messages and attachments
      const archivedThreads = await prisma.chatThread.findMany({
        where: {
          ownerId: userId,
          providerId: provider.id,
          archived: true,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              attachments: true,
            },
          },
          tags: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.json({ provider, archivedThreads });
    } catch (err) {
      console.error('Error fetching archived items:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /provider/:providerId/cleanup
 * Removes all data belonging to a provider that is no longer needed.
 *
 * Cleanup rules:
 *  - Only threads that are archived **and** have no active (non‑archived) sibling threads are removed.
 *  - Messages and attachments linked to those threads are also deleted.
 *  - Provider record itself is NOT deleted; only its data is purged.
 *  - Operation is scoped to the authenticated user.
 */
router.delete(
  '/provider/:providerId/cleanup',
  [
    param('providerId').isString().withMessage('providerId must be a string'),
    validate,
  ],
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { providerId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      // Verify provider ownership
      const provider = await prisma.provider.findFirst({
        where: {
          id: providerId,
          ownerId: userId,
        },
      });

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found or inaccessible' });
      }

      // Find threads eligible for deletion:
      // - Belong to this user & provider
      // - Archived = true
      // - No non‑archived threads exist for the same provider (i.e., all threads are archived)
      const activeThreadExists = await prisma.chatThread.findFirst({
        where: {
          ownerId: userId,
          providerId: provider.id,
          archived: false,
        },
      });

      if (activeThreadExists) {
        return res.status(400).json({
          error:
            'Cannot cleanup provider while active (non‑archived) threads still exist.',
        });
      }

      // All threads are archived – proceed to delete them
      const threadsToDelete = await prisma.chatThread.findMany({
        where: {
          ownerId: userId,
          providerId: provider.id,
        },
        select: { id: true },
      });

      const threadIds = threadsToDelete.map((t) => t.id);

      // Transactionally delete messages, attachments, tags, then threads
      await prisma.$transaction(async (tx) => {
        // Delete attachments
        await tx.attachment.deleteMany({
          where: {
            message: {
              threadId: { in: threadIds },
            },
          },
        });

        // Delete messages
        await tx.message.deleteMany({
          where: {
            threadId: { in: threadIds },
          },
        });

        // Delete thread‑tag relations
        await tx.chatThreadTag.deleteMany({
          where: {
            threadId: { in: threadIds },
          },
        });

        // Finally delete threads
        await tx.chatThread.deleteMany({
          where: {
            id: { in: threadIds },
          },
        });
      });

      res.json({
        message: `Cleanup successful. Removed ${threadIds.length} thread(s) and associated data for provider ${provider.id}.`,
      });
    } catch (err) {
      console.error('Error during provider cleanup:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;