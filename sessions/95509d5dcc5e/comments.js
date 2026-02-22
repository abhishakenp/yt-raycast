import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Comment, User, Video } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Middleware to validate request bodies for comment creation and updates.
 */
export const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters.'),
  body('videoId')
    .isInt({ gt: 0 })
    .withMessage('Valid videoId is required.'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Middleware to validate commentId param.
 */
export const validateCommentId = [
  param('commentId')
    .isInt({ gt: 0 })
    .withMessage('commentId must be a positive integer.'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Create a new comment.
 * Requires authentication (req.user should contain the authenticated user id).
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { content, videoId } = req.body;

    // Ensure the video exists
    const video = await prisma.video.findUnique({
      where: { id: Number(videoId) },
    });
    if (!video) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        video: { connect: { id: Number(videoId) } },
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        video: { select: { id: true, title: true } },
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get comments for a specific video with pagination.
 */
export const getCommentsByVideo = async (req: Request, res: Response) => {
  try {
    const videoId = Number(req.params.videoId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      prisma.comment.count({ where: { videoId } }),
      prisma.comment.findMany({
        where: { videoId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
    ]);

    return res.json({
      total,
      page,
      limit,
      comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Update a comment.
 * Only the comment author can update.
 */
export const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const commentId = Number(req.params.commentId);
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments.' });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Delete a comment.
 * Only the comment author or an admin can delete.
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role; // e.g., 'admin' or 'user'
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const commentId = Number(req.params.commentId);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this comment.' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Like or unlike a comment.
 * Toggles the like status for the authenticated user.
 */
export const toggleLikeComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const commentId = Number(req.params.commentId);

    const existing = await prisma.commentLike.findFirst({
      where: { commentId, userId },
    });

    if (existing) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existing.id },
      });
    } else {
      // Like
      await prisma.commentLike.create({
        data: { commentId, userId },
      });
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    return res.json({ commentId, liked: !existing, likeCount });
  } catch (error) {
    console.error('Error toggling like on comment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Report a comment for moderation.
 */
export const reportComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const commentId = Number(req.params.commentId);
    const { reason, details } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    await prisma.commentReport.create({
      data: {
        comment: { connect: { id: commentId } },
        reporter: { connect: { id: userId } },
        reason,
        details,
      },
    });

    return res.status(201).json({ message: 'Comment reported successfully.' });
  } catch (error) {
    console.error('Error reporting comment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};