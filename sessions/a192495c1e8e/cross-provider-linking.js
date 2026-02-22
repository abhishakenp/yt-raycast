<string> {
    if (!chatIds || chatIds.length < 2) {
      throw new BadRequestError('At least two chat IDs are required to create a link group.');
    }

    // Verify ownership and existence of each chat
    const chats = await prisma.chat.findMany({
      where: {
        id: { in: chatIds },
        userId,
      },
      select: { id: true, provider: true },
    });

    if (chats.length !== chatIds.length) {
      throw new NotFoundError('One or more chats not found or do not belong to the user.');
    }

    // Ensure chats come from different providers (optional but typical for cross‑provider linking)
    const providerSet = new Set(chats.map(c => c.provider));
    if (providerSet.size < 2) {
      throw new BadRequestError('Cross‑provider linking requires chats from at least two distinct providers.');
    }

    // Generate a UUID for the group
    const linkGroupId = crypto.randomUUID();

    // Assign the linkGroupId to all chats
    await prisma.chat.updateMany({
      where: { id: { in: chatIds } },
      data: { linkGroupId },
    });

    return linkGroupId;
  }

  /**
   * Adds additional chats to an existing link group.
   *
   * @param userId       ID of the user.
   * @param linkGroupId  Existing link group identifier.
   * @param chatIds      Chats to add.
   */
  static async addChatsToGroup(userId: string, linkGroupId: string, chatIds: string[]): Promise<void> {
    if (!chatIds?.length) {
      throw new BadRequestError('No chat IDs provided.');
    }

    // Verify the group exists
    const existingGroup = await prisma.chat.findFirst({
      where: { linkGroupId, userId },
    });
    if (!existingGroup) {
      throw new NotFoundError('Link group not found for this user.');
    }

    // Verify each chat belongs to the user and is not already linked elsewhere
    const chats = await prisma.chat.findMany({
      where: {
        id: { in: chatIds },
        userId,
      },
      select: { id: true, linkGroupId: true },
    });

    if (chats.length !== chatIds.length) {
      throw new NotFoundError('One or more chats not found or do not belong to the user.');
    }

    const alreadyLinked = chats.filter(c => c.linkGroupId && c.linkGroupId !== linkGroupId);
    if (alreadyLinked.length) {
      throw new BadRequestError('Some chats are already linked to a different group.');
    }

    // Update the chats
    await prisma.chat.updateMany({
      where: { id: { in: chatIds } },
      data: { linkGroupId },
    });
  }

  /**
   * Retrieves all chats that belong to the same link group as the given chat.
   *
   * @param userId  ID of the user.
   * @param chatId  Chat whose group we want to resolve.
   * @returns       Array of Chat objects (including provider info).
   */
  static async getLinkedChats(userId: string, chatId: string): Promise<Chat[]> {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { linkGroupId: true, userId: true },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found.');
    }
    if (chat.userId !== userId) {
      throw new UnauthorizedError('You do not have access to this chat.');
    }
    if (!chat.linkGroupId) {
      // No group – return only the requested chat
      return [await prisma.chat.findUnique({ where: { id: chatId } }) as Chat];
    }

    const linkedChats = await prisma.chat.findMany({
      where: {
        linkGroupId: chat.linkGroupId,
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return linkedChats;
  }

  /**
   * Removes a single chat from its link group.
   *
   * @param userId  ID of the user.
   * @param chatId  Chat to detach.
   */
  static async removeChatFromGroup(userId: string, chatId: string): Promise<void> {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { linkGroupId: true, userId: true },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found.');
    }
    if (chat.userId !== userId) {
      throw new UnauthorizedError('You do not have permission to modify this chat.');
    }
    if (!chat.linkGroupId) {
      // Already unlinked – nothing to do
      return;
    }

    await prisma.chat.update({
      where: { id: chatId },
      data: { linkGroupId: null },
    });

    // If the group now contains only one chat, clean up the group identifier
    const remaining = await prisma.chat.count({
      where: { linkGroupId: chat.linkGroupId, userId },
    });

    if (remaining <= 1) {
      // Clear the linkGroupId from the last remaining chat(s)
      await prisma.chat.updateMany({
        where: { linkGroupId: chat.linkGroupId, userId },
        data: { linkGroupId: null },
      });
    }
  }

  /**
   * Deletes an entire link group, unlinking all member chats.
   *
   * @param userId       ID of the user.
   * @param linkGroupId  Identifier of the group to delete.
   */
  static async deleteLinkGroup(userId: string, linkGroupId: string): Promise<void> {
    const groupExists = await prisma.chat.findFirst({
      where: { linkGroupId, userId },
    });

    if (!groupExists) {
      throw new NotFoundError('Link group not found.');
    }

    await prisma.chat.updateMany({
      where: { linkGroupId, userId },
      data: { linkGroupId: null },
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Helper: crypto.randomUUID polyfill for Node < 14.17 (if needed)            */
/* -------------------------------------------------------------------------- */
declare const crypto: {
  randomUUID(): string;
};
if (typeof crypto?.randomUUID !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomBytes } = require('crypto');
  (global as any).crypto = {
    randomUUID: () => {
      const bytes = randomBytes(16);
      // Set version to 4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      // Set variant to RFC 4122
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = bytes.toString('hex');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    },
  };
}