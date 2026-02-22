<void> {
  // 1️⃣ Load chat with provider reference
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      provider: true,
      messages: true,
    },
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  if (chat.userId !== userId) {
    throw new Error('Unauthorized: chat does not belong to the user');
  }

  if (!chat.isArchived) {
    throw new Error('Chat must be archived before it can be deleted from the provider');
  }

  if (!chat.providerId) {
    throw new Error('Chat has no associated provider');
  }

  // 2️⃣ Determine provider and perform deletion
  const provider = chat.provider;

  switch (provider.type) {
    case ProviderEnum.OPENAI:
      await deleteOpenAIThread(provider.externalId);
      break;

    case ProviderEnum.ANTHROPIC:
      await deleteAnthropicConversation(provider.externalId);
      break;

    case ProviderEnum.GEMINI:
      await deleteGeminiChat(provider.externalId);
      break;

    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }

  // 3️⃣ Mark the provider reference as deleted (optional clean‑up)
  await prisma.provider.update({
    where: { id: provider.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/**
 * Delete an OpenAI thread.
 *
 * @param threadId The OpenAI thread identifier.
 */
async function deleteOpenAIThread(threadId: string): Promise<void> {
  try {
    // OpenAI SDK does not expose a direct delete method yet, so we use raw fetch.
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI deletion failed: ${response.status} ${body}`);
    }
  } catch (err) {
    console.error('Failed to delete OpenAI thread', err);
    throw err;
  }
}

/**
 * Delete an Anthropic conversation.
 *
 * @param conversationId The Anthropic conversation identifier.
 */
async function deleteAnthropicConversation(conversationId: string): Promise<void> {
  // Anthropic currently does not provide a public delete endpoint.
  // Implement provider‑specific logic here when it becomes available.
  console.warn('Delete operation for Anthropic is not implemented. Skipping.');
}

/**
 * Delete a Gemini chat.
 *
 * @param chatId The Gemini chat identifier.
 */
async function deleteGeminiChat(chatId: string): Promise<void> {
  // Gemini API does not expose a delete endpoint at this time.
  // Placeholder for future implementation.
  console.warn('Delete operation for Gemini is not implemented. Skipping.');
}