import { useCallback, useMemo } from 'react'

/** Minimal interface for the fields useUndoRedo actually uses. */
interface UndoRedoController {
  edits: Array<{ previewVersion: number }> | undefined | null
  history: Array<{ version: number }> | undefined | null
  restoreVersion: (version: number) => Promise<void>
}

/**
 * Undo/redo for inline edits. The edit controller already exposes
 * `edits` (newest-first array from Convex), `history` (all preview versions),
 * and `restoreVersion(version)`.
 *
 * - `currentVersion` = max version in history (the active preview version)
 * - `canUndo` = there exists a version < currentVersion in history
 * - `canRedo` = there exists an edit with previewVersion > currentVersion
 * - `undo()` = restore to the highest version < currentVersion
 * - `redo()` = restore to the lowest edit version > currentVersion
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

  const allVersions = useMemo(
    () => history.map((h) => h.version).sort((a, b) => a - b),
    [history],
  )

  const canUndo = allVersions.some((v) => v < currentVersion)
  const canRedo = edits.some((e) => e.previewVersion > currentVersion)

  const undo = useCallback(async () => {
    if (!canUndo) return
    const targetVersion = Math.max(
      ...allVersions.filter((v) => v < currentVersion),
    )
    await controller.restoreVersion(targetVersion)
  }, [canUndo, allVersions, currentVersion, controller])

  const redo = useCallback(async () => {
    if (!canRedo) return
    const futureVersions = edits
      .map((e) => e.previewVersion)
      .filter((v) => v > currentVersion)
      .sort((a, b) => a - b)
    await controller.restoreVersion(futureVersions[0])
  }, [canRedo, edits, currentVersion, controller])

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    currentVersion,
    historyDepth: allVersions.length,
  }
}
