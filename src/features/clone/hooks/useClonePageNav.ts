import { useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export interface ClonePageNavItem {
  pathname: string
  /** Page <title>; optional in the schema (`v.optional(v.string())`). */
  title: string | undefined
  isHome: boolean
  failed: boolean
  storageId?: Id<'_storage'> | null
  byteLength?: number
  truncated?: boolean
}

export interface ClonePageNavState {
  currentHtml: string | null
  /** File-storage URL for the active clone doc when it's too large for inline
   *  html; render the iframe with `src={currentUrl}` instead of `srcDoc`. */
  currentUrl: string | null
  currentPath: string
  pages: ClonePageNavItem[]
  isClone: boolean
}

interface CloneNavMessage {
  type: 'ship-clone-nav'
  path?: string
  abs?: string
}

export function useClonePageNav(
  sessionId: string | undefined,
): ClonePageNavState {
  const queriedRows = useQuery(
    api.sessions.listClonePages,
    sessionId ? { lookup: sessionId } : 'skip',
  )
  const rows = Array.isArray(queriedRows) ? queriedRows : []
  const homePath = useMemo(() => {
    if (rows.length === 0) return ''
    const home = rows.find((row) => row.isHome)
    return (home ?? rows[0]).pathname
  }, [rows])

  const [currentPath, setCurrentPath] = useState<string>('')

  // Default currentPath to the home (or first) row once rows load, and keep it
  // valid if rows change. Only reset when the current selection no longer exists.
  useEffect(() => {
    if (rows.length === 0) return
    const exists = rows.some((row) => row.pathname === currentPath)
    if (!exists) setCurrentPath(homePath)
  }, [rows, homePath, currentPath])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as CloneNavMessage | null
      if (!data || data.type !== 'ship-clone-nav') return
      const path = data.path
      if (path && rows.some((row) => row.pathname === path)) {
        setCurrentPath(path)
        return
      }
      void data.abs
      // Stay inside the cloned preview when a same-origin link was not captured
      // in this crawl budget. Opening the original URL breaks deep-clone fidelity.
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [rows])

  const activePath = currentPath || homePath
  const currentRow =
    rows.find((row) => row.pathname === activePath) ??
    rows.find((row) => row.isHome) ??
    rows[0]
  const activePreview = useQuery(
    api.sessions.getCloneHomePreview,
    sessionId
      ? {
          lookup: sessionId,
          ...(activePath ? { pathname: activePath } : {}),
        }
      : 'skip',
  )

  return {
    currentHtml: currentRow?.html ?? activePreview?.html ?? null,
    currentUrl: activePreview?.url ?? null,
    currentPath: activePath,
    pages: rows.map((row) => ({
      pathname: row.pathname,
      title: row.title,
      isHome: row.isHome,
      failed: row.failed,
      storageId: row.storageId,
      byteLength: row.byteLength,
      truncated: row.truncated,
    })),
    isClone: rows.length > 0,
  }
}
