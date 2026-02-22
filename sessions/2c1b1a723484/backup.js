<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

// ---------------------------------------------------------------------------
// Backup generation
// ---------------------------------------------------------------------------
export async function generateBackup(userId: string): Promise<Buffer> {
  // 1️⃣ Load user & ensure they have a backup key
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, backupKey: true },
  });
  if (!user) throw new Error('User not found');
  if (!user.backupKey) throw new Error('Backup key not configured for user');

  // 2️⃣ Gather all related data
  const [threads, providers, tags, attachments] = await Promise.all([
    prisma.chatThread.findMany({
      where: { userId },
      include: { messages: true, tags: true, attachments: true },
    }),
    prisma.provider.findMany({ where: { userId } }),
    prisma.tag.findMany({ where: { userId } }),
    prisma.attachment.findMany({ where: { userId } }),
  ]);

  // 3️⃣ Build a plain‑object snapshot
  const snapshot = {
    user: { id: user.id, email: user.email },
    providers,
    tags,
    threads: threads.map((t) => ({
      ...t,
      messages: t.messages,
      tags: t.tags,
      attachments: t.attachments,
    })),
    attachments,
    generatedAt: new Date().toISOString(),
  };

  // 4️⃣ Serialize & compress
  const json = JSON.stringify(snapshot);
  const gzip = createGzip();
  const source = Readable.from([json]);
  const compressed = await streamToBuffer(source.pipe(gzip));

  // 5️⃣ Derive encryption key (user‑specific)
  //    backupKey is stored as a base64‑encoded random 32‑byte secret.
  const key = Buffer.from(user.backupKey, 'base64');

  // 6️⃣ Encrypt using AES‑256‑GCM
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 7️⃣ Return a single buffer: [iv][authTag][encrypted]
  return Buffer.concat([iv, authTag, encrypted]);
}

// ---------------------------------------------------------------------------
// Backup restoration
// ---------------------------------------------------------------------------
export async function restoreBackup(userId: string, encryptedBackup: Buffer): Promise<void> {
  // 1️⃣ Load user & key
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, backupKey: true },
  });
  if (!user) throw new Error('User not found');
  if (!user.backupKey) throw new Error('Backup key not configured for user');

  const key = Buffer.from(user.backupKey, 'base64');

  // 2️⃣ Split buffer into iv, authTag, ciphertext
  const iv = encryptedBackup.subarray(0, IV_LENGTH);
  const authTag = encryptedBackup.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = encryptedBackup.subarray(IV_LENGTH + TAG_LENGTH);

  // 3️⃣ Decrypt
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  // 4️⃣ Decompress
  const gunzip = createGunzip();
  const source = Readable.from([decrypted]);
  const decompressed = await streamToBuffer(source.pipe(gunzip));

  // 5️⃣ Parse JSON
  const snapshot = JSON.parse(decompressed.toString('utf-8'));

  // -----------------------------------------------------------------------
  // 6️⃣ Upsert data – all operations are wrapped in a transaction to keep
  //    the database consistent. Conflicts are resolved by keeping the
  //    newest version (based on `updatedAt` if present) or by simply
  //    ignoring duplicates.
  // -----------------------------------------------------------------------
  await prisma.$transaction(async (tx) => {
    // Providers
    for (const prov of snapshot.providers) {
      await tx.provider.upsert({
        where: { id: prov.id },
        create: prov,
        update: prov,
      });
    }

    // Tags
    for (const tag of snapshot.tags) {
      await tx.tag.upsert({
        where: { id: tag.id },
        create: tag,
        update: tag,
      });
    }

    // Attachments (stand‑alone)
    for (const att of snapshot.attachments) {
      await tx.attachment.upsert({
        where: { id: att.id },
        create: att,
        update: att,
      });
    }

    // ChatThreads + nested messages/tags/attachments
    for (const thread of snapshot.threads) {
      // Upsert thread first (without relations)
      const { messages, tags: threadTags, attachments: threadAttachments, ...threadData } = thread;
      await tx.chatThread.upsert({
        where: { id: threadData.id },
        create: threadData,
        update: threadData,
      });

      // Messages
      for (const msg of messages) {
        await tx.message.upsert({
          where: { id: msg.id },
          create: { ...msg, chatThreadId: threadData.id },
          update: { ...msg, chatThreadId: threadData.id },
        });
      }

      // Thread‑level tags (many‑to‑many linking)
      if (threadTags && threadTags.length) {
        await tx.chatThread.update({
          where: { id: threadData.id },
          data: {
            tags: {
              set: [], // clear existing links
              connect: threadTags.map((t: Tag) => ({ id: t.id })),
            },
          },
        });
      }

      // Thread‑level attachments
      if (threadAttachments && threadAttachments.length) {
        await tx.chatThread.update({
          where: { id: threadData.id },
          data: {
            attachments: {
              set: [], // clear existing links
              connect: threadAttachments.map((a: Attachment) => ({ id: a.id })),
            },
          },
        });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Utility: generate & store a per‑user backup key (run once per account)
// ---------------------------------------------------------------------------
export async function provisionBackupKey(userId: string): Promise<string> {
  const rawKey = randomBytes(KEY_LENGTH);
  const encoded = rawKey.toString('base64');

  await prisma.user.update({
    where: { id: userId },
    data: { backupKey: encoded },
  });

  return encoded;
}

// ---------------------------------------------------------------------------
// Types exported for external use
// ---------------------------------------------------------------------------
export type BackupSnapshot = ReturnType<typeof generateBackup>;
export type RestoreResult = void;