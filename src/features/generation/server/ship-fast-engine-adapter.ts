import {
  assertCompletedEngineWorkspaceArtifacts,
  createEngineWorkspacePath,
  prepareEngineWorkspace,
  readEngineWorkspaceArtifacts,
} from './engine-workspace'
import type { EngineWorkspaceArtifacts } from './engine-workspace'
import type { TranslationCacheClient } from '@ship-fast/engine/llm/translation-cache-client.ts'
import type { PlanCacheClient } from '@ship-fast/engine'

export type ShipFastEngineSessionEvent =
  | { type: 'log'; message: string }
  | { type: 'status'; message: string; phase?: string }
  | { type: 'task'; task: unknown }
  | { type: 'tasks'; tasks: unknown[] }
  | { type: 'preview_ready' }
  | { type: 'openui_ready' }
  | { type: 'broadcast'; payload: unknown }

export type ShipFastEngineSessionContext = {
  id: string
  broadcast: (payload: unknown) => void
  setPrompt: (prompt: string) => void
  setTasks: (tasks: unknown[]) => void
  updateTask: (task: unknown) => void
  signalHomepageReady: () => void
  signalOpenuiReady: () => void
  setElapsed: (elapsed: number) => void
  setCost: (cost: number) => void
  cacheClient?: TranslationCacheClient
}

export type RunShipFastEngine = (input: {
  prompt: string
  workspace: string
  sessionCtx: ShipFastEngineSessionContext
  integrations?: {
    afterSiteSpecSaved?: (opts: {
      workspace: string
      siteSpec: unknown
      log: (msg: string) => void
      status: (message: string, phase: string) => void
    }) => Promise<void>
  }
  preferredLanguage?: string
  signal?: AbortSignal
  cacheClient?: TranslationCacheClient
  planCacheClient?: PlanCacheClient
  promptCacheKey?: string
  sessionId?: string
}) => Promise<unknown>

export type ShipFastEngineAdapterInput = {
  sessionId: string
  prompt: string
  preferredLanguage?: string
  signal?: AbortSignal
  cacheClient?: TranslationCacheClient
  planCacheClient?: PlanCacheClient
  promptCacheKey?: string
}

export type ShipFastEngineAdapterResult = EngineWorkspaceArtifacts & {
  workspace: string
  events: ShipFastEngineSessionEvent[]
  elapsedMs: number
}

export type ShipFastEngineAdapterOptions = {
  runAll: RunShipFastEngine
  workspaceRoot: string
  now?: () => number
  onEvent?: (
    event: ShipFastEngineSessionEvent,
    context: { sessionId: string; prompt: string; workspace: string },
  ) => void | Promise<void>
}

function createSessionContext(
  sessionId: string,
  emit: (event: ShipFastEngineSessionEvent) => void,
  cacheClient?: TranslationCacheClient,
): ShipFastEngineSessionContext {
  return {
    id: sessionId,
    broadcast: (payload) => emit({ type: 'broadcast', payload }),
    setPrompt: (message) => emit({ type: 'log', message }),
    setTasks: (tasks) => emit({ type: 'tasks', tasks }),
    updateTask: (task) => emit({ type: 'task', task }),
    signalHomepageReady: () => emit({ type: 'preview_ready' }),
    signalOpenuiReady: () => emit({ type: 'openui_ready' }),
    setElapsed: (elapsed) =>
      emit({ type: 'status', message: String(elapsed), phase: 'elapsed' }),
    setCost: (cost) =>
      emit({ type: 'status', message: String(cost), phase: 'cost' }),
    cacheClient,
  }
}

const eventKey = (event: ShipFastEngineSessionEvent): string | undefined => {
  try {
    return JSON.stringify(event)
  } catch {
    return undefined
  }
}

const abortReason = (signal: AbortSignal): Error => {
  if (signal.reason instanceof Error) return signal.reason
  if (typeof signal.reason === 'string' && signal.reason.trim()) {
    return new Error(signal.reason)
  }
  return new Error('Generation cancelled')
}

const runWithSignal = async <T>(
  operation: Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  if (!signal) return await operation
  if (signal.aborted) throw abortReason(signal)

  let abortListener: (() => void) | undefined
  const aborted = new Promise<never>((_resolve, reject) => {
    abortListener = () => reject(abortReason(signal))
    signal.addEventListener('abort', abortListener, { once: true })
  })

  try {
    return await Promise.race([operation, aborted])
  } finally {
    if (abortListener) signal.removeEventListener('abort', abortListener)
  }
}

export function createShipFastEngineAdapter({
  runAll,
  workspaceRoot,
  now = Date.now,
  onEvent,
}: ShipFastEngineAdapterOptions) {
  return {
    generate: async ({
      sessionId,
      prompt,
      preferredLanguage,
      signal,
      cacheClient,
      planCacheClient,
      promptCacheKey,
    }: ShipFastEngineAdapterInput) => {
      const startedAt = now()
      const events: ShipFastEngineSessionEvent[] = []
      const seenEvents = new Set<string>()
      const pendingEventWrites: Promise<void>[] = []
      const workspace = createEngineWorkspacePath(workspaceRoot, sessionId)
      const persistEvent = (event: ShipFastEngineSessionEvent) => {
        if (!onEvent) return

        pendingEventWrites.push(
          Promise.resolve()
            .then(() => onEvent(event, { sessionId, prompt, workspace }))
            .catch(() => undefined),
        )
      }
      const emit = (event: ShipFastEngineSessionEvent) => {
        const key = eventKey(event)
        if (key && seenEvents.has(key)) return
        if (key) seenEvents.add(key)
        events.push(event)
        // All events — including preview_ready — are emitted immediately so
        // the dashboard can show the first frame as soon as it's available.
        // A later generation failure is handled separately; the user keeps
        // the partial preview and the failed portion can be retried.
        persistEvent(event)
      }

      if (signal?.aborted) throw abortReason(signal)
      prepareEngineWorkspace(workspace)
      await runWithSignal(
        runAll({
          prompt,
          workspace,
          sessionCtx: createSessionContext(sessionId, emit, cacheClient),
          preferredLanguage,
          signal,
          cacheClient,
          planCacheClient,
          promptCacheKey,
          sessionId,
        }),
        signal,
      )
      const artifacts = readEngineWorkspaceArtifacts(workspace)
      assertCompletedEngineWorkspaceArtifacts(artifacts)

      await Promise.all(pendingEventWrites)

      return {
        ...artifacts,
        workspace,
        events,
        elapsedMs: now() - startedAt,
      }
    },
  }
}
