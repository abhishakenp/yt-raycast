// File: src/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'FRIEND_REQUEST',
        'FRIEND_ACCEPTED',
        'FOLLOW',
        'EVENT_INVITE',
        'EVENT_UPDATE',
        'COMMENT',
        'LIKE',
        'PAYMENT_SUCCESS',
        'JOKER_GRANTED',
        'ADMIN_ALERT',
      ],
      required: true,
    },
    payload: {
      // free‑form data depending on type (e.g. eventId, commentId, etc.)
      type: mongoose.Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);

// File: src/controllers/notificationController.js
const Notification = require('../models/Notification');

/**
 * Create a new notification.
 * @param {ObjectId} recipientId
 * @param {ObjectId} senderId (optional)
 * @param {String} type
 * @param {Object} payload (optional)
 */
async function createNotification(recipientId, senderId, type, payload = {}) {
  const notification = new Notification({
    recipient: recipientId,
    sender: senderId,
    type,
    payload,
  });
  return await notification.save();
}

/**
 * Get paginated notifications for the logged‑in user.
 */
async function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username avatar')
        .lean(),
      Notification.countDocuments({ recipient: userId }),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: notifications,
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Mark one or many notifications as read.
 */
async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { ids } = req.body; // expects array of notification ids

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No notification ids provided' });
    }

    const result = await Notification.updateMany(
      { _id: { $in: ids }, recipient: userId },
      { $set: { read: true } }
    );

    res.json({ modifiedCount: result.nModified });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Delete a notification (soft‑delete could be added later).
 */
async function deleteNotification(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Bulk delete all read notifications for a user.
 */
async function clearReadNotifications(req, res) {
  try {
    const userId = req.user.id;
    const result = await Notification.deleteMany({
      recipient: userId,
      read: true,
    });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error clearing read notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  clearReadNotifications,
};

// File: src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  clearReadNotifications,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/notifications
 * @desc Get paginated notifications for current user
 * @access Private
 */
router.get('/', getUserNotifications);

/**
 * @route PATCH /api/notifications/read
 * @desc Mark selected notifications as read
 * @access Private
 * @body { ids: [String] }
 */
router.patch('/read', markAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a single notification
 * @access Private
 */
router.delete('/:id', deleteNotification);

/**
 * @route DELETE /api/notifications
 * @desc Delete all read notifications for current user
 * @access Private
 */
router.delete('/', clearReadNotifications);

module.exports = router;

// File: src/middleware/authenticate.js
// Simple JWT authentication middleware placeholder
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { authenticate };

// File: src/app.js
const express = require('express');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Register routes
app.use('/api/notifications', notificationRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;