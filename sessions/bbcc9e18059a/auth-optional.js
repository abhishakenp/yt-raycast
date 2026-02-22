<old-token>
 */
export async function refreshToken(req: Request, res: Response) {
  if (!AUTH_ENABLED) {
    return res.status(403).json({ error: 'Authentication is disabled' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const oldToken = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true }) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Export router to be mounted in the main app.
 */
import { Router } from 'express';
export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);

export default authRouter;