import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Mock image generation handler.
 * Expects JSON body:
 * {
 *   "userId": "string",          // ID of the authenticated user
 *   "modelId": "string",         // ID of the selected model
 *   "prompt": "string"           // Text prompt for image generation
 * }
 *
 * Returns:
 * {
 *   "generatedImageId": "string",
 *   "imageUrl": "string",
 *   "promptId": "string",
 *   "modelId": "string",
 *   "createdAt": "ISO8601 timestamp"
 * }
 */
export async function generateImageMock(req, res) {
  try {
    const { userId, modelId, prompt } = req.body;

    // Basic validation
    if (!userId || !modelId || !prompt) {
      return res.status(400).json({ error: 'userId, modelId and prompt are required.' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify model exists
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) {
      return res.status(404).json({ error: 'Model not found.' });
    }

    // Create Prompt record
    const promptRecord = await prisma.prompt.create({
      data: {
        id: uuidv4(),
        userId,
        modelId,
        text: prompt,
        createdAt: new Date(),
      },
    });

    // Mock image generation – using a placeholder image service
    const placeholderId = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${placeholderId}/800/600`;

    // Create GeneratedImage record
    const generatedImage = await prisma.generatedImage.create({
      data: {
        id: uuidv4(),
        userId,
        modelId,
        promptId: promptRecord.id,
        imageUrl,
        createdAt: new Date(),
      },
    });

    // Respond with generated image info
    return res.status(201).json({
      generatedImageId: generatedImage.id,
      imageUrl: generatedImage.imageUrl,
      promptId: promptRecord.id,
      modelId,
      createdAt: generatedImage.createdAt,
    });
  } catch (error) {
    console.error('Error in generateImageMock:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// Express route registration (example)
// import express from 'express';
// const router = express.Router();
// router.post('/api/generate', generateImageMock);
// export default router;