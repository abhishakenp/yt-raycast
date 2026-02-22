<RSAKeyPair> {
  return new Promise<RSAKeyPair>((resolve, reject) => {
    crypto.generateKeyPair(
      ASYMMETRIC_ALGO,
      {
        modulusLength: RSA_KEY_SIZE,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      },
      (err, publicKey, privateKey) => {
        if (err) return reject(err);
        resolve({ publicKey, privateKey });
      },
    );
  });
}

/**
 * Derives a symmetric key from a user‑provided password using PBKDF2.
 * Returns both the key and the random salt used (required for decryption).
 */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Buffer,
): Promise<{ key: SymmetricKey; salt: Buffer }> {
  const usedSalt = salt ?? randomBytes(SALT_BYTE_LENGTH);
  const key = await pbkdf2Async(
    password,
    usedSalt,
    PBKDF2_ITERATIONS,
    32,
    PBKDF2_DIGEST,
  );
  return { key, salt: usedSalt };
}

// -----------------------------------------------------------------------------
// Symmetric Encryption (AES‑256‑GCM)
// -----------------------------------------------------------------------------
/**
 * Encrypts arbitrary data with a symmetric key.
 * Returns an EncryptedPayload ready for storage.
 */
export async function encryptSymmetric(
  plaintext: Buffer | string,
  key: SymmetricKey,
): Promise<EncryptedPayload> {
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = crypto.createCipheriv(SYMMETRIC_ALGO, key, iv, {
    authTagLength: AUTH_TAG_BYTE_LENGTH,
  });

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts a payload encrypted with encryptSymmetric().
 */
export async function decryptSymmetric(
  payload: EncryptedPayload,
  key: SymmetricKey,
): Promise<Buffer> {
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(SYMMETRIC_ALGO, key, iv, {
    authTagLength: AUTH_TAG_BYTE_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext;
}

// -----------------------------------------------------------------------------
// Asymmetric Encryption (RSA‑OAEP)
// -----------------------------------------------------------------------------
/**
 * Encrypts a symmetric key with a recipient's RSA public key.
 * The output is base64‑encoded for storage.
 */
export function encryptKeyWithPublicKey(
  symmetricKey: SymmetricKey,
  publicKeyPem: string,
): string {
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    symmetricKey,
  );
  return encrypted.toString('base64');
}

/**
 * Decrypts a symmetric key using the RSA private key.
 */
export function decryptKeyWithPrivateKey(
  encryptedKeyB64: string,
  privateKeyPem: string,
): SymmetricKey {
  const encryptedKey = Buffer.from(encryptedKeyB64, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedKey,
  );
  return decrypted;
}

// -----------------------------------------------------------------------------
// High‑Level Message Encryption API
// -----------------------------------------------------------------------------
/**
 * Encrypts a chat message for storage.
 *
 * Workflow:
 *   1. Derive a per‑user symmetric key (or fetch a cached one).
 *   2. Encrypt the message body with AES‑256‑GCM.
 *   3. Encrypt the symmetric key with the user's RSA public key.
 *
 * The returned object contains everything needed to decrypt later:
 *   - encryptedMessage: the AES‑GCM payload
 *   - encryptedKey: RSA‑encrypted symmetric key (base64)
 *   - keySalt: salt used for PBKDF2 (if the symmetric key was derived from a password)
 */
export interface StoredMessage {
  encryptedMessage: EncryptedPayload;
  encryptedKey: string; // base64 RSA‑encrypted symmetric key
  keySalt?: string; // base64, only present when key derived from password
}

/**
 * Encrypt a plain text message for a given user.
 *
 * @param plaintext   The message content (string)
 * @param userPublicKeyPem  RSA public key of the message owner (PEM)
 * @param password   Optional password to derive the symmetric key.
 *                   If omitted, a random key is generated.
 *
 * @returns StoredMessage ready to be persisted.
 */
export async function encryptChatMessage(
  plaintext: string,
  userPublicKeyPem: string,
  password?: string,
): Promise<StoredMessage> {
  // 1️⃣ Generate or derive a symmetric key
  let symmetricKey: SymmetricKey;
  let keySalt: Buffer | undefined;

  if (password) {
    const derived = await deriveKeyFromPassword(password);
    symmetricKey = derived.key;
    keySalt = derived.salt;
  } else {
    symmetricKey = randomBytes(32); // 256‑bit key
  }

  // 2️⃣ Encrypt the message body
  const encryptedMessage = await encryptSymmetric(plaintext, symmetricKey);

  // 3️⃣ Encrypt the symmetric key with the user's RSA public key
  const encryptedKey = encryptKeyWithPublicKey(symmetricKey, userPublicKeyPem);

  return {
    encryptedMessage,
    encryptedKey,
    keySalt: keySalt?.toString('base64'),
  };
}

/**
 * Decrypt a stored message.
 *
 * @param stored          The StoredMessage retrieved from DB.
 * @param userPrivateKeyPem  RSA private key of the owner (PEM). Must be the
 *                           decrypted private key (i.e. after password‑based
 *                           decryption if you store it encrypted).
 * @param password        Optional password if the symmetric key was derived
 *                        from one during encryption.
 *
 * @returns The original plaintext message.
 */
export async function decryptChatMessage(
  stored: StoredMessage,
  userPrivateKeyPem: string,
  password?: string,
): Promise<string> {
  // 1️⃣ Recover the symmetric key
  const symmetricKey = decryptKeyWithPrivateKey(
    stored.encryptedKey,
    userPrivateKeyPem,
  );

  // If a password was used to derive the key, we could optionally verify it
  // by re‑deriving and comparing, but for simplicity we trust the RSA envelope.

  // 2️⃣ Decrypt the message payload
  const plaintextBuffer = await decryptSymmetric(
    stored.encryptedMessage,
    symmetricKey,
  );

  return plaintextBuffer.toString('utf-8');
}

// -----------------------------------------------------------------------------
// Private Key Encryption (Password‑Based)
// -----------------------------------------------------------------------------
// Users' RSA private keys must never be stored in clear text. The helpers below
// allow encrypting/decrypting the PEM using a password‑derived key.
//
// The format mirrors encryptSymmetric() output, stored alongside the encrypted
// private key in the DB.
export async function encryptPrivateKey(
  privateKeyPem: string,
  password: string,
): Promise<EncryptedPayload> {
  const { key, salt } = await deriveKeyFromPassword(password);
  const payload = await encryptSymmetric(Buffer.from(privateKeyPem, 'utf-8'), key);
  // Attach the salt so we can re‑derive the key during decryption
  payload.salt = salt.toString('base64');
  return payload;
}

export async function decryptPrivateKey(
  encrypted: EncryptedPayload,
  password: string,
): Promise<string> {
  if (!encrypted.salt) {
    throw new Error('Missing salt for private key decryption');
  }
  const salt = Buffer.from(encrypted.salt, 'base64');
  const { key } = await deriveKeyFromPassword(password, salt);
  const decrypted = await decryptSymmetric(encrypted, key);
  return decrypted.toString('utf-8');
}

// -----------------------------------------------------------------------------
// Exported module interface
// -----------------------------------------------------------------------------
export default {
  generateRSAKeyPair,
  encryptChatMessage,
  decryptChatMessage,
  encryptPrivateKey,
  decryptPrivateKey,
  encryptKeyWithPublicKey,
  decryptKeyWithPrivateKey,
};