<PruneResult> {
  const audit = new AuditService();

  // Build base where clause for chats
  const chatWhere: any = {
    userId,
    remotePruneRequestedAt: { not: null }, // flag set when user requests remote prune
  };
  if (olderThan) {
    chatWhere.createdAt = { lt: olderThan };
  }

  // Fetch chats to be pruned (including related messages & attachments)
  const chats = await prisma.chat.findMany({
    where: chatWhere,
    include: {
      messages: {
        include: {
          attachments: true,
        },
      },
    },
  });

  let deletedChats = 0;
  let deletedMessages = 0;
  let deletedAttachments = 0;

  for (const chat of chats) {
    // Delete attachments from S3
    for (const message of chat.messages) {
      for (const attachment of message.attachments) {
        await deleteAttachmentFromS3(attachment);
        await prisma.attachment.delete({
          where: { id: attachment.id },
        });
        deletedAttachments++;
        await audit.log({
          userId,
          action: 'attachment_deleted',
          entity: 'Attachment',
          entityId: attachment.id,
          details: { chatId: chat.id, messageId: message.id },
        });
      }

      // Delete the message itself
      await prisma.message.delete({
        where: { id: message.id },
      });
      deletedMessages++;
      await audit.log({
        userId,
        action: 'message_deleted',
        entity: 'Message',
        entityId: message.id,
        details: { chatId: chat.id },
      });
    }

    // Finally delete the chat
    await prisma.chat.delete({
      where: { id: chat.id },
    });
    deletedChats++;
    await audit.log({
      userId,
      action: 'chat_deleted',
      entity: 'Chat',
      entityId: chat.id,
      details: { remotePruneRequestedAt: chat.remotePruneRequestedAt },
    });
  }

  Logger.info(
    `Remote prune completed for user ${userId}: ${deletedChats} chats, ${deletedMessages} messages, ${deletedAttachments} attachments removed.`,
  );

  return { deletedChats, deletedMessages, deletedAttachments };
}

/**
 * Helper to delete a single attachment from S3.
 */
async function deleteAttachmentFromS3(attachment: Attachment): Promise<void> {
  if (!attachment.s3Key) {
    // No S3 reference; nothing to delete.
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: attachment.s3Key,
  });

  try {
    await s3.send(command);
    Logger.debug(`Deleted S3 object ${attachment.s3Key}`);
  } catch (err) {
    Logger.error(
      `Failed to delete S3 object ${attachment.s3Key} for attachment ${attachment.id}:`,
      err,
    );
    // Continue; audit will still record the DB deletion.
  }
}