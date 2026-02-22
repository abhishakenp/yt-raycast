import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ErrorLog } from '@prisma/client';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Initialize Prisma client
const prisma = new PrismaClient();

// Ensure logs directory exists
const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Write to file (rotate manually or use winston-daily-rotate-file in production)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Also output to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Express error‑handling middleware that:
 *   1. Logs the error to Winston (file + console)
 *   2. Persists the error to the database for later inspection
 *   3. Sends a generic error response (no stack traces exposed to clients)
 */
export async function errorLoggingMiddleware(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  // Build a structured log entry
  const logEntry = {
    message: err.message || 'Unknown error',
    stack: err.stack,
    // Capture request context for debugging
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: (req as any).user?.id ?? null, // assumes authentication middleware adds req.user
    // Optionally add request body (cautiously – avoid PII)
    body: req.body,
    // Timestamp is added automatically by Winston
  };

  // Log to Winston
  logger.error(logEntry);

  // Persist to DB (non‑blocking, but we await to guarantee order)
  try {
    await prisma.errorLog.create({
      data: {
        message: logEntry.message,
        stack: logEntry.stack,
        method: logEntry.method,
        url: logEntry.url,
        ip: logEntry.ip,
        userId: logEntry.userId,
        // Store a JSON string of the request body (truncated to 1KB to avoid huge blobs)
        requestBody:
          typeof logEntry.body === 'object'
            ? JSON.stringify(logEntry.body).slice(0, 1024)
            : undefined,
      },
    } as any);
  } catch (dbErr) {
    // If DB logging fails, we still want the original error to be visible in logs
    logger.error({
      message: 'Failed to persist error log to DB',
      originalError: err.message,
      dbError: (dbErr as Error).message,
    });
  }

  // Respond to client – never expose stack traces in production
  const status = err.status || 500;
  const responsePayload: { error: string; details?: string } = {
    error: status === 500 ? 'Internal Server Error' : err.message,
  };

  // In development, optionally include stack for easier debugging
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    responsePayload.details = err.stack;
  }

  res.status(status).json(responsePayload);
}

/**
 * Helper function to manually log non‑exception events (e.g., background job failures)
 */
export async function logError(
  message: string,
  options?: {
    stack?: string;
    method?: string;
    url?: string;
    ip?: string;
    userId?: string;
    requestBody?: any;
  }
) {
  const entry = {
    message,
    stack: options?.stack,
    method: options?.method ?? 'N/A',
    url: options?.url ?? 'N/A',
    ip: options?.ip ?? 'N/A',
    userId: options?.userId ?? null,
    requestBody:
      typeof options?.requestBody === 'object'
        ? JSON.stringify(options.requestBody).slice(0, 1024)
        : undefined,
  };

  logger.error(entry);

  try {
    await prisma.errorLog.create({
      data: entry as any,
    });
  } catch (e) {
    logger.error({
      message: 'Failed to persist manual error log',
      originalMessage: message,
      dbError: (e as Error).message,
    });
  }
}

/**
 * Prisma schema snippet (add to your schema.prisma):
 *
 * model ErrorLog {
 *   id           String   @id @default(uuid())
 *   createdAt    DateTime @default(now())
 *   message      String
 *   stack        String?
 *   method       String?
 *   url          String?
 *   ip           String?
 *   userId       String?   // foreign key to User if needed
 *   requestBody  String?   // truncated JSON payload
 *
 *   @@index([createdAt])
 * }
 *
 * After updating schema, run: npx prisma migrate dev --name add_error_log
 */

export default logger;