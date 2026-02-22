import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, PricingPlan } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to validate request body for creating/updating a pricing plan
 */
const validatePricingPlan = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non‑negative number'),
  body('currency')
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3‑letter ISO code'),
  body('features')
    .isArray({ min: 1 })
    .withMessage('Features must be a non‑empty array of strings')
    .custom((arr) => arr.every((f: any) => typeof f === 'string'))
    .withMessage('Each feature must be a string'),
  body('stripePlanId')
    .optional()
    .isString()
    .withMessage('stripePlanId must be a string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * GET /api/pricing
 * Public endpoint – returns all active pricing plans
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/pricing/:id
 * Public endpoint – returns a single pricing plan by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const plan = await prisma.pricingPlan.findUnique({
      where: { id: Number(id) },
    });
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error(`Failed to fetch pricing plan ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/pricing
 * Admin only – create a new pricing plan
 */
router.post(
  '/',
  // TODO: replace with real admin auth middleware
  (req, res, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
  validatePricingPlan,
  async (req: Request, res: Response) => {
    const { name, price, currency, features, stripePlanId } = req.body;
    try {
      const newPlan = await prisma.pricingPlan.create({
        data: {
          name,
          price: Number(price),
          currency,
          features,
          stripePlanId,
          isActive: true,
        },
      });
      res.status(201).json(newPlan);
    } catch (error) {
      console.error('Failed to create pricing plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PATCH /api/pricing/:id
 * Admin only – update an existing pricing plan
 */
router.patch(
  '/:id',
  // TODO: replace with real admin auth middleware
  (req, res, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
  validatePricingPlan,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, price, currency, features, stripePlanId, isActive } = req.body;
    try {
      const updatedPlan = await prisma.pricingPlan.update({
        where: { id: Number(id) },
        data: {
          name,
          price: price !== undefined ? Number(price) : undefined,
          currency,
          features,
          stripePlanId,
          isActive,
        },
      });
      res.json(updatedPlan);
    } catch (error) {
      console.error(`Failed to update pricing plan ${id}:`, error);
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/pricing/:id
 * Admin only – soft delete a pricing plan (set isActive = false)
 */
router.delete(
  '/:id',
  // TODO: replace with real admin auth middleware
  (req, res, next) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const plan = await prisma.pricingPlan.update({
        where: { id: Number(id) },
        data: { isActive: false },
      });
      res.json({ message: 'Pricing plan deactivated', plan });
    } catch (error) {
      console.error(`Failed to deactivate pricing plan ${id}:`, error);
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Pricing plan not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Middleware to attach the user's current pricing plan to req.userPlan
 * Assumes req.user.id is populated by authentication middleware
 */
export const attachUserPlan = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    return next();
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { pricingPlanId: true },
    });
    if (user?.pricingPlanId) {
      const plan = await prisma.pricingPlan.findUnique({
        where: { id: user.pricingPlanId },
      });
      req.userPlan = plan || null;
    } else {
      req.userPlan = null;
    }
    next();
  } catch (error) {
    console.error('Failed to attach user pricing plan:', error);
    next(error);
  }
};

export default router;