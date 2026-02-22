import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Image } from "@prisma/client";
import { body, param, validationResult } from "express-validator";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Middleware to ensure the user is authenticated.
 * Assumes that authentication middleware populates req.user with { id: string }
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user || typeof req.user.id !== "string") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * GET /gallery
 * List all images belonging to the authenticated user.
 * Supports pagination via query params: ?page=1&limit=20
 */
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    try {
      const [images, total] = await Promise.all([
        prisma.image.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            prompt: true,
            model: true,
          },
        }),
        prisma.image.count({ where: { userId } }),
      ]);

      res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: images,
      });
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  }
);

/**
 * GET /gallery/:imageId
 * Retrieve a single image belonging to the authenticated user.
 */
router.get(
  "/:imageId",
  requireAuth,
  param("imageId").isUUID(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req.user as any).id;
    const { imageId } = req.params;

    try {
      const image = await prisma.image.findFirst({
        where: { id: imageId, userId },
        include: {
          prompt: true,
          model: true,
        },
      });

      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      res.json(image);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  }
);

/**
 * DELETE /gallery/:imageId
 * Delete an image belonging to the authenticated user.
 */
router.delete(
  "/:imageId",
  requireAuth,
  param("imageId").isUUID(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req.user as any).id;
    const { imageId } = req.params;

    try {
      const image = await prisma.image.findFirst({
        where: { id: imageId, userId },
      });

      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Optionally, delete the stored file from cloud storage here.
      // await deleteFromS3(image.url);

      await prisma.image.delete({
        where: { id: imageId },
      });

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  }
);

/**
 * PATCH /gallery/:imageId
 * Update metadata (title, description) of an image.
 */
router.patch(
  "/:imageId",
  requireAuth,
  param("imageId").isUUID(),
  body("title").optional().isString().isLength({ max: 150 }),
  body("description").optional().isString().isLength({ max: 500 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = (req.user as any).id;
    const { imageId } = req.params;
    const { title, description } = req.body;

    try {
      const image = await prisma.image.findFirst({
        where: { id: imageId, userId },
      });

      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      const updated = await prisma.image.update({
        where: { id: imageId },
        data: {
          title: title ?? image.title,
          description: description ?? image.description,
        },
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ error: "Failed to update image" });
    }
  }
);

export default router;