import { createAppError } from '@/shared/errors/app-error'
import type { AppErrorShape } from '@/shared/errors/app-error'
import type {
  GenerationStatus,
  SessionTask,
} from '@/features/generation/schemas/generation-contracts'

export type GenerationState = {
  status: GenerationStatus
  previewVersion: number
  tasks: SessionTask[]
  error?: AppErrorShape
}

export type GenerationEvent =
  | { type: 'queued' }
  | { type: 'validating' }
  | { type: 'streaming'; taskKey: string; title: string }
  | { type: 'homepage_ready'; html: string }
  | { type: 'site_spec_ready'; specJson: string }
  | { type: 'preview_ready'; html: string }
  | { type: 'failed'; message: string }

const nextStatusByEvent = {
  queued: 'queued',
  validating: 'validating',
  streaming: 'streaming',
  homepage_ready: 'homepage_ready',
  site_spec_ready: 'site_spec_ready',
  preview_ready: 'preview_ready',
  failed: 'failed',
} satisfies Record<GenerationEvent['type'], GenerationStatus>

const transitionRules: Record<GenerationStatus, readonly GenerationStatus[]> = {
  created: ['queued', 'validating', 'failed'],
  queued: ['validating', 'streaming', 'failed'],
  validating: ['streaming', 'failed'],
  streaming: ['homepage_ready', 'failed'],
  homepage_ready: ['site_spec_ready', 'preview_ready', 'failed'],
  site_spec_ready: ['preview_ready', 'failed'],
  preview_ready: ['failed'],
  failed: [],
}

const previewEvents: readonly GenerationEvent['type'][] = [
  'homepage_ready',
  'preview_ready',
]

export function createInitialGenerationState(): GenerationState {
  return {
    status: 'created',
    previewVersion: 0,
    tasks: [],
  }
}

export function canTransitionGenerationStatus(
  from: GenerationStatus,
  to: GenerationStatus,
): boolean {
  // Fail closed for unknown/persisted-legacy statuses instead of crashing
  // when `transitionRules[from]` is undefined.
  const allowed = transitionRules[from]
  return Array.isArray(allowed) ? allowed.includes(to) : false
}

export function applyGenerationEvent(
  state: GenerationState,
  event: GenerationEvent,
): GenerationState {
  const nextStatus = nextStatusByEvent[event.type]
  const canTransition = canTransitionGenerationStatus(state.status, nextStatus)

  return canTransition
    ? {
        ...state,
        status: nextStatus,
        previewVersion: previewEvents.includes(event.type)
          ? state.previewVersion + 1
          : state.previewVersion,
        tasks:
          event.type === 'streaming'
            ? [
                ...state.tasks,
                {
                  taskKey: event.taskKey,
                  title: event.title,
                  status: 'running',
                  order: state.tasks.length,
                },
              ]
            : state.tasks,
        error:
          event.type === 'failed'
            ? {
                code: 'GENERATION_FAILED',
                message: event.message,
                status: createAppError('GENERATION_FAILED', event.message)
                  .status,
              }
            : state.error,
      }
    : {
        ...state,
        status: 'failed',
        error: {
          code: 'GENERATION_FAILED',
          message: `Invalid generation transition from ${state.status} to ${nextStatus}`,
          status: 500,
        },
      }
}
