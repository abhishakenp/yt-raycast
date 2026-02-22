// models/photo.js
const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      maxlength: 200,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    // optional: store dimensions, size, mime type
    metadata: {
      width: Number,
      height: Number,
      size: Number,
      mimeType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', PhotoSchema);

// controllers/photoController.js
const Photo = require('../models/photo');
const path = require('path');
const fs = require('fs');
const { uploadToS3, deleteFromS3 } = require('../utils/s3'); // optional S3 helper
const sharp = require('sharp');

// Helper to build public URL (local or S3)
const getPublicUrl = (file) => {
  if (process.env.STORAGE_PROVIDER === 's3') {
    return file.Location; // S3 returns Location
  }
  // local storage
  return `${process.env.BASE_URL}/uploads/${file.filename}`;
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Optional: resize/compress with sharp
    const buffer = await sharp(req.file.path)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Overwrite original file with processed buffer
    fs.writeFileSync(req.file.path, buffer);

    let fileInfo;
    if (process.env.STORAGE_PROVIDER === 's3') {
      fileInfo = await uploadToS3(req.file);
    } else {
      fileInfo = {
        filename: req.file.filename,
        path: req.file.path,
      };
    }

    const photo = new Photo({
      url: getPublicUrl(fileInfo),
      caption: req.body.caption,
      user: req.user.id,
      event: req.body.eventId || null,
      metadata: {
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    await photo.save();

    res.status(201).json({ photo });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('user', 'name avatar');
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json({ photo });
  } catch (err) {
    console.error('Get photo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const photos = await Photo.find({ event: eventId })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');
    res.json({ photos });
  } catch (err) {
    console.error('List event photos error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Only owner or admin can delete
    if (photo.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove file from storage
    if (process.env.STORAGE_PROVIDER === 's3') {
      await deleteFromS3(photo.url);
    } else {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(photo.url));
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Failed to delete local file:', err);
      });
    }

    await photo.remove();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// routes/photoRoutes.js
const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config (local storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const mime = allowed.test(file.mimetype);
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mime && ext) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Routes
router.post(
  '/',
  auth,
  upload.single('photo'),
  photoController.uploadPhoto
);

router.get('/:id', auth, photoController.getPhoto);

router.get('/event/:eventId', auth, photoController.listEventPhotos);

router.delete('/:id', auth, photoController.deletePhoto);

module.exports = router;

// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = {
      id: user.id,
      isAdmin: user.role === 'admin',
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// utils/s3.js (optional, only used if STORAGE_PROVIDER=s3)
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadToS3 = (file) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Body: fileStream,
    Key: `photos/${file.filename}`,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };
  return s3.upload(uploadParams).promise();
};

exports.deleteFromS3 = async (url) => {
  const urlObj = new URL(url);
  const key = urlObj.pathname.substring(1); // remove leading '/'
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };
  await s3.deleteObject(params).promise();
};

// app.js (excerpt to mount routes)
const express = require('express');
const app = express();
const photoRoutes = require('./routes/photoRoutes');

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve local uploads

app.use('/api/photos', photoRoutes);

// ... other middlewares, error handling, server start

module.exports = app;