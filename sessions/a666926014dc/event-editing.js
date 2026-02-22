<Event> = {};
  const allowedFieldsForDelegate = ['title', 'description', 'startTime', 'endTime', 'location', 'themeId'];
  const bodyKeys = Object.keys(req.body) as (keyof typeof req.body)[];

  for (const key of bodyKeys) {
    // Skip fields the delegate is not allowed to change
    if (!isOwner && !allowedFieldsForDelegate.includes(key as string)) {
      continue;
    }

    // @ts-ignore – we know the key exists on Event type
    updatePayload[key] = req.body[key];
  }

  // Business rule: capacity cannot be set lower than current confirmed participants
  if (updatePayload.capacity !== undefined) {
    const confirmedCount = event.participants?.length ?? 0;
    if (updatePayload.capacity < confirmedCount) {
      throw new BadRequestError(
        `Capacity cannot be lower than the number of confirmed participants (${confirmedCount}).`
      );
    }
  }

  // Business rule: startTime must be before endTime
  if (updatePayload.startTime && updatePayload.endTime) {
    if (new Date(updatePayload.startTime) >= new Date(updatePayload.endTime)) {
      throw new BadRequestError('Start time must be before end time.');
    }
  } else if (updatePayload.startTime && !updatePayload.endTime) {
    if (new Date(updatePayload.startTime) >= new Date(event.endTime)) {
      throw new BadRequestError('Start time must be before current end time.');
    }
  } else if (!updatePayload.startTime && updatePayload.endTime) {
    if (new Date(event.startTime) >= new Date(updatePayload.endTime)) {
      throw new BadRequestError('Current start time must be before new end time.');
    }
  }

  // Persist changes
  const updatedEvent = await prisma.event.update({
    where: { id: Number(eventId) },
    data: updatePayload,
    include: {
      owner: { select: { id: true, username: true } },
      theme: true,
    },
  });

  res.status(200).json({
    message: 'Event updated successfully',
    event: updatedEvent,
  });
});

/**
 * Express router setup for event routes.
 * This file can be imported in the main server file.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.put(
  '/:eventId',
  authenticate, // ensures req.user is set and token validated
  validateEditEvent,
  editEvent
);

export default router;