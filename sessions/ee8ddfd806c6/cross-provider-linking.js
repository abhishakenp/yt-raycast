< TITLE_SIMILARITY_THRESHOLD) return false;

  const timeDiff = Math.abs(
    new Date(chatA.createdAt).getTime() - new Date(chatB.createdAt).getTime()
  );
  if (timeDiff > TIME_WINDOW_MS) return false;

  return true;
}

/**
 * Assign a common `groupId` to a set of chats that belong together.
 *
 * @param chatIds Array of chat IDs to group
 * @param groupId Optional pre‑generated group ID; if omitted a new UUID is created.
 */
async function assignGroupId(chatIds: string[], groupId?: string): Promise<void> {
  const id = groupId ?? uuidv4();
  await prisma.chat.updateMany({
    where: { id: { in: chatIds } },
    data: { groupId: id },
  });
}

/**
 * Core linking routine for a single user.
 *
 * 1. Pull all chats belonging to the user that are not already grouped.
 * 2. Compare each chat against every other chat from a different provider.
 * 3. When a match is found, create (or reuse) a groupId and assign it to both chats.
 *
 * This function is idempotent – re‑running it will not create duplicate groups.
 *
 * @param userId The user whose chats should be processed.
 */
export async function linkUserChats(userId: string): Promise<void> {
  // Load all chats for the user that have no groupId yet.
  const chats = await prisma.chat.findMany({
    where: {
      userId,
      OR: [{ groupId: null }, { groupId: '' }],
    },
    orderBy: { createdAt: 'asc' },
  });

  // Early exit if nothing to process.
  if (chats.length < 2) return;

  // Keep track of which chats have already been assigned a group.
  const processed = new Set<string>();

  for (let i = 0; i < chats.length; i++) {
    const chatA = chats[i];
    if (processed.has(chatA.id)) continue;

    const matchingChatIds: string[] = [chatA.id];

    for (let j = i + 1; j < chats.length; j++) {
      const chatB = chats[j];
      if (processed.has(chatB.id)) continue;

      if (areChatsLinkable(chatA, chatB)) {
        matchingChatIds.push(chatB.id);
        processed.add(chatB.id);
      }
    }

    // If we found more than one chat that belongs together, assign a group.
    if (matchingChatIds.length > 1) {
      await assignGroupId(matchingChatIds);
      matchingChatIds.forEach((id) => processed.add(id));
    }
  }
}

/**
 * Batch processing entry‑point.
 *
 * This can be scheduled (e.g., via a cron job) to run across all users.
 */
export async function runCrossProviderLinking(): Promise<void> {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    try {
      await linkUserChats(user.id);
    } catch (err) {
      console.error(`Failed linking chats for user ${user.id}:`, err);
    }
  }
}

// If this file is executed directly (`node crossProviderLinking.js`), run the batch job.
if (require.main === module) {
  runCrossProviderLinking()
    .then(() => {
      console.log('Cross‑provider linking completed.');
      process.exit(0);
    })
    .catch((e) => {
      console.error('Unexpected error during linking:', e);
      process.exit(1);
    });
}