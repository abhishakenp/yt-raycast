<Prompt> => {
  const parsed = promptCreateSchema.parse(data);
  // Ensure model exists
  const model = await prisma.model.findUnique({ where: { id: parsed.modelId } });
  if (!model) {
    throw new Error('Model not found');
  }

  return prisma.prompt.create({
    data: {
      userId,
      modelId: parsed.modelId,
      content: parsed.content,
      negative: parsed.negative,
      parameters: parsed.parameters,
      isFavorite: parsed.isFavorite ?? false,
    },
  });
};

export const getUserPrompts = async (userId: string): Promise<Prompt[]> => {
  return prisma.prompt.findMany({
    where: { userId },
    include: { model: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPromptById = async (userId: string, promptId: string): Promise<Prompt | null> => {
  return prisma.prompt.findFirst({
    where: { id: promptId, userId },
    include: { model: true },
  });
};

export const updatePrompt = async (userId: string, promptId: string, data: any): Promise<Prompt> => {
  const parsed = promptUpdateSchema.parse(data);
  // If modelId is being changed, verify existence
  if (parsed.modelId) {
    const model = await prisma.model.findUnique({ where: { id: parsed.modelId } });
    if (!model) {
      throw new Error('Model not found');
    }
  }

  return prisma.prompt.update({
    where: { id: promptId },
    data: {
      content: parsed.content,
      negative: parsed.negative,
      modelId: parsed.modelId,
      parameters: parsed.parameters,
      isFavorite: parsed.isFavorite,
    },
  });
};

export const deletePrompt = async (userId: string, promptId: string): Promise<void> => {
  await prisma.prompt.deleteMany({
    where: { id: promptId, userId },
  });
};

// src/controllers/promptController.ts
import { Request, Response } from 'express';
import * as promptService from '../services/promptService';

export const createPrompt = async (req: Request, res: Response) => {
  try {
    const prompt = await promptService.createPrompt(req.user!.id, req.body);
    res.status(201).json(prompt);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listPrompts = async (req: Request, res: Response) => {
  try {
    const prompts = await promptService.getUserPrompts(req.user!.id);
    res.json(prompts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPrompt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const prompt = await promptService.getPromptById(req.user!.id, id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePrompt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await promptService.updatePrompt(req.user!.id, id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deletePrompt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await promptService.deletePrompt(req.user!.id, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// src/routes/promptRoutes.ts
import { Router } from 'express';
import * as promptController from '../controllers/promptController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', promptController.createPrompt);
router.get('/', promptController.listPrompts);
router.get('/:id', promptController.getPrompt);
router.patch('/:id', promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);

export default router;

// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import promptRoutes from './routes/promptRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// API routes
app.use('/api/prompts', promptRoutes);

// Global error handler (optional)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

export default app;