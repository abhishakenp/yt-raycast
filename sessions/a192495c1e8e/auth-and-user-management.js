import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = 12;

// ---------- Types ----------
interface AuthRequest extends Request {
  user?: User;
}

// ---------- Helper Functions ----------
function generateToken(userId: number): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setTokenCookie(res: Response, token: string) {
  // HttpOnly cookie for browser clients; also return token in body for API clients
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

// ---------- Middleware ----------
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.split(" ")[0] === "Bearer"
    ? authHeader.split(" ")[1]
    : null;
  const token = tokenFromHeader || req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
    prisma.user
      .findUnique({ where: { id: payload.sub } })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
      })
      .catch(() => res.status(500).json({ error: "Database error" }));
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---------- Routes ----------

// Register a new user
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required fields" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash: hashedPassword,
      },
    });

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    const { passwordHash, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login existing user
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required fields" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout (clear cookie)
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// Get current authenticated user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Update profile (name, email, password)
router.put(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const { name, email, oldPassword, newPassword } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    try {
      // If password change requested, verify old password first
      if (oldPassword && newPassword) {
        const passwordValid = await bcrypt.compare(
          oldPassword,
          req.user.passwordHash
        );
        if (!passwordValid) {
          return res.status(403).json({ error: "Current password incorrect" });
        }
        updates.passwordHash = await bcrypt.hash(
          newPassword,
          BCRYPT_SALT_ROUNDS
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updates,
      });

      const { passwordHash, ...safeUser } = updatedUser;
      res.json({ user: safeUser });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;