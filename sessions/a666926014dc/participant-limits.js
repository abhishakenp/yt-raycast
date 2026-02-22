< limit,
      currentParticipants: current,
      participantLimit: limit,
      spotsRemaining: limit === 0 ? null : Math.max(limit - current, 0),
    };
  }

  /**
   * Retrieves a paginated list of participants for an event.
   *
   * @param eventId   ID of the event.
   * @param page      Page number (1‑based).
   * @param pageSize  Number of records per page.
   * @returns An object containing participants and pagination metadata.
   */
  static async listParticipants(eventId: number, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [total, participants] = await prisma.$transaction([
      prisma.eventParticipant.count({ where: { eventId } }),
      prisma.eventParticipant.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      participants,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Helper Types (if needed)                                                  */
/* -------------------------------------------------------------------------- */

export type CapacityStatus = {
  canJoin: boolean;
  currentParticipants: number;
  participantLimit: number; // 0 means unlimited
  spotsRemaining: number | null; // null when unlimited
};

export type PaginatedParticipants = {
  participants: Array<{
    user: {
      id: number;
      username: string;
      avatarUrl?: string | null;
    };
    joinedAt: Date;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};