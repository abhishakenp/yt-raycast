const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current mood status
router.get('/:userId/mood', auth, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Only the user themselves or an admin can view the mood
  if (req.user.id !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const user = await User.findById(userId).select('mood');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ mood: user.mood || null });
}));

// Update mood status
router.put(
  '/:userId/mood',
  auth,
  body('mood')
    .optional()
    .isString()
    .isLength({ max: 140 })
    .withMessage('Mood must be a string up to 140 characters'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;

    // Only the user themselves or an admin can modify the mood
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { mood } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { mood: mood || null },
      { new: true, runValidators: true, select: 'mood' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit real‑time update if socket.io is configured
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${userId}`).emit('moodUpdated', { mood: user.mood });
    }

    res.json({ mood: user.mood });
  })
);

module.exports = router;