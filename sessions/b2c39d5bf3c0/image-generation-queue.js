// imageQueue.js
// Backend logic for Image Generation Queue in ImageGen Studio
// ----------------------------------------------------------
// Dependencies
const express = require('express');
const mongoose = require('mongoose');
const { Queue, Worker, QueueScheduler, Job } = require('bullmq');
const IORedis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// ----------------------------------------------------------
// Mongoose Models
// ----------------------------------------------------------

// User schema (simplified)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  // other fields like subscription, etc.
});
const User = mongoose.model('User', UserSchema);

// Model (AI model) schema
const ModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true }, // e.g., "stability", "openai"
  version: { type: String },
  // any additional config needed for generation
});
const Model = mongoose.model('Model', ModelSchema);

// Prompt schema
const PromptSchema = new mongoose.Schema({
  text: { type: String, required: true },
  negative: { type: String },
  parameters: { type: mongoose.Schema.Types.Mixed }, // e.g., {width:512,height:512,steps:30}
});
const Prompt = mongoose.model('Prompt', PromptSchema);

// Image schema
const ImageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
  prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  },
  url: { type: String }, // URL to stored image (e.g., S3)
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});
const Image = mongoose.model('Image', ImageSchema);

// ----------------------------------------------------------
// Queue Setup (BullMQ + Redis)
// ----------------------------------------------------------
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const imageQueueName = 'image-generation';
const imageQueue = new Queue(imageQueueName, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

const queueScheduler = new QueueScheduler(imageQueueName, {
  connection: redisConnection,
});
queueScheduler.waitUntilReady().catch(console.error);

// ----------------------------------------------------------
// Worker – processes generation jobs
// ----------------------------------------------------------
// NOTE: Replace the dummy generateImage function with actual
// integration to your AI image generation provider.
async function generateImage({ model, prompt }) {
  // Simulated delay for generation
  await new Promise((res) => setTimeout(res, 3000));

  // Dummy image URL – in real implementation upload to storage (S3, Cloudinary, etc.)
  const dummyUrl = `https://dummyimage.com/600x400/000/fff&text=${encodeURIComponent(
    prompt.text.slice(0, 20)
  )}`;
  return dummyUrl;
}

const imageWorker = new Worker(
  imageQueueName,
  async (job) => {
    const { imageId } = job.data;
    const imageDoc = await Image.findById(imageId).populate('model prompt');
    if (!imageDoc) {
      throw new Error(`Image document not found for ID ${imageId}`);
    }

    // Update status to processing
    imageDoc.status = 'processing';
    await imageDoc.save();

    try {
      const generatedUrl = await generateImage({
        model: imageDoc.model,
        prompt: imageDoc.prompt,
      });

      // Update image document with result
      imageDoc.status = 'completed';
      imageDoc.url = generatedUrl;
      imageDoc.completedAt = new Date();
      await imageDoc.save();
    } catch (err) {
      console.error('Generation error:', err);
      imageDoc.status = 'failed';
      imageDoc.error = err.message || 'Unknown error';
      await imageDoc.save();
      throw err; // Let BullMQ handle retries/backoff
    }
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.QUEUE_CONCURRENCY) || 3,
  }
);

imageWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

// ----------------------------------------------------------
// Express Router – API Endpoints
// ----------------------------------------------------------
const router = express.Router();

// Middleware to ensure user is authenticated
// (Replace with your actual auth middleware)
function ensureAuth(req, res, next) {
  // Assuming req.user is set after JWT/session verification
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// POST /generate – enqueue a new image generation request
router.post('/generate', ensureAuth, async (req, res) => {
  const { modelId, promptText, negativePrompt, parameters } = req.body;

  if (!modelId || !promptText) {
    return res.status(400).json({ error: 'modelId and promptText are required' });
  }

  try {
    // Validate model existence
    const model = await Model.findById(modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Create Prompt document
    const prompt = await Prompt.create({
      text: promptText,
      negative: negativePrompt,
      parameters,
    });

    // Create Image placeholder document
    const image = await Image.create({
      user: req.user._id,
      model: model._id,
      prompt: prompt._id,
      status: 'queued',
    });

    // Add job to queue
    await imageQueue.add('generate', { imageId: image._id }, { jobId: image._id.toString() });

    res.status(202).json({
      message: 'Generation queued',
      imageId: image._id,
      status: image.status,
    });
  } catch (err) {
    console.error('Enqueue error:', err);
    res.status(500).json({ error: 'Failed to queue generation request' });
  }
});

// GET /jobs/:id – fetch status of a generation job
router.get('/jobs/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findById(id)
      .populate('model')
      .populate('prompt')
      .lean();

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Ensure the requesting user owns the image
    if (image.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      imageId: image._id,
      status: image.status,
      url: image.url,
      error: image.error,
      createdAt: image.createdAt,
      completedAt: image.completedAt,
    });
  } catch (err) {
    console.error('Status fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve job status' });
  }
});

// Optional: GET /jobs – list recent jobs for the authenticated user
router.get('/jobs', ensureAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  try {
    const images = await Image.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('model')
      .populate('prompt')
      .lean();

    res.json(
      images.map((img) => ({
        imageId: img._id,
        status: img.status,
        url: img.url,
        createdAt: img.createdAt,
        completedAt: img.completedAt,
        model: img.model.name,
        prompt: img.prompt.text,
      }))
    );
  } catch (err) {
    console.error('List jobs error:', err);
    res.status(500).json({ error: 'Failed to list jobs' });
  }
});

// ----------------------------------------------------------
// Export
// ----------------------------------------------------------
module.exports = {
  router,
  imageQueue,
  imageWorker,
  Image,
  Prompt,
  Model,
  User,
};