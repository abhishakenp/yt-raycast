<void> {
  await prisma.$transaction(async (tx) => {
    const messages = await tx.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const hashMap = new Map<string, Message[]>();

    for (const msg of messages) {
      const hash = generateMessageHash(msg);
      const bucket = hashMap.get(hash) ?? [];
      bucket.push(msg);
      hashMap.set(hash, bucket);
    }

    for (const [hash, group] of hashMap.entries()) {
      if (group.length <= 1) continue; // no duplicates

      // Keep the first (earliest) message as the canonical one
      const canonical = group[0];
      const duplicates = group.slice(1);

      // Re‑associate attachments
      const attachmentIds = (
        await tx.attachment.findMany({
          where: { messageId: { in: duplicates.map((d) => d.id) } },
          select: { id: true },
        })
      ).map((a) => a.id);

      if (attachmentIds.length) {
        await tx.attachment.updateMany({
          where: { id: { in: attachmentIds } },
          data: { messageId: canonical.id },
        });
      }

      // Re‑associate tags (many‑to‑many via MessageTag join table)
      const duplicateTagLinks = await tx.messageTag.findMany({
        where: { messageId: { in: duplicates.map((d) => d.id) } },
        select: { tagId: true },
      });

      if (duplicateTagLinks.length) {
        // Insert missing links for the canonical message
        const existingTagLinks = await tx.messageTag.findMany({
          where: { messageId: canonical.id },
          select: { tagId: true },
        });
        const existingTagIds = new Set(existingTagLinks.map((l) => l.tagId));

        const newLinks = duplicateTagLinks
          .filter((l) => !existingTagIds.has(l.tagId))
          .map((l) => ({
            messageId: canonical.id,
            tagId: l.tagId,
          }));

        if (newLinks.length) {
          await tx.messageTag.createMany({ data: newLinks, skipDuplicates: true });
        }

        // Delete old links
        await tx.messageTag.deleteMany({
          where: { messageId: { in: duplicates.map((d) => d.id) } },
        });
      }

      // Finally delete duplicate messages
      await tx.message.deleteMany({
        where: { id: { in: duplicates.map((d) => d.id) } },
      });
    }
  });
}

/**
 * Public API – deduplicate messages for a given user across all their chats.
 *
 * This helper iterates over each chat belonging to the user and runs the
 * deduplication routine. It can be invoked as a background job or via an
 * admin endpoint.
 *
 * @param userId ID of the user whose chats should be processed
 */
export async function deduplicateUserMessages(userId: string): Promise<void> {
  const chats = await prisma.chat.findMany({
    where: { userId },
    select: { id: true },
  });

  for (const chat of chats) {
    await deduplicateChatMessages(chat.id);
  }
}

/**
 * Example Express route (to be mounted in your router) that triggers
 * deduplication for the authenticated user.
 *
 *   POST /api/deduplicate
 *
 * Authentication middleware should populate req.user.id.
 */
export async function deduplicationRouteHandler(req: any, res: any) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    await deduplicateUserMessages(userId);
    res.json({ status: 'ok', message: 'Deduplication completed.' });
  } catch (err) {
    console.error('Deduplication error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}