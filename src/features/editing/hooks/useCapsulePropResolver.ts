import { useCallback, useRef, useState } from 'react'
import { useOptionalSessionState } from '@ship-fast/lakebed/react'
import type { JsonRecord } from '@ship-fast/lakebed/server'
import {
  matchElementToProp,
  buildPropPatch,
  type CapsulePropContext,
} from '@ship-fast/blocks/capsules'

// ─── Types ──────────────────────────────────────────────────────────────────

export type CapsuleTextChange = {
  oldText: string
  newText: string
  element: HTMLElement
  occurrenceIndex: number
  /** When present, the edit targets a capsule prop via Lakebed
   *  instead of a generic text override. */
  capsuleProp?: CapsulePropContext
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Capsule names that are excluded from realtime editing. */
const NON_REALTIME_PATTERN = /(Navbar|Footer)$/

/** Resolve the capsule name + statementId from an element's nearest capsule ancestor. */
const resolveCapsuleAncestor = (
  element: HTMLElement | null,
): { capsuleName: string; statementId: string } | null => {
  if (!element) return null
  const capsuleEl = element.closest('[data-openui-component]')
  const name = capsuleEl?.getAttribute('data-openui-component')
  const varName = capsuleEl?.getAttribute('data-openui-var')
  if (!name || !varName || name === 'Stack') return null
  if (NON_REALTIME_PATTERN.test(name)) return null
  return { capsuleName: name, statementId: varName }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Tracks the active capsule and resolves prop context for inline text edits.
 * Must be used inside a `LakebedSessionProvider` (DirectPreview is).
 *
 * - `setActiveElement`: call when an element is activated (onElementActivate)
 * - `resolveProp`: call when a text change is committed to detect which prop
 *   the edit targets
 * - `getPatch`: build a Lakebed merge patch for a resolved prop + new value
 */
export const useCapsulePropResolver = () => {
  const [activeCapsuleKey, setActiveCapsuleKey] = useState<string | null>(null)
  const activeElementRef = useRef<HTMLElement | null>(null)

  // Call unconditionally — dummy key when no capsule is active.
  // The preview can render outside LakebedSessionProvider in raw/static paths.
  // In that case this resolves to null data and falls back to text overrides.
  const { data } = useOptionalSessionState<JsonRecord>(
    activeCapsuleKey || '__none__',
  )

  const setActiveElement = useCallback((element: HTMLElement | null) => {
    activeElementRef.current = element
    const ancestor = resolveCapsuleAncestor(element)
    if (ancestor) {
      setActiveCapsuleKey(`${ancestor.capsuleName}:${ancestor.statementId}`)
    } else {
      setActiveCapsuleKey(null)
    }
  }, [])

  const resolveProp = useCallback(
    (element: HTMLElement): CapsulePropContext | null => {
      if (!data || !activeCapsuleKey) return null
      const ancestor = resolveCapsuleAncestor(element)
      if (!ancestor) return null
      return matchElementToProp(
        element,
        ancestor.capsuleName,
        ancestor.statementId,
        data,
      )
    },
    [data, activeCapsuleKey],
  )

  const getPatch = useCallback(
    (context: CapsulePropContext, newValue: string): Partial<JsonRecord> => {
      if (!data) return {}
      return buildPropPatch(context, newValue, data)
    },
    [data],
  )

  return {
    setActiveElement,
    resolveProp,
    getPatch,
    capsuleData: data,
    capsuleKey: activeCapsuleKey,
  }
}
