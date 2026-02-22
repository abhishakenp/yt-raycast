<string, any>
  ) {
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    // Update chat's updatedAt for ordering
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(chatId: string, skip = 0, take = 100) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    });
  }

  /** -------------------- TAG -------------------- */

  async addTagToChat(chatId: string, name: string, color?: string) {
    // Find or create tag
    let tag = await prisma.tag.findFirst({ where: { name, userId: undefined } });
    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          id: uuidv4(),
          name,
          color: color ?? '#f59e0b', // default amber accent
        },
      });
    }

    // Connect tag to chat
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
    });

    return tag;
  }

  async removeTagFromChat(chatId: string, tagId: string) {
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });
  }

  /** -------------------- ATTACHMENT -------------------- */

  async addAttachment(
    chatId: string,
    originalName: string,
    mimeType: string,
    buffer: Buffer
  ) {
    const attachmentsDir = path.resolve(process.cwd(), 'data', 'attachments');
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true });
    }

    const fileId = uuidv4();
    const ext = path.extname(originalName);
    const fileName = `${fileId}${ext}`;
    const filePath = path.join(attachmentsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        id: fileId,
        chatId,
        originalName,
        mimeType,
        filePath,
        size: buffer.length,
      },
    });

    return attachment;
  }

  async getAttachment(attachmentId: string) {
    return prisma.attachment.findUnique({ where: { id: attachmentId } });
  }

  async deleteAttachment(attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment) return;

    if (attachment.filePath && fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });
  }

  /** -------------------- PROVIDER (import‑only) -------------------- */

  async registerProvider(userId: string, name: string, apiKey: string) {
    // Provider data is stored locally; the actual API calls are performed elsewhere.
    return prisma.provider.create({
      data: {
        id: uuidv4(),
        userId,
        name,
        apiKey: Buffer.from(apiKey).toString('base64'), // simple obfuscation
      },
    });
  }

  async getProvider(providerId: string) {
    return prisma.provider.findUnique({ where: { id: providerId } });
  }

  /** -------------------- SEARCH & FILTER -------------------- */

  async searchChats(
    userId: string,
    query: string,
    tagIds?: string[]
  ): Promise<Chat[]> {
    const where: any = {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        {
          messages: {
            some: {
              content: { contains: query, mode: 'insensitive' },
            },
          },
        },
      ],
    };

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: { id: { in: tagIds } },
      };
    }

    return prisma.chat.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { tags: true },
    });
  }

  /** -------------------- EXPORT -------------------- */

  async exportChatAsJSON(chatId: string) {
    const chat = await this.getChatById(chatId);
    if (!chat) throw new Error('Chat not found');

    const exportObj = {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      provider: chat.provider?.name ?? null,
      tags: chat.tags?.map((t) => ({ id: t.id, name: t.name, color: t.color })) ?? [],
      messages: chat.messages?.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
      })) ?? [],
    };

    return JSON.stringify(exportObj, null, 2);
  }

  async exportChatAsMarkdown(chatId: string) {
    const chat = await this.getChatById(chatId);
    if (!chat) throw new Error('Chat not found');

    const lines: string[] = [];
    lines.push(`# ${chat.title}`);
    lines.push('');
    for (const msg of chat.messages ?? []) {
      const roleHeader = msg.role === 'assistant' ? '## Assistant' : '## User';
      lines.push(roleHeader);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
    }

    return lines.join('\n');
  }

  /** -------------------- CLEANUP -------------------- */

  async close() {
    await prisma.$disconnect();
  }
}

// Export a singleton for easy import throughout the project
export const localStorage = new LocalOnlyStorageService();