import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

/**
 * Returns the static dark‑mode colour palette used by the front‑end.
 * This endpoint can be called by the client to bootstrap Tailwind
 * configuration without hard‑coding values in the UI.
 */
export const getThemeConfig = (_req: Request, res: Response) => {
  const config = {
    mode: 'dark',
    palette: {
      primary: '#6366f1',
      secondary: '#4b5563',
      accent: '#f59e0b',
      background: '#111827',
      surface: '#1f2937',
    },
    typography: 'Inter',
  };
  res.json(config);
};

/**
 * Retrieves the authenticated user's dark‑mode preference.
 * If the user has never set a preference, defaults to `true`
 * (dark mode enabled) to match the app's default styling.
 */
export const getUserTheme = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ darkMode: typeof user.darkMode === 'boolean' ? user.darkMode : true });
  } catch (err) {
    next(err);
  }
};

/**
 * Persists the authenticated user's dark‑mode preference.
 * Expects a JSON body: { darkMode: boolean }
 */
export const setUserTheme = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { darkMode } = req.body;

    if (typeof darkMode !== 'boolean') {
      return res.status(400).json({ message: 'darkMode must be a boolean' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userRepo = getRepository(User);
    await userRepo.update(userId, { darkMode });

    res.json({ darkMode });
  } catch (err) {
    next(err);
  }
};