import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { sendNotification } from '../services/notificationService';
import { verifyEventOwner } from '../middlewares/authorizationMiddleware';

const prisma = new PrismaClient();

/**
 * Apply the authenticated user to an event.
 * POST /events/:eventId/apply
 */
export const applyToEvent = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { eventId } = req.params;

  try {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: { id: true, ownerId: true, participantLimit: true, participants: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user already applied or is already a participant
    const existingApplication = await prisma.eventApplication.findFirst({
      where: {
        eventId: event.id,
        applicantId: userId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this event' });
    }

    const isParticipant = await prisma.eventParticipant.findFirst({
      where: {
        eventId: event.id,
        userId,
      },
    });

    if (isParticipant) {
      return res.status(400).json({ error: 'You are already a participant of this event' });
    }

    // Enforce participant limit (if any)
    if (event.participantLimit) {
      const currentCount = await prisma.eventParticipant.count({
        where: { eventId: event.id },
      });
      if (currentCount >= event.participantLimit) {
        return res.status(400).json({ error: 'Event participant limit reached' });
      }
    }

    // Create application with status PENDING
    const application = await prisma.eventApplication.create({
      data: {
        eventId: event.id,
        applicantId: userId!,
        status: ApplicationStatus.PENDING,
        appliedAt: new Date(),
      },
    });

    // Notify event owner about new application
    await sendNotification({
      recipientId: event.ownerId,
      type: 'EVENT_APPLICATION',
      payload: {
        eventId: event.id,
        applicantId: userId,
        applicationId: application.id,
      },
      message: `${req.user?.username} applied to your event "${event.id}"`,
    });

    return res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve an application.
 * POST /events/:eventId/applications/:applicationId/approve
 * Only event owner can approve.
 */
export const approveApplication = [
  verifyEventOwner, // middleware that ensures req.user.id === event.ownerId
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, applicationId } = req.params;
    const ownerId = req.user?.id;

    try {
      // Fetch application
      const application = await prisma.eventApplication.findUnique({
        where: { id: Number(applicationId) },
        include: { event: true, applicant: true },
      });

      if (!application || application.eventId !== Number(eventId)) {
        return res.status(404).json({ error: 'Application not found for this event' });
      }

      if (application.status !== ApplicationStatus.PENDING) {
        return res.status(400).json({ error: 'Application is not pending' });
      }

      // Add applicant as participant
      await prisma.eventParticipant.create({
        data: {
          eventId: application.eventId,
          userId: application.applicantId,
        },
      });

      // Update application status
      const updatedApp = await prisma.eventApplication.update({
        where: { id: Number(applicationId) },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedAt: new Date(),
          reviewerId: ownerId,
        },
      });

      // Notify applicant
      await sendNotification({
        recipientId: application.applicantId,
        type: 'APPLICATION_APPROVED',
        payload: { eventId: application.eventId },
        message: `Your application to event "${application.event.title}" has been approved!`,
      });

      return res.json({ application: updatedApp });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * Reject an application.
 * POST /events/:eventId/applications/:applicationId/reject
 * Only event owner can reject.
 */
export const rejectApplication = [
  verifyEventOwner,
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, applicationId } = req.params;
    const ownerId = req.user?.id;

    try {
      const application = await prisma.eventApplication.findUnique({
        where: { id: Number(applicationId) },
        include: { event: true, applicant: true },
      });

      if (!application || application.eventId !== Number(eventId)) {
        return res.status(404).json({ error: 'Application not found for this event' });
      }

      if (application.status !== ApplicationStatus.PENDING) {
        return res.status(400).json({ error: 'Application is not pending' });
      }

      const updatedApp = await prisma.eventApplication.update({
        where: { id: Number(applicationId) },
        data: {
          status: ApplicationStatus.REJECTED,
          reviewedAt: new Date(),
          reviewerId: ownerId,
        },
      });

      // Notify applicant
      await sendNotification({
        recipientId: application.applicantId,
        type: 'APPLICATION_REJECTED',
        payload: { eventId: application.eventId },
        message: `Your application to event "${application.event.title}" was rejected.`,
      });

      return res.json({ application: updatedApp });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * Get all applications for an event (owner view).
 * GET /events/:eventId/applications
 */
export const getEventApplications = [
  verifyEventOwner,
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId } = req.params;

    try {
      const applications = await prisma.eventApplication.findMany({
        where: { eventId: Number(eventId) },
        include: {
          applicant: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });

      return res.json({ applications });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * Get applications made by the authenticated user.
 * GET /me/applications
 */
export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  try {
    const applications = await prisma.eventApplication.findMany({
      where: { applicantId: userId },
      include: {
        event: {
          select: { id: true, title: true, startDate: true, ownerId: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return res.json({ applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a pending application (applicant view).
 * DELETE /events/:eventId/applications/:applicationId
 */
export const cancelApplication = async (req: Request, res: Response, next: NextFunction) => {
  const { eventId, applicationId } = req.params;
  const userId = req.user?.id;

  try {
    const application = await prisma.eventApplication.findUnique({
      where: { id: Number(applicationId) },
    });

    if (!application || application.eventId !== Number(eventId) || application.applicantId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== ApplicationStatus.PENDING) {
      return res.status(400).json({ error: 'Only pending applications can be cancelled' });
    }

    await prisma.eventApplication.delete({
      where: { id: Number(applicationId) },
    });

    // Optionally notify event owner about cancellation
    await sendNotification({
      recipientId: application.event.ownerId,
      type: 'APPLICATION_CANCELLED',
      payload: { eventId: application.eventId, applicantId: userId },
      message: `${req.user?.username} cancelled their application to your event.`,
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};