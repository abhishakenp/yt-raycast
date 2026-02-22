<void> {
  // 1️⃣ Fetch the chat together with its provider information
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { provider: true },
  });

  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found`);
  }

  if (chat.userId !== userId) {
    throw new Error('Unauthorized: you do not own this chat');
  }

  // 2️⃣ Ensure the chat has been archived locally before we attempt remote deletion
  if (!chat.archivedAt) {
    throw new Error('Chat must be archived locally before it can be deleted from the provider');
  }

  // 3️⃣ Resolve the correct provider client
  const provider = chat.provider as Provider;
  let deletionResult: boolean = false;

  switch (provider.type) {
    case 'OPENAI':
      deletionResult = await deleteFromOpenAI(provider, chat);
      break;

    case 'ANTHROPIC':
      deletionResult = await deleteFromAnthropic(provider, chat);
      break;

    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }

  // 4️⃣ Update DB state based on remote deletion outcome
  if (deletionResult) {
    await prisma.chat.update({
      where: { id: chatId },
      data: { deletedFromProviderAt: new Date() },
    });
    logger.info(`Chat ${chatId} successfully deleted from ${provider.type}`);
  } else {
    // We keep the local archive but surface the failure for later retry
    logger.warn(`Failed to delete chat ${chatId} from ${provider.type}. Will retry later.`);
    throw new Error(`Remote deletion failed for chat ${chatId}`);
  }
}

/**
 * Deletes a chat from OpenAI using the stored provider credentials.
 */
async function deleteFromOpenAI(provider: Provider, chat: { externalId: string }): Promise<boolean> {
  try {
    const client = new OpenAIClient({
      apiKey: provider.apiKey,
      organization: provider.organizationId,
    });

    // OpenAI does not expose a direct "delete conversation" endpoint.
    // Instead we use the "Delete thread" endpoint for the Assistants API
    // (or a custom endpoint if you store the conversation elsewhere).
    // Adjust this stub to match the actual OpenAI API you rely on.

    await client.deleteThread(chat.externalId);
    return true;
  } catch (err) {
    logger.error(`OpenAI deletion error for thread ${chat.externalId}:`, err);
    return false;
  }
}

/**
 * Deletes a chat from Anthropic using the stored provider credentials.
 */
async function deleteFromAnthropic(provider: Provider, chat: { externalId: string }): Promise<boolean> {
  try {
    const client = new AnthropicClient({
      apiKey: provider.apiKey,
    });

    // Anthropic currently does not provide a public delete endpoint.
    // If you store the conversation ID elsewhere (e.g., in a DB), you can
    // issue a custom request to your own cleanup service.
    // This placeholder demonstrates where that logic would live.

    await client.deleteConversation(chat.externalId);
    return true;
  } catch (err) {
    logger.error(`Anthropic deletion error for conversation ${chat.externalId}:`, err);
    return false;
  }
}

/**
 * Optional helper to schedule a retry for failed deletions.
 * You can integrate this with a job queue like BullMQ, Agenda, etc.
 */
export async function scheduleDeletionRetry(chatId: string, userId: string, delayMs = 5 * 60 * 1000) {
  // Example using setTimeout (replace with real job queue in production)
  setTimeout(() => {
    deleteChatFromProvider(chatId, userId).catch((e) => {
      logger.error(`Retry failed for chat ${chatId}:`, e);
    });
  }, delayMs);
}