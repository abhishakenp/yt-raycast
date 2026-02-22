<jwt>
 *   Optional body (JSON):
 *     { "encryptionPassphrase": "string" }   // if omitted, server‑side key is used
 *
 * Response:
 *   - 200: application/zip (or application/json for format=json)
 *   - 401/403: authentication/authorization errors
 *   - 500: internal errors
 */
export async function exportUserData(req: Request, res: Response, next: NextFunction) {
  try {
    // -------------------------------------------------------------------------
    // 1️⃣ Authentication & user context
    // -------------------------------------------------------------------------
    const userId = (req as any).user?.id; // assume auth middleware populated req.user
    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // -------------------------------------------------------------------------
    // 2️⃣ Resolve encryption key
    // -------------------------------------------------------------------------
    const { encryptionPassphrase } = req.body ?? {};
    const encryptionKey = await getUserEncryptionKey(userId, encryptionPassphrase);
    if (!encryptionKey) {
      return res.status(403).json({ error: 'Unable to derive encryption key' });
    }

    // -------------------------------------------------------------------------
    // 3️⃣ Gather data
    // -------------------------------------------------------------------------
    const [chats, tags, providers] = await Promise.all([
      prisma.chat.findMany({
        where: { userId },
        include: {
          messages: {
            include: {
              attachments: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tag.findMany({ where: { userId } }),
      prisma.provider.findMany({ where: { userId } }),
    ]);

    // -------------------------------------------------------------------------
    // 4️⃣ Prepare archive (zip)
    // -------------------------------------------------------------------------
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilename = `chatvault-export-${new Date().toISOString()}.zip`;

    // Set response headers early so the client can start downloading
    res.attachment(zipFilename);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe archive to response, then encrypt on‑the‑fly
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey.key, encryptionKey.iv);
    const encryptedStream = archive.pipe(cipher).pipe(res);

    // -------------------------------------------------------------------------
    // 5️⃣ Add JSON payloads
    // -------------------------------------------------------------------------
    archive.append(JSON.stringify({ chats }, null, 2), { name: 'chats.json' });
    archive.append(JSON.stringify({ tags }, null, 2), { name: 'tags.json' });
    archive.append(JSON.stringify({ providers }, null, 2), { name: 'providers.json' });

    // -------------------------------------------------------------------------
    // 6️⃣ Stream attachments (avoid loading whole files into memory)
    // -------------------------------------------------------------------------
    for (const chat of chats) {
      for (const message of chat.messages) {
        for (const attachment of message.attachments) {
          // Assume attachment.path stores absolute path on disk or S3 URL.
          // For simplicity we handle local filesystem paths.
          const attachmentPath = path.resolve(attachment.path);
          const entryName = `attachments/${chat.id}/${message.id}/${path.basename(attachmentPath)}`;

          // Add file stream to archive
          archive.file(attachmentPath, { name: entryName });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 7️⃣ Finalize archive
    // -------------------------------------------------------------------------
    await archive.finalize();

    // Wait for the pipeline to finish before ending the request
    await pipe(encryptedStream, new Promise(() => {}));
  } catch (err) {
    console.error('Export error:', err);
    next(err);
  }
}

/**
 * Helper to derive a 256‑bit key + IV for AES‑GCM.
 *
 * In a real product you would store a per‑user master key (derived from the
 * user's password via Argon2id) and use HKDF to derive the encryptionKey.
 * Here we provide a minimal implementation for demonstration.
 */
export async function getUserEncryptionKey(
  userId: string,
  passphrase?: string
): Promise<{ key: Buffer; iv: Buffer } | null> {
  // Fetch stored salt & encrypted master key
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { encryptionSalt: true, encryptedMasterKey: true },
  });
  if (!user) return null;

  const salt = Buffer.from(user.encryptionSalt, 'base64');
  const masterKeyEnc = Buffer.from(user.encryptedMasterKey, 'base64');

  // Derive key from passphrase or fallback to stored master key (if already decrypted)
  const derivedKey = crypto.pbkdf2Sync(
    passphrase ?? '',
    salt,
    200_000,
    32,
    'sha256'
  );

  // Decrypt master key (AES‑256‑GCM with stored IV)
  const iv = masterKeyEnc.slice(0, 12);
  const tag = masterKeyEnc.slice(masterKeyEnc.length - 16);
  const ciphertext = masterKeyEnc.slice(12, masterKeyEnc.length - 16);

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(tag);
    const masterKey = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    // Use masterKey as the final encryption key for the export zip
    const exportIv = crypto.randomBytes(12);
    return { key: masterKey, iv: exportIv };
  } catch {
    return null;
  }
}