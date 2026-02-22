<
      Prisma.MessageGetPayload<{
        include: { attachments: true; tags: true };
      }>[]
    >`
      SELECT m.*
      FROM "Message" m
      JOIN "ChatThread" ct ON ct.id = m."chatThreadId"
      WHERE ct."userId" = ${userId}
        AND to_tsvector('simple', m.content) @@ plainto_tsquery('simple', ${query})
      ORDER BY ts_rank(to_tsvector('simple', m.content), plainto_tsquery('simple', ${query})) DESC
      LIMIT ${limit} OFFSET ${skip};
    `;

    // ---------- 2️⃣ Search ChatThreads ----------
    const threadResults = await prisma.chatThread.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          {
            messages: {
              some: {
                content: { contains: query, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        tags: true,
        provider: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip,
    });

    // ---------- 3️⃣ Search Tags ----------
    const tagResults = await prisma.tag.findMany({
      where: {
        userId,
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      take: limit,
      skip,
    });

    // ---------- 4️⃣ Search Providers ----------
    const providerResults = await prisma.provider.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { apiKey: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: limit,
      skip,
    });

    // Combine totals for pagination metadata (simple sum, could be refined)
    const total =
      messageResults.length + threadResults.length + tagResults.length + providerResults.length;

    res.json({
      results: {
        messages: messageResults,
        threads: threadResults,
        tags: tagResults,
        providers: providerResults,
      },
      pagination: {
        page,
        limit,
        total,
      },
    });
  },
);

/**
 * Register routes – to be used in src/routes/index.ts or similar.
 */
export const registerSearchRoutes = (app: import('express').Express) => {
  app.get('/search', verifyAuth, searchHandler);
};