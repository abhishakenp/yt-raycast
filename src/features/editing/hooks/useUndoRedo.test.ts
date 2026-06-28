// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useUndoRedo } from './useUndoRedo'

const makeController = (
  overrides: Partial<{
    edits: Array<{ previewVersion: number }>
    history: Array<{ version: number }>
    restoreVersion: (v: number) => Promise<void>
  }> = {},
) => ({
  edits: overrides.edits ?? [],
  history: overrides.history ?? [],
  restoreVersion:
    overrides.restoreVersion ??
    (async (v: number) => {
      void v
    }),
})

describe('useUndoRedo', () => {
  it('initial state: no edits → canUndo=false, canRedo=false', () => {
    const { result } = renderHook(() => useUndoRedo(makeController()))
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historyDepth).toBe(0)
  })

  it('one edit → canUndo=true, canRedo=false', () => {
    const ctrl = makeController({
      edits: [{ previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }],
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('two edits → canUndo=true, canRedo=false', () => {
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('undo calls restoreVersion with the most recent edit version', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    await act(async () => {
      await result.current.undo()
    })
    // Undo stack was [1, 2], pop 2 → restore to v2
    expect(restoreVersion).toHaveBeenCalledWith(2)
  })

  it('undo enables canRedo', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canRedo).toBe(false)
    await act(async () => {
      await result.current.undo()
    })
    expect(result.current.canRedo).toBe(true)
  })

  it('redo after undo restores correctly', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    // Undo: pop v2 from undoStack, push currentVersion (2) onto redoStack
    await act(async () => {
      await result.current.undo()
    })
    expect(restoreVersion).toHaveBeenLastCalledWith(2)
    // Redo: pop v2 from redoStack, restore to v2
    await act(async () => {
      await result.current.redo()
    })
    expect(restoreVersion).toHaveBeenLastCalledWith(2)
    expect(result.current.canRedo).toBe(false)
  })

  it('undo when canUndo=false does nothing', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({ restoreVersion })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    await act(async () => {
      await result.current.undo()
    })
    expect(restoreVersion).not.toHaveBeenCalled()
  })

  it('redo when canRedo=false does nothing', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({
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

  it('currentVersion reflects max history version', () => {
    const ctrl = makeController({
      edits: [{ previewVersion: 5 }],
      history: [{ version: 3 }, { version: 4 }, { version: 5 }],
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.currentVersion).toBe(5)
  })

  it('multiple undo then redo works with stack-based approach', async () => {
    // Simulate the backend creating new versions on each restore.
    let historyState = [
      { version: 0 },
      { version: 1 },
      { version: 2 },
      { version: 3 },
    ]
    const restoreVersion = vi.fn(async (_v: number) => {
      const nextVersion = Math.max(...historyState.map((h) => h.version)) + 1
      historyState = [...historyState, { version: nextVersion }]
    })
    const ctrl = {
      edits: [
        { previewVersion: 3 },
        { previewVersion: 2 },
        { previewVersion: 1 },
      ],
      get history() {
        return historyState
      },
      restoreVersion,
    }
    const { result } = renderHook(() => useUndoRedo(ctrl))
    // Undo stack initialized to [1, 2, 3]
    // Undo: pop 3, push currentVersion(3) onto redo, restore to 3
    await act(async () => {
      await result.current.undo()
    })
    expect(restoreVersion).toHaveBeenLastCalledWith(3)
    // Undo: pop 2, push currentVersion(4) onto redo, restore to 2
    await act(async () => {
      await result.current.undo()
    })
    expect(restoreVersion).toHaveBeenLastCalledWith(2)
    // Redo: pop 4 from redo, restore to 4
    await act(async () => {
      await result.current.redo()
    })
    expect(restoreVersion).toHaveBeenLastCalledWith(4)
    // Redo: pop 3 from redo, restore to 3
    await act(async () => {
      await result.current.redo()
    })
    expect(restoreVersion).toHaveBeenLastCalledWith(3)
    expect(result.current.canRedo).toBe(false)
  })
})
