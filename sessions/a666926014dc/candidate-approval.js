// candidateApproval.js
// Backend logic for approving a candidate (event application) in the Lidmi platform.
// Assumes an Express.js server with Sequelize ORM and JWT-based authentication.

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Event, User, EventApplication, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { emitNotification } = require('../utils/realtime');

// -----------------------------------------------------------------------------
// Helper: verify that the requester has permission to approve candidates for the event.
// Only the event creator or an admin can approve.
async function authorizeEventOwner(req, res, next) {
  const { eventId } = req.params;
  const requesterId = req.user.id;

  try {
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Assuming Event has a `ownerId` field.
    if (event.ownerId !== requesterId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    // Attach event to request for later use.
    req.event = event;
    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// -----------------------------------------------------------------------------
// Route: POST /events/:eventId/candidates/:candidateId/approve
// Approve a pending application to join an event.
router.post(
  '/events/:eventId/candidates/:candidateId/approve',
  authenticate,
  authorizeEventOwner,
  async (req, res) => {
    const { eventId, candidateId } = req.params;

    try {
      // Find the pending application.
      const application = await EventApplication.findOne({
        where: {
          id: candidateId,
          eventId,
          status: 'pending',
        },
      });

      if (!application) {
        return res
          .status(404)
          .json({ error: 'Pending application not found.' });
      }

      // Check participant limit if the event defines one.
      if (req.event.participantLimit) {
        const approvedCount = await EventApplication.count({
          where: {
            eventId,
            status: 'approved',
          },
        });

        if (approvedCount >= req.event.participantLimit) {
          return res
            .status(400)
            .json({ error: 'Event participant limit reached.' });
        }
      }

      // Approve the application.
      application.status = 'approved';
      await application.save();

      // Optionally, create a Participant record (if you have a separate model).
      // await Participant.create({ eventId, userId: application.userId });

      // Notify the applicant via in-app notification.
      await Notification.create({
        userId: application.userId,
        type: 'application_approved',
        payload: {
          eventId: req.event.id,
          eventTitle: req.event.title,
        },
        read: false,
      });

      // Emit real‑time notification if using websockets (e.g., Socket.io).
      emitNotification(application.userId, {
        type: 'application_approved',
        eventId: req.event.id,
        title: req.event.title,
      });

      // Send email confirmation.
      const applicant = await User.findByPk(application.userId);
      if (applicant && applicant.email) {
        await sendEmail({
          to: applicant.email,
          subject: `Your application to "${req.event.title}" has been approved`,
          template: 'applicationApproved',
          context: {
            userName: applicant.username,
            eventTitle: req.event.title,
            eventDate: req.event.startDate,
          },
        });
      }

      res.json({
        message: 'Candidate approved successfully.',
        application: {
          id: application.id,
          status: application.status,
        },
      });
    } catch (err) {
      console.error('Approval error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;