// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createEdit: vi.fn(),
  forkSession: vi.fn(),
  restorePreviewVersion: vi.fn(),
  navigate: vi.fn(),
  readOwnerSecret: vi.fn(() => 'owner-secret'),
  setCachedTranslation: vi.fn(),
  serverApplyEdit: vi.fn(),
  queryValues: new Map(),
}))

vi.mock('@tanstack/react-router', () => {
  function useNavigate() {
    return mocks.navigate
  }
  return { useNavigate }
})

vi.mock('convex/react', () => {
  function useMutation(reference: { __name?: string }) {
    if (reference.__name === 'sessions:createEdit') return mocks.createEdit
    if (reference.__name === 'sessions:forkSession') return mocks.forkSession
    if (reference.__name === 'sessions:restorePreviewVersion') {
      return mocks.restorePreviewVersion
    }
    return vi.fn()
  }

  function useQuery(reference: { __name?: string }) {
    return mocks.queryValues.get(reference.__name)
  }

  return { useMutation, useQuery }
})

vi.mock('@/features/session/services/anonymous-owner-secret', () => {
  function readAnonymousOwnerSecret() {
    return mocks.readOwnerSecret()
  }
  return { readAnonymousOwnerSecret }
})

vi.mock('@/island/openui/_providers/translation', () => {
  function setCachedTranslation(locale: string, source: string, value: string) {
    mocks.setCachedTranslation(locale, source, value)
  }
  return { setCachedTranslation }
})

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

function ServerControllerHarness() {
  const controller = useEditController('session-1')
  mocks.serverApplyEdit.mockImplementation(controller.applyEdit)
  return null
}

describe('useEditController release regressions', () => {
  beforeEach(() => {
    mocks.createEdit.mockResolvedValue({ saved: true })
    mocks.forkSession.mockResolvedValue({ sessionId: 'forked-session' })
    mocks.restorePreviewVersion.mockResolvedValue(undefined)
    mocks.queryValues.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('exposes hydrated edit and preview history queries without replacing them with empty arrays', () => {
    const edit = { editType: 'text', previewVersion: 4 }
    const historyEntry = { version: 4 }
    mocks.queryValues.set('sessions:listEdits', [edit])
    mocks.queryValues.set('sessions:listPreviewHistory', [historyEntry])

    const { result } = renderHook(() => useEditController('session-1'))

    expect(result.current.edits).toEqual([edit])
    expect(result.current.history).toEqual([historyEntry])
  })

  it('normalizes a non-Error edit rejection and leaves the controller idle', async () => {
    mocks.createEdit.mockRejectedValueOnce('network disconnected')
    const { result } = renderHook(() => useEditController('session-1'))

    await act(async () => {
      await expect(
        result.current.applyEdit(
          'text',
          'Hero heading',
          'Before',
          'After',
          'inline edit',
        ),
      ).resolves.toEqual({ ok: false, error: 'Edit failed' })
    })

    expect(result.current.editError).toBe('Edit failed')
    expect(result.current.isEditing).toBe(false)
  })

  it('rejects a fork response without a destination session id', async () => {
    mocks.forkSession.mockResolvedValueOnce({})
    const { result } = renderHook(() => useEditController('session-1'))

    await act(async () => {
      await expect(result.current.forkCurrentSession()).resolves.toBeNull()
    })

    expect(result.current.editError).toBe('Fork failed: no session ID returned')
    expect(result.current.isForking).toBe(false)
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('normalizes a non-Error fork rejection', async () => {
    mocks.forkSession.mockRejectedValueOnce('connection lost')
    const { result } = renderHook(() => useEditController('session-1'))

    await act(async () => {
      await expect(result.current.forkCurrentSession()).resolves.toBeNull()
    })

    expect(result.current.editError).toBe('Fork failed')
    expect(result.current.isForking).toBe(false)
  })

  it('reports both Error and non-Error preview restore failures', async () => {
    mocks.restorePreviewVersion
      .mockRejectedValueOnce(new Error('VERSION_MISSING'))
      .mockRejectedValueOnce('offline')
    const { result } = renderHook(() => useEditController('session-1'))

    await act(async () => {
      await result.current.restoreVersion(2)
    })
    expect(result.current.editError).toBe('VERSION_MISSING')

    await act(async () => {
      await result.current.restoreVersion(3)
    })
    expect(result.current.editError).toBe('Restore failed')
    expect(result.current.isEditing).toBe(false)
  })

  it('does not poison the browser cache with an incomplete translated edit', async () => {
    mocks.createEdit.mockResolvedValueOnce({
      saved: true,
      translatedEdit: {
        locale: 'hi',
        sourceText: 'Original heading',
      },
    })
    const { result } = renderHook(() => useEditController('session-1'))

    await act(async () => {
      await result.current.applyEdit(
        'text',
        'Hero heading',
        'Before',
        'After',
        'inline edit',
      )
    })

    expect(mocks.setCachedTranslation).not.toHaveBeenCalled()
  })

  it('omits browser owner credentials when an edit executes without window', async () => {
    vi.stubGlobal('window', undefined)
    renderToString(<ServerControllerHarness />)

    await mocks.serverApplyEdit(
      'text',
      'Hero heading',
      'Before',
      'After',
      'inline edit',
    )

    expect(mocks.readOwnerSecret).not.toHaveBeenCalled()
    expect(mocks.createEdit).toHaveBeenCalledWith(
      expect.objectContaining({ anonymousOwnerSecret: undefined }),
    )
  })
})
