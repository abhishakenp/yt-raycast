// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Id } from '../../../../convex/_generated/dataModel'

// Mock convex/react — factory must be self-contained (vi.mock is hoisted).
// useMutation is routed by the function __name so each mutation is independently
// controllable from individual tests.
const mockCreateEdit = vi.fn()
const mockForkSession = vi.fn()
const mockRestorePreviewVersion = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

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

// Mock anonymous owner secret so applyEdit/fork paths don't touch real storage.
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => 'owner-secret',
}))

const mockSetCachedTranslation = vi.hoisted(() => vi.fn())

vi.mock('@/island/openui/_providers/translation', () => ({
  setCachedTranslation: mockSetCachedTranslation,
}))

// Mock the API object so useMutation can read __name off each query reference.
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
 * Behavioral tests for useEditController.
 *
 * Philosophy: assert EXPECTED / CORRECT behavior. If the production code is
 * buggy, the test MUST fail — we do not pin current broken behavior.
 *
 * The real hook is rendered via renderHook; convex/react mutations are mocked
 * with controllable async functions so we can drive pending / resolve / reject
 * transitions and assert the hook's real state machine.
 */

// A deferred lets a test hold a mutation pending, assert mid-flight state, then
// resolve/reject to finish the flow.
type Deferred<T> = {
  promise: Promise<T>
  resolve: (v: T) => void
  reject: (e: unknown) => void
}
function makeDeferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const SESSION_ID = 'test-session-id' as Id<'sessions'>

// jsdom throws a console error on `window.location.href =` assignment; stub it
// so forkCurrentSession's redirect doesn't pollute output or throw.
function stubLocation() {
  const original = window.location
  // @ts-expect-error — intentional jsdom override for test isolation
  delete window.location
  // @ts-expect-error — minimal writable location stub
  window.location = { href: '' }
  return original
}
function restoreLocation(original: Location) {
  // @ts-expect-error — restore the real jsdom location
  delete window.location
  // @ts-expect-error — reassign
  window.location = original
}

describe('useEditController (behavioral)', () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = stubLocation()
  })
  afterEach(() => {
    vi.clearAllMocks()
    restoreLocation(originalLocation)
  })

  // 1. applyEdit success
  it('1. applyEdit success: returns true, editError cleared, isEditing false after', async () => {
    mockCreateEdit.mockResolvedValueOnce({ saved: true })
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).toBe(true)
    expect(result.current.editError).toBeUndefined()
    expect(result.current.isEditing).toBe(false)
  })

  it('refreshes the browser translation cache when a translated inline edit is saved', async () => {
    mockCreateEdit.mockResolvedValueOnce({
      saved: true,
      translatedEdit: {
        locale: 'hi',
        sourceText: 'Original English headline',
        translation: 'अपडेट किया गया शीर्षक',
      },
    })
    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.applyEdit(
        'text',
        'Hero headline',
        'मूल अंग्रेज़ी शीर्षक',
        'अपडेट किया गया शीर्षक',
        'inline edit',
      )
    })

    expect(mockSetCachedTranslation).toHaveBeenCalledWith(
      'hi',
      'Original English headline',
      'अपडेट किया गया शीर्षक',
    )
  })

  // 2. TEXT_NOT_FOUND error
  it('2. applyEdit TEXT_NOT_FOUND error: returns { ok:false, error }, editError set', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('TEXT_NOT_FOUND: Selected text was not found'),
    )
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).toEqual({
      ok: false,
      error: expect.stringContaining('TEXT_NOT_FOUND'),
    })
    expect(result.current.editError).toContain('TEXT_NOT_FOUND')
    expect(result.current.isEditing).toBe(false)
  })

  // 3. FORBIDDEN error → fork_needed
  it('3. applyEdit FORBIDDEN error: returns "fork_needed", editError set', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('FORBIDDEN: you do not own this session'),
    )
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
      )
    })

    expect(editResult).toBe('fork_needed')
    expect(result.current.editError).toContain('FORBIDDEN')
    expect(result.current.isEditing).toBe(false)
  })

  // 4. Generic unknown error
  it('4. applyEdit generic error: returns { ok:false, error }, editError set', async () => {
    mockCreateEdit.mockRejectedValueOnce(new Error('something blew up'))
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        'BUTTON: Google Play',
        'Google Play',
        'Gogle Play',
        'inline edit',
        undefined,
        0,
      )
    })

    expect(editResult).toEqual({
      ok: false,
      error: expect.stringContaining('something blew up'),
    })
    expect(result.current.editError).toBe('something blew up')
    expect(result.current.isEditing).toBe(false)
  })

  // 5. forkCurrentSession re-applies pending edit
  it('5. forkCurrentSession: fork success → pending edit re-applied (forkSession called with pending edit payload)', async () => {
    // First, trigger a FORBIDDEN edit so a pending edit is stored.
    mockCreateEdit.mockRejectedValueOnce(
      new Error('FORBIDDEN: you do not own this session'),
    )
    mockForkSession.mockResolvedValueOnce({ sessionId: 'forked-session-1' })

    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.applyEdit(
        'text',
        'BUTTON: Google Play',
        'Google Play',
        'Gogle Play',
        'inline edit',
        '<b>Gogle Play</b>',
        2,
      )
    })

    let forkResult: unknown
    await act(async () => {
      forkResult = await result.current.forkCurrentSession()
    })

    // forkSession is invoked once and carries the pending edit so the server
    // re-applies it on the owned fork.
    expect(mockForkSession).toHaveBeenCalledTimes(1)
    const forkArg = mockForkSession.mock.calls[0][0]
    expect(forkArg.sourceSessionId).toBe(SESSION_ID)
    expect(forkArg.edit).toMatchObject({
      editType: 'text',
      targetLabel: 'BUTTON: Google Play',
      beforeText: 'Google Play',
      afterText: 'Gogle Play',
      instruction: 'inline edit',
      afterHtml: '<b>Gogle Play</b>',
      occurrenceIndex: 2,
    })
    expect(forkResult).toEqual({ sessionId: 'forked-session-1' })
    expect(result.current.isForking).toBe(false)
  })

  // 6. fork mutation fails
  it('6. forkCurrentSession: fork fails → editError set, isForking false', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('FORBIDDEN: you do not own this session'),
    )
    mockForkSession.mockRejectedValueOnce(new Error('fork exploded'))

    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.applyEdit('text', 'lbl', 'a', 'b', 'instr')
    })

    let forkResult: unknown
    await act(async () => {
      forkResult = await result.current.forkCurrentSession()
    })

    expect(forkResult).toBeNull()
    expect(result.current.editError).toBe('fork exploded')
    expect(result.current.isForking).toBe(false)
  })

  // 7. restoreVersion
  it('7. restoreVersion: calls restorePreviewVersion with correct version number', async () => {
    mockRestorePreviewVersion.mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.restoreVersion(7)
    })

    expect(mockRestorePreviewVersion).toHaveBeenCalledTimes(1)
    expect(mockRestorePreviewVersion.mock.calls[0][0]).toMatchObject({
      sessionId: SESSION_ID,
      version: 7,
    })
    expect(result.current.isEditing).toBe(false)
  })

  // 8. Edit types forwarded to mutation
  it('8. Edit types: text/style/image/ai_rewrite forwarded as editType on createEdit', async () => {
    const { result } = renderHook(() => useEditController(SESSION_ID))

    for (const type of ['text', 'style', 'image', 'ai_rewrite'] as const) {
      mockCreateEdit.mockResolvedValueOnce({ saved: true })
      await act(async () => {
        await result.current.applyEdit(type, 'lbl', 'a', 'b', 'instr')
      })
    }

    expect(mockCreateEdit).toHaveBeenCalledTimes(4)
    expect(mockCreateEdit.mock.calls[0][0].editType).toBe('text')
    expect(mockCreateEdit.mock.calls[1][0].editType).toBe('style')
    expect(mockCreateEdit.mock.calls[2][0].editType).toBe('image')
    expect(mockCreateEdit.mock.calls[3][0].editType).toBe('ai_rewrite')
  })

  it('8b. style clear edits with an empty style string are persisted when the edit has an instruction', async () => {
    mockCreateEdit.mockResolvedValueOnce({ saved: true })
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'style',
        'SECTION: Hero…',
        '[data-openui-var="home_hero"]',
        '',
        'inline style',
        undefined,
        0,
      )
    })

    expect(editResult).toBe(true)
    expect(mockCreateEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: SESSION_ID,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'style',
        targetLabel: 'SECTION: Hero…',
        beforeText: '[data-openui-var="home_hero"]',
        afterText: '',
        instruction: 'inline style',
        occurrenceIndex: 0,
      }),
    )
  })

  it('8c. image removal edits with an empty replacement are persisted when the edit has an instruction', async () => {
    mockCreateEdit.mockResolvedValueOnce({ saved: true })
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'image',
        'IMG: Hero…',
        'Hero alt',
        '',
        'remove image',
        undefined,
        2,
      )
    })

    expect(editResult).toBe(true)
    expect(mockCreateEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: SESSION_ID,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'image',
        targetLabel: 'IMG: Hero…',
        beforeText: 'Hero alt',
        afterText: '',
        instruction: 'remove image',
        occurrenceIndex: 2,
      }),
    )
  })

  // 9. isEditing true while mutation pending
  it('9. isEditing: true while mutation pending, false after resolve', async () => {
    const deferred = makeDeferred<{ saved: boolean }>()
    mockCreateEdit.mockReturnValueOnce(deferred.promise)
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editPromise!: Promise<unknown>
    act(() => {
      editPromise = result.current.applyEdit('text', 'lbl', 'a', 'b', 'instr')
    })

    // Mid-flight: editing flag raised.
    expect(result.current.isEditing).toBe(true)

    await act(async () => {
      deferred.resolve({ saved: true })
      await editPromise
    })

    expect(result.current.isEditing).toBe(false)
  })

  // 10. isForking true while fork mutation pending
  it('10. isForking: true while fork pending, false after', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('FORBIDDEN: you do not own this session'),
    )
    const deferred = makeDeferred<{ sessionId: string }>()
    mockForkSession.mockReturnValueOnce(deferred.promise)

    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.applyEdit('text', 'lbl', 'a', 'b', 'instr')
    })

    let forkPromise!: Promise<unknown>
    act(() => {
      forkPromise = result.current.forkCurrentSession()
    })

    expect(result.current.isForking).toBe(true)

    await act(async () => {
      deferred.resolve({ sessionId: 'forked-2' })
      await forkPromise
    })

    expect(result.current.isForking).toBe(false)
  })

  // 11. editError clears on new successful edit
  it('11. editError clears when a new successful edit happens', async () => {
    mockCreateEdit.mockRejectedValueOnce(new Error('first failure'))
    mockCreateEdit.mockResolvedValueOnce({ saved: true })

    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.applyEdit('text', 'lbl', 'a', 'b', 'instr')
    })
    expect(result.current.editError).toBe('first failure')

    await act(async () => {
      await result.current.applyEdit('text', 'lbl', 'a', 'b', 'instr')
    })
    expect(result.current.editError).toBeUndefined()
  })

  // 12. Pending edit stored when fork needed, cleared after fork re-applies
  it('12. Pending edit stored when fork needed, cleared after fork re-applies', async () => {
    mockCreateEdit.mockRejectedValueOnce(
      new Error('FORBIDDEN: you do not own this session'),
    )
    mockForkSession.mockResolvedValueOnce({ sessionId: 'forked-3' })
    // A second fork (after the first succeeds) should carry no pending edit.
    mockForkSession.mockResolvedValueOnce({ sessionId: 'forked-4' })

    const { result } = renderHook(() => useEditController(SESSION_ID))

    await act(async () => {
      await result.current.applyEdit(
        'text',
        'lbl',
        'a',
        'b',
        'instr',
        undefined,
        1,
      )
    })

    await act(async () => {
      await result.current.forkCurrentSession()
    })
    // First fork carries the stored pending edit.
    expect(mockForkSession.mock.calls[0][0].edit).toMatchObject({
      editType: 'text',
      targetLabel: 'lbl',
      occurrenceIndex: 1,
    })

    await act(async () => {
      await result.current.forkCurrentSession()
    })
    // After a successful fork the pending edit ref is cleared, so a subsequent
    // fork carries no edit payload.
    expect(mockForkSession.mock.calls[1][0].edit).toBeUndefined()
  })

  // 13. Empty content SHOULD be rejected without calling the mutation.
  // Expected behavior: applyEdit must short-circuit on empty content and never
  // invoke createEdit. If the code forwards an empty edit to the mutation,
  // this test FAILS (that is a bug).
  it('13. Empty content: rejected without calling mutation', async () => {
    const { result } = renderHook(() => useEditController(SESSION_ID))

    let editResult: unknown
    await act(async () => {
      editResult = await result.current.applyEdit(
        'text',
        undefined,
        undefined,
        undefined,
        undefined,
      )
    })

    // The mutation must NOT be called for an empty edit.
    expect(mockCreateEdit).not.toHaveBeenCalled()
    // And the call must be rejected (not return true).
    expect(editResult).not.toBe(true)
    expect(result.current.isEditing).toBe(false)
  })

  // 14. Concurrent edits: a second edit while the first is pending SHOULD be
  // queued or rejected — not silently dropped, and not run in parallel with a
  // single boolean isEditing that flips false after the first resolves while
  // the second is still pending.
  //
  // Expected behavior: while the second edit is still pending, isEditing must
  // remain true. If isEditing goes false after the first resolves (because it
  // is a single boolean with no refcount / queue), this test FAILS — that is a
  // bug.
  it('14. Concurrent edits: second edit while first pending is queued/rejected, isEditing stays true while any edit pending', async () => {
    const d1 = makeDeferred<{ saved: boolean }>()
    const d2 = makeDeferred<{ saved: boolean }>()
    mockCreateEdit.mockReturnValueOnce(d1.promise)
    mockCreateEdit.mockReturnValueOnce(d2.promise)

    const { result } = renderHook(() => useEditController(SESSION_ID))

    let p1!: Promise<unknown>
    let p2!: Promise<unknown>
    act(() => {
      p1 = result.current.applyEdit('text', 'lbl1', 'a', 'b', 'instr1')
    })
    act(() => {
      p2 = result.current.applyEdit('text', 'lbl2', 'c', 'd', 'instr2')
    })

    // Both edits were issued; the controller must not silently drop either.
    // A correct implementation either queues the second (mutation not yet
    // called) or rejects it. In either case isEditing reflects real pending
    // work.
    expect(result.current.isEditing).toBe(true)

    // Resolve the first edit.
    await act(async () => {
      d1.resolve({ saved: true })
      await p1
    })

    // The second edit is still pending, so isEditing MUST still be true.
    // If the implementation uses a single boolean that the first edit's
    // `finally` flips to false, this assertion fails — exposing the bug.
    expect(result.current.isEditing).toBe(true)

    // Now finish the second edit.
    await act(async () => {
      d2.resolve({ saved: true })
      await p2
    })
    expect(result.current.isEditing).toBe(false)
  })
})
