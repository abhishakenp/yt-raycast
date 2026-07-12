import { useCallback } from 'react'
import { useSessionState, useMergeSessionData } from '@ship-fast/lakebed/react'
import type { JsonRecord } from '@ship-fast/lakebed/server'

export type SectionCapsuleActions = {
  canEdit: boolean
  sectionData: JsonRecord | null
  addItem: (collectionKey: string, item: JsonRecord) => Promise<void>
  removeItem: (collectionKey: string, index: number) => Promise<void>
  reorderItem: (
    collectionKey: string,
    fromIndex: number,
    toIndex: number,
  ) => Promise<void>
  editItem: (
    collectionKey: string,
    index: number,
    patch: JsonRecord,
  ) => Promise<void>
  setProp: (key: string, value: unknown) => Promise<void>
}

const isJsonRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

/**
 * Hook that reads/writes lakebed session data for a specific capsule section.
 * Must be used inside a `LakebedSessionProvider`.
 *
 * The lakebed key is `${capsuleName}:${statementId}` — the same key
 * `withSectionRealtime` uses to seed and merge section data.
 */
export const useSectionCapsuleActions = (
  capsuleName: string,
  statementId: string,
): SectionCapsuleActions => {
  const lakebedKey = `${capsuleName}:${statementId}`
  const { canWrite, data } = useSessionState<JsonRecord>(lakebedKey)
  const mergeData = useMergeSessionData<JsonRecord>(lakebedKey)

  const canEdit = canWrite && data !== null

  const addItem = useCallback(
    async (collectionKey: string, item: JsonRecord) => {
      const currentItems = Array.isArray(data?.[collectionKey])
        ? (data![collectionKey] as unknown[])
        : []
      await mergeData({
        [collectionKey]: [...currentItems, item],
      } as Partial<JsonRecord>)
    },
    [data, mergeData],
  )

  const removeItem = useCallback(
    async (collectionKey: string, index: number) => {
      if (!Array.isArray(data?.[collectionKey])) return
      const items = data![collectionKey] as unknown[]
      const filtered = items.filter((_, i) => i !== index)
      await mergeData({
        [collectionKey]: filtered,
      } as Partial<JsonRecord>)
    },
    [data, mergeData],
  )

  const reorderItem = useCallback(
    async (collectionKey: string, fromIndex: number, toIndex: number) => {
      if (!Array.isArray(data?.[collectionKey])) return
      const items = [...(data![collectionKey] as unknown[])]
      if (
        fromIndex < 0 ||
        fromIndex >= items.length ||
        toIndex < 0 ||
        toIndex >= items.length
      )
        return
      const [moved] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, moved)
      await mergeData({
        [collectionKey]: items,
      } as Partial<JsonRecord>)
    },
    [data, mergeData],
  )

  const editItem = useCallback(
    async (collectionKey: string, index: number, patch: JsonRecord) => {
      if (!Array.isArray(data?.[collectionKey])) return
      const items = data![collectionKey] as unknown[]
      const item = items[index]
      if (!isJsonRecord(item)) return
      const patched = items.map((it, i) =>
        i === index ? { ...item, ...patch } : it,
      )
      await mergeData({
        [collectionKey]: patched,
      } as Partial<JsonRecord>)
    },
    [data, mergeData],
  )

  const setProp = useCallback(
    async (key: string, value: unknown) => {
      await mergeData({ [key]: value } as Partial<JsonRecord>)
    },
    [mergeData],
  )

  return {
    canEdit,
    sectionData: data,
    addItem,
    removeItem,
    reorderItem,
    editItem,
    setProp,
  }
}
