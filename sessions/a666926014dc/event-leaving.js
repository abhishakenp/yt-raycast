import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Event, User } from '@prisma/client';
import { sendNotification } from '../services/notificationService';
import { processRefund } from '../services/paymentService';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to ensure the user is authenticated.
 * Assumes that authentication middleware has already populated req.userId.
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}

/**
 * @route DELETE /events/:eventId/leave
 * @desc Allows an authenticated user to leave an event they have joined.
 * @access Private
 */
router.delete(
  '/events/:eventId/leave',
  requireAuth,
  async (req: Request, res: Response) => {
    const userId = Number(req.userId);
    const eventId = Number(req.params.eventId);

    try {
      // Verify the event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          participants: {
            select: { id: true },
          },
          owner: {
            select: { id: true, email: true },
          },
          pricing: true, // assuming a relation that holds price info
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
      }

      // Check if the user is a participant
      const isParticipant = event.participants.some((p) => p.id === userId);
      if (!isParticipant) {
        return res
          .status(403)
          .json({ error: 'You are not a participant of this event.' });
      }

      // Prevent the owner from leaving (owner must delete or transfer ownership)
      if (event.owner.id === userId) {
        return res
          .status(400)
          .json({ error: 'Event owners cannot leave their own event.' });
      }

      // Remove the participant relation
      await prisma.eventParticipant.deleteMany({
        where: {
          eventId,
          userId,
        },
      });

      // If the event has a price and the user paid, process a refund
      if (event.pricing?.price && event.pricing?.price > 0) {
        // Find the transaction related to this user & event
        const transaction = await prisma.transaction.findFirst({
          where: {
            eventId,
            userId,
            type: 'PAYMENT',
            status: 'COMPLETED',
          },
        });

        if (transaction) {
          // Process refund via payment service (e.g., Braintree)
          const refundResult = await processRefund(transaction);
          // Record the refund transaction
          await prisma.transaction.create({
            data: {
              userId,
              eventId,
              amount: -transaction.amount,
              type: 'REFUND',
              status: refundResult.success ? 'COMPLETED' : 'FAILED',
              externalId: refundResult.refundId,
            },
          });
        }
      }

      // Notify the event owner about the participant leaving
      await sendNotification({
        recipientId: event.owner.id,
        title: 'Participant Left Event',
        message: `${(await prisma.user.findUnique({ where: { id: userId } }))?.username ||
          'A user'} has left your event "${event.title}".`,
        data: {
          eventId: event.id,
          userId,
        },
      });

      return res
        .status(200)
        .json({ message: 'Successfully left the event.' });
    } catch (error) {
      console.error('Error leaving event:', error);
      return res
        .status(500)
        .json({ error: 'An unexpected error occurred.' });
    }
  }
);

export default router;