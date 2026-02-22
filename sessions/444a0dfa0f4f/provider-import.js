<ImportResult> {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider with id ${providerId} not found`);
    }

    const externalChats = await this.fetchProviderChats(provider);
    const result: ImportResult = {
      chatsCreated: 0,
      chatsUpdated: 0,
      messagesCreated: 0,
      messagesUpdated: 0,
      attachmentsCreated: 0,
      tagsCreated: 0,
    };

    for (const extChat of externalChats) {
      const { created, updated, messagesCreated, messagesUpdated, attachmentsCreated, tagsCreated } =
        await this.upsertChat(userId, provider.id, extChat);
      result.chatsCreated += created ? 1 : 0;
      result.chatsUpdated += updated ? 1 : 0;
      result.messagesCreated += messagesCreated;
      result.messagesUpdated += messagesUpdated;
      result.attachmentsCreated += attachmentsCreated;
      result.tagsCreated += tagsCreated;
    }

    return result;
  }

  /**
   * Calls the external provider API and normalises the response.
   * This method should be extended per provider type (e.g., OpenAI, Anthropic).
   */
  private async fetchProviderChats(provider: Provider): Promise<ProviderChat[]> {
    // Example generic implementation – assumes provider.apiUrl returns an array of chats
    const response = await axios.get(`${provider.apiUrl}/chats`, {
      headers: {
        Authorization: `Bearer ${provider.accessToken}`,
      },
    });

    // The shape of response.data must be transformed to ProviderChat[]
    // For now we assume it already matches.
    return response.data as ProviderChat[];
  }

  /**
   * Upserts a chat and its related entities.
   * Returns a summary of what was created/updated.
   */
  private async upsertChat(
    userId: string,
    providerId: string,
    extChat: ProviderChat,
  ): Promise<{
    created: boolean;
    updated: boolean;
    messagesCreated: number;
    messagesUpdated: number;
    attachmentsCreated: number;
    tagsCreated: number;
  }> {
    // Find existing chat by user + provider + externalId
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        userId,
        providerId,
        externalId: extChat.externalId,
      },
      include: {
        messages: true,
        tags: true,
      },
    });

    let chatId: string;
    let created = false;
    let updated = false;

    if (existingChat) {
      // Update mutable fields (title, timestamps)
      await this.prisma.chat.update({
        where: { id: existingChat.id },
        data: {
          title: extChat.title,
          updatedAt: new Date(extChat.updatedAt ?? extChat.createdAt),
        },
      });
      chatId = existingChat.id;
      updated = true;
    } else {
      const newChat = await this.prisma.chat.create({
        data: {
          id: uuidv4(),
          userId,
          providerId,
          externalId: extChat.externalId,
          title: extChat.title,
          createdAt: new Date(extChat.createdAt),
          updatedAt: new Date(extChat.updatedAt ?? extChat.createdAt),
        },
      });
      chatId = newChat.id;
      created = true;
    }

    // Upsert tags (if any)
    let tagsCreated = 0;
    if (extChat.tags && extChat.tags.length > 0) {
      for (const tagName of extChat.tags) {
        const existingTag = await this.prisma.tag.findFirst({
          where: { name: tagName, userId },
        });
        if (!existingTag) {
          await this.prisma.tag.create({
            data: {
              id: uuidv4(),
              userId,
              name: tagName,
            },
          });
          tagsCreated += 1;
        }
        // Link tag to chat (many‑to‑many)
        await this.prisma.chatTag.upsert({
          where: {
            chatId_tagId: {
              chatId,
              tagId: existingTag?.id ?? (await this.prisma.tag.findUnique({ where: { name_userId: { name: tagName, userId } } }))!.id,
            },
          },
          update: {},
          create: {
            chatId,
            tagId: existingTag?.id ?? (await this.prisma.tag.findUnique({ where: { name_userId: { name: tagName, userId } } }))!.id,
          },
        });
      }
    }

    // Process messages
    let messagesCreated = 0;
    let messagesUpdated = 0;
    let attachmentsCreated = 0;

    for (const extMsg of extChat.messages) {
      const existingMsg = await this.prisma.message.findFirst({
        where: {
          chatId,
          externalId: extMsg.externalId,
        },
        include: { attachments: true },
      });

      let messageId: string;
      if (existingMsg) {
        await this.prisma.message.update({
          where: { id: existingMsg.id },
          data: {
            role: extMsg.role,
            content: extMsg.content,
            createdAt: new Date(extMsg.createdAt),
          },
        });
        messageId = existingMsg.id;
        messagesUpdated += 1;
      } else {
        const newMsg = await this.prisma.message.create({
          data: {
            id: uuidv4(),
            chatId,
            externalId: extMsg.externalId,
            role: extMsg.role,
            content: extMsg.content,
            createdAt: new Date(extMsg.createdAt),
          },
        });
        messageId = newMsg.id;
        messagesCreated += 1;
      }

      // Attachments
      if (extMsg.attachments && extMsg.attachments.length > 0) {
        for (const extAtt of extMsg.attachments) {
          const exists = await this.prisma.attachment.findFirst({
            where: {
              messageId,
              url: extAtt.url,
            },
          });
          if (!exists) {
            await this.prisma.attachment.create({
              data: {
                id: uuidv4(),
                messageId,
                url: extAtt.url,
                filename: extAtt.filename,
                mimeType: extAtt.mimeType,
                size: extAtt.size,
              },
            });
            attachmentsCreated += 1;
          }
        }
      }
    }

    return {
      created,
      updated,
      messagesCreated,
      messagesUpdated,
      attachmentsCreated,
      tagsCreated,
    };
  }
}