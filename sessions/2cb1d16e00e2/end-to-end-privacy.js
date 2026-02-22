<KeyPair> {
  await sodium.ready;
  const keyPair = sodium.crypto_box_keypair();

  const salt = randomBytes(16);
  const symmetricKey = deriveKeyFromPassword(password, salt);
  const iv = randomBytes(12); // AES‑GCM nonce length

  const cipher = createCipheriv('aes-256-gcm', symmetricKey, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(keyPair.privateKey)), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store: salt || iv || authTag || encryptedPrivateKey (all base64)
  const payload = Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');

  return {
    publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
    privateKey: payload,
  };
}

/**
 * Decrypt a user's encrypted private key using their password.
 *
 * @param encryptedPrivateKey - Base64 string produced by generateUserKeyPair.
 * @param password - User's password.
 * @returns Uint8Array containing the raw private key.
 */
export function decryptUserPrivateKey(encryptedPrivateKey: string, password: string): Uint8Array {
  const data = Buffer.from(encryptedPrivateKey, 'base64');

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const authTag = data.slice(28, 44);
  const encrypted = data.slice(44);

  const symmetricKey = deriveKeyFromPassword(password, salt);
  const decipher = createDecipheriv('aes-256-gcm', symmetricKey, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return new Uint8Array(decrypted);
}

/**
 * Encrypt arbitrary plaintext for a recipient using the sender's private key and recipient's public key.
 *
 * @param plaintext - The message to encrypt.
 * @param senderPrivateKey - Sender's raw private key (Uint8Array).
 * @param recipientPublicKey - Recipient's public key (base64 string).
 * @returns {EncryptedPayload}
 */
export async function encryptForRecipient(
  plaintext: string,
  senderPrivateKey: Uint8Array,
  recipientPublicKey: string
): Promise<EncryptedPayload> {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const recipientPK = Buffer.from(recipientPublicKey, 'base64');
  const ciphertext = sodium.crypto_box_easy(
    Buffer.from(plaintext),
    nonce,
    recipientPK,
    senderPrivateKey
  );

  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64'),
    senderPublicKey: Buffer.from(sodium.crypto_scalarmult_base(senderPrivateKey)).toString('base64'),
  };
}

/**
 * Decrypt a payload that was encrypted for the user.
 *
 * @param payload - EncryptedPayload received from the client.
 * @param userPrivateKey - User's raw private key (Uint8Array).
 * @returns Decrypted plaintext string.
 */
export async function decryptFromSender(
  payload: EncryptedPayload,
  userPrivateKey: Uint8Array
): Promise<string> {
  await sodium.ready;
  const nonce = Buffer.from(payload.nonce, 'base64');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64');
  const senderPK = Buffer.from(payload.senderPublicKey, 'base64');

  const plaintext = sodium.crypto_box_open_easy(ciphertext, nonce, senderPK, userPrivateKey);
  return Buffer.from(plaintext).toString('utf-8');
}

/**
 * Middleware to ensure that any incoming message payload is encrypted.
 * If a plaintext `content` field is detected, it will be encrypted using the
 * server‑stored recipient public key (e.g., the chat owner) and the sender's
 * private key derived from the request's auth context.
 *
 * Usage (Express):
 *   app.post('/messages', e2eEncryptMiddleware, messageController.create);
 */
export function e2eEncryptMiddleware(publicKeyProvider: (userId: string) => Promise<string>) {
  return async (req: any, res: any, next: any) => {
    try {
      const { userId, privateKey, password } = req.auth; // assumed auth middleware populates this
      if (!userId || !privateKey) {
        return res.status(401).json({ error: 'Unauthenticated' });
      }

      // Decrypt stored private key using password (if password not in session, expect it in body)
      const userPrivKey = typeof privateKey === 'string'
        ? decryptUserPrivateKey(privateKey, password)
        : new Uint8Array(privateKey);

      // If the client sent plaintext, encrypt it now
      if (req.body && typeof req.body.content === 'string') {
        const recipientPublicKey = await publicKeyProvider(userId);
        const encrypted = await encryptForRecipient(req.body.content, userPrivKey, recipientPublicKey);
        // Replace plaintext with encrypted structure
        req.body.encrypted = encrypted;
        delete req.body.content;
      }

      next();
    } catch (err) {
      console.error('E2E encryption middleware error:', err);
      res.status(500).json({ error: 'Encryption failure' });
    }
  };
}

/**
 * Helper to store encrypted chat/message data.
 * This function expects the caller to have already encrypted the payload.
 *
 * @param prisma - Prisma client instance.
 * @param chatId - Target chat identifier.
 * @param encrypted - EncryptedPayload to persist.
 */
export async function storeEncryptedMessage(
  prisma: any,
  chatId: string,
  encrypted: EncryptedPayload,
  metadata?: Record<string, any>
) {
  return prisma.message.create({
    data: {
      chatId,
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
      senderPublicKey: encrypted.senderPublicKey,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

/**
 * Retrieve and decrypt a message for a user.
 *
 * @param prisma - Prisma client.
 * @param messageId - Identifier of the message.
 * @param userPrivateKey - Raw private key of the requesting user.
 * @returns Decrypted message content.
 */
export async function retrieveDecryptedMessage(
  prisma: any,
  messageId: string,
  userPrivateKey: Uint8Array
) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error('Message not found');

  const payload: EncryptedPayload = {
    ciphertext: msg.ciphertext,
    nonce: msg.nonce,
    senderPublicKey: msg.senderPublicKey,
  };

  return decryptFromSender(payload, userPrivateKey);
}