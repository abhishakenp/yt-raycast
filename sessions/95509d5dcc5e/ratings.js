import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Rating } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/authenticate';

const prisma = new PrismaClient();
const router = Router();

/**
 * @route   POST /ratings/:videoId
 * @desc    Add or update a rating for a video
 * @access  Private
 */
router.post(
  '/:videoId',
  authenticate,
  param('videoId').isInt({ gt: 0 }).withMessage('Video ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const videoId = parseInt(req.params.videoId, 10);
      const { rating } = req.body;

      // Ensure the video exists
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      // Upsert rating (create if not exists, otherwise update)
      const upsertedRating = await prisma.rating.upsert({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        update: {
          rating,
          updatedAt: new Date(),
        },
        create: {
          userId,
          videoId,
          rating,
        },
      });

      return res.status(200).json(upsertedRating);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /ratings/:videoId
 * @desc    Get average rating and total count for a video
 * @access  Public
 */
router.get(
  '/:videoId',
  param('videoId').isInt({ gt: 0 }).withMessage('Video ID must be a positive integer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const videoId = parseInt(req.params.videoId, 10);

      // Ensure the video exists
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const aggregation = await prisma.rating.aggregate({
        where: { videoId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return res.status(200).json({
        videoId,
        averageRating: aggregation._avg.rating ? Number(aggregation._avg.rating.toFixed(2)) : null,
        totalRatings: aggregation._count.rating,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /ratings/:videoId
 * @desc    Delete a user's rating for a video
 * @access  Private
 */
router.delete(
  '/:videoId',
  authenticate,
  param('videoId').isInt({ gt: 0 }).withMessage('Video ID must be a positive integer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const videoId = parseInt(req.params.videoId, 10);

      const deleted = await prisma.rating.deleteMany({
        where: {
          userId,
          videoId,
        },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      return res.status(200).json({ message: 'Rating removed' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;