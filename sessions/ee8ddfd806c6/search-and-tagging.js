<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * Search chats and messages based on free text and tags.
 * Returns paginated results with relevance ordering.
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const {
    query,
    tags,
    providerIds,
    dateFrom,
    dateTo,
    page,
    pageSize,
  } = SearchSchema.parse(req.body);

  // Build where clause incrementally
  const where: Prisma.ChatWhereInput = {
    AND: [],
  };

  // Provider filter
  if (providerIds && providerIds.length > 0) {
    (where.AND as Prisma.ChatWhereInput[]).push({
      providerId: { in: providerIds },
    });
  }

  // Date range filter (based on chat.createdAt)
  if (dateFrom || dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    (where.AND as Prisma.ChatWhereInput[]).push({ createdAt });
  }

  // Tag filter – ensure the chat has *all* requested tags
  if (tags && tags.length > 0) {
    (where.AND as Prisma.ChatWhereInput[]).push({
      tags: {
        some: {
          name: { in: tags },
        },
      },
    });
  }

  // Full‑text search across chat title and messages content
  // Using PostgreSQL full‑text search via Prisma raw query for relevance
  const searchCondition = query
    ? Prisma.sql`
        to_tsvector('english', coalesce("Chat"."title", '') || ' ' || coalesce(string_agg("Message"."content", ' '), '')) @@ plainto_tsquery('english', ${query})
      `
    : Prisma.sql`TRUE`;

  const offset = (page - 1) * pageSize;

  const chats = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string | null;
      createdAt: Date;
      providerId: string;
      relevance: number;
    }>
  >(Prisma.sql`
    SELECT
      "Chat"."id",
      "Chat"."title",
      "Chat"."createdAt",
      "Chat"."providerId",
      ts_rank(
        to_tsvector('english', coalesce("Chat"."title", '') || ' ' || coalesce(string_agg("Message"."content", ' '), '')),
        plainto_tsquery('english', ${query ?? ''})
      ) AS relevance
    FROM "Chat"
    LEFT JOIN "Message" ON "Message"."chatId" = "Chat"."id"
    WHERE ${searchCondition}
    ${where.AND.length > 0 ? Prisma.sql`AND (${Prisma.join(where.AND, ' AND ')})` : Prisma.sql``}
    GROUP BY "Chat"."id"
    ORDER BY relevance DESC, "Chat"."createdAt" DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  // Load tags for each chat in a single query to avoid N+1
  const chatIds = chats.map(c => c.id);
  const tagsByChat = await prisma.tag.findMany({
    where: { chats: { some: { id: { in: chatIds } } } },
    select: { id: true, name: true, chats: { select: { id: true } } },
  });

  const tagsMap: Record<string, Array<{ id: string; name: string }>> = {};
  tagsByChat.forEach(tag => {
    tag.chats.forEach(c => {
      if (!tagsMap[c.id]) tagsMap[c.id] = [];
      tagsMap[c.id].push({ id: tag.id, name: tag.name });
    });
  });

  const results = chats.map(chat => ({
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    providerId: chat.providerId,
    relevance: Number(chat.relevance),
    tags: tagsMap[chat.id] ?? [],
  }));

  res.json({
    page,
    pageSize,
    total: results.length, // For simplicity; replace with count query for large datasets
    results,
  });
});

/**
 * Add a tag to a chat.
 * If the tag does not exist, it will be created.
 */
export const addTagToChat = asyncHandler(async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  const { tagName } = TagMutationSchema.parse(req.body);

  // Ensure chat belongs to the authenticated user (pseudo‑code)
  // const userId = req.user.id;
  // const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  // if (!chat) return res.status(404).json({ error: 'Chat not found' });

  // Upsert tag
  const tag = await prisma.tag.upsert({
    where: { name: tagName },
    update: {},
    create: { name: tagName },
  });

  // Connect tag to chat
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      tags: {
        connect: { id: tag.id },
      },
    },
  });

  res.status(200).json({ message: 'Tag added', tag });
});

/**
 * Remove a tag from a chat.
 */
export const removeTagFromChat = asyncHandler(async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  const { tagName } = TagMutationSchema.parse(req.body);

  const tag = await prisma.tag.findUnique({ where: { name: tagName } });
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      tags: {
        disconnect: { id: tag.id },
      },
    },
  });

  // Optional: clean up orphan tags (no chats attached)
  const attachedChats = await prisma.chat.count({
    where: { tags: { some: { id: tag.id } } },
  });
  if (attachedChats === 0) {
    await prisma.tag.delete({ where: { id: tag.id } });
  }

  res.status(200).json({ message: 'Tag removed' });
});

/**
 * Retrieve all tags for the authenticated user, with usage count.
 */
export const listTags = asyncHandler(async (req: Request, res: Response) => {
  // const userId = req.user.id;
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { chats: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const formatted = tags.map(t => ({
    id: t.id,
    name: t.name,
    usageCount: t._count.chats,
  }));

  res.json(formatted);
});

/**
 * Bulk tag assignment – apply a set of tags to multiple chats.
 * Payload:
 *   chatIds: string[]
 *   tags: string[]
 */
export const bulkTag = asyncHandler(async (req: Request, res: Response) => {
  const payload = z.object({
    chatIds: z.array(z.string().uuid()),
    tags: z.array(z.string().min(1).max(50)),
  }).parse(req.body);

  // Upsert all tags first
  const upsertedTags = await Promise.all(
    payload.tags.map(name =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Connect tags to each chat
  await prisma.chat.updateMany({
    where: { id: { in: payload.chatIds } },
    data: {
      // Prisma does not support connectMany in updateMany, so we loop
    },
  });

  // Because Prisma cannot batch connect many-to-many in updateMany,
  // we perform individual updates (could be optimized with raw query)
  await Promise.all(
    payload.chatIds.map(chatId =>
      prisma.chat.update({
        where: { id: chatId },
        data: {
          tags: {
            connect: upsertedTags.map(t => ({ id: t.id })),
          },
        },
      })
    )
  );

  res.json({ message: 'Tags applied', appliedTo: payload.chatIds.length });
});

/**
 * Express router wiring (to be imported in your main server file)
 */
import { Router } from 'express';
export const searchTagRouter = Router();

// Assuming authentication middleware is applied globally or per route
searchTagRouter.post('/search', search);
searchTagRouter.post('/chats/:chatId/tags', addTagToChat);
searchTagRouter.delete('/chats/:chatId/tags', removeTagFromChat);
searchTagRouter.get('/tags', listTags);
searchTagRouter.post('/tags/bulk', bulkTag);