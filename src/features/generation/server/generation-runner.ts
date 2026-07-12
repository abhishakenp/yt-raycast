import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { createShipFastEngineAdapter } from './ship-fast-engine-adapter'
import type { EngineWorkspaceTask } from './engine-workspace'
import type {
  RunShipFastEngine,
  ShipFastEngineAdapterOptions,
} from './ship-fast-engine-adapter'

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
  completeGeneration: (
    input: PersistCompleteGenerationInput,
  ) => Promise<{ previewVersion: number }>
  failGeneration: (input: PersistFailGenerationInput) => Promise<unknown>
}

export type RunEngineGenerationInput = {
  sessionId: string
  prompt: string
  preferredLanguage?: string
  anonymousOwnerSecret?: string
  workspaceRoot: string
  runAll: RunShipFastEngine
  persistence: GenerationPersistence
  onEvent?: ShipFastEngineAdapterOptions['onEvent']
}

export type RunEngineGenerationResult =
  | { status: 'completed'; previewVersion: number }
  | { status: 'failed'; message: string }

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Generation failed'
}

export async function runEngineGeneration({
  sessionId,
  prompt,
  preferredLanguage,
  anonymousOwnerSecret,
  workspaceRoot,
  runAll,
  persistence,
  onEvent,
}: RunEngineGenerationInput): Promise<RunEngineGenerationResult> {
  try {
    const result = await createShipFastEngineAdapter({
      runAll,
      workspaceRoot,
      onEvent,
    }).generate({
      sessionId,
      prompt,
      preferredLanguage,
    })

    if (isUnsafePublicPreviewHtml(result.html)) {
      throw new Error(
        'Ship Fast engine wrote OpenUI handoff HTML instead of a rendered preview',
      )
    }

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

    await persistence
      .failGeneration({
        sessionId,
        anonymousOwnerSecret,
        message,
      })
      .catch(() => {
        // Failure persistence is best-effort; the generation has already
        // failed and we must still surface a failed result to the caller.
      })

    return { status: 'failed', message }
  }
}
