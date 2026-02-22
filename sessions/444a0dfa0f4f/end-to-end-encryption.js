<Buffer> {
  return pbkdf2Async(
    password,
    salt,
    CONFIG.PBKDF2_ITERATIONS,
    CONFIG.KEY_LENGTH,
    CONFIG.PBKDF2_DIGEST,
  ) as Promise<Buffer>;
}

/**
 * Generate a fresh random salt for a new user.
 */
export function generateSalt(): Buffer {
  return randomBytes(16);
}

/**
 * Encrypt arbitrary data (string or Buffer) using AES‑256‑GCM.
 *
 * The output format is:
 *   <iv (12 bytes)><ciphertext><auth tag (16 bytes)>
 *
 * @param plaintext - Data to encrypt.
 * @param key - 32‑byte symmetric key.
 * @returns Buffer containing IV + ciphertext + auth tag.
 */
export function encrypt(
  plaintext: string | Buffer,
  key: Buffer,
): Buffer {
  const iv = randomBytes(CONFIG.IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, authTag]);
}

/**
 * Decrypt data produced by `encrypt`.
 *
 * @param encrypted - Buffer containing IV + ciphertext + auth tag.
 * @param key - Same symmetric key used for encryption.
 * @returns Decrypted Buffer.
 */
export function decrypt(
  encrypted: Buffer,
  key: Buffer,
): Buffer {
  const iv = encrypted.slice(0, CONFIG.IV_LENGTH);
  const authTag = encrypted.slice(
    encrypted.length - CONFIG.GCM_TAG_LENGTH,
  );
  const ciphertext = encrypted.slice(
    CONFIG.IV_LENGTH,
    encrypted.length - CONFIG.GCM_TAG_LENGTH,
  );

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext;
}

/**
 * Helper to encrypt a message body before persisting.
 *
 * @param message - Plain‑text message content.
 * @param userKey - User‑specific symmetric key derived from their password.
 * @returns Base64‑encoded string ready for storage.
 */
export function encryptMessage(
  message: string,
  userKey: Buffer,
): string {
  const encrypted = encrypt(Buffer.from(message, 'utf8'), userKey);
  return encrypted.toString('base64');
}

/**
 * Helper to decrypt a stored message.
 *
 * @param encryptedMessage - Base64‑encoded encrypted payload from DB.
 * @param userKey - Same user‑specific key used for encryption.
 * @returns Decrypted plain‑text message.
 */
export function decryptMessage(
  encryptedMessage: string,
  userKey: Buffer,
): string {
  const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
  const decrypted = decrypt(encryptedBuffer, userKey);
  return decrypted.toString('utf8');
}

/**
 * Middleware for Express routes that need to transparently encrypt/decrypt
 * message payloads. Assumes `req.user` is populated (e.g., by an auth guard)
 * and contains `passwordDerivedKey` – a Buffer derived via `deriveKeyFromPassword`.
 *
 * Usage:
 *   app.post('/messages', encryptionMiddleware, async (req, res) => { ... });
 */
export function encryptionMiddleware(
  req: any,
  res: any,
  next: () => void,
) {
  if (!req.user?.passwordDerivedKey) {
    // No key available – the route should reject the request.
    return res.status(401).json({ error: 'Encryption key missing' });
  }

  // Attach helpers to request for downstream handlers.
  req.encryptMessage = (msg: string) =>
    encryptMessage(msg, req.user.passwordDerivedKey);
  req.decryptMessage = (enc: string) =>
    decryptMessage(enc, req.user.passwordDerivedKey);
  next();
}

/**
 * Example of how to store a new user with a salted password hash and a salt
 * for key derivation. This function would be called during registration.
 *
 * @param prisma - Prisma client instance.
 * @param email - User email.
 * @param password - Plain‑text password.
 */
export async function registerUser(
  prisma: any,
  email: string,
  password: string,
) {
  const salt = generateSalt();
  const passwordHash = await pbkdf2Async(
    password,
    salt,
    CONFIG.PBKDF2_ITERATIONS,
    CONFIG.KEY_LENGTH,
    CONFIG.PBKDF2_DIGEST,
  );

  await prisma.user.create({
    data: {
      email,
      passwordHash: passwordHash.toString('hex'),
      passwordSalt: salt.toString('hex'),
    },
  });
}

/**
 * During login, derive the key and attach it to the request user object.
 *
 * @param prisma - Prisma client.
 * @param email - User email.
 * @param password - Plain‑text password.
 * @returns User object enriched with `passwordDerivedKey`.
 */
export async function authenticateUser(
  prisma: any,
  email: string,
  password: string,
): Promise<User & { passwordDerivedKey: Buffer } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;

  const salt = Buffer.from(user.passwordSalt, 'hex');
  const storedHash = Buffer.from(user.passwordHash, 'hex');

  const derivedKey = await deriveKeyFromPassword(password, salt);
  const testHash = await pbkdf2Async(
    password,
    salt,
    CONFIG.PBKDF2_ITERATIONS,
    CONFIG.KEY_LENGTH,
    CONFIG.PBKDF2_DIGEST,
  );

  if (!crypto.timingSafeEqual(storedHash, testHash)) {
    return null;
  }

  // Attach the derived key for encryption operations.
  return {
    ...user,
    passwordDerivedKey: derivedKey,
  };
}