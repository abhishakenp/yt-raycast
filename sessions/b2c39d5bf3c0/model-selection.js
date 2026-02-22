import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Model as PrismaModel } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to handle validation results
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * GET /models
 * List all available AI models that can be used for image generation.
 * Returns a compact representation (id, name, description, isActive).
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const models = await prisma.model.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          version: true,
          provider: true,
        },
        orderBy: { name: 'asc' },
      });
      res.json(models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      res.status(500).json({ error: 'Unable to retrieve models' });
    }
  }
);

/**
 * GET /models/:id
 * Retrieve detailed information about a single model.
 */
router.get(
  '/:id',
  param('id').isInt({ gt: 0 }).withMessage('Model ID must be a positive integer'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const modelId = Number(req.params.id);
    try {
      const model = await prisma.model.findUnique({
        where: { id: modelId },
      });
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }
      res.json(model);
    } catch (error) {
      console.error(`Failed to fetch model ${modelId}:`, error);
      res.status(500).json({ error: 'Unable to retrieve model' });
    }
  }
);

/**
 * POST /models/:id/select
 * Set the chosen model as the default for the authenticated user.
 * Body: { promptId?: number } – optional prompt to associate the model with immediately.
 */
router.post(
  '/:id/select',
  param('id').isInt({ gt: 0 }).withMessage('Model ID must be a positive integer'),
  body('promptId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Prompt ID must be a positive integer'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id; // Assume auth middleware attaches user
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const modelId = Number(req.params.id);
    const { promptId } = req.body;

    try {
      // Verify model exists and is active
      const model = await prisma.model.findFirst({
        where: { id: modelId, isActive: true },
      });
      if (!model) {
        return res.status(404).json({ error: 'Model not found or inactive' });
      }

      // Update user's default model
      await prisma.user.update({
        where: { id: userId },
        data: { defaultModelId: modelId },
      });

      // If a promptId is supplied, associate the model with that prompt
      if (promptId) {
        const prompt = await prisma.prompt.findFirst({
          where: { id: promptId, userId },
        });
        if (!prompt) {
          return res.status(404).json({ error: 'Prompt not found for this user' });
        }
        await prisma.prompt.update({
          where: { id: promptId },
          data: { modelId },
        });
      }

      res.json({ message: 'Model selected successfully', modelId });
    } catch (error) {
      console.error(`Failed to select model ${modelId} for user ${userId}:`, error);
      res.status(500).json({ error: 'Unable to select model' });
    }
  }
);

/**
 * GET /models/user
 * Retrieve the currently selected/default model for the authenticated user.
 */
router.get(
  '/user',
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultModelId: true },
      });
      if (!user?.defaultModelId) {
        return res.status(404).json({ error: 'No default model set for user' });
      }

      const model = await prisma.model.findUnique({
        where: { id: user.defaultModelId },
      });

      if (!model) {
        return res.status(404).json({ error: 'Default model not found' });
      }

      res.json(model);
    } catch (error) {
      console.error(`Failed to fetch default model for user ${userId}:`, error);
      res.status(500).json({ error: 'Unable to retrieve default model' });
    }
  }
);

export default router;