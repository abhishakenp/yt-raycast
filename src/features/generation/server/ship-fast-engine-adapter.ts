import {
  createEngineWorkspacePath,
  prepareEngineWorkspace,
  readEngineWorkspaceArtifacts,
} from './engine-workspace'
import type { EngineWorkspaceArtifacts } from './engine-workspace'

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
}) => Promise<unknown>

export type ShipFastEngineAdapterInput = {
  sessionId: string
  prompt: string
  preferredLanguage?: string
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
  }
}

export function createShipFastEngineAdapter({
  runAll,
  workspaceRoot,
  now = Date.now,
  onEvent,
}: ShipFastEngineAdapterOptions) {
  return {
    generate: async ({ sessionId, prompt, preferredLanguage }) => {
      const startedAt = now()
      const events: ShipFastEngineSessionEvent[] = []
      const pendingEventWrites: Promise<void>[] = []
      const workspace = createEngineWorkspacePath(workspaceRoot, sessionId)
      const emit = (event) => {
        events.push(event)

        if (onEvent) {
          pendingEventWrites.push(
            Promise.resolve(
              onEvent(event, { sessionId, prompt, workspace }),
            ).catch(() => undefined),
          )
        }
      }

      prepareEngineWorkspace(workspace)
      await runAll({
        prompt,
        workspace,
        sessionCtx: createSessionContext(sessionId, emit),
        preferredLanguage,
      })
      await Promise.all(pendingEventWrites)

      return {
        ...readEngineWorkspaceArtifacts(workspace),
        workspace,
        events,
        elapsedMs: now() - startedAt,
      }
    },
  }
}
