<void> {
  const verificationUrl = `${config.app.baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(
    user.email,
  )}`;

  const mailOptions = {
    from: `"${config.app.name}" <${config.email.from}>`,
    to: user.email,
    subject: 'Verify your email address',
    html: `
      <p>Hello ${user.username || user.email},</p>
      <p>Thank you for registering on ${config.app.name}. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <hr/>
      <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Registers a new user and triggers email verification.
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username } = req.body;

    // Basic validation (you can replace with a proper validation library)
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Hash password (using bcrypt)
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const { token, expires } = generateVerificationToken();

    // Create user record with verification fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        isEmailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(user, token);

    return res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies a user's email using the token sent via email.
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, email } = req.query as { token?: string; email?: string };

    if (!token || !email) {
      return res.status(400).json({ message: 'Invalid verification link.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    if (
      user.emailVerificationToken !== token ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
    }

    // Update user record to mark email as verified and clear token fields
    await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Resends verification email (in case the user didn't receive it or token expired).
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email is already verified.' });
    }

    // Generate a new token
    const { token, expires } = generateVerificationToken();

    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    await sendVerificationEmail(user, token);

    return res
      .status(200)
      .json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Express router setup for email verification endpoints.
 */
import { Router } from 'express';
const router = Router();

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;