<Chat[]> {
  return prisma.chat.findMany({
    where: { userId },
    include: {
      messages: {
        include: {
          attachments: true,
          tags: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Export chats as a JSON file.
 */
export async function exportChatsJSON(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = verifyJwt(req.headers.authorization);
    const chats = await getUserChats(userId);

    const exportPayload = chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      provider: chat.provider,
      tags: chat.tags?.map((t) => ({ id: t.id, name: t.name })) ?? [],
      messages: chat.messages?.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        tags: msg.tags?.map((t) => ({ id: t.id, name: t.name })) ?? [],
        attachments: msg.attachments?.map((a) => ({
          id: a.id,
          filename: a.filename,
          mimeType: a.mimeType,
          // Do NOT embed binary data in JSON export; provide a signed URL placeholder.
          url: `/api/attachments/${a.id}/download`,
        })) ?? [],
      })) ?? [],
    }));

    const filename = `chat-export-${new Date().toISOString()}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.send(JSON.stringify(exportPayload, null, 2));
  } catch (err) {
    next(err);
  }
}

/**
 * Generate a PDF representation of a single chat.
 */
async function generateChatPdf(chat: Chat): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .fillColor('#3b82f6')
      .text(chat.title ?? 'Untitled Chat', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#94a3b8')
      .text(`Provider: ${chat.provider}`, { align: 'center' })
      .text(`Created: ${chat.createdAt.toISOString()}`, { align: 'center' })
      .moveDown(1);

    // Tags
    if (chat.tags?.length) {
      doc
        .fontSize(12)
        .fillColor('#f59e0b')
        .text('Tags:', { underline: true })
        .moveDown(0.2);
      chat.tags.forEach((tag) => {
        doc.fontSize(10).fillColor('#f1f5f9').text(`- ${tag.name}`);
      });
      doc.moveDown(1);
    }

    // Messages
    chat.messages?.forEach((msg) => {
      const roleColor = msg.role === 'assistant' ? '#64748b' : '#3b82f6';
      doc
        .fontSize(12)
        .fillColor(roleColor)
        .text(`${msg.role.toUpperCase()}`, { underline: true })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .fillColor('#f1f5f9')
        .text(msg.content ?? '')
        .moveDown(0.2);

      // Message tags
      if (msg.tags?.length) {
        doc
          .fontSize(9)
          .fillColor('#f59e0b')
          .text(
            `Tags: ${msg.tags.map((t) => t.name).join(', ')}`,
            { indent: 20 }
          )
          .moveDown(0.2);
      }

      // Attachments placeholder
      if (msg.attachments?.length) {
        doc
          .fontSize(9)
          .fillColor('#64748b')
          .text(
            `Attachments: ${msg.attachments
              .map((a) => a.filename)
              .join(', ')}`,
            { indent: 20 }
          )
          .moveDown(0.2);
      }

      doc.moveDown(0.5);
    });

    doc.end();
  });
}

/**
 * Export all chats as a single PDF (one chat per page).
 */
export async function exportChatsPDF(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = verifyJwt(req.headers.authorization);
    const chats = await getUserChats(userId);

    // Create a PDF document that concatenates each chat.
    const doc = new PDFDocument({ autoFirstPage: false });
    const passThrough = new stream.PassThrough();

    // Pipe PDF to response stream
    pipeline(doc, passThrough).catch((e) => next(e));

    const filename = `chat-export-${new Date().toISOString()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    passThrough.pipe(res);

    for (const chat of chats) {
      doc.addPage();
      const chatBuffer = await generateChatPdf(chat);
      // Insert the generated page buffer into the main doc.
      // PDFKit does not support direct buffer insertion, so we render
      // the chat content directly instead of using generateChatPdf.
      // To keep the implementation simple, we render inline here:

      // Header
      doc
        .fontSize(20)
        .fillColor('#3b82f6')
        .text(chat.title ?? 'Untitled Chat', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor('#94a3b8')
        .text(`Provider: ${chat.provider}`, { align: 'center' })
        .text(`Created: ${chat.createdAt.toISOString()}`, { align: 'center' })
        .moveDown(1);

      // Tags
      if (chat.tags?.length) {
        doc
          .fontSize(12)
          .fillColor('#f59e0b')
          .text('Tags:', { underline: true })
          .moveDown(0.2);
        chat.tags.forEach((tag) => {
          doc.fontSize(10).fillColor('#f1f5f9').text(`- ${tag.name}`);
        });
        doc.moveDown(1);
      }

      // Messages
      chat.messages?.forEach((msg) => {
        const roleColor = msg.role === 'assistant' ? '#64748b' : '#3b82f6';
        doc
          .fontSize(12)
          .fillColor(roleColor)
          .text(`${msg.role.toUpperCase()}`, { underline: true })
          .moveDown(0.2);

        doc
          .fontSize(10)
          .fillColor('#f1f5f9')
          .text(msg.content ?? '')
          .moveDown(0.2);

        if (msg.tags?.length) {
          doc
            .fontSize(9)
            .fillColor('#f59e0b')
            .text(
              `Tags: ${msg.tags.map((t) => t.name).join(', ')}`,
              { indent: 20 }
            )
            .moveDown(0.2);
        }

        if (msg.attachments?.length) {
          doc
            .fontSize(9)
            .fillColor('#64748b')
            .text(
              `Attachments: ${msg.attachments
                .map((a) => a.filename)
                .join(', ')}`,
              { indent: 20 }
            )
            .moveDown(0.2);
        }

        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
}

/**
 * Route registration (to be used in your Express app)
 *
 * Example:
 *   import { Router } from 'express';
 *   import { exportChatsJSON, exportChatsPDF } from './controllers/exportController';
 *
 *   const router = Router();
 *   router.get('/export/json', exportChatsJSON);
 *   router.get('/export/pdf', exportChatsPDF);
 *   export default router;
 */