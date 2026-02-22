import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Event, User } from '@prisma/client';
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
 * POST /events/:eventId/delegate
 * Body: { newOwnerId: string }
 *
 * Allows the current event owner (or an admin) to transfer ownership of an event
 * to another user who is already a participant of the event.
 *
 * Permissions:
 * - The requester must be authenticated (req.user populated by auth middleware)
 * - The requester must be either:
 *   a) the current owner of the event, or
 *   b) have an admin role (user.role === 'ADMIN')
 *
 * Business rules:
 * - The new owner must be a confirmed participant of the event.
 * - Ownership transfer creates a notification for the new owner.
 * - The previous owner remains a participant (unless they explicitly leave later).
 */
router.post(
  '/events/:eventId/delegate',
  [
    param('eventId').isUUID().withMessage('eventId must be a valid UUID'),
    body('newOwnerId').isUUID().withMessage('newOwnerId must be a valid UUID'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    const requester: User = (req as any).user; // auth middleware should attach user
    const { eventId } = req.params;
    const { newOwnerId } = req.body;

    try {
      // 1️⃣ Fetch the event with its participants
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          participants: {
            select: { userId: true },
          },
          owner: true,
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // 2️⃣ Permission check
      const isOwner = event.ownerId === requester.id;
      const isAdmin = requester.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions to delegate this event' });
      }

      // 3️⃣ Validate new owner existence
      const newOwner = await prisma.user.findUnique({
        where: { id: newOwnerId },
      });

      if (!newOwner) {
        return res.status(404).json({ error: 'New owner user not found' });
      }

      // 4️⃣ Ensure new owner is a participant of the event
      const isParticipant = event.participants.some(p => p.userId === newOwnerId);
      if (!isParticipant) {
        return res.status(400).json({
          error: 'The new owner must be a participant of the event',
        });
      }

      // 5️⃣ Perform the delegation inside a transaction
      await prisma.$transaction(async (tx) => {
        // Update event owner
        await tx.event.update({
          where: { id: eventId },
          data: { ownerId: newOwnerId },
        });

        // Create a notification for the new owner
        await tx.notification.create({
          data: {
            userId: newOwnerId,
            type: 'EVENT_DELEGATION',
            title: 'You are now the owner of an event',
            message: `You have been delegated ownership of the event "${event.title}".`,
            metadata: {
              eventId,
            },
          },
        });
      });

      // 6️⃣ Respond
      return res.status(200).json({
        message: 'Event ownership successfully delegated',
        eventId,
        newOwnerId,
      });
    } catch (error) {
      console.error('Error delegating event ownership:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;