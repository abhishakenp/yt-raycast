import {
  createEngineWorkspacePath,
  prepareEngineWorkspace,
  readEngineWorkspaceArtifacts,
} from '@/features/generation/server/engine-workspace'
import type { EngineWorkspaceArtifacts, EngineWorkspaceTask } from '@/features/generation/server/engine-workspace'

export type ShipFastEngineSessionEvent =
  | { type: 'log'; message: string }
  | { type: 'status'; message: string; phase?: string }
  | { type: 'task'; task: EngineWorkspaceTask }
  | { type: 'tasks'; tasks: EngineWorkspaceTask[] }
  | { type: 'preview_ready' }
  | { type: 'openui_ready' }
  | { type: 'broadcast'; payload: unknown }

export type ShipFastEngineSessionContext = {
  id: string
  broadcast: (payload: unknown) => void
  setPrompt: (prompt: string) => void
  setTasks: (tasks: EngineWorkspaceTask[]) => void
  updateTask: (task: EngineWorkspaceTask) => void
  signalHomepageReady: () => void
  signalOpenuiReady: () => void
  setElapsed: (elapsed: number) => void
  setCost: (cost: number) => void
}

export type RunShipFastEngine = (input: {
  prompt: string
  workspace: string
  sessionCtx: ShipFastEngineSessionContext
  integrations?: unknown
}) => Promise<unknown>

export type ShipFastEngineAdapterInput = {
  sessionId: string
  prompt: string
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
}

const createSessionContext = (
  sessionId: string,
  events: ShipFastEngineSessionEvent[],
): ShipFastEngineSessionContext => ({
  id: sessionId,
  broadcast: (payload) => events.push({ type: 'broadcast', payload }),
  setPrompt: (message) => events.push({ type: 'log', message }),
  setTasks: (tasks) => events.push({ type: 'tasks', tasks }),
  updateTask: (task) => events.push({ type: 'task', task }),
  signalHomepageReady: () => events.push({ type: 'preview_ready' }),
  signalOpenuiReady: () => events.push({ type: 'openui_ready' }),
  setElapsed: (elapsed) => events.push({ type: 'status', message: String(elapsed), phase: 'elapsed' }),
  setCost: (cost) => events.push({ type: 'status', message: String(cost), phase: 'cost' }),
})

export const createShipFastEngineAdapter = ({
  runAll,
  workspaceRoot,
  now = Date.now,
}: ShipFastEngineAdapterOptions) => ({
  generate: async ({ sessionId, prompt }: ShipFastEngineAdapterInput): Promise<ShipFastEngineAdapterResult> => {
    const startedAt = now()
    const events: ShipFastEngineSessionEvent[] = []
    const workspace = createEngineWorkspacePath(workspaceRoot, sessionId)

    prepareEngineWorkspace(workspace)
    await runAll({
      prompt,
      workspace,
      sessionCtx: createSessionContext(sessionId, events),
    })

    return {
      ...readEngineWorkspaceArtifacts(workspace),
      workspace,
      events,
      elapsedMs: now() - startedAt,
    }
  },
})
