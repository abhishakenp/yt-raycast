<void> => {
  await AppDataSource.initialize();
  console.log("🔌 SQLite database initialized at", AppDataSource.options.database);
};

/**
 * Example CRUD utilities – can be expanded per‑entity.
 */
export const UserRepository = AppDataSource.getRepository(User);
export const ProviderRepository = AppDataSource.getRepository(Provider);
export const ThreadRepository = AppDataSource.getRepository(ChatThread);
export const MessageRepository = AppDataSource.getRepository(Message);
export const AttachmentRepository = AppDataSource.getRepository(Attachment);

/**
 * -------------------------------------------------
 *  Exported service functions (local‑only)
 * -------------------------------------------------
 */

export const createUser = async (email: string, passwordHash: string): Promise<User> => {
  const user = UserRepository.create({ email, passwordHash });
  return await UserRepository.save(user);
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await UserRepository.findOneBy({ email });
};

export const createProvider = async (name: string, apiKey?: string): Promise<Provider> => {
  const provider = ProviderRepository.create({ name });
  if (apiKey) provider.apiKey = apiKey;
  return await ProviderRepository.save(provider);
};

export const createThread = async (
  ownerId: string,
  title: string,
  providerId?: string
): Promise<ChatThread> => {
  const owner = await UserRepository.findOneByOrFail({ id: ownerId });
  const thread = ThreadRepository.create({
    title,
    owner,
    provider: providerId ? await ProviderRepository.findOneByOrFail({ id: providerId }) : undefined,
  });
  return await ThreadRepository.save(thread);
};

export const addMessage = async (
  threadId: string,
  role: "user" | "assistant" | "system",
  content: string,
  attachments?: { filename: string; mimeType: string; size: number; path: string }[]
): Promise<Message> => {
  const thread = await ThreadRepository.findOneByOrFail({ id: threadId });
  const message = MessageRepository.create({
    thread,
    role,
    content,
    timestamp: new Date(),
  });

  if (attachments && attachments.length > 0) {
    message.attachments = attachments.map((att) => {
      const a = AttachmentRepository.create({
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
      });
      a.path = att.path; // encrypted automatically
      return a;
    });
  }

  return await MessageRepository.save(message);
};

/**
 * -------------------------------------------------
 *  Graceful shutdown helper
 * -------------------------------------------------
 */
export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log("🛑 SQLite connection closed");
  }
};

/**
 * -------------------------------------------------
 *  Example usage (remove in production)
 * -------------------------------------------------
 */
if (require.main === module) {
  (async () => {
    await initDatabase();

    // Demo: create a user, provider, thread and a message
    const user = await createUser("alice@example.com", "$2b$10$examplehash");
    const provider = await createProvider("OpenAI", "sk-very-secret-key");
    const thread = await createThread(user.id, "My first chat", provider.id);
    await addMessage(thread.id, "user", "Hello, AI!", [
      {
        filename: "screenshot.png",
        mimeType: "image/png",
        size: 124578,
        path: "/absolute/path/to/screenshot.png",
      },
    ]);

    console.log("✅ Demo data created");
    await closeDatabase();
  })().catch((e) => {
    console.error("❌ Error during demo:", e);
    process.exit(1);
  });
}