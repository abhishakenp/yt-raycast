<Buffer> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { encryptedKey: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  if (user.encryptedKey) {
    // Decrypt stored key with master key
    const payload: EncryptedPayload = JSON.parse(user.encryptedKey);
    return decrypt(payload, MASTER_KEY_BUFFER);
  }

  // No key yet – generate a fresh 256‑bit key
  const newKey = crypto.randomBytes(32);
  const encrypted = encrypt(newKey, MASTER_KEY_BUFFER);
  await prisma.user.update({
    where: { id: userId },
    data: { encryptedKey: JSON.stringify(encrypted) },
  });
  return newKey;
}

// -----------------------------------------------------------------------------
// Field‑level Encryption Helpers (for Prisma models)
// -----------------------------------------------------------------------------
/**
 * Encrypt a string field for storage.
 */
export async function encryptField(
  plaintext: string,
  userKey: Buffer
): Promise<string> {
  const payload = encrypt(Buffer.from(plaintext, 'utf8'), userKey);
  return JSON.stringify(payload);
}

/**
 * Decrypt a stored string field.
 */
export async function decryptField(
  encrypted: string,
  userKey: Buffer
): Promise<string> {
  const payload: EncryptedPayload = JSON.parse(encrypted);
  const decrypted = decrypt(payload, userKey);
  return decrypted.toString('utf8');
}

// -----------------------------------------------------------------------------
// Middleware: Strip Sensitive Data from Logs & Requests
// -----------------------------------------------------------------------------
const SENSITIVE_FIELDS = ['password', 'apiKey', 'accessToken', 'refreshToken'];

/**
 * Remove sensitive fields from request bodies before they hit any logger.
 */
export function privacySanitizer(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.body && typeof req.body === 'object') {
    const sanitized = { ...req.body };
    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    // Attach a safe copy for downstream logging if needed
    (req as any)._sanitizedBody = sanitized;
  }
  next();
}

// -----------------------------------------------------------------------------
// Remote Purge Workflow (placeholder for future remote provider integration)
// -----------------------------------------------------------------------------
/**
 * Initiates a remote purge request for a given provider.
 * This function is deliberately a no‑op for the local‑only storage mode,
 * but the signature is kept to allow future extensions without breaking API.
 */
export async function requestRemotePurge(
  providerId: string,
  userId: string,
  resourceIds: string[]
): Promise<void> {
  // In a privacy‑first, local‑only deployment we never contact external services.
  // The function exists to keep the contract stable and to document intent.
  console.debug(
    `[Privacy] Remote purge requested for provider ${providerId} – ignored in local mode.`
  );
}

// -----------------------------------------------------------------------------
// Example: Persisting a Message with Encryption
// -----------------------------------------------------------------------------
export async function storeMessage(
  userId: string,
  chatId: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  const userKey = await getUserEncryptionKey(userId);
  const encryptedContent = await encryptField(content, userKey);
  const encryptedMetadata = metadata
    ? await encryptField(JSON.stringify(metadata), userKey)
    : undefined;

  await prisma.message.create({
    data: {
      userId,
      chatId,
      content: encryptedContent,
      metadata: encryptedMetadata,
    },
  });
}

/**
 * Retrieve and decrypt a message.
 */
export async function fetchMessage(
  userId: string,
  messageId: string
): Promise<{ content: string; metadata?: Record<string, unknown> }> {
  const userKey = await getUserEncryptionKey(userId);
  const msg = await prisma.message.findUnique({
    where: { id: messageId, userId },
    select: { content: true, metadata: true },
  });
  if (!msg) {
    throw new Error('Message not found');
  }

  const content = await decryptField(msg.content, userKey);
  const metadata = msg.metadata
    ? JSON.parse(await decryptField(msg.metadata, userKey))
    : undefined;

  return { content, metadata };
}

// -----------------------------------------------------------------------------
// Exported utilities
// -----------------------------------------------------------------------------
export default {
  encryptField,
  decryptField,
  getUserEncryptionKey,
  privacySanitizer,
  requestRemotePurge,
  storeMessage,
  fetchMessage,
};