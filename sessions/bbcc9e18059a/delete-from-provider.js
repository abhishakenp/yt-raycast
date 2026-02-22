<void> {
  // 1️⃣ Load thread + provider info
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { provider: true, user: true },
  });

  if (!thread) {
    throw new Error('Chat thread not found');
  }

  if (thread.userId !== userId) {
    throw new Error('Unauthorized: thread does not belong to user');
  }

  const provider = thread.provider;
  if (!provider) {
    throw new Error('No provider linked to this thread');
  }

  // 2️⃣ Build request based on provider type
  let deleteUrl: string;
  let method = 'DELETE';
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${provider.apiKey}`,
  };
  let body: any = null;

  switch (provider.name as ProviderEnum) {
    case ProviderEnum.OPENAI:
      // OpenAI does not expose a direct thread delete endpoint; we simulate by
      // deleting the associated fine‑tuned file or using the "delete thread" beta.
      // For illustration, assume a hypothetical endpoint:
      deleteUrl = `https://api.openai.com/v1/threads/${thread.providerThreadId}`;
      break;

    case ProviderEnum.ANTHROPIC:
      // Anthropic currently lacks a delete endpoint; we use a placeholder.
      deleteUrl = `https://api.anthropic.com/v1/threads/${thread.providerThreadId}`;
      break;

    case ProviderEnum.GEMINI:
      // Gemini (Google AI) hypothetical delete endpoint.
      deleteUrl = `https://generativelanguage.googleapis.com/v1beta2/threads/${thread.providerThreadId}`;
      break;

    default:
      throw new Error(`Unsupported provider: ${provider.name}`);
  }

  // 3️⃣ Perform the HTTP request
  const response = await fetch(deleteUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Failed to delete thread from ${provider.name}: ${response.status} ${response.statusText} – ${errText}`
    );
  }

  // 4️⃣ Update local DB – either mark as deleted or remove completely
  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      deletedFromProvider: true,
      // optional: keep a deletion timestamp
      deletedAt: new Date(),
    },
  });

  // 5️⃣ Optionally cascade delete messages locally (soft‑delete)
  await prisma.message.updateMany({
    where: { threadId },
    data: { deleted: true },
  });
}

/**
 * Express route handler for DELETE /api/threads/:threadId/provider
 */
export async function deleteThreadFromProviderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id; // assuming auth middleware populates req.user
  const { threadId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    await deleteThreadFromProvider(userId, threadId);
    return res.status(200).json({ success: true, message: 'Thread deleted from provider' });
  } catch (err: any) {
    console.error('Provider deletion error:', err);
    return res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
}

/**
 * Register the route – to be used in your main router file.
 *
 * Example:
 *   import { Router } from 'express';
 *   import { deleteThreadFromProviderHandler } from './services/providerDeletionService';
 *
 *   const router = Router();
 *   router.delete('/threads/:threadId/provider', deleteThreadFromProviderHandler);
 *
 *   export default router;
 */
export const providerDeletionRouter = (router: import('express').Router) => {
  router.delete('/threads/:threadId/provider', deleteThreadFromProviderHandler);
};