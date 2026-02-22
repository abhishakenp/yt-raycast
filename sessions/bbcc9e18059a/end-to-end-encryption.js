< IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted payload');
  }

  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(data.length - TAG_LENGTH);
  const ciphertext = data.slice(IV_LENGTH, data.length - TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

/**
 * Prisma middleware to transparently encrypt/decrypt Message content.
 * Assumes the Prisma client is instantiated elsewhere and imported.
 *
 * Usage:
 *   import { prisma } from '../prisma';
 *   prisma.$use(messageEncryptionMiddleware);
 *
 * The client must supply the user's encryption key via the `context`
 * object of each request (e.g., `ctx.encryptionKey`), which should be a
 * Buffer derived from the client‑side secret.
 */
export function messageEncryptionMiddleware(params: any, next: any) {
  // Only act on the Message model
  if (params.model !== 'Message') {
    return next(params);
  }

  // Retrieve the per‑request encryption key from the Prisma context.
  // This key must be set by upstream middleware (e.g., an Express
  // request handler that extracts the key from the authenticated user).
  const encryptionKey: Buffer | undefined = params?.args?.encryptionKey;

  // If no key is present, we simply pass through (allowing public messages).
  if (!encryptionKey) {
    return next(params);
  }

  // ---- CREATE / UPDATE ----
  if (['create', 'createMany', 'update', 'updateMany', 'upsert'].includes(params.action)) {
    const data = params.args?.data;
    if (data?.content) {
      data.content = encrypt(data.content, encryptionKey);
    }
    // For nested creates (e.g., createMany inside upsert) handle recursively
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.content) {
          item.content = encrypt(item.content, encryptionKey);
        }
      });
    }
  }

  // ---- READ ----
  if (['findUnique', 'findFirst', 'findMany'].includes(params.action)) {
    // After the query resolves, decrypt the content fields.
    return next(params).then((result: any) => {
      const decryptRecursive = (obj: any) => {
        if (Array.isArray(obj)) {
          obj.forEach(decryptRecursive);
        } else if (obj && typeof obj === 'object') {
          if (obj.content && typeof obj.content === 'string') {
            try {
              obj.content = decrypt(obj.content, encryptionKey);
            } catch (e) {
              // If decryption fails, keep the ciphertext (avoid throwing)
              console.warn('Failed to decrypt message content', e);
            }
          }
          // Recurse into nested objects
          Object.values(obj).forEach(decryptRecursive);
        }
      };
      decryptRecursive(result);
      return result;
    });
  }

  // For any other actions, just forward
  return next(params);
}

/**
 * Express middleware to attach the user's encryption key to the Prisma
 * request context. It expects the client to send the derived key in a
 * custom header `x-encryption-key` (Base64‑encoded). In a real‑world
 * implementation the key would be derived client‑side from the user's
 * password or stored in a secure enclave and never transmitted in plain
 * form; this example keeps it simple for demonstration.
 */
export function attachEncryptionKeyMiddleware(prisma: any) {
  return (req: any, res: any, next: any) => {
    const keyHeader = req.headers['x-encryption-key'];
    if (typeof keyHeader === 'string') {
      try {
        const key = deriveKeyFromSecret(keyHeader);
        // Prisma allows per‑request context via `$use` middleware arguments.
        // We'll monkey‑patch the `$executeRaw` call chain to inject the key.
        // A cleaner approach is to use `prisma.$extends` in newer Prisma versions.
        req.prisma = prisma.$extends({
          query: {
            $allModels: {
              async $allOperations({ args, query }) {
                // Attach the key to args so our encryption middleware can read it
                if (args) {
                  args.encryptionKey = key;
                }
                return query(args);
              },
            },
          },
        });
      } catch (e) {
        console.error('Invalid encryption key header', e);
        // Proceed without encryption; optionally reject the request
      }
    }
    next();
  };
}

/**
 * Helper to generate a random 256‑bit key for a new user.
 * The key should be encrypted with the user's public key on the client
 * before being stored, or derived from a passphrase that never leaves the
 * client. This function is provided for testing / provisioning purposes.
 *
 * @returns Base64‑encoded 32‑byte key
 */
export function generateUserEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}