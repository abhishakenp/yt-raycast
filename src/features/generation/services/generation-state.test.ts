import { describe, expect, it } from 'vitest'

import { createMockGenUIEvents } from '@/features/generation/services/mock-genui-adapter'
import {
  applyGenerationEvent,
  canTransitionGenerationStatus,
  createInitialGenerationState,
} from '@/features/generation/services/generation-state'

describe('generation state machine', () => {
  it('allows the happy-path generation sequence', async () => {
    const events = await createMockGenUIEvents({ prompt: 'hotel booking site' })
    const finalState = events.reduce(applyGenerationEvent, createInitialGenerationState())

    expect(finalState.status).toBe('preview_ready')
    expect(finalState.previewVersion).toBe(2)
    expect(finalState.tasks).toHaveLength(1)
  })

  it('rejects transitions that skip required readiness', () => {
    const state = applyGenerationEvent(createInitialGenerationState(), {
      type: 'preview_ready',
      html: '<main />',
    })

    expect(state.status).toBe('failed')
    expect(state.error?.message).toContain('Invalid generation transition')
  })

  it('documents allowed status transitions', () => {
    expect(canTransitionGenerationStatus('created', 'queued')).toBe(true)
    expect(canTransitionGenerationStatus('created', 'preview_ready')).toBe(false)
  })
})
