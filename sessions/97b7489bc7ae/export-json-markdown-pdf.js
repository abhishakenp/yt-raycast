<Chat & {
  messages: (Message & { attachments: Attachment[] })[];
  tags: Tag[];
}> {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { attachments: true },
      },
      tags: true,
    },
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  return chat as any;
}

/**
 * Convert chat data to JSON string.
 */
function chatToJSON(chat: any): string {
  return JSON.stringify(chat, null, 2);
}

/**
 * Convert chat data to Markdown.
 */
function chatToMarkdown(chat: any): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Chat Export`);
  lines.push(`**Chat ID:** ${chat.id}`);
  lines.push(`**Created At:** ${chat.createdAt.toISOString()}`);
  if (chat.title) lines.push(`**Title:** ${chat.title}`);
  if (chat.tags?.length) {
    const tagList = chat.tags.map((t: Tag) => t.name).join(', ');
    lines.push(`**Tags:** ${tagList}`);
  }
  lines.push('\n---\n');

  // Messages
  for (const msg of chat.messages) {
    const role = msg.role?.toUpperCase() ?? 'UNKNOWN';
    const timestamp = msg.createdAt.toISOString();
    lines.push(`**${role}** \`${timestamp}\``);
    lines.push('');
    lines.push(msg.content);
    lines.push('');

    if (msg.attachments?.length) {
      lines.push('**Attachments:**');
      for (const att of msg.attachments) {
        lines.push(`- ${att.filename} (${att.mimeType}, ${att.size} bytes)`);
      }
      lines.push('');
    }

    lines.push('---\n');
  }

  return lines.join('\n');
}

/**
 * Convert chat data to PDF buffer.
 */
function chatToPDFBuffer(chat: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(20).fillColor('#3b82f6').text('Chat Export', { align: 'center' });
    doc.moveDown();

    // Meta
    doc.fontSize(12).fillColor('#6b7280');
    doc.text(`Chat ID: ${chat.id}`);
    doc.text(`Created At: ${chat.createdAt.toISOString()}`);
    if (chat.title) doc.text(`Title: ${chat.title}`);
    if (chat.tags?.length) {
      const tagList = chat.tags.map((t: Tag) => t.name).join(', ');
      doc.text(`Tags: ${tagList}`);
    }
    doc.moveDown();

    // Divider
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#4b5563');
    doc.moveDown();

    // Messages
    for (const msg of chat.messages) {
      const role = msg.role?.toUpperCase() ?? 'UNKNOWN';
      const timestamp = msg.createdAt.toISOString();

      doc.fillColor('#f59e0b').fontSize(12).text(`${role} – ${timestamp}`, { underline: true });
      doc.moveDown(0.5);
      doc.fillColor('#e5e7eb').fontSize(11).text(msg.content);
      doc.moveDown(0.5);

      if (msg.attachments?.length) {
        doc.fillColor('#6b7280').fontSize(10).text('Attachments:');
        for (const att of msg.attachments) {
          doc.text(`- ${att.filename} (${att.mimeType}, ${att.size} bytes)`, { indent: 20 });
        }
        doc.moveDown(0.5);
      }

      // Divider between messages
      doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#374151');
      doc.moveDown();
    }

    doc.end();
  });
}

/**
 * Middleware to handle async errors.
 */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * GET /export/:chatId
 * Query param: format=json|md|pdf (default json)
 */
router.get(
  '/export/:chatId',
  asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const format = (req.query.format as string)?.toLowerCase() ?? 'json';

    const chat = await getChatFull(chatId);

    switch (format) {
      case 'json': {
        const json = chatToJSON(chat);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.json"`);
        res.send(json);
        break;
      }
      case 'md':
      case 'markdown': {
        const md = chatToMarkdown(chat);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.md"`);
        res.send(md);
        break;
      }
      case 'pdf': {
        const buffer = await chatToPDFBuffer(chat);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.pdf"`);
        res.send(buffer);
        break;
      }
      default:
        res.status(400).json({ error: 'Invalid format. Supported: json, md, pdf' });
    }
  })
);

export default router;