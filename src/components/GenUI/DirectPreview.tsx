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
import { useCapsulePropResolver } from '@/features/editing/hooks/useCapsulePropResolver'
import type { CapsuleTextChange } from '@/features/editing/hooks/useCapsulePropResolver'
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

type TextOverride = {
  beforeText: string
  afterText: string
  occurrenceIndex?: number
}

function normalizeSelectionText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, ' ') ?? ''
}

const TEXT_OVERRIDE_SKIP_SELECTOR =
  'script, style, textarea, input, [data-ship-fast-inline-editing="true"], [contenteditable="true"], [contenteditable="plaintext-only"]'

const INLINE_EDITOR_ARTIFACT_SELECTOR =
  '[data-ship-fast-inline-editing], [contenteditable="true"], [contenteditable="plaintext-only"]'

function stripInlineEditorArtifacts(root: HTMLElement) {
  const elements = root.matches(INLINE_EDITOR_ARTIFACT_SELECTOR)
    ? [
        root,
        ...Array.from(
          root.querySelectorAll<HTMLElement>(INLINE_EDITOR_ARTIFACT_SELECTOR),
        ),
      ]
    : Array.from(
        root.querySelectorAll<HTMLElement>(INLINE_EDITOR_ARTIFACT_SELECTOR),
      )

  for (const element of elements) {
    element.removeAttribute('contenteditable')
    delete element.dataset.shipFastInlineEditing
    element.style.outline = ''
    element.style.outlineOffset = ''
    element.style.cursor = ''
  }
}

function collectMutableTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || parent.closest(TEXT_OVERRIDE_SKIP_SELECTOR)) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes: Text[] = []
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text)
  }
  return nodes
}

function findStyleOverrideTargets(
  root: HTMLElement,
  anchor: string,
): HTMLElement[] {
  if (!anchor) return []
  const attributeAnchor = anchor.match(
    /^\[(data-openui-var|data-openui-component|data-sf-export-page)=(["'])(.*?)\2\]$/,
  )
  if (attributeAnchor) {
    const [, attributeName, , rawExpected] = attributeAnchor
    const expected = rawExpected.replace(/\\(["'\\])/g, '$1')
    return [
      root,
      ...Array.from(root.querySelectorAll<HTMLElement>('*')),
    ].filter((el) => el.getAttribute(attributeName) === expected)
  }
  if (anchor.startsWith('#')) {
    const idAnchor = anchor.slice(1)
    return [
      root,
      ...Array.from(root.querySelectorAll<HTMLElement>('*')),
    ].filter((el) => el.getAttribute('id') === idAnchor)
  }
  const anchorTokens = anchor.split(/\s+/).filter(Boolean)
  if (anchorTokens.length === 0) return []
  return Array.from(root.querySelectorAll<HTMLElement>('*')).filter((el) => {
    const classTokens = new Set(
      (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
    )
    return anchorTokens.every((token) => classTokens.has(token))
  })
}

function findAppliedRange(
  value: string,
  afterText: string,
  index: number,
): { start: number; end: number } | null {
  if (!afterText) return null
  let start = value.indexOf(afterText)
  while (start !== -1) {
    const end = start + afterText.length
    if (index >= start && index < end) return { start, end }
    start = value.indexOf(afterText, start + Math.max(1, afterText.length))
  }
  return null
}

function findSupersedingRange(
  value: string,
  afterTexts: string[],
  index: number,
): { start: number; end: number } | null {
  for (const afterText of afterTexts) {
    const range = findAppliedRange(value, afterText, index)
    if (range) return range
  }
  return null
}

function applyTextOverrideToValues(
  values: string[],
  { beforeText, afterText, occurrenceIndex = 0 }: TextOverride,
  supersedingAfterTexts: string[] = [],
): void {
  if (!beforeText) return

  let seen = 0
  for (let valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
    const value = values[valueIndex]
    let from = value.indexOf(beforeText)
    while (from !== -1) {
      const supersedingRange = findSupersedingRange(
        value,
        supersedingAfterTexts,
        from,
      )
      if (supersedingRange) {
        if (seen === occurrenceIndex) return
        seen += 1
        from = value.indexOf(beforeText, supersedingRange.end)
        continue
      }
      const appliedRange = findAppliedRange(value, afterText, from)
      if (appliedRange) {
        if (seen === occurrenceIndex) return
        seen += 1
        from = value.indexOf(beforeText, appliedRange.end)
        continue
      }
      if (seen === occurrenceIndex) {
        values[valueIndex] =
          value.slice(0, from) +
          afterText +
          value.slice(from + beforeText.length)
        return
      }
      seen += 1
      from = value.indexOf(beforeText, from + beforeText.length)
    }
  }
}

function applyTextOverrides(
  root: HTMLElement,
  textOverrides: TextOverride[] | undefined,
): void {
  if (!textOverrides || textOverrides.length === 0) return
  const nodes = collectMutableTextNodes(root)
  const nextValues = nodes.map((node) => node.nodeValue ?? '')

  const chronologicalOverrides = [...textOverrides].reverse()
  for (let index = 0; index < chronologicalOverrides.length; index += 1) {
    const supersedingAfterTexts = chronologicalOverrides
      .slice(index + 1)
      .map((override) => override.afterText)
      .filter(Boolean)
    applyTextOverrideToValues(
      nextValues,
      chronologicalOverrides[index],
      supersedingAfterTexts,
    )
  }

  for (let index = 0; index < nodes.length; index += 1) {
    if (nodes[index].nodeValue !== nextValues[index]) {
      nodes[index].nodeValue = nextValues[index]
    }
  }
}

function createPreviewSelection(
  root: HTMLElement,
  target: HTMLElement,
): PreviewSelection {
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
    onTextChange?: (change: CapsuleTextChange) => void
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
    /** Inline text edits to re-apply on render. Dashboard provides newest-first
     *  history; DirectPreview replays oldest-first so chained edits land on the
     *  final user-visible text even if canonical source is temporarily stale. */
    textOverrides?: TextOverride[]
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
      textOverrides,
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null)
    const selectedElementRef = useRef<HTMLElement | null>(null)
    const [portalContainer, setPortalContainer] =
      useState<HTMLDivElement | null>(null)

    // Capsule prop resolver — tracks the active capsule and resolves which
    // prop a text edit targets. Static preview paths without a Lakebed session
    // resolve to null capsule data and fall back to text overrides.
    const capsuleResolver = useCapsulePropResolver()

    const setRootRef = useCallback(
      (node) => {
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

    // Wrap onElementActivate to track the active capsule for prop resolution.
    const handleElementActivate = useCallback(
      (element, rect) => {
        capsuleResolver.setActiveElement(element)
        onElementActivate?.(element, rect)
      },
      [capsuleResolver, onElementActivate],
    )

    // Wrap onTextChange to resolve capsule prop context. When the edited text
    // matches a capsule prop value, the change carries a `capsuleProp` field
    // so the parent can route the edit through Lakebed instead of text overrides.
    const handleTextChange = useCallback(
      (change) => {
        const propContext = capsuleResolver.resolveProp(change.element)
        onTextChange?.({
          ...change,
          ...(propContext ? { capsuleProp: propContext } : {}),
        })
      },
      [capsuleResolver, onTextChange],
    )

    const { commitEdit, cancelEdit } = useTextEdit(
      internalRef,
      editMode,
      handleTextChange,
      onImageChange,
      handleElementActivate,
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

    useLayoutEffect(() => {
      const root = internalRef.current
      if (!root || editMode) return

      stripInlineEditorArtifacts(root)

      const observer = new MutationObserver(() => {
        stripInlineEditorArtifacts(root)
      })
      observer.observe(root, {
        attributes: true,
        attributeFilter: [
          'contenteditable',
          'data-ship-fast-inline-editing',
          'style',
        ],
        childList: true,
        subtree: true,
      })
      return () => observer.disconnect()
    }, [children, editMode])

    useLayoutEffect(() => {
      const root = internalRef.current
      if (!root || !textOverrides || textOverrides.length === 0) return

      const apply = () => applyTextOverrides(root, textOverrides)
      apply()

      const observer = new MutationObserver(() => apply())
      observer.observe(root, {
        characterData: true,
        childList: true,
        subtree: true,
      })
      return () => observer.disconnect()
    }, [textOverrides, children])

    // Re-apply saved inline style/align edits BEFORE paint. Same rationale as
    // text overrides: useLayoutEffect runs before the browser paints, so style
    // edits appear on the first visible frame with no flash.
    useLayoutEffect(() => {
      const root = internalRef.current
      if (!root || !styleOverrides || styleOverrides.length === 0) return

      const apply = () => {
        for (const override of styleOverrides) {
          if (!override.classAnchor) continue
          const matches = findStyleOverrideTargets(root, override.classAnchor)
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

      const handleClick = (event) => {
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
