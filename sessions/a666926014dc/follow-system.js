<void> {
  if (followerId === followingId) {
    throw new BadRequestError('You cannot follow yourself.');
  }

  // Ensure both users exist
  const [follower, following] = await Promise.all([
    prisma.user.findUnique({ where: { id: followerId } }),
    prisma.user.findUnique({ where: { id: followingId } })
  ]);

  if (!follower) throw new NotFoundError('Follower user not found.');
  if (!following) throw new NotFoundError('User to follow not found.');

  // Prevent duplicate follows
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });

  if (existing) {
    throw new BadRequestError('You are already following this user.');
  }

  await prisma.follow.create({
    data: {
      followerId,
      followingId
    }
  });
}

/**
 * Unfollow a user.
 * @param followerId - ID of the user who wants to unfollow.
 * @param followingId - ID of the user to be unfollowed.
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });

  if (!follow) {
    throw new BadRequestError('You are not following this user.');
  }

  await prisma.follow.delete({
    where: { id: follow.id }
  });
}

/**
 * Get a list of followers for a given user.
 * @param userId - ID of the user whose followers are requested.
 */
export async function getFollowers(userId: string): Promise<User[]> {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: true }
  });
  return follows.map(f => f.follower);
}

/**
 * Get a list of users that the given user is following.
 * @param userId - ID of the user whose followings are requested.
 */
export async function getFollowing(userId: string): Promise<User[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: true }
  });
  return follows.map(f => f.following);
}

/**
 * Check if a follower is following a target user.
 * @param followerId - ID of the potential follower.
 * @param followingId - ID of the potential followee.
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });
  return !!follow;
}

// src/controllers/followController.ts
import { Request, Response, NextFunction } from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing
} from '../services/followService';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /follow/:userId
 * Follow the user with id = :userId
 */
export const follow = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const followerId = (req as any).user.id; // Assuming auth middleware attaches user
  const followingId = req.params.userId;

  await followUser(followerId, followingId);
  res.status(200).json({ message: 'Successfully followed the user.' });
});

/**
 * DELETE /follow/:userId
 * Unfollow the user with id = :userId
 */
export const unfollow = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const followerId = (req as any).user.id;
  const followingId = req.params.userId;

  await unfollowUser(followerId, followingId);
  res.status(200).json({ message: 'Successfully unfollowed the user.' });
});

/**
 * GET /followers/:userId
 * Retrieve a list of followers for the specified user.
 */
export const listFollowers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const followers = await getFollowers(userId);
  res.status(200).json({ followers });
});

/**
 * GET /following/:userId
 * Retrieve a list of users that the specified user follows.
 */
export const listFollowing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const following = await getFollowing(userId);
  res.status(200).json({ following });
});

/**
 * GET /follow/status/:userId
 * Returns whether the authenticated user follows :userId
 */
export const followStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const followerId = (req as any).user.id;
  const followingId = req.params.userId;

  const following = await isFollowing(followerId, followingId);
  res.status(200).json({ following });
});

// src/routes/followRoutes.ts
import { Router } from 'express';
import {
  follow,
  unfollow,
  listFollowers,
  listFollowing,
  followStatus
} from '../controllers/followController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication except public follower/following lists
router.post('/follow/:userId', authenticate, follow);
router.delete('/follow/:userId', authenticate, unfollow);
router.get('/followers/:userId', listFollowers);
router.get('/following/:userId', listFollowing);
router.get('/follow/status/:userId', authenticate, followStatus);

export default router;

// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed token.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new UnauthorizedError('User not found.');
    }
    (req as any).user = user;
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid token.');
  }
}

// src/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// src/utils/errors.ts
export class BadRequestError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// src/app.ts (excerpt – add the follow routes)
import express from 'express';
import followRoutes from './routes/followRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

// ... other middlewares and routes

app.use('/api', followRoutes);

// Global error handler
app.use(errorHandler);

export default app;

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}