<Theme>;

  if (!name || !primaryColor || !secondaryColor || !backgroundColor) {
    return res.status(400).json({ error: 'Missing required theme fields.' });
  }

  try {
    // If isDefault is true, unset previous default
    if (isDefault) {
      await prisma.theme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const newTheme = await prisma.theme.create({
      data: {
        name,
        primaryColor,
        secondaryColor,
        backgroundColor,
        isDefault: !!isDefault,
      },
    });

    res.status(201).json({ message: 'Theme created.', theme: newTheme });
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme.' });
  }
});

/**
 * PUT /admin/themes/:themeId
 * Update an existing theme (admin only).
 * Body can contain any of the Theme fields.
 */
router.put('/admin/themes/:themeId', requireAdmin, async (req: Request, res: Response) => {
  const { themeId } = req.params;
  const data = req.body as Partial<Theme>;

  try {
    // If trying to set a new default, unset previous default first
    if (data.isDefault) {
      await prisma.theme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedTheme = await prisma.theme.update({
      where: { id: Number(themeId) },
      data,
    });

    res.json({ message: 'Theme updated.', theme: updatedTheme });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme.' });
  }
});

/**
 * DELETE /admin/themes/:themeId
 * Delete a theme (admin only).
 * Prevent deletion of the default theme.
 */
router.delete('/admin/themes/:themeId', requireAdmin, async (req: Request, res: Response) => {
  const { themeId } = req.params;

  try {
    const theme = await prisma.theme.findUnique({ where: { id: Number(themeId) } });
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found.' });
    }
    if (theme.isDefault) {
      return res.status(400).json({ error: 'Cannot delete the default theme.' });
    }

    await prisma.theme.delete({ where: { id: Number(themeId) } });
    res.json({ message: 'Theme deleted.' });
  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({ error: 'Failed to delete theme.' });
  }
});

export default router;