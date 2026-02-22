import { Request, Response, NextFunction } from 'express';
import { PrismaClient, GeneratedImage } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to ensure the user is authenticated.
 * Assumes that an authentication middleware has already set req.userId.
 */
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * GET /gallery
 * Retrieves a paginated list of generated images belonging to the authenticated user.
 */
export async function getUserGallery(req: Request, res: Response) {
  const userId = Number(req.userId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [images, total] = await Promise.all([
      prisma.generatedImage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          prompt: true,
          imageUrl: true,
          createdAt: true,
          model: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.generatedImage.count({ where: { userId } }),
    ]);

    res.json({
      data: images,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
}

/**
 * GET /gallery/:id
 * Retrieves a single generated image if it belongs to the authenticated user.
 */
export async function getGalleryImage(req: Request, res: Response) {
  const userId = Number(req.userId);
  const imageId = Number(req.params.id);

  try {
    const image = await prisma.generatedImage.findFirst({
      where: { id: imageId, userId },
      include: {
        model: { select: { id: true, name: true } },
        prompt: { select: { id: true, content: true } },
      },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}

/**
 * DELETE /gallery/:id
 * Deletes a generated image if it belongs to the authenticated user.
 */
export async function deleteGalleryImage(req: Request, res: Response) {
  const userId = Number(req.userId);
  const imageId = Number(req.params.id);

  try {
    const image = await prisma.generatedImage.findFirst({
      where: { id: imageId, userId },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await prisma.generatedImage.delete({
      where: { id: imageId },
    });

    // Optionally, delete the stored file from cloud storage here.

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
}

/**
 * Export router-ready handlers with authentication enforced.
 */
export const galleryController = {
  ensureAuthenticated,
  getUserGallery,
  getGalleryImage,
  deleteGalleryImage,
};