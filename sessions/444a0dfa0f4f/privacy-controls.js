<PrivacySettings>
 */
export const updatePrivacySettings = [
  verifyAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as User).id;
      const updates: Partial<PrivacySettings> = req.body;

      // Validate incoming fields
      const allowedKeys = Object.keys(DEFAULT_SETTINGS);
      for (const key of Object.keys(updates)) {
        if (!allowedKeys.includes(key)) {
          return res
            .status(400)
            .json({ success: false, error: `Invalid setting: ${key}` });
        }
      }

      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { privacySettings: true },
      });

      const currentSettings: PrivacySettings = current?.privacySettings
        ? JSON.parse(decrypt(current.privacySettings))
        : DEFAULT_SETTINGS;

      const merged = { ...currentSettings, ...updates };
      const encrypted = encrypt(JSON.stringify(merged));

      await prisma.user.update({
        where: { id: userId },
        data: { privacySettings: encrypted },
      });

      res.json({ success: true, settings: merged });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * DELETE /privacy/data
 * Deletes all user data according to privacy settings.
 * - Removes chats, messages, attachments locally.
 * - Optionally triggers deletion on linked providers.
 */
export const deleteUserData = [
  verifyAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as User).id;

      // Fetch user settings to decide provider deletion behaviour
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { privacySettings: true },
      });
      const settings: PrivacySettings = user?.privacySettings
        ? JSON.parse(decrypt(user.privacySettings))
        : DEFAULT_SETTINGS;

      // Delete local data
      await prisma.attachment.deleteMany({ where: { chat: { userId } } });
      await prisma.message.deleteMany({ where: { chat: { userId } } });
      await prisma.chat.deleteMany({ where: { userId } });

      // If user opted to delete from providers, invoke provider APIs
      if (settings.deleteFromProviderOnRemoval) {
        const linkedProviders = await prisma.provider.findMany({
          where: { users: { some: { id: userId } } },
        });

        for (const provider of linkedProviders) {
          try {
            // Assume a generic provider SDK with a `revokeAccess` method
            const sdk = getProviderSdk(provider);
            await sdk.revokeAccess(userId);
          } catch (e) {
            // Log but continue with other providers
            console.warn(
              `Failed to revoke access for provider ${provider.name}:`,
              e,
            );
          }
        }
      }

      // Finally, wipe privacy settings (optional)
      await prisma.user.update({
        where: { id: userId },
        data: { privacySettings: null },
      });

      res.json({ success: true, message: 'All user data deleted.' });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * POST /privacy/provider/:providerId/revoke
 * Revokes access to a specific external provider without deleting local data.
 */
export const revokeProviderAccess = [
  verifyAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as User).id;
      const providerId = Number(req.params.providerId);

      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: { users: true },
      });

      if (!provider) {
        return res
          .status(404)
          .json({ success: false, error: 'Provider not found' });
      }

      const isLinked = provider.users.some((u) => u.id === userId);
      if (!isLinked) {
        return res
          .status(403)
          .json({ success: false, error: 'Provider not linked to user' });
      }

      // Call provider SDK to revoke token / permissions
      const sdk = getProviderSdk(provider);
      await sdk.revokeAccess(userId);

      // Disconnect relation in DB
      await prisma.provider.update({
        where: { id: providerId },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
      });

      res.json({
        success: true,
        message: `Access to ${provider.name} revoked.`,
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Helper: Resolve a provider SDK based on its type.
 * This is a stub – in a real implementation each provider would have its own module.
 */
function getProviderSdk(provider: Provider) {
  // Example stub implementation
  switch (provider.type) {
    case 'openai':
      return require('../providers/openai');
    case 'anthropic':
      return require('../providers/anthropic');
    // Add more providers as needed
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}

/**
 * Export router to be mounted in the main app.
 */
import { Router } from 'express';
const router = Router();

router.get('/', getPrivacySettings);
router.patch('/', updatePrivacySettings);
router.delete('/data', deleteUserData);
router.post('/provider/:providerId/revoke', revokeProviderAccess);

export default router;