<string, string>;

      const pageNum = Math.max(parseInt(page, 10), 1);
      const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);
      const skip = (pageNum - 1) * limitNum;

      // ----------------------------------------------------------------------
      // 2️⃣ Build Prisma `where` clause
      // ----------------------------------------------------------------------
      const where: Prisma.MessageWhereInput = {
        // Only messages belonging to the requesting user
        chatThread: {
          userId,
        },
      };

      // Full‑text search (simple LIKE for demo; replace with Postgres full‑text or Elastic later)
      if (q) {
        const like = `%${q.toLowerCase()}%`;
        where.OR = [
          { content: { contains: q, mode: "insensitive" } },
          {
            chatThread: {
              title: { contains: q, mode: "insensitive" },
            },
          },
          {
            tags: {
              some: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        ];
      }

      // Provider filter
      if (providerId) {
        where.chatThread = {
          ...where.chatThread,
          providerId,
        };
      }

      // Thread filter
      if (threadId) {
        where.chatThreadId = threadId;
      }

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Tag filter (messages must contain *all* supplied tags)
      if (tagIds) {
        const ids = tagIds.split(",").map((id) => id.trim()).filter(Boolean);
        if (ids.length > 0) {
          // Prisma cannot express “contains all” directly, so we use a HAVING‑style approach:
          // 1. Filter messages that have at least one of the tags.
          // 2. Group by message.id and ensure count of distinct matching tags equals ids.length.
          // This is implemented via a raw query for performance.
          const rawResult = await prisma.$queryRaw<
            {
              id: string;
              content: string;
              createdAt: Date;
              chatThreadId: string;
            }[]
          >`
            SELECT m.id, m.content, m."createdAt", m."chatThreadId"
            FROM "Message" m
            JOIN "_MessageToTag" mt ON mt."A" = m.id
            WHERE mt."B" = ANY(ARRAY[${Prisma.join(ids)}]::uuid[])
            ${startDate ? Prisma.sql`AND m."createdAt" >= ${new Date(startDate)}` : Prisma.empty}
            ${endDate ? Prisma.sql`AND m."createdAt" <= ${new Date(endDate)}` : Prisma.empty}
            GROUP BY m.id
            HAVING COUNT(DISTINCT mt."B") = ${ids.length}
            ORDER BY ${
              sort === "oldest"
                ? Prisma.sql`m."createdAt" ASC`
                : Prisma.sql`m."createdAt" DESC`
            }
            LIMIT ${limitNum} OFFSET ${skip};
          `;

          return res.json({
            page: pageNum,
            limit: limitNum,
            total: rawResult.length,
            results: rawResult,
          });
        }
      }

      // ----------------------------------------------------------------------
      // 3️⃣ Determine ordering
      // ----------------------------------------------------------------------
      const orderBy: Prisma.MessageOrderByWithRelationInput = {};
      if (sort === "oldest") {
        orderBy.createdAt = "asc";
      } else if (sort === "relevance" && q) {
        // Simple relevance: prioritize messages where content starts with query
        orderBy.content = "desc";
      } else {
        // Default newest first
        orderBy.createdAt = "desc";
      }

      // ----------------------------------------------------------------------
      // 4️⃣ Execute query (standard path when no tag‑all filter)
      // ----------------------------------------------------------------------
      const [total, messages] = await Promise.all([
        prisma.message.count({ where }),
        prisma.message.findMany({
          where,
          include: {
            chatThread: {
              select: { id: true, title: true, providerId: true },
            },
            tags: {
              select: { id: true, name: true },
            },
            attachments: {
              select: { id: true, filename: true, url: true },
            },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
      ]);

      res.json({
        page: pageNum,
        limit: limitNum,
        total,
        results: messages,
      });
    } catch (error) {
      console.error("[/search] error:", error);
      next(error);
    }
  }
);

export default router;