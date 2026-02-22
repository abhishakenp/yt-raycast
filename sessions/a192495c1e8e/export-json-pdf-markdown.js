<Chat & {
  messages: (Message & { tags: Tag[]; attachments: Attachment[] })[];
}> {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          tags: true,
          attachments: true,
        },
      },
    },
  });

  if (!chat) {
    throw new Error('Chat not found or access denied');
  }

  return chat as any;
}

/**
 * Export as JSON
 */
function exportAsJSON(chat: any): Buffer {
  // Remove Prisma internal fields if needed
  const clean = JSON.stringify(chat, null, 2);
  return Buffer.from(clean, 'utf-8');
}

/**
 * Export as Markdown
 */
function exportAsMarkdown(chat: any): Buffer {
  const lines: string[] = [];

  lines.push(`# Chat Export – ${chat.title || 'Untitled'}`);
  lines.push(`*Created at:* ${chat.createdAt.toISOString()}`);
  lines.push(`*Provider:* ${chat.provider}`);
  lines.push('\n---\n');

  for (const msg of chat.messages) {
    const role = msg.role?.toUpperCase() || 'UNKNOWN';
    const timestamp = msg.createdAt.toISOString();
    lines.push(`## ${role} – ${timestamp}`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');

    if (msg.tags?.length) {
      const tagList = msg.tags.map((t: Tag) => `\`${t.name}\``).join(' ');
      lines.push(`**Tags:** ${tagList}`);
      lines.push('');
    }

    if (msg.attachments?.length) {
      lines.push('**Attachments:**');
      for (const att of msg.attachments) {
        lines.push(`- ${att.filename} (${att.mimeType}, ${att.size} bytes)`);
      }
      lines.push('');
    }

    lines.push('---\n');
  }

  return Buffer.from(lines.join('\n'), 'utf-8');
}

/**
 * Export as PDF using pdfkit
 */
function exportAsPDF(chat: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(`Chat Export – ${chat.title || 'Untitled'}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Created at: ${chat.createdAt.toISOString()}`);
    doc.text(`Provider: ${chat.provider}`);
    doc.moveDown();

    // Messages
    for (const msg of chat.messages) {
      const role = msg.role?.toUpperCase() || 'UNKNOWN';
      const timestamp = msg.createdAt.toISOString();

      doc.fontSize(12).fillColor('#0066CC').text(`${role} – ${timestamp}`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#000000').text(msg.content);
      doc.moveDown(0.5);

      if (msg.tags?.length) {
        const tagStr = msg.tags.map((t: Tag) => `#${t.name}`).join(' ');
        doc.fontSize(10).fillColor('#555555').text(`Tags: ${tagStr}`);
        doc.moveDown(0.5);
      }

      if (msg.attachments?.length) {
        doc.fontSize(10).fillColor('#555555').text('Attachments:');
        for (const att of msg.attachments) {
          doc.text(`- ${att.filename} (${att.mimeType}, ${att.size} bytes)`);
        }
        doc.moveDown(0.5);
      }

      doc.moveDown();
      doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#CCCCCC').stroke();
      doc.moveDown();
    }

    doc.end();
  });
}

/**
 * Route: GET /api/chats/:id/export?format=json|pdf|md
 */
router.get(
  '/:id/export',
  verifyAuth,
  async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const format = (req.query.format as string)?.toLowerCase() || 'json';
    const userId = (req as any).user.id; // set by verifyAuth

    try {
      const chat = await getChatWithRelations(chatId, userId);

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      switch (format) {
        case 'pdf':
          buffer = await exportAsPDF(chat);
          filename = `${chat.title || 'chat'}_${chat.id}.pdf`;
          contentType = 'application/pdf';
          break;
        case 'md':
        case 'markdown':
          buffer = exportAsMarkdown(chat);
          filename = `${chat.title || 'chat'}_${chat.id}.md`;
          contentType = 'text/markdown';
          break;
        case 'json':
        default:
          buffer = exportAsJSON(chat);
          filename = `${chat.title || 'chat'}_${chat.id}.json`;
          contentType = 'application/json';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err: any) {
      console.error('Export error:', err);
      res.status(404).json({ error: err.message || 'Chat not found' });
    }
  }
);

export default router;