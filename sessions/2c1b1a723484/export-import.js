<string, string>();
      for (const { entry, dest } of attachmentEntries) {
        await new Promise<void>((resolve, reject) => {
          const writeStream = fs.createWriteStream(dest);
          entry.pipe(writeStream);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
        const oldId = path.basename(dest).split('-')[0];
        const newId = uuidv4();
        attachmentIdMap.set(oldId, newId);
        // Move to final storage location (example: ./uploads/)
        const finalPath = path.join(__dirname, '../../uploads', `${newId}-${path.basename(dest).split('-')[1]}`);
        fs.renameSync(dest, finalPath);
      }

      // Import providers (dedup by provider name)
      for (const prov of importJson.providers) {
        await prisma.provider.upsert({
          where: { userId_name: { userId, name: prov.name } },
          update: prov,
          create: { ...prov, userId },
        });
      }

      // Import tags (dedup by name)
      for (const tag of importJson.tags) {
        await prisma.tag.upsert({
          where: { userId_name: { userId, name: tag.name } },
          update: tag,
          create: { ...tag, userId },
        });
      }

      // Import threads, messages, attachments, and message‑tag relations
      for (const thread of importJson.threads) {
        const createdThread = await prisma.chatThread.create({
          data: {
            id: uuidv4(),
            title: thread.title,
            userId,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
          },
        });

        // Import thread‑level tags
        if (thread.tags?.length) {
          const tagConnect = thread.tags.map((t: any) => ({
            id: t.id,
          }));
          await prisma.chatThread.update({
            where: { id: createdThread.id },
            data: {
              tags: {
                connect: tagConnect,
              },
            },
          });
        }

        for (const msg of thread.messages) {
          const createdMsg = await prisma.message.create({
            data: {
              id: uuidv4(),
              content: msg.content,
              role: msg.role,
              chatThreadId: createdThread.id,
              createdAt: msg.createdAt,
              updatedAt: msg.updatedAt,
            },
          });

          // Message‑level tags
          if (msg.tags?.length) {
            const tagConnect = msg.tags.map((t: any) => ({
              id: t.id,
            }));
            await prisma.message.update({
              where: { id: createdMsg.id },
              data: {
                tags: {
                  connect: tagConnect,
                },
              },
            });
          }

          // Attachments
          if (msg.attachments?.length) {
            for (const att of msg.attachments) {
              const newAttId = attachmentIdMap.get(att.id);
              if (!newAttId) continue; // skip missing attachment
              await prisma.attachment.create({
                data: {
                  id: newAttId,
                  fileName: att.fileName,
                  mimeType: att.mimeType,
                  filePath: path.join(__dirname, '../../uploads', `${newAttId}-${att.fileName}`),
                  messageId: createdMsg.id,
                  createdAt: att.createdAt,
                  updatedAt: att.updatedAt,
                },
              });
            }
          }
        }
      }

      // Cleanup temp folder
      fs.rmdirSync(tempDir, { recursive: true });

      res.json({ success: true, message: 'Import completed' });
    } catch (err) {
      console.error('Import error:', err);
      res.status(500).json({ error: 'Failed to import data', details: err instanceof Error ? err.message : undefined });
    }
  }
);

export default router;