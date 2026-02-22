<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * POST /chats/:chatId/link
 * Links a chat from another provider to the current chat.
 *
 * Body: { linkedChatId: string }
 *
 * Permissions:
 * - Both chats must belong to the authenticated user.
 * - The chats must be from different providers (optional, can be same).
 * - A chat cannot be linked to itself.
 * - Duplicate links are ignored (idempotent).
 */
export const linkChatHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id as string; // assume auth middleware sets req.user
    const { chatId } = req.params;
    const { linkedChatId } = linkSchema.parse(req.body);

    // Validate UUID format for primary chatId
    if (!/^[0-9a-fA-F-]{36}$/.test(chatId)) {
      return res.status(400).json({ error: 'Invalid chatId format.' });
    }

    // Fetch primary chat
    const primaryChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { provider: true },
    });
    if (!primaryChat) {
      return res.status(404).json({ error: 'Primary chat not found.' });
    }
    if (primaryChat.userId !== userId) {
      return res.status(403).json({ error: 'Access denied to primary chat.' });
    }

    // Fetch linked chat
    const linkedChat = await prisma.chat.findUnique({
      where: { id: linkedChatId },
      include: { provider: true },
    });
    if (!linkedChat) {
      return res.status(404).json({ error: 'Linked chat not found.' });
    }
    if (linkedChat.userId !== userId) {
      return res.status(403).json({ error: 'Access denied to linked chat.' });
    }

    // Prevent linking a chat to itself
    if (primaryChat.id === linkedChat.id) {
      return res
        .status(400)
        .json({ error: 'Cannot link a chat to itself.' });
    }

    // Optional: enforce different providers
    // if (primaryChat.providerId === linkedChat.providerId) {
    //   return res
    //     .status(400)
    //     .json({ error: 'Chats from the same provider cannot be linked.' });
    // }

    // Check if a link already exists (bidirectional)
    const existingLink = await prisma.chatLink.findFirst({
      where: {
        OR: [
          {
            primaryChatId: primaryChat.id,
            linkedChatId: linkedChat.id,
          },
          {
            primaryChatId: linkedChat.id,
            linkedChatId: primaryChat.id,
          },
        ],
        userId,
      },
    });

    if (existingLink) {
      // Idempotent response
      return res.status(200).json({
        message: 'Chats already linked.',
        link: existingLink,
      });
    }

    // Create the link (store both directions for easier queries)
    const link = await prisma.chatLink.create({
      data: {
        userId,
        primaryChatId: primaryChat.id,
        linkedChatId: linkedChat.id,
      },
    });

    // Also create reverse link for convenience (optional)
    await prisma.chatLink.create({
      data: {
        userId,
        primaryChatId: linkedChat.id,
        linkedChatId: primaryChat.id,
      },
    });

    return res.status(201).json({
      message: 'Chats linked successfully.',
      link,
    });
  },
);

/**
 * GET /chats/:chatId/links
 * Retrieves all chats linked to the given chat.
 */
export const getChatLinksHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id as string;
    const { chatId } = req.params;

    // Validate chatId format
    if (!/^[0-9a-fA-F-]{36}$/.test(chatId)) {
      return res.status(400).json({ error: 'Invalid chatId format.' });
    }

    // Verify ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' });
    }
    if (chat.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch linked chats
    const links = await prisma.chatLink.findMany({
      where: {
        primaryChatId: chatId,
        userId,
      },
      include: {
        linkedChat: {
          include: {
            provider: true,
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    const linkedChats = links.map((link) => ({
      linkId: link.id,
      chat: {
        id: link.linkedChat.id,
        title: link.linkedChat.title,
        provider: link.linkedChat.provider?.name,
        lastMessageSnippet:
          link.linkedChat.messages[0]?.content?.slice(0, 100) ?? '',
        createdAt: link.linkedChat.createdAt,
      },
    }));

    return res.status(200).json({ linkedChats });
  },
);

/**
 * DELETE /chats/:chatId/link/:linkId
 * Removes a link between two chats.
 */
export const unlinkChatHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id as string;
    const { chatId, linkId } = req.params;

    // Verify the link belongs to the user and primary chat
    const link = await prisma.chatLink.findUnique({
      where: { id: linkId },
    });
    if (!link) {
      return res.status(404).json({ error: 'Link not found.' });
    }
    if (link.userId !== userId || link.primaryChatId !== chatId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Delete both directions (if reverse exists)
    await prisma.chatLink.deleteMany({
      where: {
        OR: [
          { id: link.id },
          {
            primaryChatId: link.linkedChatId,
            linkedChatId: link.primaryChatId,
            userId,
          },
        ],
      },
    });

    return res.status(200).json({ message: 'Link removed successfully.' });
  },
);

/**
 * Register routes (to be used in your Express app)
 *
 * Example:
 *   import { Router } from 'express';
 *   import {
 *     linkChatHandler,
 *     getChatLinksHandler,
 *     unlinkChatHandler,
 *   } from './chatLinkController';
 *
 *   const router = Router();
 *   router.post('/chats/:chatId/link', linkChatHandler);
 *   router.get('/chats/:chatId/links', getChatLinksHandler);
 *   router.delete('/chats/:chatId/link/:linkId', unlinkChatHandler);
 *
 *   export default router;
 */
export default {
  linkChatHandler,
  getChatLinksHandler,
  unlinkChatHandler,
};