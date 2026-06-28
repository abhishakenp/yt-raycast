import { useCallback, useMemo, useRef, useState } from 'react'

/** Minimal interface for the fields useUndoRedo actually uses. */
interface UndoRedoController {
  edits: Array<{ previewVersion: number }> | undefined | null
  history: Array<{ version: number }> | undefined | null
  restoreVersion: (version: number) => Promise<void>
}

/**
 * Undo/redo for inline edits.
 *
 * The backend `restorePreviewHistoryVersion` creates a NEW version
 * (current+1) with the old content rather than moving a pointer.
 * So after undo from v3 to v2, a new v4 is created with v2's content.
 * currentVersion becomes 4, and the history grows. This means we can't
 * use version numbers to navigate — we need client-side stacks.
 *
 * Approach:
 * - `undoStackRef`: versions to undo TO (most recent first)
 * - `redoStackRef`: versions to redo TO (most recent first)
 * - When a new edit appears (edits list grows), push the edit's
 *   previewVersion onto undoStack and clear redoStack.
 * - undo: pop from undoStack, push currentVersion onto redoStack,
 *   restore to popped version.
 * - redo: pop from redoStack, push currentVersion onto undoStack,
 *   restore to popped version.
 */
export function useUndoRedo(controller: UndoRedoController) {
  const edits = controller.edits ?? []
  const history = controller.history ?? []

  const currentVersion = useMemo(() => {
    if (history.length > 0) {
      return Math.max(...history.map((h) => h.version))
    }
    if (edits.length > 0) {
      return edits[0].previewVersion
    }
    return 0
  }, [history, edits])

  // Client-side stacks
  const undoStackRef = useRef<number[]>([])
  const redoStackRef = useRef<number[]>([])
  const [undoStackSize, setUndoStackSize] = useState(0)
  const [redoStackSize, setRedoStackSize] = useState(0)

  // Track edits length to detect new edits and initialize the undo stack
  const prevEditsLengthRef = useRef(edits.length)
  const initializedRef = useRef(false)

  // Initialize undo stack from edits on first run
  if (!initializedRef.current && edits.length > 0) {
    // Edits are newest-first. Push all edit versions onto undo stack
    // in order (oldest first = bottom of stack, newest = top).
    // The undo stack should contain versions we can go back to.
    // We push them so the most recent edit is at the top.
    const editVersions = edits
      .map((e) => e.previewVersion)
      .sort((a, b) => a - b)
    undoStackRef.current = editVersions
    setUndoStackSize(editVersions.length)
    initializedRef.current = true
  }

  // Detect new edits (edits list grew)
  if (edits.length > prevEditsLengthRef.current) {
    // New edit(s) appeared — push the newest edit version onto undo stack
    const newestVersion = edits[0]?.previewVersion
    if (newestVersion !== undefined) {
      undoStackRef.current = [...undoStackRef.current, newestVersion]
    }
    // Clear redo stack
    redoStackRef.current = []
    setRedoStackSize(0)
    setUndoStackSize(undoStackRef.current.length)
  }
  prevEditsLengthRef.current = edits.length

  const canUndo = undoStackSize > 0
  const canRedo = redoStackSize > 0

  const undo = useCallback(async () => {
    if (undoStackRef.current.length === 0) return
    // Pop the top of the undo stack — that's the version to restore to
    const targetVersion = undoStackRef.current[undoStackRef.current.length - 1]
    undoStackRef.current = undoStackRef.current.slice(0, -1)
    // Push currentVersion onto redo stack
    redoStackRef.current = [...redoStackRef.current, currentVersion]
    setUndoStackSize(undoStackRef.current.length)
    setRedoStackSize(redoStackRef.current.length)
    await controller.restoreVersion(targetVersion)
  }, [currentVersion, controller])

  const redo = useCallback(async () => {
    if (redoStackRef.current.length === 0) return
    // Pop the top of the redo stack — that's the version to restore to
    const targetVersion = redoStackRef.current[redoStackRef.current.length - 1]
    redoStackRef.current = redoStackRef.current.slice(0, -1)
    // Push currentVersion onto undo stack
    undoStackRef.current = [...undoStackRef.current, currentVersion]
    setRedoStackSize(redoStackRef.current.length)
    setUndoStackSize(undoStackRef.current.length)
    await controller.restoreVersion(targetVersion)
  }, [currentVersion, controller])

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    currentVersion,
    historyDepth: history.length,
  }
}
