// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
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

  it('one edit → canUndo=true (version 0 exists), canRedo=false', () => {
    const ctrl = makeController({
      edits: [{ previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }],
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historyDepth).toBe(2)
  })

  it('two edits at latest → canUndo=true, canRedo=false', () => {
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('undo calls restoreVersion with previous version', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }, { version: 2 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    await result.current.undo()
    expect(restoreVersion).toHaveBeenCalledWith(1)
  })

  it('redo calls restoreVersion with next edit version', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    // Simulate being at version 1 (after undo from version 2)
    const ctrl = makeController({
      edits: [{ previewVersion: 2 }, { previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    expect(result.current.canRedo).toBe(true)
    await result.current.redo()
    expect(restoreVersion).toHaveBeenCalledWith(2)
  })

  it('undo at first edit restores to version 0', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({
      edits: [{ previewVersion: 1 }],
      history: [{ version: 0 }, { version: 1 }],
      restoreVersion,
    })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    await result.current.undo()
    expect(restoreVersion).toHaveBeenCalledWith(0)
  })

  it('undo when canUndo=false does nothing', async () => {
    const restoreVersion = vi.fn(async (v: number) => {
      void v
    })
    const ctrl = makeController({ restoreVersion })
    const { result } = renderHook(() => useUndoRedo(ctrl))
    await result.current.undo()
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
    await result.current.redo()
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
})
