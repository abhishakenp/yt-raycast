<${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>Hello,</p>
      <p>You requested a password reset for your ${process.env.APP_NAME} account.</p>
      <p>Click the link below to set a new password. This link will expire in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:5px;text-decoration:none;">
        Reset Password
      </a>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>Thanks,<br/>The ${process.env.APP_NAME} Team</p>
    `,
  };
  await transporter.sendMail(mailOptions);
}

// -----------------------------------------------------------------------------
// POST /auth/forgot-password
// Body: { email: string }
// -----------------------------------------------------------------------------
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Do not reveal that the email does not exist
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
  });

  try {
    await sendResetEmail(email, token);
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Error sending reset email:', err);
    return res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// -----------------------------------------------------------------------------
// POST /auth/reset-password
// Body: { token: string, newPassword: string, confirmPassword: string }
// -----------------------------------------------------------------------------
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return res.status(200).json({ message: 'Password has been reset successfully' });
});

// -----------------------------------------------------------------------------
// POST /auth/change-password
// Protected route
// Body: { currentPassword: string, newPassword: string, confirmPassword: string }
// -----------------------------------------------------------------------------
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = (req as any).user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return res.status(200).json({ message: 'Password changed successfully' });
});

export default router;