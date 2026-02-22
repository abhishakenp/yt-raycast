<string>();
      const existingMessageHashes = await tx.message.findMany({
        where: { chat: { userId } },
        select: { id: true, content: true, createdAt: true },
      }).then((msgs) => msgs.map((m) => hashObject({ content: m.content, createdAt: m.createdAt })));

      existingMessageHashes.forEach((h) => messageHashes.add(h));

      // Import chats and messages
      for (const chat of payload.chats) {
        // Upsert chat by externalId (if present) else by title+userId
        const chatUpsert = await tx.chat.upsert({
          where: chat.externalId
            ? { externalId_userId: { externalId: chat.externalId, userId } }
            : { title_userId: { title: chat.title, userId } },
          update: {
            title: chat.title,
            providerId: chat.providerId,
            // keep existing timestamps
          },
          create: {
            title: chat.title,
            userId,
            providerId: chat.providerId,
            externalId: chat.externalId ?? null,
          },
        });

        // Link tags (many‑to‑many)
        if (chat.tags?.length) {
          const tagIds = await Promise.all(
            chat.tags.map(async (t: any) => {
              const tag = await tx.tag.upsert({
                where: { name_userId: { name: t.name, userId } },
                update: t,
                create: { ...t, userId },
              });
              return tag.id;
            })
          );
          await tx.chat.update({
            where: { id: chatUpsert.id },
            data: { tags: { set: tagIds.map((id) => ({ id })) } },
          });
        }

        // Import messages with deduplication
        for (const msg of chat.messages ?? []) {
          const msgHash = hashObject({ content: msg.content, createdAt: msg.createdAt });
          if (messageHashes.has(msgHash)) continue; // skip duplicate

          await tx.message.create({
            data: {
              content: msg.content,
              role: msg.role,
              createdAt: new Date(msg.createdAt),
              chatId: chatUpsert.id,
              // Preserve any metadata/attachments fields if present
              metadata: msg.metadata ?? undefined,
            },
          });
          messageHashes.add(msgHash);
        }
      }
    });

    res.json({ success: true, message: 'Import completed' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

export default router;