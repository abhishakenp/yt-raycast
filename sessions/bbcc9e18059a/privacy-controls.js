<PrivacySettings> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        incrementalSync: true,
        retainData: true,
        analyticsConsent: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      incrementalSync: user.incrementalSync,
      retainData: user.retainData,
      analyticsConsent: user.analyticsConsent,
    };
  }

  /**
   * Updates the privacy settings for the given user.
   */
  static async updateSettings(userId: string, updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        incrementalSync: true,
        retainData: true,
        analyticsConsent: true,
      },
    });

    return {
      incrementalSync: updated.incrementalSync,
      retainData: updated.retainData,
      analyticsConsent: updated.analyticsConsent,
    };
  }

  /**
   * Generates a data export (JSON + optional HTML) for the user.
   * Returns a temporary file path that can be streamed to the client.
   */
  static async exportData(userId: string, format: 'json' | 'html'): Promise<string> {
    // Gather all user‑related data
    const [threads, messages, tags, attachments] = await Promise.all([
      prisma.chatThread.findMany({ where: { userId } }),
      prisma.message.findMany({ where: { userId } }),
      prisma.tag.findMany({ where: { userId } }),
      prisma.attachment.findMany({ where: { userId } }),
    ]);

    const exportPayload = {
      userId,
      exportedAt: new Date().toISOString(),
      threads,
      messages,
      tags,
      attachments,
    };

    const exportId = uuidv4();
    const exportPath = join(__dirname, '..', '..', 'tmp', `${exportId}.${format}`);

    if (format === 'json') {
      await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(exportPath);
        ws.write(JSON.stringify(exportPayload, null, 2));
        ws.end(() => resolve());
        ws.on('error', reject);
      });
    } else {
      // Very simple HTML rendering – can be expanded later
      const html = `
        <html>
          <head><title>Chat Collector Export</title></head>
          <body>
            <h1>Export for User ${userId}</h1>
            <pre>${JSON.stringify(exportPayload, null, 2)}</pre>
          </body>
        </html>`;
      await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(exportPath);
        ws.write(html);
        ws.end(() => resolve());
        ws.on('error', reject);
      });
    }

    return exportPath;
  }

  /**
   * Deletes the user account and all associated data.
   */
  static async deleteAccount(userId: string): Promise<void> {
    // Delete provider tokens first to avoid FK issues
    await prisma.provider.deleteMany({ where: { userId } });

    // Delete everything else in cascade (assuming DB cascade rules)
    await prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Revokes access to a specific provider and optionally deletes data fetched from it.
   */
  static async revokeProvider(userId: string, providerId: string, deleteProviderData: boolean): Promise<void> {
    const provider = await prisma.provider.findFirst({
      where: { id: providerId, userId },
    });

    if (!provider) {
      throw new Error('Provider not found or not owned by user');
    }

    // Delete the stored OAuth/API token
    await prisma.provider.delete({ where: { id: provider.id } });

    if (deleteProviderData) {
      // Remove messages/threads that originated from this provider
      await prisma.message.deleteMany({
        where: {
          userId,
          providerId: provider.id,
        },
      });
      await prisma.chatThread.deleteMany({
        where: {
          userId,
          providerId: provider.id,
        },
      });
    }
  }
}

/**
 * Express controller exposing privacy‑related endpoints.
 */
export const privacyController = {
  /**
   * GET /privacy/settings
   */
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const settings = await PrivacyService.getSettings(user.id);
      res.json({ success: true, settings });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /privacy/settings
   */
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const updates: Partial<PrivacySettings> = req.body;
      const settings = await PrivacyService.updateSettings(user.id, updates);
      res.json({ success: true, settings });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /privacy/export
   * Body: { format: 'json' | 'html' }
   */
  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const format = req.body.format === 'html' ? 'html' : 'json';
      const filePath = await PrivacyService.exportData(user.id, format);

      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="chat-collector-export.${format}"`);

      const stream = createWriteStream(filePath);
      stream.on('finish', () => {
        // Cleanup temporary file after sending
        unlink(filePath, () => {});
      });

      // Pipe the file to response
      const readStream = require('fs').createReadStream(filePath);
      readStream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /privacy/account
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      await PrivacyService.deleteAccount(user.id);
      // Invalidate session / JWT on the client side
      res.json({ success: true, message: 'Account and all data deleted.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /privacy/revoke-provider
   * Body: { providerId: string, deleteProviderData?: boolean }
   */
  async revokeProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { providerId, deleteProviderData = false } = req.body;
      await PrivacyService.revokeProvider(user.id, providerId, deleteProviderData);
      res.json({ success: true, message: 'Provider access revoked.' });
    } catch (err) {
      next(err);
    }
  },
};

/**
 * Helper to attach routes to an Express router.
 * Usage:
 *   import { router as privacyRouter } from './privacyRoutes';
 *   app.use('/privacy', privacyRouter);
 */
import { Router } from 'express';
export const router = Router();

router.get('/settings', privacyController.getSettings);
router.patch('/settings', privacyController.updateSettings);
router.post('/export', privacyController.exportData);
router.delete('/account', privacyController.deleteAccount);
router.post('/revoke-provider', privacyController.revokeProvider);

export default router;