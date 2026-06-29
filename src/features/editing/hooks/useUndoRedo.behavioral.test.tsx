// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useUndoRedo } from './useUndoRedo'

interface Ctrl {
  edits: Array<{ previewVersion: number }>
  history: Array<{ version: number }>
  restoreVersion: (v: number) => Promise<void>
}

const makeCtrl = (overrides: Partial<Ctrl> = {}): Ctrl => ({
  edits: overrides.edits ?? [],
  history: overrides.history ?? [],
  restoreVersion:
    overrides.restoreVersion ??
    (async (v: number) => {
      void v
    }),
})

describe('useUndoRedo (behavioral)', () => {
  it('1. initial state: empty undo/redo stacks', () => {
    const { result } = renderHook(() => useUndoRedo(makeCtrl()))
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('2. after an edit: undo stack has entry, redo stack empty', () => {
    const ctrl = makeCtrl({
      edits: [{ previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }],
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('3. undo: pops undo, pushes to redo, calls restoreVersion', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeCtrl({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canRedo).toBe(false)
    await act(async () => {
      await result.current.undo()
    })
    // popped top of undo stack (v2) → restore to v2
    expect(restoreVersion).toHaveBeenCalledWith(2)
    expect(result.current.canRedo).toBe(true)
  })

  it('4. redo: pops redo, pushes to undo, calls restoreVersion', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeCtrl({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    await act(async () => {
      await result.current.undo()
    })
    restoreVersion.mockClear()
    await act(async () => {
      await result.current.redo()
    })
    expect(restoreVersion).toHaveBeenCalled()
    expect(result.current.canRedo).toBe(false)
  })

  it('5. new edit after undo clears redo stack', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    let edits = [{ previewVersion: 2 }, { previewVersion: 1 }]
    let history = [{ version: 0 }, { version: 1 }, { version: 2 }]
    const ctrl: Ctrl = {
      get edits() {
        return edits
      },
      get history() {
        return history
      },
      restoreVersion,
    }
    const { result, rerender } = renderHook(() => useUndoRedo(ctrl))
    await act(async () => {
      await result.current.undo()
    })
    expect(result.current.canRedo).toBe(true)
    // simulate a new edit appearing
    edits = [
      { previewVersion: 3 },
      { previewVersion: 2 },
      { previewVersion: 1 },
    ]
    history = [...history, { version: 3 }]
    rerender()
    expect(result.current.canRedo).toBe(false)
  })

  it('6. cannot undo when stack empty', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const { result } = renderHook(() =>
      useUndoRedo(makeCtrl({ restoreVersion })),
    )
    expect(result.current.canUndo).toBe(false)
    await act(async () => {
      await result.current.undo()
    })
    expect(restoreVersion).not.toHaveBeenCalled()
  })

  it('7. cannot redo when stack empty', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeCtrl({
      edits: [{ previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canRedo).toBe(false)
    await act(async () => {
      await result.current.redo()
    })
    expect(restoreVersion).not.toHaveBeenCalled()
  })
})
