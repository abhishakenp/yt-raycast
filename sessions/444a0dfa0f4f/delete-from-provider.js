<
  Provider['type'],
  (chat: Chat, provider: Provider) => { url: string; method: 'delete' | 'post' | 'put' }
> = {
  openai: (chat, provider) => ({
    url: `https://api.openai.com/v1/threads/${chat.externalId}`,
    method: 'delete',
  }),
  anthropic: (chat, provider) => ({
    url: `https://api.anthropic.com/v1/threads/${chat.externalId}`,
    method: 'delete',
  }),
  // Add other providers here
};

/**
 * Delete a chat from its originating provider.
 *
 * @param userId - ID of the user performing the operation.
 * @param chatId - ID of the chat to delete from the provider.
 * @throws Will throw an error if the chat does not belong to the user,
 *         if the provider is unsupported, or if the provider API call fails.
 */
export async function deleteChatFromProvider(userId: string, chatId: string): Promise<void> {
  // 1️⃣ Fetch chat with provider details
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { provider: true, user: true },
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  // 2️⃣ Authorization check
  if (chat.userId !== userId) {
    throw new Error('Unauthorized: chat does not belong to the user');
  }

  const provider = chat.provider as Provider | null;
  if (!provider) {
    throw new Error('Chat has no associated provider');
  }

  // 3️⃣ Resolve delete endpoint for the provider
  const endpointBuilder = providerDeleteEndpoint[provider.type as Provider['type']];
  if (!endpointBuilder) {
    throw new Error(`Delete operation not supported for provider type: ${provider.type}`);
  }

  const { url, method } = endpointBuilder(chat, provider);

  // 4️⃣ Prepare request headers (e.g., Authorization)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Assume the provider stores an API key in the Provider model
  if (provider.apiKey) {
    if (provider.type === 'openai') {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    } else if (provider.type === 'anthropic') {
      headers['x-api-key'] = provider.apiKey;
    }
    // Add other provider‑specific header logic here
  }

  // 5️⃣ Call provider API
  try {
    await axios.request({
      url,
      method,
      headers,
    });
  } catch (err: any) {
    // Propagate a meaningful error
    const msg = err.response?.data?.error?.message ?? err.message;
    throw new Error(`Provider deletion failed: ${msg}`);
  }

  // 6️⃣ Update local DB to reflect external deletion
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      externalDeletedAt: new Date(),
    },
  });
}

/**
 * Express route handler for DELETE /chats/:chatId/provider
 */
export async function deleteChatFromProviderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = (req as any).user?.id; // Assuming authentication middleware populates req.user
  const { chatId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    await deleteChatFromProvider(userId, chatId);
    return res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Provider deletion failed')) {
      return res.status(502).json({ error: error.message });
    }
    return next(error);
  }
}