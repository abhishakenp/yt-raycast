import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Model } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Middleware to ensure the user is authenticated.
 * Assumes JWT token is verified earlier and user ID is attached to req.userId.
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * GET /api/models
 * Returns a list of all active AI models that can be used for image generation.
 */
export const getAvailableModels = async (req: Request, res: Response) => {
  try {
    const models = await prisma.model.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to retrieve models' });
  }
};

/**
 * GET /api/models/me
 * Returns the currently selected model for the authenticated user.
 */
export const getUserPreferredModel = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId as string },
      select: {
        preferredModel: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
          },
        },
      },
    });

    if (!user?.preferredModel) {
      return res.status(404).json({ error: 'No preferred model set' });
    }

    res.json({ model: user.preferredModel });
  } catch (error) {
    console.error('Error fetching user preferred model:', error);
    res.status(500).json({ error: 'Failed to retrieve preferred model' });
  }
};

/**
 * POST /api/models/me
 * Sets the preferred model for the authenticated user.
 * Body: { modelId: string }
 */
export const setUserPreferredModel = [
  requireAuth,
  body('modelId').isUUID().withMessage('modelId must be a valid UUID'),

  async (req: Request, res: Response) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { modelId } = req.body as { modelId: string };

    try {
      // Verify the model exists and is active
      const model = await prisma.model.findFirst({
        where: { id: modelId, isActive: true },
      });

      if (!model) {
        return res.status(404).json({ error: 'Model not found or inactive' });
      }

      // Update user's preferred model
      await prisma.user.update({
        where: { id: req.userId as string },
        data: { preferredModelId: modelId },
      });

      res.json({ message: 'Preferred model updated', model: { id: model.id, name: model.name } });
    } catch (error) {
      console.error('Error setting preferred model:', error);
      res.status(500).json({ error: 'Failed to set preferred model' });
    }
  },
];

/**
 * Express router setup (to be imported in the main server file)
 */
import { Router } from 'express';
const router = Router();

router.get('/models', getAvailableModels);
router.get('/models/me', requireAuth, getUserPreferredModel);
router.post('/models/me', setUserPreferredModel);

export default router;