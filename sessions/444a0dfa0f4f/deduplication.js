<void> {
  let cursor: number | null = null;
  const hashMap = new Map<string, Message>(); // hash -> canonical message

  while (true) {
    const batch = await prisma.message.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        content: true,
        role: true,
        providerId: true,
        createdAt: true,
      },
    });

    if (batch.length === 0) break;

    const updates: { id: number; duplicateOfId: number }[] = [];

    for (const msg of batch) {
      const hash = computeMessageHash(msg as Message);

      if (!hashMap.has(hash)) {
        // First occurrence of this hash – treat as canonical
        hashMap.set(hash, msg as Message);
      } else {
        // Duplicate found – link to the canonical message
        const canonical = hashMap.get(hash)!;
        // Prefer the older record as canonical
        const keep = canonical.createdAt <= msg.createdAt ? canonical : (msg as Message);
        const discard = keep.id === canonical.id ? (msg as Message) : canonical;

        // Update map so future duplicates point to the oldest record
        hashMap.set(hash, keep);
        updates.push({ id: discard.id, duplicateOfId: keep.id });
      }
    }

    // Bulk update duplicates
    if (updates.length > 0) {
      await prisma.$transaction(
        updates.map(u =>
          prisma.message.update({
            where: { id: u.id },
            data: { duplicateOfId: u.duplicateOfId },
          })
        )
      );
    }

    // Prepare cursor for next batch
    cursor = batch[batch.length - 1].id;
  }
}

/**
 * Optional helper to clean up duplicate records after they have been linked.
 * This physically deletes rows that are marked as duplicates.
 * Use with caution – ensure you have backups or a soft‑delete strategy.
 */
export async function purgeDuplicateMessages(): Promise<void> {
  const duplicates = await prisma.message.findMany({
    where: { duplicateOfId: { not: null } },
    select: { id: true },
  });

  if (duplicates.length === 0) return;

  await prisma.$transaction(
    duplicates.map(d =>
      prisma.message.delete({
        where: { id: d.id },
      })
    )
  );
}

/**
 * Run deduplication as a scheduled job.
 * Example usage with node‑cron or any scheduler:
 *
 *   import { deduplicateMessages, purgeDuplicateMessages } from './deduplication.service';
 *
 *   cron.schedule('0 3 * * *', async () => {
 *     await deduplicateMessages();
 *     await purgeDuplicateMessages();
 *   });
 */
export async function runDeduplicationJob(): Promise<void> {
  console.log('[Deduplication] Starting job...');
  await deduplicateMessages();
  console.log('[Deduplication] Linking complete. Purging duplicates...');
  await purgeDuplicateMessages();
  console.log('[Deduplication] Job finished.');
}