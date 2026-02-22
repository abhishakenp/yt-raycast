import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Chat, User } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';

const prisma = new PrismaClient();
const router = Router();

/**
 * Checkout a chat for editing.
 * - Marks the chat as checked out by the current user.
 * - Prevents other users from checking out the same chat simultaneously.
 * - Returns the latest chat state.
 */
router.post(
  '/chats/:chatId/checkout',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as User).id;
    const chatId = Number(req.params.chatId);

    try {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { id: true, checkedOutById: true, checkedOutAt: true },
      });

      if (!chat) {
        throw new NotFoundError('Chat not found');
      }

      if (chat.checkedOutById && chat.checkedOutById !== userId) {
        throw new ConflictError('Chat is already checked out by another user');
      }

      const now = new Date();

      const updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: {
          checkedOutById: userId,
          checkedOutAt: now,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { attachments: true, tags: true },
          },
          tags: true,
          provider: true,
        },
      });

      res.json({ chat: updatedChat });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * Checkin a chat after editing.
 * - Clears the checkout lock.
 * - Optionally merges any client‑side changes (e.g., new messages, tags).
 * - Updates `updatedAt` to reflect the latest modification.
 */
router.post(
  '/chats/:chatId/checkin',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as User).id;
    const chatId = Number(req.params.chatId);
    const { messages, tags } = req.body; // optional incremental updates

    try {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { id: true, checkedOutById: true },
      });

      if (!chat) {
        throw new NotFoundError('Chat not found');
      }

      if (chat.checkedOutById !== userId) {
        throw new ConflictError('You do not hold the checkout lock for this chat');
      }

      // Begin transaction to apply incremental updates atomically
      await prisma.$transaction(async (tx) => {
        // 1. Append new messages if provided
        if (Array.isArray(messages) && messages.length > 0) {
          const createMsgs = messages.map((msg: any) => ({
            chatId,
            role: msg.role,
            content: msg.content,
            providerMessageId: msg.providerMessageId ?? null,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          }));
          await tx.message.createMany({ data: createMsgs });
        }

        // 2. Upsert tags (add new, keep existing)
        if (Array.isArray(tags) && tags.length > 0) {
          for (const tagName of tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
            await tx.chatTag.create({
              data: { chatId, tagId: tag.id },
            });
          }
        }

        // 3. Release the checkout lock
        await tx.chat.update({
          where: { id: chatId },
          data: {
            checkedOutById: null,
            checkedOutAt: null,
            updatedAt: new Date(),
          },
        });
      });

      const refreshedChat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { attachments: true, tags: true },
          },
          tags: true,
          provider: true,
        },
      });

      res.json({ chat: refreshedChat });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * Force release a checkout (admin only).
 * Useful for stale locks.
 */
router.post(
  '/chats/:chatId/checkout/release',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const chatId = Number(req.params.chatId);

    try {
      if (!user.isAdmin) {
        throw new BadRequestError('Only admins can force release checkouts');
      }

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { checkedOutById: true },
      });

      if (!chat) {
        throw new NotFoundError('Chat not found');
      }

      if (!chat.checkedOutById) {
        return res.json({ message: 'Chat is not checked out' });
      }

      await prisma.chat.update({
        where: { id: chatId },
        data: {
          checkedOutById: null,
          checkedOutAt: null,
          updatedAt: new Date(),
        },
      });

      res.json({ message: 'Checkout lock released' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;