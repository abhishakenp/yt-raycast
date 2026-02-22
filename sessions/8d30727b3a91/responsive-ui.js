import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Model, GeneratedImage, PricingPlan, User } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to protect routes and attach the authenticated user to the request.
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Helper to parse pagination query parameters with sane defaults.
 */
const parsePagination = (req: Request) => {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * GET /api/models
 * Returns a paginated list of available AI models.
 * Supports optional search (`q`) and sorting (`sortBy`, `order`).
 */
router.get("/models", async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req);
  const search = (req.query.q as string) ?? "";
  const sortBy = (req.query.sortBy as string) ?? "createdAt";
  const order = (req.query.order as string) === "desc" ? "desc" : "asc";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, models] = await Promise.all([
    prisma.model.count({ where }),
    prisma.model.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
  ]);

  res.json({
    data: models,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/gallery
 * Returns a paginated list of generated images.
 * If the user is authenticated, they only see their own images unless `public=true` is passed.
 */
router.get("/gallery", authenticate, async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req);
  const publicOnly = req.query.public === "true";

  const where: any = publicOnly
    ? { isPublic: true }
    : { userId: req.user!.id };

  const [total, images] = await Promise.all([
    prisma.generatedImage.count({ where }),
    prisma.generatedImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        model: true,
        user: { select: { id: true, email: true } },
      },
    }),
  ]);

  res.json({
    data: images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      prompt: img.prompt,
      createdAt: img.createdAt,
      model: img.model?.name,
      user: img.user?.email,
      isPublic: img.isPublic,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/pricing
 * Returns all active pricing plans.
 */
router.get("/pricing", async (_req: Request, res: Response) => {
  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  });

  res.json({
    data: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      features: plan.features,
      tier: plan.tier,
    })),
  });
});

/**
 * GET /api/user/me
 * Returns the authenticated user's profile.
 */
router.get("/user/me", authenticate, async (req: Request, res: Response) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  });
});

/**
 * POST /api/prompts
 * Accepts a prompt and returns a mock generated image URL.
 * This endpoint is intentionally simple for the mock implementation.
 */
router.post("/prompts", authenticate, async (req: Request, res: Response) => {
  const { prompt, modelId, isPublic } = req.body as {
    prompt: string;
    modelId: string;
    isPublic?: boolean;
  };

  if (!prompt || !modelId) {
    return res.status(400).json({ error: "Prompt and modelId are required" });
  }

  const model = await prisma.model.findUnique({ where: { id: modelId } });
  if (!model) {
    return res.status(404).json({ error: "Model not found" });
  }

  // Mock image generation – in a real app you'd call an AI service.
  const mockImageUrl = `https://dummyimage.com/800x600/111827/6366f1&text=${encodeURIComponent(
    prompt.slice(0, 20)
  )}`;

  const generated = await prisma.generatedImage.create({
    data: {
      prompt,
      imageUrl: mockImageUrl,
      userId: req.user!.id,
      modelId,
      isPublic: !!isPublic,
    },
  });

  res.status(201).json({
    id: generated.id,
    url: generated.imageUrl,
    prompt: generated.prompt,
    createdAt: generated.createdAt,
    model: model.name,
    isPublic: generated.isPublic,
  });
});

export default router;