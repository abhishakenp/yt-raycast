import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Event, User } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../utils/httpErrors';
import { sendEventDeletionNotification } from '../services/notificationService';
import { refundLidsIfApplicable } from '../services/paymentService';

const prisma = new PrismaClient();

/**
 * DELETE /events/:id
 * Deletes an event.
 *
 * Permissions:
 * - Event owner can delete the event.
 * - Admin users can delete any event.
 *
 * Side‑effects:
 * - Deletes related comments, photos, participants, notifications, and transactions.
 * - Refunds virtual currency (Lids) to participants if the event had a price and participants paid.
 * - Sends a deletion notification to the event owner and participants.
 */
export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  const eventId = Number(req.params.id);
  const user = req.user as User; // populated by auth middleware

  try {
    // 1️⃣ Fetch the event with necessary relations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        owner: true,
        participants: true,
        comments: true,
        photos: true,
        notifications: true,
        transactions: true,
      },
    });

    // 2️⃣ Validate existence
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // 3️⃣ Authorization check
    const isOwner = event.ownerId === user.id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to delete this event');
    }

    // 4️⃣ Begin transaction – cascade delete related data
    await prisma.$transaction(async (tx) => {
      // Refund participants if the event was paid and the user paid Lids
      if (event.price && event.price > 0) {
        await refundLidsIfApplicable(tx, event);
      }

      // Delete notifications related to this event
      await tx.notification.deleteMany({
        where: { eventId: event.id },
      });

      // Delete comments
      await tx.comment.deleteMany({
        where: { eventId: event.id },
      });

      // Delete photos
      await tx.photo.deleteMany({
        where: { eventId: event.id },
      });

      // Delete participant links (junction table)
      await tx.eventParticipant.deleteMany({
        where: { eventId: event.id },
      });

      // Delete transactions (e.g., payments, refunds)
      await tx.transaction.deleteMany({
        where: { eventId: event.id },
      });

      // Finally delete the event itself
      await tx.event.delete({
        where: { id: event.id },
      });
    });

    // 5️⃣ Notify owner and participants about deletion
    await sendEventDeletionNotification(event);

    // 6️⃣ Respond
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Helper services (simplified)                                               */
/* -------------------------------------------------------------------------- */

async function refundLidsIfApplicable(
  tx: PrismaClient,
  event: Event & { participants: { userId: number; paidLids: number }[] }
) {
  // For each participant that paid Lids, credit them back
  const refunds = event.participants
    .filter((p) => p.paidLids && p.paidLids > 0)
    .map((p) => ({
      userId: p.userId,
      amount: p.paidLids,
    }));

  for (const refund of refunds) {
    // Update user's credit balance
    await tx.credit.updateMany({
      where: { userId: refund.userId },
      data: {
        balance: {
          increment: refund.amount,
        },
      },
    });

    // Record a refund transaction
    await tx.transaction.create({
      data: {
        userId: refund.userId,
        eventId: event.id,
        type: 'REFUND',
        amount: refund.amount,
        status: 'COMPLETED',
        description: `Refund for deleted event "${event.title}"`,
      },
    });
  }
}