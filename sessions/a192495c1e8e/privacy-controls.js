<PrivacySettings>;

    const updateData: Partial<User> = {};
    if (typeof allowProviderSync === 'boolean')
      updateData.allowProviderSync = allowProviderSync;
    if (typeof autoDeleteAfterExport === 'boolean')
      updateData.autoDeleteAfterExport = autoDeleteAfterExport;
    if (dataRetentionDays !== undefined)
      updateData.dataRetentionDays = dataRetentionDays;
    if (typeof deleteFromProviderAfterArchive === 'boolean')
      updateData.deleteFromProviderAfterArchive = deleteFromProviderAfterArchive;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        allowProviderSync: true,
        autoDeleteAfterExport: true,
        dataRetentionDays: true,
        deleteFromProviderAfterArchive: true,
      },
    });

    const settings: PrivacySettings = {
      allowProviderSync: updatedUser.allowProviderSync,
      autoDeleteAfterExport: updatedUser.autoDeleteAfterExport,
      dataRetentionDays: updatedUser.dataRetentionDays,
      deleteFromProviderAfterArchive: updatedUser.deleteFromProviderAfterArchive,
    };

    res.json({ settings });
  }
);

// POST request full data deletion (GDPR right to be forgotten)
router.post(
  '/delete-account',
  authenticate,
  async (req: Request, res: Response) => {
    const userId = (req.user as User).id;

    // Delete all related data in a transaction
    await prisma.$transaction([
      prisma.attachment.deleteMany({ where: { userId } }),
      prisma.message.deleteMany({ where: { userId } }),
      prisma.chat.deleteMany({ where: { userId } }),
      prisma.tag.deleteMany({ where: { userId } }),
      prisma.provider.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Invalidate session / token (implementation depends on auth strategy)
    // For JWT based auth, client should discard token. Here we just respond.
    res.status(204).send();
  }
);

// POST delete data from a specific provider after archiving
router.post(
  '/delete-provider/:providerId',
  authenticate,
  async (req: Request, res: Response) => {
    const userId = (req.user as User).id;
    const providerId = parseInt(req.params.providerId, 10);

    // Verify provider belongs to user
    const provider = await prisma.provider.findFirst({
      where: { id: providerId, userId },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Find chats linked to this provider that have been archived
    const chats = await prisma.chat.findMany({
      where: {
        userId,
        providerId,
        archivedAt: { not: null },
      },
      select: { id: true },
    });

    const chatIds = chats.map((c) => c.id);

    // Delete messages from the external provider via its API.
    // This is a placeholder – actual implementation depends on provider SDK.
    try {
      // Example: await externalProviderApi.deleteMessages(provider, chatIds);
    } catch (err) {
      console.error('Failed to delete from provider', err);
      return res.status(502).json({ error: 'Failed to communicate with provider' });
    }

    // Optionally, mark provider data as deleted locally
    await prisma.provider.update({
      where: { id: providerId },
      data: { dataDeletedAt: new Date() },
    });

    res.json({ deletedProviderId: providerId, affectedChats: chatIds.length });
  }
);

export default router;