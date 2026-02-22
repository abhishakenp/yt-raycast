import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient, Comment, User, Event } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import { verifyJwt } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

/**
 * Middleware to handle validation results
 */
const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST /api/comments
 * @desc    Create a new comment on an event
 * @access  Private
 */
router.post(
  '/',
  verifyJwt,
  [
    body('eventId').isInt({ gt: 0 }).withMessage('eventId must be a positive integer'),
    body('content')
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('content must be between 1 and 1000 characters'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id as number;
    const { eventId, content } = req.body;

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: userId } },
        event: { connect: { id: eventId } },
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.status(201).json(comment);
  }
);

/**
 * @route   GET /api/comments/event/:eventId
 * @desc    Get paginated comments for a specific event
 * @access  Public
 */
router.get(
  '/event/:eventId',
  [
    param('eventId').isInt({ gt: 0 }).withMessage('eventId must be a positive integer'),
    // optional pagination
    (req, res, next) => {
      req.query.page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      req.query.limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      next();
    },
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId, 10);
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      prisma.comment.count({ where: { eventId } }),
      prisma.comment.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
    ]);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      comments,
    });
  }
);

/**
 * @route   PATCH /api/comments/:id
 * @desc    Update a comment (only author or admin)
 * @access  Private
 */
router.patch(
  '/:id',
  verifyJwt,
  [
    param('id').isInt({ gt: 0 }).withMessage('Comment id must be a positive integer'),
    body('content')
      .optional()
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('content must be between 1 and 1000 characters'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.id, 10);
    const userId = (req as any).user.id as number;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Allow if author or user has admin role
    const isAdmin = (req as any).user.role === 'ADMIN';
    if (comment.authorId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.json(updated);
  }
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (author or admin)
 * @access  Private
 */
router.delete(
  '/:id',
  verifyJwt,
  [param('id').isInt({ gt: 0 }).withMessage('Comment id must be a positive integer')],
  handleValidation,
  async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.id, 10);
    const userId = (req as any).user.id as number;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAdmin = (req as any).user.role === 'ADMIN';
    if (comment.authorId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.status(204).send();
  }
);

export default router;