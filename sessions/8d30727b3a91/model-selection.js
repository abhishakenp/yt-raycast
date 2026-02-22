import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Model, User } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /models
 * Retrieve a list of available AI models for image generation.
 * Returns an array of models with id, name, description, and thumbnailUrl.
 */
router.get(
  '/models',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const models: Model[] = await prisma.model.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          thumbnailUrl: true,
        },
        orderBy: { name: 'asc' },
      });
      res.json({ models });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /users/:userId/select-model
 * Set the currently active model for a user.
 * Body: { modelId: string }
 */
router.post(
  '/users/:userId/select-model',
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { modelId } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: 'modelId is required' });
    }

    try {
      // Verify that the model exists
      const model = await prisma.model.findUnique({
        where: { id: modelId },
      });
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      // Verify that the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user's selectedModelId
      const updatedUser: User = await prisma.user.update({
        where: { id: userId },
        data: { selectedModelId: modelId },
        select: {
          id: true,
          email: true,
          selectedModelId: true,
        },
      });

      res.json({
        message: 'Model selection updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /users/:userId/selected-model
 * Retrieve the model currently selected by the user.
 */
router.get(
  '/users/:userId/selected-model',
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          selectedModelId: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.selectedModelId) {
        return res
          .status(200)
          .json({ message: 'No model selected', model: null });
      }

      const model = await prisma.model.findUnique({
        where: { id: user.selectedModelId },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnailUrl: true,
        },
      });

      res.json({ model });
    } catch (error) {
      next(error);
    }
  }
);

export default router;