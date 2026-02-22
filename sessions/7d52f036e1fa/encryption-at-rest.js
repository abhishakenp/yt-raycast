<string>('ENCRYPTION_KEY');
    if (!keyB64) {
      this.logger.error('ENCRYPTION_KEY is not set. Encryption at rest will be disabled.');
      // In production this should crash early; for safety we generate a random key.
      this.key = crypto.randomBytes(32);
    } else {
      const key = Buffer.from(keyB64, 'base64');
      if (key.length !== 32) {
        this.logger.error('ENCRYPTION_KEY must be 32 bytes (base64).');
        throw new Error('Invalid ENCRYPTION_KEY length');
      }
      this.key = key;
    }
  }

  /**
   * Encrypts a UTF‑8 string and returns a base64 payload containing:
   *   iv (12 bytes) | ciphertext | authTag (16 bytes)
   *
   * The format is compatible with the `decrypt` method below.
   */
  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(12); // GCM standard nonce size
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Concatenate iv + ciphertext + authTag and encode as base64
    return Buffer.concat([iv, ciphertext, authTag]).toString('base64');
  }

  /**
   * Decrypts a base64 payload produced by `encrypt`.
   */
  decrypt(encrypted: string): string {
    const data = Buffer.from(encrypted, 'base64');
    if (data.length < 12 + 16) {
      throw new Error('Invalid encrypted payload');
    }
    const iv = data.slice(0, 12);
    const authTag = data.slice(data.length - 16);
    const ciphertext = data.slice(12, data.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString('utf8');
  }

  /**
   * Generates a new random 256‑bit key and returns it base64‑encoded.
   * Useful for provisioning new environments.
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }
}

/**
 * TypeORM transformer that automatically encrypts/decrypts column values.
 *
 * Usage:
 *   @Column({
 *     type: 'text',
 *     transformer: new EncryptedColumn(),
 *   })
 *   secretData: string;
 */
export class EncryptedColumn implements ValueTransformer {
  private readonly encryptionService: EncryptionService;

  constructor() {
    // In a real NestJS app you would inject the service via DI.
    // For the transformer (which is instantiated by TypeORM) we create a temporary instance.
    // This assumes ConfigService is globally available via process.env.
    const configService = {
      get: (key: string) => process.env[key],
    } as ConfigService;
    this.encryptionService = new EncryptionService(configService);
  }

  /**
   * Called when writing to the DB.
   */
  to(value: string | null): string | null {
    if (value === null || value === undefined) {
      return value;
    }
    return this.encryptionService.encrypt(value);
  }

  /**
   * Called when reading from the DB.
   */
  from(value: string | null): string | null {
    if (value === null || value === undefined) {
      return value;
    }
    try {
      return this.encryptionService.decrypt(value);
    } catch (err) {
      // If decryption fails we log and return the raw value to avoid data loss.
      console.error('Failed to decrypt column value', err);
      return value;
    }
  }
}