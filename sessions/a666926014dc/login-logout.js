const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// ---------------------------------------------------
// Mongoose User Schema (simplified for auth purposes)
// ---------------------------------------------------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  // Store the latest refresh token to allow revocation on logout
  refreshToken: { type: String, default: null },
  // Additional fields (profile, etc.) can be added here
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// ---------------------------------------------------
// JWT Helper Functions
// ---------------------------------------------------
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

// ---------------------------------------------------
// Express Router for Auth
// ---------------------------------------------------
const router = express.Router();
router.use(cookieParser());

// --------------------
// POST /login
// --------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create JWTs
    const payload = { sub: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token (optional: hash before storing for extra security)
    user.refreshToken = refreshToken;
    await user.save();

    // Set HttpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Return minimal user info
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        // add other non‑sensitive fields as needed
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// --------------------
// POST /logout
// --------------------
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;

  // Clear cookies regardless of token validity
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  if (!refreshToken) {
    // No token to revoke – still consider logout successful
    return res.status(200).json({ message: 'Logged out.' });
  }

  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(200).json({ message: 'Logged out.' });
    }

    // Invalidate stored refresh token
    await User.updateOne({ _id: decoded.sub, refreshToken }, { $set: { refreshToken: null } });
    return res.status(200).json({ message: 'Logged out.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ---------------------------------------------------
// Middleware: Protect routes with access token
// ---------------------------------------------------
const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required.' });

  const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);
  if (!payload) return res.status(401).json({ message: 'Invalid or expired token.' });

  req.user = { id: payload.sub, email: payload.email };
  next();
};

module.exports = { router, authenticate, User };