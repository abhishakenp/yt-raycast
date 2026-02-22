<${config.email.fromAddress}>`,
        to: email,
        subject: 'Verify your Lidmi account',
        html: `
          <p>Hello ${name},</p>
          <p>Thank you for registering on Lidmi. Please verify your email by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify Email</a></p>
          <p>If you did not sign up for an account, you can safely ignore this email.</p>
          <p>Best regards,<br/>The Lidmi Team</p>
        `,
      });

      return res.status(201).json({ message: 'Registration successful. Verification email sent.' });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;