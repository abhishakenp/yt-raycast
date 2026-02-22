import { PrismaClient, AuditLogAction, AuditLogItemType } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();

/**
 * Types of items that can be archived.
 */
export type ArchivableItem =
  | { type: 'CHAT'; id: string }
  | { type: 'MESSAGE'; id: string }
  | { type: 'PROVIDER'; id: string }
  | { type: 'TAG'; id: string }
  | { type: 'ATTACHMENT'; id: string };

/**
 * Record an audit log entry whenever an item is archived or unarchived.
 *
 * @param userId   ID of the user performing the action
 * @param item     The item being archived/unarchived
 * @param action   The action performed (ARCHIVE or UNARCHIVE)
 * @param details  Optional free‑form details (e.g. reason, source)
 */
export async function createArchiveAuditLog(
  userId: string,
  item: ArchivableItem,
  action: AuditLogAction,
  details?: string,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      itemId: item.id,
      itemType: item.type as AuditLogItemType,
      action,
      details,
    },
  });
}

/**
 * Middleware to automatically log archive actions for supported entities.
 *
 * Usage (Express):
 *   router.patch('/chats/:id/archive', archiveMiddleware('CHAT'), archiveChatHandler);
 *
 * @param itemType The type of the item being archived (must match AuditLogItemType)
 */
export function archiveMiddleware(itemType: AuditLogItemType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // assumes authentication middleware populates req.user
    const itemId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Validate UUID format (or whatever your IDs are)
    const idSchema = z.string().uuid();
    const parseResult = idSchema.safeParse(itemId);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    // Attach audit info to request for later handlers
    (req as any).auditInfo = {
      userId,
      item: { type: itemType, id: itemId },
    };
    next();
  };
}

/**
 * Call this after the actual archive operation succeeded.
 *
 * @param req Express request (must contain auditInfo from archiveMiddleware)
 */
export async function logSuccessfulArchive(req: Request) {
  const auditInfo = (req as any).auditInfo as {
    userId: string;
    item: ArchivableItem;
  };
  if (!auditInfo) {
    throw new Error('Audit info missing – ensure archiveMiddleware is used.');
  }

  await createArchiveAuditLog(
    auditInfo.userId,
    auditInfo.item,
    'ARCHIVE',
    'Item archived via API',
  );
}

/**
 * Call this after an unarchive operation succeeded.
 *
 * @param req Express request (must contain auditInfo from archiveMiddleware)
 */
export async function logSuccessfulUnarchive(req: Request) {
  const auditInfo = (req as any).auditInfo as {
    userId: string;
    item: ArchivableItem;
  };
  if (!auditInfo) {
    throw new Error('Audit info missing – ensure archiveMiddleware is used.');
  }

  await createArchiveAuditLog(
    auditInfo.userId,
    auditInfo.item,
    'UNARCHIVE',
    'Item unarchived via API',
  );
}

/**
 * GET /audit-logs
 *
 * Query parameters:
 *   - userId?: string
 *   - itemType?: AuditLogItemType
 *   - action?: AuditLogAction
 *   - from?: ISO date string
 *   - to?: ISO date string
 *   - limit?: number (default 50)
 *   - cursor?: string (for pagination)
 */
export async function getAuditLogsHandler(req: Request, res: Response) {
  const querySchema = z.object({
    userId: z.string().uuid().optional(),
    itemType: z.enum(['CHAT', 'MESSAGE', 'PROVIDER', 'TAG', 'ATTACHMENT']).optional(),
    action: z.enum(['ARCHIVE', 'UNARCHIVE']).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    limit: z.coerce.number().min(1).max(200).default(50),
    cursor: z.string().optional(),
  });

  const parse = querySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid query parameters', details: parse.error.format() });
  }

  const { userId, itemType, action, from, to, limit, cursor } = parse.data;

  const where: any = {};
  if (userId) where.userId = userId;
  if (itemType) where.itemType = itemType;
  if (action) where.action = action;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }
  if (cursor) {
    where.id = { gt: cursor };
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      userId: true,
      itemId: true,
      itemType: true,
      action: true,
      details: true,
      createdAt: true,
    },
  });

  const nextCursor = logs.length === limit ? logs[logs.length - 1].id : null;

  res.json({ logs, nextCursor });
}

/**
 * Prisma schema addition (to be placed in schema.prisma):
 *
 *   model AuditLog {
 *     id        String   @id @default(uuid())
 *     userId    String
 *     user      User     @relation(fields: [userId], references: [id])
 *     itemId    String
 *     itemType  AuditLogItemType
 *     action    AuditLogAction
 *     details   String?  @db.Text
 *     createdAt DateTime @default(now())
 *
 *     @@index([userId, createdAt])
 *   }
 *
 *   enum AuditLogItemType {
 *     CHAT
 *     MESSAGE
 *     PROVIDER
 *     TAG
 *     ATTACHMENT
 *   }
 *
 *   enum AuditLogAction {
 *     ARCHIVE
 *     UNARCHIVE
 *   }
 */