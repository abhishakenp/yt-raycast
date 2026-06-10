import { createShipFastEngineAdapter } from '@/features/generation/server/ship-fast-engine-adapter'
import type { EngineWorkspaceTask } from '@/features/generation/server/engine-workspace'
import type { RunShipFastEngine } from '@/features/generation/server/ship-fast-engine-adapter'

export type PersistCompleteGenerationInput = {
  sessionId: string
  anonymousOwnerSecret?: string
  html: string
  siteSpecJson?: string
  openUiSource?: string
  tasks: EngineWorkspaceTask[]
}

export type PersistFailGenerationInput = {
  sessionId: string
  anonymousOwnerSecret?: string
  message: string
}

export type GenerationPersistence = {
  completeGeneration: (input: PersistCompleteGenerationInput) => Promise<{ previewVersion: number }>
  failGeneration: (input: PersistFailGenerationInput) => Promise<unknown>
}

export type RunEngineGenerationInput = {
  sessionId: string
  prompt: string
  anonymousOwnerSecret?: string
  workspaceRoot: string
  runAll: RunShipFastEngine
  persistence: GenerationPersistence
}

export type RunEngineGenerationResult =
  | { status: 'completed'; previewVersion: number }
  | { status: 'failed'; message: string }

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Generation failed'

export const runEngineGeneration = async ({
  sessionId,
  prompt,
  anonymousOwnerSecret,
  workspaceRoot,
  runAll,
  persistence,
}: RunEngineGenerationInput): Promise<RunEngineGenerationResult> => {
  try {
    const result = await createShipFastEngineAdapter({ runAll, workspaceRoot }).generate({
      sessionId,
      prompt,
    })
    const persisted = await persistence.completeGeneration({
      sessionId,
      anonymousOwnerSecret,
      html: result.html,
      siteSpecJson: result.siteSpecJson,
      openUiSource: result.openUiSource,
      tasks: result.tasks,
    })

    return { status: 'completed', previewVersion: persisted.previewVersion }
  } catch (error) {
    const message = toErrorMessage(error)

    await persistence.failGeneration({
      sessionId,
      anonymousOwnerSecret,
      message,
    })

    return { status: 'failed', message }
  }
}
