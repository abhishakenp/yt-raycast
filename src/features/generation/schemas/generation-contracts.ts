import * as z from 'zod'

export const generationStatusValues = [
  'created',
  'queued',
  'validating',
  'streaming',
  'homepage_ready',
  'site_spec_ready',
  'preview_ready',
  'failed',
] as const

export const taskStatusValues = [
  'pending',
  'running',
  'succeeded',
  'failed',
] as const

export const exportTargetValues = ['html', 'react', 'next'] as const

export const createGenerationInputSchema = z.object({
  prompt: z.string().trim().min(1),
  preferredLanguage: z.string().trim().default('en'),
  preferredExportTarget: z.enum(exportTargetValues).default('html'),
  isPrivate: z.boolean().default(false),
  designReferenceUrl: z.string().url().optional(),
})

export const sessionSummarySchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  status: z.enum(generationStatusValues),
  preferredLanguage: z.string().min(1),
  preferredExportTarget: z.enum(exportTargetValues),
  isPrivate: z.boolean(),
  previewVersion: z.number().int().nonnegative(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
})

export const sessionTaskSchema = z.object({
  taskKey: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(taskStatusValues),
  order: z.number().int().nonnegative(),
  errorMessage: z.string().optional(),
})

export type CreateGenerationInput = z.infer<typeof createGenerationInputSchema>
export type GenerationStatus = (typeof generationStatusValues)[number]
export type SessionSummary = z.infer<typeof sessionSummarySchema>
export type SessionTask = z.infer<typeof sessionTaskSchema>

export const parseCreateGenerationInput = (
  input: unknown,
): CreateGenerationInput => createGenerationInputSchema.parse(input)
