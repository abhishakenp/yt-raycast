// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Id } from '../../../../convex/_generated/dataModel'

// Mock convex/react — factory must be self-contained (vi.mock is hoisted)
const mockCreateEdit = vi.fn()
const mockForkSession = vi.fn()
const mockRestorePreviewVersion = vi.fn()
vi.mock('convex/react', () => ({
  useMutation: (fn: unknown) => {
    const fnName = (fn as Record<string, unknown>).__name as string
    if (fnName === 'sessions:createEdit') return mockCreateEdit
    if (fnName === 'sessions:forkSession') return mockForkSession
    if (fnName === 'sessions:restorePreviewVersion')
      return mockRestorePreviewVersion
    return vi.fn()
  },
  useQuery: () => undefined,
}))

// Mock anonymous owner secret
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => 'owner-secret',
}))

// Mock the API object so useMutation can read __name
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      createEdit: { __name: 'sessions:createEdit' },
      forkSession: { __name: 'sessions:forkSession' },
      restorePreviewVersion: { __name: 'sessions:restorePreviewVersion' },
      listEdits: { __name: 'sessions:listEdits' },
      listPreviewHistory: { __name: 'sessions:listPreviewHistory' },
    },
  },
}))

import { useEditController } from './useEditController'

/**
 * Tests that applyEdit returns the error synchronously (not via stale React
 * state). This is the regression that caused missing error toasts when text
 * edits failed to persist.
 */
describe('useEditController: applyEdit error return', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns { ok: false, error } when mutation throws TEXT_NOT_FOUND', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('TEXT_NOT_FOUND: Selected text was not found'),
    )

    const { result } = renderHook(() =>
      useEditController('test-session-id' as Id<'sessions'>),
    )

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play…',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).not.toBe(true)
    expect(editResult).not.toBe(false)
    expect(editResult).not.toBe('fork_needed')
    expect(editResult).toEqual({
      ok: false,
      error: expect.stringContaining('TEXT_NOT_FOUND'),
    })
  })

  it('returns true when mutation succeeds', async () => {
    mockCreateEdit.mockResolvedValueOnce({ saved: true })

    const { result } = renderHook(() =>
      useEditController('test-session-id' as Id<'sessions'>),
    )

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play…',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).toBe(true)
  })

  it('returns fork_needed when mutation throws FORBIDDEN error', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('FORBIDDEN: you do not own this session'),
    )

    const { result } = renderHook(() =>
      useEditController('test-session-id' as Id<'sessions'>),
    )

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play…',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).toBe('fork_needed')
  })

  it('returns { ok: false, error } when saved === false', async () => {
    mockCreateEdit.mockResolvedValueOnce({ saved: false })

    const { result } = renderHook(() =>
      useEditController('test-session-id' as Id<'sessions'>),
    )

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play…',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).toEqual({
      ok: false,
      error: expect.stringContaining('not found'),
    })
  })
})
