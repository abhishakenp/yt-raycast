< event.priceLids) {
        throw new BadRequestError('Insufficient Lids balance to join this event');
      }

      // Deduct Lids from user and credit organizer
      await tx.user.update({
        where: { id: userId },
        data: {
          lidsBalance: { decrement: event.priceLids },
        },
      });

      await tx.user.update({
        where: { id: event.organizerId },
        data: {
          lidsBalance: { increment: event.priceLids },
        },
      });

      // Record the transaction (virtual currency)
      await createTransaction({
        prisma: tx,
        fromUserId: userId,
        toUserId: event.organizerId,
        amount: event.priceLids,
        type: 'EVENT_JOIN',
        referenceId: event.id,
      });
    }

    // 5️⃣ Determine if event requires approval
    if (event.requiresApproval) {
      // Store as pending application
      await tx.eventApplication.create({
        data: {
          eventId: event.id,
          userId,
          status: 'PENDING',
        },
      });

      // Notify organizer about new application
      await sendNotification({
        prisma: tx,
        recipientId: event.organizerId,
        title: 'New Event Join Request',
        body: `${req.user?.username || 'A user'} wants to join your event "${event.title}".`,
        data: { eventId: event.id, applicantId: userId },
      });

      res.status(202).json({
        message: 'Join request submitted and pending approval',
      });
      return;
    }

    // 6️⃣ Directly add participant
    await tx.eventParticipant.create({
      data: {
        eventId: event.id,
        userId,
        joinedAt: new Date(),
      },
    });

    // 7️⃣ Notify organizer about new participant
    await sendNotification({
      prisma: tx,
      recipientId: event.organizerId,
      title: 'New Participant',
      body: `${req.user?.username || 'A user'} has joined your event "${event.title}".`,
      data: { eventId: event.id, participantId: userId },
    });
  });

  // Transaction completed successfully
  res.status(200).json({ message: 'Successfully joined the event' });
};

export default {
  joinEvent,
};