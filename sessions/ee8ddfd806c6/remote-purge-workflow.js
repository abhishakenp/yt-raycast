import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { Queue, Worker, Job } from 'bullmq';
import { getProviderClient } from '../providers';
import { logger } from '../lib/logger';

// -----------------------------------------------------------------------------
// Queue setup
// -----------------------------------------------------------------------------
const purgeQueue = new Queue('remote-purge', {
  connection: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
});

export const enqueueRemotePurge = async (chatId: string, userId: string) => {
  await purgeQueue.add('purge', { chatId, userId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
};

// -----------------------------------------------------------------------------
// Worker – performs the actual remote purge
// -----------------------------------------------------------------------------
const purgeWorker = new Worker(
  'remote-purge',
  async (job: Job) => {
    const { chatId, userId } = job.data as { chatId: string; userId: string };
    logger.info(`Starting remote purge for chat ${chatId} (requested by user ${userId})`);

    // 1️⃣ Load chat + provider info
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { provider: true, messages: true },
    });

    if (!chat) {
      throw new Error(`Chat ${chatId} not found`);
    }

    // 2️⃣ Verify ownership
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    if (chat.userId !== user.id) {
      throw new Error(`User ${userId} does not own chat ${chatId}`);
    }

    // 3️⃣ Get provider client (e.g. OpenAI, Anthropic)
    const providerClient = getProviderClient(chat.provider);
    if (!providerClient) {
      throw new Error(`No client implementation for provider ${chat.provider.name}`);
    }

    // 4️⃣ Call remote delete API
    try {
      await providerClient.deleteConversation(chat.remoteConversationId);
      logger.info(`Remote conversation ${chat.remoteConversationId} deleted from ${chat.provider.name}`);
    } catch (err) {
      logger.error(`Failed to delete remote conversation ${chat.remoteConversationId}: ${(err as Error).message}`);
      // Re‑throw to let BullMQ retry according to attempts/backoff
      throw err;
    }

    // 5️⃣ Update local DB – mark as purged, keep metadata for audit
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        remotePurgedAt: new Date(),
        status: 'PURGED',
      },
    });

    // 6️⃣ Optionally delete messages locally (or keep for archival)
    // Here we keep messages but flag them as remote‑only‑deleted
    await prisma.message.updateMany({
      where: { chatId },
      data: { remoteDeleted: true },
    });

    logger.info(`Remote purge workflow completed for chat ${chatId}`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
    concurrency: 5,
  },
);

purgeWorker.on('failed', (job, err) => {
  logger.error(`Remote purge job ${job.id} failed: ${err.message}`);
});

purgeWorker.on('completed', (job) => {
  logger.info(`Remote purge job ${job.id} completed`);
});

// -----------------------------------------------------------------------------
// Express controller – enqueue purge request
// -----------------------------------------------------------------------------
export const remotePurgeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id; // assuming authentication middleware populates req.user

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Basic validation – ensure chat belongs to user
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    if (chat.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Enqueue the purge job
    await enqueueRemotePurge(chatId, userId);

    return res.status(202).json({ message: 'Remote purge scheduled' });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------------------
// Export for server setup
// -----------------------------------------------------------------------------
export default {
  router: (app) => {
    app.post('/api/purge/:chatId', remotePurgeController);
  },
  purgeQueue,
  purgeWorker,
};