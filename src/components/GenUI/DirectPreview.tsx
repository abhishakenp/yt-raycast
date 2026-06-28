import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
} from 'react'
import { PortalContainerProvider } from '@ship-fast/blocks/portal'
import {
  applyThemeVars,
  injectThemeFonts,
  clearThemeVars,
} from '../../genui/theme-apply'
import type { ThemeStyles } from '../../genui/theme-presets'
import { observeGeneratedMobileNavs } from './generated-mobile-nav'
import { useTextEdit } from '@/features/editing/hooks/useTextEdit'
import { useElementInspector } from '@/features/editing/hooks/useElementInspector'
import {
  getElementPath,
  type InspectorSelection,
} from '@/features/editing/element-path'

export type PreviewToolMode = 'select' | 'annotate' | null

export type PreviewSelection = {
  label: string
  tagName: string
  selectedText: string
  elementPath: string
  html: string
  imageSrc?: string
  imageAlt?: string
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

const normalizeSelectionText = (value: string | null | undefined) =>
  value?.trim().replace(/\s+/g, ' ') ?? ''

const createPreviewSelection = (
  root: HTMLElement,
  target: HTMLElement,
): PreviewSelection => {
  const selectedText = normalizeSelectionText(target.textContent).slice(0, 500)
  const label =
    target.getAttribute('aria-label') ||
    selectedText.slice(0, 96) ||
    target.tagName.toLowerCase()
  const image =
    target.tagName.toLowerCase() === 'img'
      ? target
      : target.querySelector('img')
  const rect = target.getBoundingClientRect()

  return {
    label,
    tagName: target.tagName.toLowerCase(),
    selectedText,
    elementPath: getElementPath(root, target),
    html: target.outerHTML.slice(0, 4000),
    imageSrc: image?.getAttribute('src') ?? undefined,
    imageAlt: image?.getAttribute('alt') ?? undefined,
    boundingBox: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  }
}

// Renders children in a scoped div container with theme CSS custom properties applied.
// Theme changes only affect this container, not the app chrome (TopBar).
const DirectPreview = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    themeStyles: ThemeStyles | null
    isDark: boolean
    deviceMode?: 'desktop' | 'tablet' | 'mobile'
    previewToolMode?: PreviewToolMode
    onPreviewSelect?: (selection: PreviewSelection) => void
    editMode?: boolean
    onTextChange?: (change: {
      oldText: string
      newText: string
      element: HTMLElement
      occurrenceIndex: number
    }) => void
    onImageChange?: (change: {
      oldSrc: string
      newSrc: string
      element: HTMLImageElement
      alt: string
    }) => void
    onElementActivate?: (element: HTMLElement, rect: DOMRect) => void
    /** Called when the user clicks Save/Apply in the toolbar. Commits any
     *  active text edit (diffs the element against its original snapshot and
     *  fires onTextChange for each modified text node). Also receives
     *  cancelEdit so the parent can revert text on toolbar close/dismiss. */
    onCommitText?: (commitEdit: () => void, cancelEdit: () => void) => void
    /** Fired when the element inspector (editMode) commits a section/container
     *  selection. Carries a serializable description of the selected element,
     *  ready to feed an AI section-patcher in a later phase. */
    onSectionSelect?: (selection: InspectorSelection | null) => void
    /** Inline style/align edits to re-apply on render, since openUiSource can't
     *  hold inline styles. Keyed by the element's exact class + occurrence. */
    styleOverrides?: Array<{
      classAnchor: string
      occurrenceIndex: number
      style: string
    }>
  }
>(
  (
    {
      children,
      themeStyles,
      isDark,
      deviceMode = 'desktop',
      previewToolMode = null,
      onPreviewSelect,
      editMode = false,
      onTextChange,
      onImageChange,
      onElementActivate,
      onCommitText,
      onSectionSelect,
      styleOverrides,
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null)
    const selectedElementRef = useRef<HTMLElement | null>(null)
    const [portalContainer, setPortalContainer] =
      useState<HTMLDivElement | null>(null)

    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (internalRef.current === node) return

        internalRef.current = node
        setPortalContainer(node)

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    const { commitEdit, cancelEdit } = useTextEdit(
      internalRef,
      editMode,
      onTextChange || (() => {}),
      onImageChange,
      onElementActivate,
    )

    // Expose commitEdit and cancelEdit to the parent so the toolbar's
    // Save/Apply button can commit text changes, and the Close/X button
    // can revert them.
    useEffect(() => {
      if (onCommitText) onCommitText(commitEdit, cancelEdit)
    }, [onCommitText, commitEdit, cancelEdit])

    // Devtools-style element inspector: hover highlights, click selects a
    // section/container (text-leaf & image clicks still go to useTextEdit).
    useElementInspector(internalRef, editMode, onSectionSelect)

    // Re-apply saved inline style/align edits BEFORE paint. Same rationale as
    // text overrides: useLayoutEffect runs before the browser paints, so style
    // edits appear on the first visible frame with no flash.
    useLayoutEffect(() => {
      const root = internalRef.current
      if (!root || !styleOverrides || styleOverrides.length === 0) return

      const apply = () => {
        for (const override of styleOverrides) {
          if (!override.classAnchor) continue
          const matches = Array.from(
            root.querySelectorAll<HTMLElement>('*'),
          ).filter((el) => el.getAttribute('class') === override.classAnchor)
          const el = matches[override.occurrenceIndex] ?? matches[0]
          if (!el) continue
          for (const declaration of override.style.split(';')) {
            const colon = declaration.indexOf(':')
            if (colon === -1) continue
            const prop = declaration.slice(0, colon).trim()
            const value = declaration.slice(colon + 1).trim()
            if (prop) el.style.setProperty(prop, value)
          }
        }
      }

      apply()
      // childList/subtree only (NOT attributes) — apply() mutates style attributes,
      // so observing attributes would loop; node replacements from re-render do not.
      const observer = new MutationObserver(() => apply())
      observer.observe(root, { childList: true, subtree: true })
      return () => observer.disconnect()
    }, [styleOverrides, children])

    useEffect(() => {
      const currentRoot = internalRef.current
      if (!currentRoot) return

      if (themeStyles) {
        applyThemeVars(currentRoot, themeStyles, isDark)
        injectThemeFonts(document, themeStyles)
      } else {
        clearThemeVars(currentRoot)
        currentRoot.classList.toggle('dark', isDark)
        currentRoot.style.colorScheme = isDark ? 'dark' : 'light'
      }
    }, [themeStyles, isDark])

    useEffect(() => {
      const currentRoot = internalRef.current
      if (!currentRoot) return

      return observeGeneratedMobileNavs(currentRoot, deviceMode)
    }, [children, deviceMode])

    useEffect(() => {
      const currentRoot = internalRef.current
      if (!currentRoot) return

      currentRoot.dataset.previewToolMode = previewToolMode ?? ''

      const clearSelectedElement = () => {
        const selectedElement = selectedElementRef.current
        if (!selectedElement) return

        selectedElement.removeAttribute('data-ship-fast-selected')
        selectedElement.style.outline = ''
        selectedElement.style.outlineOffset = ''
        selectedElement.style.cursor = ''
        selectedElementRef.current = null
      }

      if (previewToolMode !== 'select') {
        clearSelectedElement()
        return
      }

      const handleClick = (event: MouseEvent) => {
        const target = event.target
        if (!(target instanceof HTMLElement) || !currentRoot.contains(target)) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        clearSelectedElement()
        const selection = createPreviewSelection(currentRoot, target)

        target.setAttribute('data-ship-fast-selected', 'true')
        target.style.outline = '2px solid rgb(34, 211, 238)'
        target.style.outlineOffset = '3px'
        target.style.cursor = 'crosshair'
        selectedElementRef.current = target
        onPreviewSelect?.(selection)

        currentRoot.dispatchEvent(
          new CustomEvent('ship-fast-preview-select', {
            bubbles: true,
            detail: selection,
          }),
        )
      }

      currentRoot.addEventListener('click', handleClick, true)

      return () => {
        currentRoot.removeEventListener('click', handleClick, true)
        clearSelectedElement()
      }
    }, [previewToolMode, children, onPreviewSelect])

    return (
      <PortalContainerProvider container={portalContainer}>
        <div
          ref={setRootRef}
          className="genui-preview relative size-full transform-gpu overflow-auto bg-background"
          data-preview-device={deviceMode}
        >
          {children}
        </div>
      </PortalContainerProvider>
    )
  },
)

DirectPreview.displayName = 'DirectPreview'

export default DirectPreview
