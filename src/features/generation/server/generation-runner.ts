import {
  assertCompletedEngineWorkspaceArtifacts,
  createEngineWorkspacePath,
  readEngineWorkspaceArtifacts,
} from './engine-workspace'
import { createShipFastEngineAdapter } from './ship-fast-engine-adapter'
import { toPublicErrorMessage } from '@/shared/errors/public-error-message'
import type {
  EngineWorkspaceArtifacts,
  EngineWorkspaceTask,
} from './engine-workspace'
import type {
  RunShipFastEngine,
  ShipFastEngineAdapterOptions,
} from './ship-fast-engine-adapter'
import type { TranslationCacheClient } from '@ship-fast/engine/llm/translation-cache-client.ts'
import type { PlanCacheClient } from '@ship-fast/engine/v3/plan-cache-client.ts'

export type PersistCompleteGenerationInput = {
  sessionId: string
  anonymousOwnerSecret?: string
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
  signal?: AbortSignal
  cacheClient?: TranslationCacheClient
  planCacheClient?: PlanCacheClient
  promptCacheKey?: string
}

export type RunEngineGenerationResult =
  | { status: 'completed'; previewVersion: number }
  | { status: 'failed'; message: string }

const GENERATION_TIMEOUT_MS = 90_000
const GENERATION_ATTEMPTS = 2

const signalError = (signal: AbortSignal): Error => {
  if (signal.reason instanceof Error) return signal.reason
  if (typeof signal.reason === 'string' && signal.reason.trim()) {
    return new Error(signal.reason)
  }
  return new Error('Generation cancelled')
}

const createGenerationAbortScope = (
  callerSignal?: AbortSignal,
): { signal: AbortSignal; dispose: () => void } => {
  const controller = new AbortController()
  const abortFromCaller = () => controller.abort(callerSignal?.reason)

  if (callerSignal?.aborted) abortFromCaller()
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true })

  const timeout = setTimeout(
    () => controller.abort(new Error('Generation timed out')),
    GENERATION_TIMEOUT_MS,
  )

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeout)
      callerSignal?.removeEventListener('abort', abortFromCaller)
    },
  }
}

const readCompletedWorkspace = (
  workspace: string,
): EngineWorkspaceArtifacts | undefined => {
  try {
    const artifacts = readEngineWorkspaceArtifacts(workspace)
    // An empty (or non-existent) workspace must not be treated as a completed
    // run. Previously `readEngineWorkspaceArtifacts` threw when `index.html`
    // was missing; now that html is out of the generation chain, site-spec.json
    // is the primary output artifact, so require it before recovering.
    if (!artifacts.siteSpecJson) return undefined
    assertCompletedEngineWorkspaceArtifacts(artifacts)
    return artifacts
  } catch {
    return undefined
  }
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
  signal: callerSignal,
  cacheClient,
  planCacheClient,
  promptCacheKey,
}: RunEngineGenerationInput): Promise<RunEngineGenerationResult> {
  const abortScope = createGenerationAbortScope(callerSignal)

  try {
    if (abortScope.signal.aborted) throw signalError(abortScope.signal)

    const workspace = createEngineWorkspacePath(workspaceRoot, sessionId)
    let result = readCompletedWorkspace(workspace)

    if (!result) {
      const adapter = createShipFastEngineAdapter({
        runAll,
        workspaceRoot,
        onEvent,
      })
      let lastError: unknown

      for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
        try {
          result = await adapter.generate({
            sessionId,
            prompt,
            preferredLanguage,
            signal: abortScope.signal,
            cacheClient,
            planCacheClient,
            promptCacheKey,
          })
          break
        } catch (error) {
          lastError = error
          if (abortScope.signal.aborted || attempt + 1 >= GENERATION_ATTEMPTS) {
            throw error
          }
        }
      }

      if (!result) throw lastError ?? new Error('Generation failed')
    }

    const persisted = await persistence.completeGeneration({
      sessionId,
      anonymousOwnerSecret,
      siteSpecJson: result.siteSpecJson,
      openUiSource: result.openUiSource,
      tasks: result.tasks,
    })

    return { status: 'completed', previewVersion: persisted.previewVersion }
  } catch (error) {
    const message = toPublicErrorMessage(
      error,
      anonymousOwnerSecret ? [anonymousOwnerSecret] : [],
    )

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
  } finally {
    abortScope.dispose()
  }
}
