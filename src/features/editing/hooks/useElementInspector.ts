import { useEffect, useRef } from 'react'
import { findTextElement } from './useTextEdit'
import {
  buildInspectorSelection,
  type InspectorSelection,
} from '../element-path'

export type { InspectorSelection }

const HOVER_STYLE =
  'position:fixed;z-index:2147483646;pointer-events:none;border:1px solid #3b82f6;background:rgba(59,130,246,0.18);box-sizing:border-box;transition:all 0.05s linear;'
const SELECTED_STYLE =
  'position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #22d3ee;background:rgba(34,211,238,0.10);box-sizing:border-box;'

const createOverlay = (baseStyle: string, role: 'hover' | 'selected') => {
  const el = document.createElement('div')
  el.setAttribute('data-ship-fast-inspector-overlay', '')
  el.setAttribute('data-overlay-role', role)
  el.style.cssText = `${baseStyle}display:none;`
  return el
}

const positionOverlay = (overlay: HTMLDivElement, rect: DOMRect) => {
  // Set individual properties rather than replacing cssText — concatenating a
  // long style string is brittle (one unparseable declaration can drop the
  // rest in stricter CSS parsers), and we want the base styles from
  // createOverlay to persist.
  overlay.style.left = `${rect.left}px`
  overlay.style.top = `${rect.top}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
  overlay.style.display = 'block'
}

/** Browser-devtools-style element inspector for the preview surface.
 *
 *  - Hovering an element paints a blue overlay tracking its bounding rect.
 *  - Clicking a text leaf or image is a no-op here (the existing `useTextEdit`
 *    flow handles contentEditable editing / image swap).
 *  - Clicking any other element (section, container, …) commits a persistent
 *    cyan selection and emits a serializable description via `onSectionSelect`,
 *    ready to feed an AI section-patcher in a later phase.
 *
 *  Overlays are separate `position: fixed` divs appended to `document.body` so
 *  highlight state NEVER mutates the preview DOM and cannot leak into the
 *  persisted `preview.html`. */
export function useElementInspector(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  onSectionSelect?: (selection: InspectorSelection | null) => void,
) {
  const hoverOverlayRef = useRef<HTMLDivElement | null>(null)
  const selectedOverlayRef = useRef<HTMLDivElement | null>(null)
  const selectedElementRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const onSectionSelectRef = useRef(onSectionSelect)
  onSectionSelectRef.current = onSectionSelect

  useEffect(() => {
    const container = containerRef.current
    if (!container || !active) return

    const hoverOverlay = createOverlay(HOVER_STYLE, 'hover')
    const selectedOverlay = createOverlay(SELECTED_STYLE, 'selected')
    document.body.appendChild(hoverOverlay)
    document.body.appendChild(selectedOverlay)
    hoverOverlayRef.current = hoverOverlay
    selectedOverlayRef.current = selectedOverlay

    const hideHover = () => {
      hoverOverlay.style.display = 'none'
    }

    const paintHover = (target: HTMLElement) => {
      positionOverlay(hoverOverlay, target.getBoundingClientRect())
    }

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof HTMLElement) || !container.contains(target)) {
        hideHover()
        return
      }
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        paintHover(target)
      })
    }

    const onMouseLeave = () => hideHover()

    const commitSelection = (target: HTMLElement) => {
      selectedElementRef.current = target
      positionOverlay(selectedOverlay, target.getBoundingClientRect())
      onSectionSelectRef.current?.(buildInspectorSelection(container, target))
    }

    const clearSelection = () => {
      selectedOverlay.style.display = 'none'
      selectedElementRef.current = null
      onSectionSelectRef.current?.(null)
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof HTMLElement) || !container.contains(target)) {
        return
      }
      // Image → let useTextEdit handle image swap.
      const tag = target.tagName.toLowerCase()
      const imgEl =
        tag === 'img'
          ? (target as HTMLImageElement)
          : (target.querySelector('img') as HTMLImageElement | null)
      if (imgEl) return
      // Editable text leaf → let useTextEdit handle contentEditable editing.
      if (findTextElement(target)) return
      // Section / container → commit selection for the AI-patch path.
      e.preventDefault()
      e.stopPropagation()
      hideHover()
      commitSelection(target)
    }

    // Reposition the persistent selection overlay on scroll/resize; hide the
    // transient hover overlay (it will repaint on the next mousemove).
    const onScrollOrResize = () => {
      hideHover()
      const selected = selectedElementRef.current
      if (selected) {
        positionOverlay(selectedOverlay, selected.getBoundingClientRect())
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection()
      }
    }

    // Click outside the preview container AND outside the prompt toolbar →
    // clear the selection (mirrors devtools' click-away-to-deselect).
    const onDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (container.contains(target)) return
      if (target.closest('.section-prompt-toolbar')) return
      if (selectedElementRef.current) clearSelection()
    }

    // The toolbar's close button dispatches this event so the hook can clear
    // its overlay in sync with the toolbar unmounting.
    const onClearRequest = () => {
      selectedOverlay.style.display = 'none'
      selectedElementRef.current = null
    }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    container.addEventListener('click', onClick, true)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDocumentMouseDown)
    document.addEventListener('ship-fast-inspector-clear', onClearRequest)

    return () => {
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      container.removeEventListener('click', onClick, true)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDocumentMouseDown)
      document.removeEventListener('ship-fast-inspector-clear', onClearRequest)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      hoverOverlay.remove()
      selectedOverlay.remove()
      hoverOverlayRef.current = null
      selectedOverlayRef.current = null
      selectedElementRef.current = null
    }
  }, [containerRef, active])
}
