import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, ReportStatus, ReportEntityType } from '@prisma/client';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateUser, authorizeAdmin } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /reports
 * Create a new report for a user, event, comment, or photo.
 * Body:
 *   - entityType: 'User' | 'Event' | 'Comment' | 'Photo'
 *   - entityId: string (UUID)
 *   - reason: string (short description)
 *   - description?: string (optional longer description)
 */
router.post(
  '/',
  authenticateUser,
  [
    body('entityType')
      .isIn(['User', 'Event', 'Comment', 'Photo'])
      .withMessage('Invalid entity type'),
    body('entityId').isUUID().withMessage('entityId must be a valid UUID'),
    body('reason')
      .isString()
      .isLength({ min: 5, max: 200 })
      .withMessage('Reason must be between 5 and 200 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description can be at most 1000 characters'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { entityType, entityId, reason, description } = req.body;
      const reporterId = (req.user as any).id; // assume auth middleware attaches user

      // Verify the reported entity actually exists
      const entityExists = await (async () => {
        switch (entityType as ReportEntityType) {
          case 'User':
            return prisma.user.findUnique({ where: { id: entityId } });
          case 'Event':
            return prisma.event.findUnique({ where: { id: entityId } });
          case 'Comment':
            return prisma.comment.findUnique({ where: { id: entityId } });
          case 'Photo':
            return prisma.photo.findUnique({ where: { id: entityId } });
          default:
            return null;
        }
      })();

      if (!entityExists) {
        return res.status(404).json({ error: `${entityType} not found` });
      }

      const report = await prisma.report.create({
        data: {
          reporterId,
          reportedEntityId: entityId,
          reportedEntityType: entityType as ReportEntityType,
          reason,
          description,
          status: ReportStatus.PENDING,
        },
      });

      return res.status(201).json({ report });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /admin/reports
 * List reports for admin review.
 * Query parameters (optional):
 *   - status: 'PENDING' | 'REVIEWED' | 'DISMISSED'
 *   - entityType: 'User' | 'Event' | 'Comment' | 'Photo'
 *   - page: number (default 1)
 *   - limit: number (default 20)
 */
router.get(
  '/admin',
  authenticateUser,
  authorizeAdmin,
  [
    query('status')
      .optional()
      .isIn(['PENDING', 'REVIEWED', 'DISMISSED'])
      .withMessage('Invalid status filter'),
    query('entityType')
      .optional()
      .isIn(['User', 'Event', 'Comment', 'Photo'])
      .withMessage('Invalid entity type filter'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, entityType, page = 1, limit = 20 } = req.query as any;
      const where: any = {};

      if (status) where.status = status;
      if (entityType) where.reportedEntityType = entityType;

      const [total, reports] = await Promise.all([
        prisma.report.count({ where }),
        prisma.report.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            reporter: { select: { id: true, username: true, email: true } },
          },
        }),
      ]);

      return res.json({
        total,
        page,
        limit,
        reports,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /admin/reports/:id
 * Update the status of a report (e.g., mark as reviewed or dismissed).
 * Body:
 *   - status: 'REVIEWED' | 'DISMISSED'
 *   - adminNote?: string
 */
router.patch(
  '/admin/:id',
  authenticateUser,
  authorizeAdmin,
  [
    param('id').isUUID().withMessage('Report ID must be a valid UUID'),
    body('status')
      .isIn(['REVIEWED', 'DISMISSED'])
      .withMessage('Invalid status value'),
    body('adminNote')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Admin note can be at most 1000 characters'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, adminNote } = req.body;
      const adminId = (req.user as any).id;

      const report = await prisma.report.findUnique({ where: { id } });
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const updatedReport = await prisma.report.update({
        where: { id },
        data: {
          status: status as ReportStatus,
          adminNote,
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
      });

      return res.json({ report: updatedReport });
    } catch (err) {
      next(err);
    }
  }
);

export default router;