// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useUndoRedo } from './useUndoRedo'

interface Deferred {
  promise: Promise<void>
  resolve: () => void
}

interface UndoRedoController {
  edits: Array<{ previewVersion: number }>
  history: Array<{ version: number }>
  restoreVersion: (version: number) => Promise<void>
}

function createController(
  restoreVersion: UndoRedoController['restoreVersion'],
  editCount = 1,
): UndoRedoController {
  const edits = Array.from(
    { length: editCount },
    function createEdit(_entry, index) {
      return { previewVersion: editCount - index }
    },
  )
  const history = Array.from(
    { length: editCount + 1 },
    function createHistoryEntry(_entry, version) {
      return { version }
    },
  )

  return { edits, history, restoreVersion }
}

function createDeferred(): Deferred {
  let resolvePromise = function unresolvedPromise() {}
  const promise = new Promise<void>(function captureResolve(resolve) {
    resolvePromise = resolve
  })

  return { promise, resolve: resolvePromise }
}

describe('useUndoRedo release edge cases', () => {
  it('preserves the undo entry when restoring the previous version fails', async () => {
    const failure = new Error('restore unavailable')
    const restoreVersion = vi.fn(async function rejectRestore() {
      throw failure
    })
    const { result } = renderHook(function renderUndoRedo() {
      return useUndoRedo(createController(restoreVersion))
    })
    let observedFailure: unknown

    await act(async function attemptUndo() {
      try {
        await result.current.undo()
      } catch (error) {
        observedFailure = error
      }
    })

    expect(observedFailure).toBe(failure)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('preserves the redo entry when restoring the newer version fails', async () => {
    const failure = new Error('restore unavailable')
    let restoreAttempt = 0
    const restoreVersion = vi.fn(async function restoreThenReject() {
      restoreAttempt += 1
      if (restoreAttempt > 1) throw failure
    })
    const { result } = renderHook(function renderUndoRedo() {
      return useUndoRedo(createController(restoreVersion))
    })

    await act(async function completeUndo() {
      await result.current.undo()
    })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)

    let observedFailure: unknown
    await act(async function attemptRedo() {
      try {
        await result.current.redo()
      } catch (error) {
        observedFailure = error
      }
    })

    expect(observedFailure).toBe(failure)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('coalesces concurrent undo requests while a restore is in flight', async () => {
    const pendingRestore = createDeferred()
    const restoreVersion = vi.fn(function restoreVersion() {
      return pendingRestore.promise
    })
    const { result } = renderHook(function renderUndoRedo() {
      return useUndoRedo(createController(restoreVersion, 2))
    })

    await act(async function doubleUndo() {
      const pendingRequests = [result.current.undo(), result.current.undo()]
      pendingRestore.resolve()
      await Promise.all(pendingRequests)
    })

    expect(restoreVersion).toHaveBeenCalledTimes(1)
    expect(restoreVersion).toHaveBeenCalledWith(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)
  })
})
