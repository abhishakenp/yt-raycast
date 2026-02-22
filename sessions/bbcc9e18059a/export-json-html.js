</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtmlExport(data: ExportPayload): string {
  const style = `
    body { font-family: Inter, sans-serif; background:#1f2937; color:#f9fafb; line-height:1.6; padding:2rem; }
    h1, h2, h3 { color:#3b82f6; }
    .thread { margin-bottom:2rem; padding:1rem; background:#111827; border-radius:0.5rem; box-shadow:0 2px 4px rgba(0,0,0,0.5); }
    .message { margin:0.5rem 0; padding:0.5rem; background:#1e293b; border-left:4px solid #3b82f6; border-radius:0.25rem; }
    .meta { font-size:0.85rem; color:#9ca3af; }
    a { color:#f59e0b; }
  `;

  const htmlThreads = data.threads
    .map(
      (thread) => `
    <section class="thread">
      <h2>${escapeHtml(thread.title || 'Untitled Thread')}</h2>
      <p class="meta">Created: ${new Date(thread.createdAt).toLocaleString()}</p>
      ${thread.messages
        .map(
          (msg) => `
        <div class="message">
          <p class="meta"><strong>${escapeHtml(msg.role)}</strong> • ${new Date(
            msg.createdAt
          ).toLocaleString()}</p>
          <p>${escapeHtml(msg.content)}</p>
          ${msg.attachments?.length
            ? `<p>Attachments: ${msg.attachments
                .map((a) => `<a href="${escapeHtml(a.url)}" target="_blank">${escapeHtml(a.filename)}</a>`)
                .join(', ')}</p>`
            : ''}
        </div>
      `
        )
        .join('')}
      ${thread.tags?.length ? `<p>Tags: ${thread.tags.map((t) => escapeHtml(t.name)).join(', ')}</p>` : ''}
    </section>
  `
    )
    .join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Chat Export</title>
      <style>${style}</style>
    </head>
    <body>
      <h1>Chat Export for ${escapeHtml(data.user?.email ?? 'Anonymous')}</h1>
      ${htmlThreads}
    </body>
    </html>
  `;
}

// ---------- Types ----------
interface ExportPayload {
  user?: { id: string; email: string };
  threads: (ChatThread & {
    messages: (Message & {
      attachments?: Attachment[];
    })[];
    tags?: Tag[];
  })[];
}

// ---------- Controller ----------
export const exportData = async (req: Request, res: Response) => {
  const format = (req.query.format as string) ?? 'json';
  const threadId = req.query.threadId as string | undefined;
  const userId = (req as any).userId as string | undefined;

  // Build base query
  const threadWhere = threadId ? { id: threadId } : {};
  const userWhere = userId ? { userId } : {};

  try {
    const threads = await prisma.chatThread.findMany({
      where: { ...threadWhere, ...userWhere },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
        tags: true,
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const payload: ExportPayload = {
      user: userId
        ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } })
        : undefined,
      threads,
    };

    if (format === 'html') {
      const html = buildHtmlExport(payload);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="chat-export-${Date.now()}.html"`);
      return res.send(html);
    }

    // Default JSON export
    const json = JSON.stringify(payload, null, 2);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="chat-export-${Date.now()}.json"`);
    return res.send(json);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
};

// ---------- Route registration (example) ----------
import express from 'express';
const router = express.Router();

router.get('/export', optionalAuth, exportData);

export default router;