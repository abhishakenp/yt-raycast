<string, Chat>();
    chatRows.forEach(row => {
      const chat = this.mapChat(row);
      chatMap.set(chat.id, chat);
      results.push({ chat });
    });

    messageRows.forEach(row => {
      const msg = this.mapMessage(row);
      const chat = chatMap.get(msg.chatId) ?? this.getChatById(msg.chatId);
      if (chat) {
        results.push({ chat, message: msg });
      }
    });

    return results.slice(0, limit);
  }

  // ----- Export / Import -----
  exportData(): string {
    const data = {
      users: this.db.prepare(`SELECT * FROM users;`).all(),
      providers: this.db.prepare(`SELECT * FROM providers;`).all(),
      chats: this.db.prepare(`SELECT * FROM chats;`).all(),
      messages: this.db.prepare(`SELECT * FROM messages;`).all(),
      tags: this.db.prepare(`SELECT * FROM tags;`).all(),
      chatTags: this.db.prepare(`SELECT * FROM chat_tags;`).all(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string) {
    const data = JSON.parse(jsonString);
    const insert = this.db.transaction(() => {
      const insertUser = this.db.prepare(
        `INSERT OR REPLACE INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?);`
      );
      data.users.forEach((u: any) => {
        insertUser.run(u.id, u.email, u.name, u.created_at);
      });

      const insertProvider = this.db.prepare(
        `INSERT OR REPLACE INTO providers (id, name, config, created_at) VALUES (?, ?, ?, ?);`
      );
      data.providers.forEach((p: any) => {
        insertProvider.run(p.id, p.name, p.config, p.created_at);
      });

      const insertChat = this.db.prepare(
        `INSERT OR REPLACE INTO chats (id, user_id, provider_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);`
      );
      data.chats.forEach((c: any) => {
        insertChat.run(
          c.id,
          c.user_id,
          c.provider_id,
          c.title,
          c.created_at,
          c.updated_at
        );
      });

      const insertMessage = this.db.prepare(
        `INSERT OR REPLACE INTO messages (id, chat_id, role, content, metadata, attachment_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);`
      );
      data.messages.forEach((m: any) => {
        insertMessage.run(
          m.id,
          m.chat_id,
          m.role,
          m.content,
          m.metadata,
          m.attachment_path,
          m.created_at
        );
      });

      const insertTag = this.db.prepare(
        `INSERT OR REPLACE INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?);`
      );
      data.tags.forEach((t: any) => {
        insertTag.run(t.id, t.name, t.color, t.created_at);
      });

      const insertChatTag = this.db.prepare(
        `INSERT OR REPLACE INTO chat_tags (chat_id, tag_id) VALUES (?, ?);`
      );
      data.chatTags.forEach((ct: any) => {
        insertChatTag.run(ct.chat_id, ct.tag_id);
      });
    });

    insert();
  }

  // ----- Remote purge workflow (local placeholder) -----
  /**
   * In a pure local‑only mode, remote purge is a no‑op.
   * This method exists to keep the API consistent.
   */
  async purgeRemoteData(_: string): Promise<void> {
    // No remote storage, nothing to purge.
    return;
  }

  // ----- Attachment handling -----
  /**
   * Store an attachment buffer locally and return its path.
   * Attachments are saved under ./data/attachments/<chatId>/<messageId>_<originalName>
   */
  storeAttachment(
    chatId: string,
    messageId: string,
    originalName: string,
    buffer: Buffer
  ): string {
    const dir = resolve(`./data/attachments/${chatId}`);
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${dir}/${messageId}_${safeName}`;
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  // ----- Cleanup -----
  close() {
    this.db.close();
  }
}