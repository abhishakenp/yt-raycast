<string, string> = {}; // oldId -> newId
      if (Array.isArray(chatData.messages)) {
        for (const msg of chatData.messages) {
          if (msg.attachment) {
            const oldId = msg.attachment.id;
            const existing = await prisma.attachment.findFirst({
              where: {
                url: msg.attachment.url,
                userId,
              },
            });
            if (existing) {
              attachmentMap[oldId] = existing.id;
            } else {
              const newAttachment = await prisma.attachment.create({
                data: {
                  id: uuidv4(),
                  filename: msg.attachment.filename,
                  mimeType: msg.attachment.mimeType,
                  url: msg.attachment.url,
                  userId,
                },
              });
              attachmentMap[oldId] = newAttachment.id;
            }
          }
        }
      }

      // Upsert Messages (deduplicate by content hash + createdAt)
      if (Array.isArray(chatData.messages)) {
        for (const msgData of chatData.messages) {
          const contentHash = hashString(msgData.content);
          const existingMsg = await prisma.message.findFirst({
            where: {
              chatId: chat.id,
              contentHash,
            },
          });

          if (existingMsg) continue; // skip duplicate

          await prisma.message.create({
            data: {
              id: msgData.id ?? uuidv4(),
              chatId: chat.id,
              role: msgData.role,
              content: msgData.content,
              contentHash,
              createdAt: msgData.createdAt ? new Date(msgData.createdAt) : new Date(),
              attachmentId: msgData.attachment
                ? attachmentMap[msgData.attachment.id] ?? null
                : null,
            },
          });
        }
      }
    }

    res.json({ success: true, message: 'Import completed.' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import data.' });
  }
});

export default router;