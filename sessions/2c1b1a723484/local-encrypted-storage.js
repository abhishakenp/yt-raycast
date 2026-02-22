<T>(data: T, userSecret: string): Promise<Buffer> {
  const json = JSON.stringify(data);
  const plain = Buffer.from(json, 'utf8');

  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(userSecret, salt);
  const encrypted = encrypt(plain, key);

  // Return: [salt][encryptedPayload]
  return Buffer.concat([salt, encrypted]);
}

export async function decryptWithSecret<T>(blob: Buffer, userSecret: string): Promise<T> {
  const salt = blob.subarray(0, SALT_LENGTH);
  const encryptedPayload = blob.subarray(SALT_LENGTH);
  const key = deriveKey(userSecret, salt);
  const decrypted = decrypt(encryptedPayload, key);
  const json = decrypted.toString('utf8');
  return JSON.parse(json) as T;
}

// -----------------------------------------------------------------------------
// Generic encrypted file repository (local storage)
// -----------------------------------------------------------------------------
export class EncryptedFileRepository<T> {
  private readonly filePath: string;
  private readonly userSecret: string;

  constructor(entityName: string, userId: string, userSecret: string) {
    // Each user gets its own folder, each entity its own file
    const userDir = path.join(STORAGE_ROOT, userId);
    this.filePath = path.join(userDir, `${entityName}.enc`);
    this.userSecret = userSecret;
    // Ensure user directory exists
    fs.mkdir(userDir, { recursive: true }).catch(() => {});
  }

  // Load the whole collection (array) from disk, decrypting it.
  async loadAll(): Promise<T[]> {
    try {
      const blob = await fs.readFile(this.filePath);
      const data = await decryptWithSecret<T[]>(blob, this.userSecret);
      return data;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // No file yet – treat as empty collection
        return [];
      }
      throw err;
    }
  }

  // Persist the whole collection (array) to disk, encrypting it.
  async saveAll(items: T[]): Promise<void> {
    const blob = await encryptWithSecret<T[]>(items, this.userSecret);
    await fs.writeFile(this.filePath, blob);
  }

  // CRUD helpers -------------------------------------------------------------
  async findById(id: string | number): Promise<T | undefined> {
    const all = await this.loadAll();
    // @ts-ignore – we assume each entity has an `id` field
    return all.find((item) => (item as any).id === id);
  }

  async create(item: T): Promise<T> {
    const all = await this.loadAll();
    // @ts-ignore – we assume each entity has an `id` field
    (item as any).id = (item as any).id ?? cryptoRandomId();
    all.push(item);
    await this.saveAll(all);
    return item;
  }

  async update(id: string | number, updates: Partial<T>): Promise<T | undefined> {
    const all = await this.loadAll();
    const index = all.findIndex((i) => (i as any).id === id);
    if (index === -1) return undefined;
    const existing = all[index];
    const merged = { ...existing, ...updates };
    all[index] = merged as T;
    await this.saveAll(all);
    return merged as T;
  }

  async delete(id: string | number): Promise<boolean> {
    const all = await this.loadAll();
    const filtered = all.filter((i) => (i as any).id !== id);
    if (filtered.length === all.length) return false;
    await this.saveAll(filtered);
    return true;
  }
}

// -----------------------------------------------------------------------------
// Utility: generate a random ID (fallback when DB‑style auto‑increment not used)
// -----------------------------------------------------------------------------
function cryptoRandomId(): string {
  // 12‑byte URL‑safe base64 string (~16 characters)
  return randomBytes(12).toString('base64url');
}

// -----------------------------------------------------------------------------
// Example usage (to be removed in production)
// -----------------------------------------------------------------------------
// interface Message {
//   id: string;
//   threadId: string;
//   role: 'user' | 'assistant';
//   content: string;
//   createdAt: string;
// }
//
// async function demo() {
//   const repo = new EncryptedFileRepository<Message>('messages', 'user-42', 'my‑super‑secret‑pass');
//   await repo.create({ id: '', threadId: 't1', role: 'user', content: 'Hello', createdAt: new Date().toISOString() });
//   const msgs = await repo.loadAll();
//   console.log(msgs);
// }
//
// demo().catch(console.error);
// -----------------------------------------------------------------------------
// End of file
// -----------------------------------------------------------------------------