<ThreadLink> {
    if (primaryChatId === secondaryChatId) {
      throw new ConflictError('Cannot link a chat to itself.');
    }

    // Fetch both chats in a single query
    const chats = await prisma.chat.findMany({
      where: {
        id: { in: [primaryChatId, secondaryChatId] },
        userId,
      },
      select: { id: true, providerId: true },
    });

    if (chats.length !== 2) {
      throw new NotFoundError('One or both chats not found or do not belong to the user.');
    }

    // Ensure no existing link (either direction)
    const existingLink = await prisma.threadLink.findFirst({
      where: {
        OR: [
          { primaryChatId, secondaryChatId },
          { primaryChatId: secondaryChatId, secondaryChatId: primaryChatId },
        ],
      },
    });

    if (existingLink) {
      throw new ConflictError('These chats are already linked.');
    }

    // Create the link
    const link = await prisma.threadLink.create({
      data: {
        primaryChatId,
        secondaryChatId,
      },
    });

    return link;
  }

  /**
   * Retrieves all chats linked to the given chat (including the chat itself).
   *
   * @param userId - ID of the user performing the query.
   * @param chatId - ID of the chat whose linked threads are requested.
   * @returns An array of Chat objects that are linked together.
   *
   * @throws NotFoundError if the chat does not exist or does not belong to the user.
   */
  static async getLinkedChats(userId: string, chatId: string): Promise<Chat[]> {
    // Verify ownership
    const baseChat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, userId: true },
    });

    if (!baseChat || baseChat.userId !== userId) {
      throw new NotFoundError('Chat not found or not owned by user.');
    }

    // Find all links where the chat appears either as primary or secondary
    const links = await prisma.threadLink.findMany({
      where: {
        OR: [
          { primaryChatId: chatId },
          { secondaryChatId: chatId },
        ],
      },
    });

    // Collect all related chat IDs
    const linkedChatIds = new Set<string>();
    linkedChatIds.add(chatId);
    for (const link of links) {
      linkedChatIds.add(link.primaryChatId);
      linkedChatIds.add(link.secondaryChatId);
    }

    // Fetch chat details
    const linkedChats = await prisma.chat.findMany({
      where: {
        id: { in: Array.from(linkedChatIds) },
        userId,
      },
    });

    return linkedChats;
  }

  /**
   * Unlinks two previously linked chats.
   *
   * @param userId - ID of the user performing the operation.
   * @param primaryChatId - ID of the primary chat.
   * @param secondaryChatId - ID of the secondary chat.
   * @returns The deleted ThreadLink record.
   *
   * @throws NotFoundError if the link does not exist.
   * @throws UnauthorizedError if the user does not own both chats.
   */
  static async unlinkChats(
    userId: string,
    primaryChatId: string,
    secondaryChatId: string,
  ): Promise<ThreadLink> {
    // Verify ownership of both chats
    const chats = await prisma.chat.findMany({
      where: {
        id: { in: [primaryChatId, secondaryChatId] },
        userId,
      },
      select: { id: true },
    });

    if (chats.length !== 2) {
      throw new UnauthorizedError('You must own both chats to unlink them.');
    }

    // Find the link (direction-agnostic)
    const link = await prisma.threadLink.findFirst({
      where: {
        OR: [
          { primaryChatId, secondaryChatId },
          { primaryChatId: secondaryChatId, secondaryChatId: primaryChatId },
        ],
      },
    });

    if (!link) {
      throw new NotFoundError('Link between the specified chats does not exist.');
    }

    // Delete the link
    const deleted = await prisma.threadLink.delete({
      where: { id: link.id },
    });

    return deleted;
  }

  /**
   * Merges messages from a secondary chat into the primary chat while preserving order.
   * This is useful when a user wants to view a unified thread across providers.
   *
   * @param userId - ID of the user performing the merge.
   * @param primaryChatId - Destination chat ID.
   * @param secondaryChatId - Source chat ID.
   * @returns The updated primary Chat with merged messages.
   *
   * @throws NotFoundError if either chat does not exist or is not owned by the user.
   */
  static async mergeChatMessages(
    userId: string,
    primaryChatId: string,
    secondaryChatId: string,
  ): Promise<Chat> {
    // Verify ownership and existence
    const [primaryChat, secondaryChat] = await Promise.all([
      prisma.chat.findUnique({
        where: { id: primaryChatId },
        select: { id: true, userId: true },
      }),
      prisma.chat.findUnique({
        where: { id: secondaryChatId },
        select: { id: true, userId: true },
      }),
    ]);

    if (!primaryChat || !secondaryChat) {
      throw new NotFoundError('One or both chats not found.');
    }
    if (primaryChat.userId !== userId || secondaryChat.userId !== userId) {
      throw new UnauthorizedError('You must own both chats to merge them.');
    }

    // Fetch messages from both chats ordered by createdAt
    const messages = await prisma.message.findMany({
      where: {
        chatId: { in: [primaryChatId, secondaryChatId] },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Reassign secondary chat messages to primary chat
    await prisma.message.updateMany({
      where: { chatId: secondaryChatId },
      data: { chatId: primaryChatId },
    });

    // Optionally, delete the now-empty secondary chat
    await prisma.chat.delete({
      where: { id: secondaryChatId },
    });

    // Remove any existing thread links involving the secondary chat
    await prisma.threadLink.deleteMany({
      where: {
        OR: [
          { primaryChatId: secondaryChatId },
          { secondaryChatId: secondaryChatId },
        ],
      },
    });

    // Return the refreshed primary chat
    const refreshedPrimary = await prisma.chat.findUnique({
      where: { id: primaryChatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        provider: true,
        tags: true,
        attachments: true,
      },
    });

    if (!refreshedPrimary) {
      throw new NotFoundError('Primary chat disappeared after merge.');
    }

    return refreshedPrimary;
  }
}