<string, string>;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma where clause dynamically
    const where: Prisma.ChatWhereInput = {
      userId,
      // Provider filter
      ...(providerId && { providerId: Number(providerId) }),
      // Date range filter
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
      // Tag filter – chats must have at least one of the supplied tags
      ...(tags && {
        tags: {
          some: {
            id: {
              in: tags.split(",").map((t) => Number(t.trim())),
            },
          },
        },
      }),
      // Full‑text search – match either chat title or any message content
      ...(q && {
        OR: [
          {
            title: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            messages: {
              some: {
                content: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }),
    };

    // Count total matches for pagination metadata
    const total = await prisma.chat.count({ where });

    // Fetch chats with limited messages (only those that match the query if q is present)
    const chats = await prisma.chat.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { updatedAt: "desc" },
      include: {
        provider: true,
        tags: true,
        // Load only messages that satisfy the text query when q is provided,
        // otherwise load the most recent 20 messages for preview.
        messages: {
          where: q
            ? {
                content: {
                  contains: q,
                  mode: "insensitive",
                },
              }
            : {
                // No text filter – just give a preview slice
                orderBy: { createdAt: "desc" },
                take: 20,
              },
          orderBy: { createdAt: "asc" },
          include: {
            attachments: true,
          },
        },
      },
    });

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      data: chats,
    });
  } catch (error) {
    console.error("[searchChats] error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Helper: validate that a user owns the requested resource.
 * Can be used as middleware in routes that need extra ownership checks.
 */
export const ensureChatOwnership = async (req: Request, res: Response, next: Function) => {
  const userId = Number(req.params.userId);
  const chatId = Number(req.params.chatId);
  if (isNaN(userId) || isNaN(chatId)) {
    return res.status(400).json({ error: "Invalid IDs" });
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { userId: true },
  });

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  if (chat.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Attach chat to request for downstream handlers if needed
  (req as any).chat = chat;
  next();
};