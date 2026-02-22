<string> => {
  return bcrypt.hash(plain, config.bcryptSaltRounds);
};

export const comparePassword = async (
  plain: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

// File: src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';

export const signJwt = (payload: { userId: string; email: string }) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyJwt = (token: string): { userId: string; email: string } => {
  return jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
};

// File: src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { UserModel } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyJwt(token);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// File: src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = await UserModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({ email, passwordHash, name });

  const token = signJwt({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await UserModel.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signJwt({ userId: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Refresh token (optional)
router.post('/refresh', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const token = signJwt({ userId: user.id, email: user.email });
  res.json({ token });
});

// Change password
router.put('/password', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords required' });
  }

  const userRecord = await UserModel.findById(req.user!.id);
  if (!userRecord) {
    return res.status(404).json({ error: 'User not found' });
  }

  const matches = await comparePassword(oldPassword, userRecord.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = await hashPassword(newPassword);
  await UserModel.updatePassword(userRecord.id, newHash);
  res.json({ message: 'Password updated successfully' });
});

export default router;

// File: src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth';
import { config } from './config';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`🚀 Server listening on port ${config.port}`);
});