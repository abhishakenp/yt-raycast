<void> {
    await sodium.ready;
    const secret = this.configService.get<string>('APP_ENCRYPTION_SECRET');
    if (!secret) {
      throw new BadRequestException('APP_ENCRYPTION_SECRET is not set');
    }
    // Derive a 32‑byte key using SHA‑256 (libsodium's crypto_generichash)
    this.masterKey = sodium.crypto_generichash(
      sodium.crypto_secretbox_KEYBYTES,
      sodium.from_string(secret),
    );
  }

  /**
   * Generate a new per‑user encryption key, encrypt it with the master key,
   * and store it in the database.
   */
  async createUserKey(userId: string): Promise<void> {
    const userKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    const encrypted = this.encryptWithMasterKey(userKey);
    await this.prisma.user.update({
      where: { id: userId },
      data: { encryptedKey: encrypted.ciphertext, nonce: encrypted.nonce },
    });
  }

  /**
   * Retrieve and decrypt a user's encryption key.
   */
  async getUserKey(userId: string): Promise<Uint8Array> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { encryptedKey: true, nonce: true },
    });
    if (!user?.encryptedKey || !user?.nonce) {
      throw new BadRequestException('User encryption key not found');
    }
    return this.decryptWithMasterKey(user.encryptedKey, user.nonce);
  }

  /**
   * Encrypt arbitrary plaintext (UTF‑8 string) with a per‑user key.
   */
  async encryptForUser(userId: string, plaintext: string): Promise<{
    ciphertext: string;
    nonce: string;
  }> {
    const key = await this.getUserKey(userId);
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(
      sodium.from_string(plaintext),
      nonce,
      key,
    );
    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce),
    };
  }

  /**
   * Decrypt data that was encrypted with encryptForUser.
   */
  async decryptForUser(
    userId: string,
    ciphertextB64: string,
    nonceB64: string,
  ): Promise<string> {
    const key = await this.getUserKey(userId);
    const ciphertext = sodium.from_base64(ciphertextB64);
    const nonce = sodium.from_base64(nonceB64);
    const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    if (!decrypted) {
      throw new BadRequestException('Failed to decrypt data');
    }
    return sodium.to_string(decrypted);
  }

  /**
   * Helper: encrypt a buffer with the master key.
   */
  private encryptWithMasterKey(plain: Uint8Array): {
    ciphertext: string;
    nonce: string;
  } {
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(plain, nonce, this.masterKey);
    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce),
    };
  }

  /**
   * Helper: decrypt a buffer with the master key.
   */
  private decryptWithMasterKey(
    ciphertextB64: string,
    nonceB64: string,
  ): Uint8Array {
    const ciphertext = sodium.from_base64(ciphertextB64);
    const nonce = sodium.from_base64(nonceB64);
    const decrypted = sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      this.masterKey,
    );
    if (!decrypted) {
      throw new BadRequestException('Failed to decrypt master‑encrypted data');
    }
    return decrypted;
  }
}