// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAnonymousOwnerSecretKey } from '@/features/session/services/anonymous-owner-secret'
import { reorderInStack } from '../lib/reorder-source'
import { useReorderElement } from './useReorderElement'

const createEditMock = vi.hoisted(() => vi.fn())

vi.mock('convex/react', () => ({
  useMutation: () => createEditMock,
}))

// Test the pure function that the hook uses — the hook itself is a thin
// wrapper around convex mutations which can't be tested in isolation
// without mocking the entire convex client.

describe('useReorderElement (via reorderInStack)', () => {
  const SOURCE = `home_hero = FoodDeliveryHero("title")
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_features = FoodDeliveryFeatures("title2")
home_features_anchor = SectionAnchor("home_features", home_features)
home = Stack([home_hero_anchor, home_features_anchor])`

  it('reorder up swaps with predecessor', () => {
    const result = reorderInStack(SOURCE, 'home_features', 'up')
    expect(result.reordered).toBe(true)
    const stackLine = result.source
      .split('\n')
      .find((l) => l.includes('Stack('))!
    expect(stackLine.indexOf('home_features_anchor')).toBeLessThan(
      stackLine.indexOf('home_hero_anchor'),
    )
  })

  it('reorder down swaps with successor', () => {
    const result = reorderInStack(SOURCE, 'home_hero', 'down')
    expect(result.reordered).toBe(true)
    const stackLine = result.source
      .split('\n')
      .find((l) => l.includes('Stack('))!
    expect(stackLine.indexOf('home_features_anchor')).toBeLessThan(
      stackLine.indexOf('home_hero_anchor'),
    )
  })

  it('reorder up at top returns false', () => {
    const result = reorderInStack(SOURCE, 'home_hero', 'up')
    expect(result.reordered).toBe(false)
  })

  it('reorder down at bottom returns false', () => {
    const result = reorderInStack(SOURCE, 'home_features', 'down')
    expect(result.reordered).toBe(false)
  })

  it('reorder non-existent var returns false', () => {
    const result = reorderInStack(SOURCE, 'nonexistent', 'up')
    expect(result.reordered).toBe(false)
  })
})

describe('useReorderElement', () => {
  const SOURCE = `home_hero = FoodDeliveryHero("title")
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_features = FoodDeliveryFeatures("title2")
home_features_anchor = SectionAnchor("home_features", home_features)
home = Stack([home_hero_anchor, home_features_anchor])`

  beforeEach(() => {
    createEditMock.mockReset()
    window.localStorage.clear()
  })

  it('persists the same reordered OpenUI source command used by AI sectionMove tools', async () => {
    createEditMock.mockResolvedValueOnce({ saved: true, previewVersion: 5 })
    window.localStorage.setItem(
      getAnonymousOwnerSecretKey('session_reorder'),
      'owner-secret',
    )
    const { result } = renderHook(() =>
      useReorderElement({
        sessionId: 'session_reorder',
        getSource: async () => SOURCE,
      }),
    )

    let moved = false
    await act(async () => {
      moved = await result.current.reorder('home_features', 'up')
    })

    expect(moved).toBe(true)
    expect(createEditMock).toHaveBeenCalledTimes(1)
    expect(createEditMock.mock.calls[0][0]).toMatchObject({
      sessionId: 'session_reorder',
      anonymousOwnerSecret: 'owner-secret',
      editType: 'ai_rewrite',
      targetLabel: 'reorder home_features up',
      instruction: 'reorder home_features up',
      afterHtml: expect.stringContaining(
        'Stack([home_features_anchor, home_hero_anchor])',
      ),
    })
  })

  it('does not create a persisted edit when the requested move is a no-op', async () => {
    const { result } = renderHook(() =>
      useReorderElement({
        sessionId: 'session_reorder',
        getSource: async () => SOURCE,
      }),
    )

    let moved = true
    await act(async () => {
      moved = await result.current.reorder('home_hero', 'up')
    })

    expect(moved).toBe(false)
    expect(result.current.reorderError).toBe('Element is already at the top')
    expect(createEditMock).not.toHaveBeenCalled()
  })

  it('does not create a persisted edit when current source is unavailable', async () => {
    const { result } = renderHook(() =>
      useReorderElement({
        sessionId: 'session_reorder',
        getSource: async () => undefined,
      }),
    )

    let moved = true
    await act(async () => {
      moved = await result.current.reorder('home_features', 'up')
    })

    expect(moved).toBe(false)
    expect(result.current.reorderError).toBe('Could not load current source')
    expect(createEditMock).not.toHaveBeenCalled()
  })
})
