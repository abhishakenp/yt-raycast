import { createServerFn } from '@tanstack/react-start'
import { runAll } from '@ship-fast/engine'
import * as z from 'zod'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { GenerationPersistence } from '@/features/generation/server/generation-runner'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'

const startGenerationInputSchema = z.object({
  sessionId: z.string().min(1),
  prompt: z.string().trim().min(1),
  anonymousOwnerSecret: z.string().optional(),
})

export const startGenerationInBackground = async (data: z.infer<typeof startGenerationInputSchema>) => {
  const [{ ConvexHttpClient }, { runEngineGeneration }, os, path] = await Promise.all([
    import('convex/browser'),
    import('@/features/generation/server/generation-runner'),
    import('node:os'),
    import('node:path'),
  ])
  const client = new ConvexHttpClient(getRuntimeConvexUrl())
  const sessionId = data.sessionId as Id<'sessions'>
  const log = async (message: string, eventType = 'log') => {
    try {
      await client.mutation(api.sessions.addGenerationEvent, {
        sessionId,
        eventType,
        message,
      })
    } catch {
      // Logging must never stop generation.
    }
  }
  await log('Starting server generation', 'status')
  const persistence: GenerationPersistence = {
    completeGeneration: async (input) => {
      await log('Generated files received, saving preview', 'status')
      return await client.mutation(api.sessions.completeGeneration, {
        sessionId,
        anonymousOwnerSecret: input.anonymousOwnerSecret,
        html: input.html,
        siteSpecJson: input.siteSpecJson,
        openUiSource: input.openUiSource,
        tasks: input.tasks,
      })
    },
    failGeneration: async (input) => {
      await log(input.message, 'failed')
      return await client.mutation(api.sessions.failGeneration, {
        sessionId,
        anonymousOwnerSecret: input.anonymousOwnerSecret,
        message: input.message,
      })
    },
  }

  await log('Running Ship Fast engine', 'status')
  const result = await runEngineGeneration({
    sessionId: data.sessionId,
    prompt: data.prompt,
    anonymousOwnerSecret: data.anonymousOwnerSecret,
    workspaceRoot:
      process.env.SHIP_FAST_ENGINE_WORKSPACE_ROOT ?? path.join(os.tmpdir(), 'ship-fast-v2-engine-workspaces'),
    runAll,
    persistence,
  })
  await log(result.status === 'completed' ? 'Generation complete' : result.message, result.status)
  return result
}

export const startGeneration = createServerFn({ method: 'POST' })
  .validator(startGenerationInputSchema)
  .handler(async ({ data }) => await startGenerationInBackground(data))
