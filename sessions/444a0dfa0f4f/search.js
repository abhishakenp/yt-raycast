<
      Array<{
        id: string;
        chatId: string;
        content: string;
        createdAt: Date;
        relevance: number;
      }>
    >`
      SELECT
        "Message"."id",
        "Message"."chatId",
        "Message"."content",
        "Message"."createdAt",
        ts_rank(
          to_tsvector('english', "Message"."content"),
          ${tsQuery}
        ) AS relevance
      FROM "Message"
      INNER JOIN "Chat" ON "Chat"."id" = "Message"."chatId"
      ${tagList.length > 0
        ? Prisma.sql`INNER JOIN "_MessageToTag" mt ON mt."A" = "Message"."id"
                     INNER JOIN "Tag" tg ON tg."id" = mt."B" AND tg."name" = ANY(${tagList})`
        : Prisma.empty}
      ${providerId
        ? Prisma.sql`WHERE "Chat"."providerId" = ${providerId}`
        : Prisma.empty}
      ${providerId ? Prisma.sql`AND` : Prisma.sql`WHERE`}
        to_tsvector('english', "Message"."content") @@ ${tsQuery}
      ORDER BY relevance DESC, "Message"."createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset};
    `;

    // -----------------------------------------------------------------------
    // Search Chats (by title)
    // -----------------------------------------------------------------------
    const chatRows = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        createdAt: Date;
        relevance: number;
      }>
    >`
      SELECT
        "Chat"."id",
        "Chat"."title",
        "Chat"."createdAt",
        ts_rank(
          to_tsvector('english', "Chat"."title"),
          ${tsQuery}
        ) AS relevance
      FROM "Chat"
      ${tagList.length > 0
        ? Prisma.sql`INNER JOIN "_ChatToTag" ct ON ct."A" = "Chat"."id"
                     INNER JOIN "Tag" tg ON tg."id" = ct."B" AND tg."name" = ANY(${tagList})`
        : Prisma.empty}
      ${providerId
        ? Prisma.sql`WHERE "Chat"."providerId" = ${providerId}`
        : Prisma.empty}
      ${providerId ? Prisma.sql`AND` : Prisma.sql`WHERE`}
        to_tsvector('english', "Chat"."title") @@ ${tsQuery}
      ORDER BY relevance DESC, "Chat"."createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset};
    `;

    res.json({
      query: q,
      page: pageNum,
      limit: pageSize,
      tags: tagList,
      providerId: providerId ?? null,
      results: {
        messages: messageRows,
        chats: chatRows,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid query parameters', details: err.errors });
    } else {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}