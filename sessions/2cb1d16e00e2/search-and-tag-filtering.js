<
          Prisma.MessageGetPayload<{ include: { tags: true; attachments: true } }>[]
        >`
          SELECT m.*
          FROM "Message" m
          LEFT JOIN "_MessageToTag" mt ON m.id = mt."A"
          LEFT JOIN "Tag" t ON mt."B" = t.id
          WHERE m."chatId" IN (
            SELECT c.id FROM "Chat" c WHERE c."userId" = ${userId}
          )
          ${tagList?.length ? Prisma.sql`AND t.name IN (${Prisma.join(tagList)})` : Prisma.sql``}
          AND to_tsvector('simple', m."content") @@ to_tsquery('simple', ${tsQuery})
          ORDER BY m."createdAt" DESC
          LIMIT ${limit + 1}
          ${cursor ? Prisma.sql`OFFSET (SELECT COUNT(*) FROM "Message" WHERE id > ${cursor})` : Prisma.sql``}
        `;

        const hasNextPage = raw.length > limit;
        const data = hasNextPage ? raw.slice(0, -1) : raw;

        return res.json({
          data,
          pagination: {
            nextCursor: hasNextPage ? data[data.length - 1].id : null,
            hasNextPage
          }
        });
      }

      // No full‑text search: use Prisma query builder.
      const messages = await prisma.message.findMany({
        where: baseWhere,
        include: {
          tags: true,
          attachments: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0
      });

      const hasNextPage = messages.length > limit;
      const data = hasNextPage ? messages.slice(0, -1) : messages;

      res.json({
        data,
        pagination: {
          nextCursor: hasNextPage ? data[data.length - 1].id : null,
          hasNextPage
        }
      });
    } else {
      // type === 'chat'
      const baseWhere: Prisma.ChatWhereInput = {
        userId,
        ...buildTagFilter(tagList, 'Chat')
      };

      if (q) {
        const { tsQuery, fields } = buildFullTextFilter(q, ['title', 'description']);
        const raw = await prisma.$queryRaw<
          Prisma.ChatGetPayload<{ include: { tags: true } }>[]
        >`
          SELECT c.*
          FROM "Chat" c
          LEFT JOIN "_ChatToTag" ct ON c.id = ct."A"
          LEFT JOIN "Tag" t ON ct."B" = t.id
          WHERE c."userId" = ${userId}
          ${tagList?.length ? Prisma.sql`AND t.name IN (${Prisma.join(tagList)})` : Prisma.sql``}
          AND (
            to_tsvector('simple', c."title") ||
            to_tsvector('simple', c."description")
          ) @@ to_tsquery('simple', ${tsQuery})
          ORDER BY c."updatedAt" DESC
          LIMIT ${limit + 1}
          ${cursor ? Prisma.sql`OFFSET (SELECT COUNT(*) FROM "Chat" WHERE id > ${cursor})` : Prisma.sql``}
        `;

        const hasNextPage = raw.length > limit;
        const data = hasNextPage ? raw.slice(0, -1) : raw;

        return res.json({
          data,
          pagination: {
            nextCursor: hasNextPage ? data[data.length - 1].id : null,
            hasNextPage
          }
        });
      }

      const chats = await prisma.chat.findMany({
        where: baseWhere,
        include: { tags: true },
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0
      });

      const hasNextPage = chats.length > limit;
      const data = hasNextPage ? chats.slice(0, -1) : chats;

      res.json({
        data,
        pagination: {
          nextCursor: hasNextPage ? data[data.length - 1].id : null,
          hasNextPage
        }
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: err.errors });
    }
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;