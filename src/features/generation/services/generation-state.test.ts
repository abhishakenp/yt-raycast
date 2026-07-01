import { describe, expect, it } from 'vitest'

import {
  applyGenerationEvent,
  canTransitionGenerationStatus,
  createInitialGenerationState,
  type GenerationEvent,
} from '@/features/generation/services/generation-state'

describe('generation state machine', () => {
  it('allows the happy-path generation sequence', async () => {
    const events: GenerationEvent[] = [
      { type: 'queued' },
      { type: 'validating' },
      {
        type: 'streaming',
        taskKey: 'homepage',
        title: 'Generate homepage for hotel booking site',
      },
      {
        type: 'homepage_ready',
        html: '<main><h1>Generated homepage</h1></main>',
      },
      {
        type: 'site_spec_ready',
        specJson: JSON.stringify({ pages: ['home'] }),
      },
      {
        type: 'preview_ready',
        html: '<main><h1>Generated homepage</h1></main>',
      },
    ]
    const finalState = events.reduce(
      applyGenerationEvent,
      createInitialGenerationState(),
    )

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
    expect(canTransitionGenerationStatus('created', 'preview_ready')).toBe(
      false,
    )
  })

  it('fails closed instead of crashing when persisted generation status is unknown', () => {
    expect(() =>
      canTransitionGenerationStatus('migrating_from_legacy' as never, 'queued'),
    ).not.toThrow()
    expect(
      canTransitionGenerationStatus('migrating_from_legacy' as never, 'queued'),
    ).toBe(false)

    const state = applyGenerationEvent(
      {
        ...createInitialGenerationState(),
        status: 'migrating_from_legacy' as never,
      },
      { type: 'queued' },
    )

    expect(state.status).toBe('failed')
    expect(state.error?.message).toContain('Invalid generation transition')
  })

  it('fails closed instead of crashing when an event type is unknown', () => {
    const state = applyGenerationEvent(createInitialGenerationState(), {
      type: 'provider_retrying',
    } as never)

    expect(state.status).toBe('failed')
    expect(state.error?.message).toContain('Invalid generation transition')
  })
})
