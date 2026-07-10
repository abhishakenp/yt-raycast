import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  type VirtualElement,
} from '@floating-ui/react'
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Loader2,
  Trash2,
  Undo2,
  Redo2,
  SlidersHorizontal,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
  BringToFront,
  SendToBack,
  Sparkles,
  Image as ImageIcon,
  Copy,
  ClipboardPaste,
  PanelTop,
  SquareArrowUp,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Button } from '#/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { firstImageSrc } from '@ship-fast/blocks/multi-image-src'
import { isEditableTextLeaf } from '../hooks/useTextEdit'
import { StyleControlsPanel } from './StyleControlsPanel'
import { TypographyControlsPanel } from './TypographyControlsPanel'
import { LinkEditPopover } from './LinkEditPopover'
import { ImageSwapPanel } from './ImageSwapPanel'

interface InlineEditToolbarProps {
  isOpen: boolean
  anchorRect: DOMRect | null
  activeElement: HTMLElement | null
  onStyleApply: (payload: {
    sourceAnchor: string
    style: string
    occurrenceIndex: number
  }) => void
  /** Called when the user clicks Apply/Save. Commits any pending text edit
   *  before style changes are saved. Always called, even if no style was
   *  modified — so text-only edits are saved too. */
  onCommitText?: () => void
  onClose: () => void
  isApplying?: boolean
  isForking?: boolean
  /** Undo/redo */
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  /** Link editing */
  onLinkEdit?: (payload: {
    oldHref: string
    newHref: string
    oldText: string
    newText: string
    target: string | null
    rel: string
    occurrenceIndex: number
  }) => void
  /** Move/reorder element in Stack */
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  /** Image swap — called with original and new src when Apply is pressed */
  onImageSelect?: (newSrc: string, originalSrc: string) => void
  /** Promote the active child element to its nearest editable section. */
  onSelectParentSection?: (element: HTMLElement) => void
  /** Promote the selection to the immediate parent DOM element (one level up).
   *  Lets the user reach containers that have no clickable gap — e.g. the page
   *  root to edit the whole-app background. */
  onSelectParent?: (element: HTMLElement) => void
  sessionId?: string
  /** Section AI edit */
  onSectionEdit?: (prompt: string) => void
  isSectionSubmitting?: boolean
  sectionError?: string
}

// Module-level clipboard for style copy/paste. Persists across element
// selections so a style copied from one element can be pasted onto another.
let copiedStyle: string | null = null

function parsePixelValue(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const parsed = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : null
}

/** Resolve a translate() x/y token to pixels. Floating UI normally emits
 *  plain pixel offsets for both axes; a percentage (e.g. a "-50%" centering
 *  offset) is resolved against the element's own `axisSize` so it can be
 *  clamped the same way a pixel offset is. Unrecognized tokens resolve to 0
 *  rather than throwing — clamping is a best-effort viewport safeguard, not
 *  a layout guarantee. */
function resolveTranslateAxis(token: string, axisSize: number): number {
  const pxMatch = token.match(/^(-?\d+(?:\.\d+)?)px$/i)
  if (pxMatch) return Number.parseFloat(pxMatch[1])
  const percentMatch = token.match(/^(-?\d+(?:\.\d+)?)%$/)
  if (percentMatch) return (Number.parseFloat(percentMatch[1]) / 100) * axisSize
  return 0
}

function parseTranslate(
  value: unknown,
  width: number,
): { x: number; y: number } | null {
  const text = String(value ?? '').trim()
  const match = text.match(
    /^translate\(\s*([^,]+)\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)$/i,
  )
  if (!match) return null
  const y = Number.parseFloat(match[2])
  if (!Number.isFinite(y)) return null
  return { x: resolveTranslateAxis(match[1].trim(), width), y }
}

function formatPixelValue(value: number): string {
  const rounded = Number(value.toFixed(3))
  return `${rounded}px`
}

const STYLE_SOURCE_ATTRIBUTE_ANCHORS = [
  'data-openui-var',
  'data-openui-component',
  'data-sf-export-page',
] as const

function escapeAttributeSelectorValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function getStyleSourceAnchor(element: HTMLElement): {
  sourceAnchor: string
  occurrenceIndex: number
} {
  const attributeAnchor = getAttributeStyleSourceAnchor(element)
  if (isGeneratedPageRoot(element) && attributeAnchor) {
    return attributeAnchor
  }

  const classAnchor = element.getAttribute('class') ?? ''
  if (classAnchor) {
    const doc = element.ownerDocument
    const peers = Array.from(
      doc.querySelectorAll(`[class="${CSS.escape(classAnchor)}"]`),
    )
    const at = peers.indexOf(element)
    return {
      sourceAnchor: classAnchor,
      occurrenceIndex: at < 0 ? 0 : at,
    }
  }

  const id = element.getAttribute('id')
  if (id) {
    return {
      sourceAnchor: `#${id}`,
      occurrenceIndex: 0,
    }
  }

  if (attributeAnchor) {
    return attributeAnchor
  }

  return {
    sourceAnchor: '',
    occurrenceIndex: 0,
  }
}

function getAttributeStyleSourceAnchor(
  element: HTMLElement,
): { sourceAnchor: string; occurrenceIndex: number } | null {
  for (const attributeName of STYLE_SOURCE_ATTRIBUTE_ANCHORS) {
    const attributeValue = element.getAttribute(attributeName)
    if (!attributeValue) continue
    const peers = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>(`[${attributeName}]`),
    ).filter((peer) => peer.getAttribute(attributeName) === attributeValue)
    const at = peers.indexOf(element)
    return {
      sourceAnchor: `[${attributeName}="${escapeAttributeSelectorValue(
        attributeValue,
      )}"]`,
      occurrenceIndex: at < 0 ? 0 : at,
    }
  }

  return null
}

function isGeneratedPageRoot(element: HTMLElement): boolean {
  return (
    element.hasAttribute('data-sf-export-page') ||
    (element.getAttribute('data-openui-component') === 'Stack' &&
      !!element.getAttribute('data-openui-var'))
  )
}

function findParentSectionElement(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement
  let nearestSemantic: HTMLElement | null = null
  while (current) {
    const tag = current.tagName.toLowerCase()
    if (
      tag === 'section' ||
      tag === 'article' ||
      tag === 'aside' ||
      tag === 'footer' ||
      tag === 'header' ||
      tag === 'main' ||
      current.getAttribute('role') === 'region'
    ) {
      nearestSemantic ??= current
      if (
        current.id ||
        current.hasAttribute('data-openui-var') ||
        current.hasAttribute('data-openui-component') ||
        current.hasAttribute('data-sf-export-page')
      ) {
        return current
      }
    }
    current = current.parentElement
  }
  return nearestSemantic
}

/** The immediate parent element the selection can be promoted to, bounded so
 *  it never escapes the generated page into the preview chrome (`.genui-preview`
 *  / `[data-preview-container]`) or the document body. Returns null at the page
 *  root, which naturally hides the button once there's nothing above to edit. */
function findSelectableParent(element: HTMLElement): HTMLElement | null {
  const parent = element.parentElement
  if (!parent) return null
  const tag = parent.tagName.toLowerCase()
  if (tag === 'body' || tag === 'html') return null
  if (
    parent.classList.contains('genui-preview') ||
    parent.hasAttribute('data-preview-container')
  ) {
    return null
  }
  return parent
}

function findPageElement(element: HTMLElement): HTMLElement | null {
  const exportPageElement = element.closest('[data-sf-export-page]')
  if (exportPageElement instanceof HTMLElement) return exportPageElement

  let current = element.parentElement
  let openUiPageStack: HTMLElement | null = null
  while (current) {
    if (
      current.classList.contains('genui-preview') ||
      current.hasAttribute('data-preview-container')
    ) {
      break
    }
    if (isGeneratedPageRoot(current)) {
      openUiPageStack = current
    }
    current = current.parentElement
  }
  return openUiPageStack
}

function stripTemporaryInlineEditingStyle(
  element: HTMLElement,
  style: string | null,
): string | null {
  if (!style || element.dataset.shipFastInlineEditing !== 'true') return style

  const scratch = element.ownerDocument.createElement('div')
  scratch.setAttribute('style', style)
  if (scratch.style.cursor === 'text') {
    scratch.style.cursor = ''
  }
  if (scratch.style.outline.includes('hsl(var(--primary))')) {
    scratch.style.outline = ''
  }
  if (scratch.style.outlineOffset === '2px') {
    scratch.style.outlineOffset = ''
  }
  const next = scratch.getAttribute('style')?.trim()
  return next ? next : null
}

export function InlineEditToolbar({
  isOpen,
  anchorRect,
  activeElement,
  onStyleApply,
  onCommitText,
  onClose,
  isApplying = false,
  isForking = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onLinkEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  onImageSelect,
  onSelectParentSection,
  onSelectParent,
  sessionId,
  onSectionEdit,
  isSectionSubmitting = false,
  sectionError,
}: InlineEditToolbarProps) {
  const [fontSize, setFontSize] = useState('16')
  const [fontSizeUnit, setFontSizeUnit] = useState('px')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [fontWeight, setFontWeight] = useState('400')
  const [color, setColor] = useState('#ffffff')
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(
    'left',
  )
  // Which extended panel is open: 'style' | 'typography' | 'link' | 'ai' | 'image' | null
  const [activePanel, setActivePanel] = useState<
    'style' | 'typography' | 'link' | 'ai' | 'image' | null
  >(null)
  // Keep the last panel mounted during collapse animation so it can animate
  // out instead of vanishing instantly.
  const [displayPanel, setDisplayPanel] = useState<
    'style' | 'typography' | 'link' | 'ai' | 'image' | null
  >(null)
  useEffect(() => {
    if (activePanel) {
      setDisplayPanel(activePanel)
    } else {
      // Delay unmount so the collapse animation can play
      const t = setTimeout(() => setDisplayPanel(null), 200)
      return () => clearTimeout(t)
    }
  }, [activePanel])

  useEffect(() => {
    if (activePanel === 'ai' && typeof onSectionEdit !== 'function') {
      setActivePanel(null)
    }
  }, [activePanel, onSectionEdit])

  // AI edit prompt text
  const [aiPrompt, setAiPrompt] = useState('')
  // Whether a style has been copied into the module-level clipboard. Drives
  // the disabled state of the Paste style button. Initialized from the
  // module-level clipboard so a style copied in a previous toolbar session
  // (or before this mount) can still be pasted.
  const [hasCopiedStyle, setHasCopiedStyle] = useState(
    () => copiedStyle !== null,
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const activeStyleElementRef = useRef<HTMLElement | null>(null)
  const originalStyleRef = useRef<string | null>(null)
  const forcePersistStyleRef = useRef(false)
  const styleCommittedRef = useRef(false)
  // Pending image swap: the new src chosen in the image panel but not yet
  // committed via Apply. On close, the original src is restored.
  const originalImageSrcRef = useRef<string | null>(null)
  const activeImageElementRef = useRef<HTMLElement | null>(null)
  const pendingImageSrcRef = useRef<string | null>(null)
  const imagePreviewClearedRef = useRef(false)
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null)
  const originalLinkAttrsRef = useRef<{
    element: HTMLAnchorElement
    target: string | null
    rel: string
  } | null>(null)

  const rememberLinkAttrs = useCallback((element: HTMLAnchorElement) => {
    originalLinkAttrsRef.current = {
      element,
      target: element.getAttribute('target'),
      rel: element.getAttribute('rel') ?? '',
    }
  }, [])

  const clearRememberedLinkAttrs = useCallback(() => {
    originalLinkAttrsRef.current = null
  }, [])

  const restoreRememberedLinkAttrs = useCallback(() => {
    const snapshot = originalLinkAttrsRef.current
    if (!snapshot) return
    if (snapshot.target === null) {
      snapshot.element.removeAttribute('target')
    } else {
      snapshot.element.setAttribute('target', snapshot.target)
    }
    if (snapshot.rel) {
      snapshot.element.setAttribute('rel', snapshot.rel)
    } else {
      snapshot.element.removeAttribute('rel')
    }
    originalLinkAttrsRef.current = null
  }, [])

  const restorePendingImagePreview = useCallback(() => {
    if (
      !pendingImageSrc ||
      !activeElement ||
      activeElement.tagName.toLowerCase() !== 'img'
    )
      return
    ;(activeElement as HTMLImageElement).src =
      originalImageSrcRef.current ?? (activeElement as HTMLImageElement).src
    pendingImageSrcRef.current = null
    imagePreviewClearedRef.current = false
    setPendingImageSrc(null)
  }, [activeElement, pendingImageSrc])

  const setActivePanelWithCleanup = useCallback(
    (nextPanel: 'style' | 'typography' | 'link' | 'ai' | 'image' | null) => {
      if (activePanel === 'link' && nextPanel !== 'link') {
        restoreRememberedLinkAttrs()
      }
      if (activePanel === 'image' && nextPanel !== 'image') {
        restorePendingImagePreview()
      }
      if (nextPanel === 'link' && activeElement instanceof HTMLAnchorElement) {
        rememberLinkAttrs(activeElement)
      }
      setActivePanel(nextPanel)
    },
    [
      activeElement,
      activePanel,
      rememberLinkAttrs,
      restorePendingImagePreview,
      restoreRememberedLinkAttrs,
    ],
  )

  useEffect(() => {
    if (
      activePanel === 'link' &&
      (typeof onLinkEdit !== 'function' ||
        !(activeElement instanceof HTMLAnchorElement))
    ) {
      restoreRememberedLinkAttrs()
      setActivePanel(null)
    }
    if (
      activePanel === 'image' &&
      (typeof onImageSelect !== 'function' ||
        !sessionId ||
        activeElement?.tagName.toLowerCase() !== 'img')
    ) {
      restorePendingImagePreview()
      setActivePanel(null)
    }
  }, [
    activeElement,
    activePanel,
    onImageSelect,
    onLinkEdit,
    restorePendingImagePreview,
    restoreRememberedLinkAttrs,
    sessionId,
  ])

  // Calculate placement ONCE when the toolbar opens (or when a new element
  // is selected). We use the MAX possible height (toolbar + tallest panel)
  // so the position never shifts when a panel opens/closes — eliminating
  // the jarring jump from top to bottom.
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

  useEffect(() => {
    if (!isOpen || !anchorRect) return
    // Max height = toolbar (~52px) + tallest panel (~280px) + gap
    const maxPossibleHeight = 340
    const spaceAbove = anchorRect.top
    const spaceBelow = window.innerHeight - anchorRect.bottom
    // Prefer 'top' (above) unless there's not enough room for the full
    // toolbar+panel and bottom has more space
    if (spaceAbove < maxPossibleHeight + 16 && spaceBelow > spaceAbove) {
      setPlacement('bottom')
    } else {
      setPlacement('top')
    }
    // Intentionally NOT depending on activePanel — we want placement
    // locked in for the entire editing session of this element.
  }, [isOpen, anchorRect])

  const { refs, floatingStyles, update } = useFloating({
    open: isOpen,
    placement,
    middleware: [offset(8), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const [viewportClampStyle, setViewportClampStyle] = useState<{
    top?: string
    left?: string
    transform?: string
  } | null>(null)

  const clampIntoViewport = useCallback(() => {
    void update()
    const rawTop = parsePixelValue(floatingStyles.top)
    const rawLeft = parsePixelValue(floatingStyles.left)
    const wrapper = wrapperRef.current
    if (!wrapper || rawTop === null || rawLeft === null) {
      setViewportClampStyle(null)
      return
    }

    const viewportPadding = 8
    const height =
      wrapper.offsetHeight || wrapper.getBoundingClientRect().height
    const width = wrapper.offsetWidth || wrapper.getBoundingClientRect().width
    const translate = parseTranslate(floatingStyles.transform, width)

    const maxTop = Math.max(
      viewportPadding,
      window.innerHeight - height - viewportPadding,
    )
    const visualTop = rawTop + (translate?.y ?? 0)
    const clampedTop = Math.min(Math.max(visualTop, viewportPadding), maxTop)
    const deltaY = clampedTop - visualTop

    const maxLeft = Math.max(
      viewportPadding,
      window.innerWidth - width - viewportPadding,
    )
    const visualLeft = rawLeft + (translate?.x ?? 0)
    const clampedLeft = Math.min(Math.max(visualLeft, viewportPadding), maxLeft)
    const deltaX = clampedLeft - visualLeft

    if (Math.abs(deltaY) <= 0.5 && Math.abs(deltaX) <= 0.5) {
      setViewportClampStyle(null)
      return
    }

    if (translate) {
      setViewportClampStyle({
        transform: `translate(${formatPixelValue(
          translate.x + deltaX,
        )}, ${formatPixelValue(translate.y + deltaY)})`,
      })
    } else {
      setViewportClampStyle({
        top: formatPixelValue(rawTop + deltaY),
        left: formatPixelValue(rawLeft + deltaX),
      })
    }
  }, [
    floatingStyles.top,
    floatingStyles.left,
    floatingStyles.transform,
    update,
  ])

  // Focus management: move focus into the toolbar when it opens (keyboard
  // users otherwise have to tab in from elsewhere in the page), and restore
  // it to the element that was being edited when the toolbar closes —
  // mirroring standard dialog/popover focus-trap conventions. Most preview
  // elements (h1, div, section, …) aren't natively focusable, so a
  // temporary tabindex is added just long enough to receive focus, then
  // removed on blur to avoid leaving stray tabindex attributes behind.
  const activeElementRef = useRef<HTMLElement | null>(null)
  activeElementRef.current = activeElement

  useEffect(() => {
    if (!isOpen) return
    // A live text edit keeps the caret in the contentEditable element itself
    // — that's the whole point of inline text editing. Stealing focus into
    // the wrapper here raced with the caret placement in useTextEdit's click
    // handler (the wrapper focus lands ~100ms later, after the caret), so the
    // user's cursor would vanish out of the text a moment after clicking it.
    if (activeElementRef.current?.getAttribute('contenteditable') === 'true')
      return
    const wrapper = wrapperRef.current
    if (wrapper && !wrapper.contains(document.activeElement)) {
      wrapper.focus({ preventScroll: true })
    }
    return () => {
      const target = activeElementRef.current
      if (!target || !document.body.contains(target)) return
      const hadTabIndex = target.hasAttribute('tabindex')
      if (!hadTabIndex) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      if (!hadTabIndex) {
        const cleanupTabIndex = () => {
          target.removeAttribute('tabindex')
          target.removeEventListener('blur', cleanupTabIndex)
        }
        target.addEventListener('blur', cleanupTabIndex)
      }
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen) {
      setViewportClampStyle(null)
      return
    }
    const frame = requestAnimationFrame(clampIntoViewport)
    const transitionTimer = window.setTimeout(clampIntoViewport, 240)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(transitionTimer)
    }
  }, [clampIntoViewport, isOpen])

  useLayoutEffect(() => {
    if (!isOpen || typeof ResizeObserver === 'undefined') return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let frame: number | null = null
    const observer = new ResizeObserver(() => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = null
        clampIntoViewport()
      })
    })
    observer.observe(wrapper)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [clampIntoViewport, isOpen])

  // Update the virtual reference whenever the anchor rect changes.
  useEffect(() => {
    if (!anchorRect) return
    refs.setPositionReference({
      getBoundingClientRect: () => anchorRect,
    } as VirtualElement)
  }, [anchorRect, refs])
  // Track whether the initial computed-style read is complete. The style-
  // applying useEffect must NOT run on mount with default values (fontSize='16',
  // color='#ffffff', fontWeight='400') — that causes a visual flash and layout
  // shift before the element's actual styles are read. Only apply styles after
  // the read is done AND the user has actually changed a control.
  const styleReadCompleteRef = useRef(false)
  const userModifiedRef = useRef(false)

  // Save original style and read computed styles when element changes
  useEffect(() => {
    if (!activeElement) return

    const previousStyleElement = activeStyleElementRef.current
    if (
      previousStyleElement &&
      previousStyleElement !== activeElement &&
      userModifiedRef.current &&
      !styleCommittedRef.current
    ) {
      const saved = originalStyleRef.current
      if (saved === null) {
        previousStyleElement.removeAttribute('style')
      } else {
        previousStyleElement.setAttribute('style', saved)
      }
    }

    const previousImageElement = activeImageElementRef.current
    if (
      previousImageElement &&
      previousImageElement !== activeElement &&
      previousImageElement.tagName.toLowerCase() === 'img' &&
      originalImageSrcRef.current !== null &&
      pendingImageSrcRef.current
    ) {
      ;(previousImageElement as HTMLImageElement).src =
        originalImageSrcRef.current
    }

    styleReadCompleteRef.current = false
    userModifiedRef.current = false
    forcePersistStyleRef.current = false
    styleCommittedRef.current = false
    activeStyleElementRef.current = activeElement
    originalStyleRef.current = stripTemporaryInlineEditingStyle(
      activeElement,
      activeElement.getAttribute('style'),
    )
    // Reset pending image swap state for the new element
    if (activeElement.tagName.toLowerCase() === 'img') {
      activeImageElementRef.current = activeElement
      originalImageSrcRef.current = (activeElement as HTMLImageElement).src
    } else {
      activeImageElementRef.current = null
      originalImageSrcRef.current = null
    }
    pendingImageSrcRef.current = null
    imagePreviewClearedRef.current = false
    setPendingImageSrc(null)
    setActivePanel(null)

    const computed = window.getComputedStyle(activeElement)
    // Parse the computed font-size into numeric value + unit. The browser
    // always returns px from getComputedStyle (even if the element uses em/rem
    // in its CSS), so we also check the element's inline style for the original
    // unit. If no inline style, default to px.
    const inlineStyle = activeElement.style.fontSize || ''
    const inlineMatch = inlineStyle.match(/^([\d.]+)(px|em|rem|pt|%)$/)
    if (inlineMatch) {
      setFontSize(inlineMatch[1])
      setFontSizeUnit(inlineMatch[2])
    } else {
      const computedMatch = computed.fontSize.match(/^([\d.]+)(px|em|rem|pt|%)/)
      if (computedMatch) {
        setFontSize(computedMatch[1])
        setFontSizeUnit(computedMatch[2])
      } else {
        setFontSize(computed.fontSize.replace(/[^\d.]/g, '') || '16')
        setFontSizeUnit('px')
      }
    }
    setIsBold(computed.fontWeight === '700' || computed.fontWeight === 'bold')
    setIsItalic(computed.fontStyle === 'italic')
    setIsUnderline(
      computed.textDecorationLine === 'underline' ||
        computed.textDecoration === 'underline',
    )
    setIsStrikethrough(
      computed.textDecorationLine === 'line-through' ||
        computed.textDecoration === 'line-through',
    )
    // Parse font weight: could be numeric (100-900) or keyword
    const fw = computed.fontWeight
    if (fw === 'bold') setFontWeight('700')
    else if (fw === 'normal') setFontWeight('400')
    else if (fw === 'lighter') setFontWeight('300')
    else if (fw === 'bolder') setFontWeight('600')
    else setFontWeight(fw || '400')
    const rgbColor = computed.color || '#ffffff'
    if (rgbColor.startsWith('rgb')) {
      const rgbMatch = rgbColor.match(/\d+/g)
      if (rgbMatch && rgbMatch.length >= 3) {
        const hex = rgbMatch
          .slice(0, 3)
          .map((x) => parseInt(x, 10).toString(16).padStart(2, '0'))
          .join('')
        setColor(`#${hex}`)
      } else {
        setColor('#ffffff')
      }
    } else {
      setColor(rgbColor)
    }

    const textAlign = computed.textAlign
    if (textAlign === 'center' || textAlign === 'right') {
      setAlignment(textAlign)
    } else {
      setAlignment('left')
    }

    // Mark read complete after state updates are processed. The style-applying
    // useEffect checks this ref to know it's safe to apply.
    requestAnimationFrame(() => {
      styleReadCompleteRef.current = true
    })
  }, [activeElement])

  // Apply styles to element for live preview — ONLY after the initial computed
  // style read is complete AND the user has actually changed a control. Without
  // this guard, the toolbar applies default values (16px, #ffffff, 400) on mount
  // before the element's real styles are read, causing a flash + layout shift.
  useEffect(() => {
    if (
      !activeElement ||
      !styleReadCompleteRef.current ||
      !userModifiedRef.current
    )
      return

    activeElement.style.fontSize = `${fontSize}${fontSizeUnit}`
    activeElement.style.fontWeight = isBold ? '700' : fontWeight
    activeElement.style.fontStyle = isItalic ? 'italic' : 'normal'
    // Combine underline + strikethrough into text-decoration-line
    const decorations: string[] = []
    if (isUnderline) decorations.push('underline')
    if (isStrikethrough) decorations.push('line-through')
    activeElement.style.textDecorationLine =
      decorations.length > 0 ? decorations.join(' ') : 'none'
    activeElement.style.color = color
    activeElement.style.textAlign = alignment
  }, [
    fontSize,
    fontSizeUnit,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    fontWeight,
    color,
    alignment,
    activeElement,
  ])

  // Prevent mousedown on the toolbar from stealing focus from the contentEditable
  // element. Without this, clicking any toolbar button blurs the contentEditable,
  // which fires finishEdit() and kills the edit before the style can be applied.
  // BUT: <select> and <input> elements need the mousedown default to function
  // (open dropdown, open color picker). Skip preventDefault for those so the
  // font-size dropdown and color picker actually work.
  const preventFocusSteal = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const tag = target.tagName
    // <select>, <input>, and Radix Select triggers (role="combobox") need
    // the mousedown default to function (open dropdown, focus input).
    if (tag === 'SELECT' || tag === 'INPUT') return
    if (target.closest('[role="combobox"]')) return
    // <label> wrapping a color input needs mousedown to trigger the input
    if (tag === 'LABEL' && target.querySelector('input[type="color"]')) return
    e.preventDefault()
  }

  const closeWithoutSaving = useCallback(() => {
    if (isApplying || isForking) return
    restoreRememberedLinkAttrs()
    if (activeElement) {
      const isActiveImage = activeElement.tagName.toLowerCase() === 'img'
      if (
        isActiveImage &&
        originalImageSrcRef.current !== null &&
        pendingImageSrc
      ) {
        ;(activeElement as HTMLImageElement).src = originalImageSrcRef.current
      }
      const saved = originalStyleRef.current
      if (saved === null) {
        activeElement.removeAttribute('style')
      } else {
        activeElement.setAttribute('style', saved)
      }
    }
    pendingImageSrcRef.current = null
    setPendingImageSrc(null)
    originalImageSrcRef.current = null
    onClose()
  }, [
    activeElement,
    isApplying,
    isForking,
    onClose,
    pendingImageSrc,
    restoreRememberedLinkAttrs,
  ])

  // Close on click outside — use wrapperRef so clicks on panels don't close.
  // Also check for closest [data-inline-edit-wrapper] as a fallback in case
  // the callback ref is temporarily null during React re-renders.
  // Radix Select/Tooltip portal their content to document.body, so also
  // check for Radix portal elements (options, popper content) — clicking
  // those should NOT close the toolbar.
  useEffect(() => {
    if (!isOpen || isApplying || isForking) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      const isInWrapper =
        (wrapperRef.current && wrapperRef.current.contains(target)) ||
        target.closest?.('[data-inline-edit-wrapper]')
      // Radix portals content outside the wrapper — treat clicks on
      // Select options, listbox content, and popper wrappers as "inside"
      const isInRadixPortal =
        target.closest?.('[role="option"]') ||
        target.closest?.('[role="listbox"]') ||
        target.closest?.('[data-radix-popper-content-wrapper]') ||
        target.closest?.('[data-radix-select-content]') ||
        target.closest?.('[role="alertdialog"]') ||
        target.closest?.('[data-radix-dialog-content]') ||
        target.closest?.('[data-radix-dialog-overlay]')
      if (
        !isInWrapper &&
        !isInRadixPortal &&
        !activeElement?.contains(target)
      ) {
        closeWithoutSaving()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, closeWithoutSaving, activeElement, isApplying, isForking])

  // Close on escape
  useEffect(() => {
    if (!isOpen || isApplying || isForking) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWithoutSaving()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeWithoutSaving, isApplying, isForking])

  const handleGenerate = () => {
    if (!aiPrompt.trim() || isSectionSubmitting || isApplying || isForking)
      return
    onSectionEdit?.(aiPrompt.trim())
  }

  // Live-preview an image swap without persisting. The actual save happens
  // in handleApply; handleClose reverts the src. newSrc may be a multi-image
  // payload (encodeMultiImageSrc) — the live <img> previews its first URL and
  // the full payload is kept pending so Apply persists the whole carousel.
  const handleImagePreview = (newSrc: string | null) => {
    if (!activeElement || !isImageElement) return
    if (originalImageSrcRef.current === null) {
      originalImageSrcRef.current = (activeElement as HTMLImageElement).src
    }
    if (newSrc === null) {
      ;(activeElement as HTMLImageElement).src =
        originalImageSrcRef.current ?? (activeElement as HTMLImageElement).src
      pendingImageSrcRef.current = null
      imagePreviewClearedRef.current = true
      setPendingImageSrc(null)
      return
    }
    ;(activeElement as HTMLImageElement).src = firstImageSrc(newSrc)
    pendingImageSrcRef.current = newSrc
    imagePreviewClearedRef.current = false
    setPendingImageSrc(newSrc)
  }

  const handleApply = () => {
    if (activeElement && !isApplying && !isForking) {
      // If an image swap is pending, commit it now.
      if (pendingImageSrc && isImageElement && onImageSelect) {
        onImageSelect(pendingImageSrc, originalImageSrcRef.current ?? '')
        pendingImageSrcRef.current = null
        imagePreviewClearedRef.current = false
        setPendingImageSrc(null)
        originalImageSrcRef.current = null
        onClose()
        return
      }

      // Always commit text changes first — the user may have typed text
      // and clicked Apply without modifying any style controls.
      onCommitText?.()

      // Only save style if the user actually modified a style control.
      if (!userModifiedRef.current) {
        onClose()
        return
      }
      const style = activeElement.getAttribute('style') ?? ''
      if (
        !forcePersistStyleRef.current &&
        style === (originalStyleRef.current ?? '')
      ) {
        imagePreviewClearedRef.current = false
        onClose()
        return
      }
      forcePersistStyleRef.current = false
      const { sourceAnchor, occurrenceIndex } =
        getStyleSourceAnchor(activeElement)
      styleCommittedRef.current = true
      onStyleApply({ sourceAnchor, style, occurrenceIndex })
      onClose()
    }
  }

  const handleDelete = () => {
    if (!activeElement || isApplying || isForking) return
    // Commit any pending text edit first
    onCommitText?.()
    // Apply display:none via the same style-override mechanism used by
    // handleApply. The element is hidden (not removed from the DOM) so
    // the override persists across re-renders via styleOverrides.
    const { sourceAnchor, occurrenceIndex } =
      getStyleSourceAnchor(activeElement)
    onStyleApply({
      sourceAnchor,
      style: 'display: none',
      occurrenceIndex,
    })
    onClose()
  }

  // Bring the selected element to the front (top) or send it to the back
  // (bottom) of its stacking context by editing its z-index. z-index only
  // applies to a positioned element, so a `static` element is first promoted
  // to `position: relative` (a no-offset relative keeps it in place visually
  // while enabling stacking). The new z-index is computed relative to the
  // element's siblings so the layering is meaningful within its own parent —
  // max(siblings)+1 for front, min(siblings)-1 for back.
  //
  // This is a LIVE PREVIEW only — like every other style control (typography,
  // spacing, paste-style), it mutates the element's inline style and marks the
  // edit as user-modified, but does NOT persist or close. The toolbar stays
  // open so the user can see the result and keep adjusting; the change is
  // committed only when Apply is pressed (handleApply reads the full inline
  // style) and reverted by closeWithoutSaving (restores originalStyleRef) if
  // the user cancels, clicks away, or presses Escape without saving.
  const handleLayer = (direction: 'front' | 'back') => {
    if (!activeElement || isApplying || isForking) return

    const computed = window.getComputedStyle(activeElement)
    const position = computed.position
    // Empty string covers jsdom, which reports no value for the default.
    if (!position || position === 'static') {
      activeElement.style.position = 'relative'
    }

    const siblingZIndices = (
      activeElement.parentElement
        ? Array.from(activeElement.parentElement.children)
        : []
    )
      .filter((el) => el !== activeElement)
      .map((el) => parseInt(window.getComputedStyle(el).zIndex, 10))
      .filter((z) => Number.isFinite(z))

    const nextZIndex =
      direction === 'front'
        ? (siblingZIndices.length ? Math.max(...siblingZIndices) : 0) + 1
        : (siblingZIndices.length ? Math.min(...siblingZIndices) : 0) - 1

    activeElement.style.zIndex = String(nextZIndex)

    // Same commit-on-Apply / revert-on-cancel contract as handlePasteStyle.
    forcePersistStyleRef.current = true
    markUserModified()
  }

  const handleClose = closeWithoutSaving

  // Mark that the user has started modifying styles. The style-applying
  // useEffect only runs after this is set, preventing the initial mount from
  // applying default values before the computed styles are read.
  const markUserModified = () => {
    userModifiedRef.current = true
  }

  // Copy the current element's inline style into the module-level clipboard.
  const handleCopyStyle = () => {
    if (!activeElement) return
    copiedStyle = activeElement.getAttribute('style') ?? ''
    setHasCopiedStyle(true)
  }

  // Paste the stored style string onto the current element and mark it as
  // user-modified so the change is committed on Apply.
  const handlePasteStyle = () => {
    if (!activeElement || copiedStyle === null) return
    if (copiedStyle) {
      activeElement.setAttribute('style', copiedStyle)
    } else {
      activeElement.removeAttribute('style')
    }
    forcePersistStyleRef.current = true
    markUserModified()
  }

  if (!isOpen || !anchorRect || !activeElement) return null

  const tag = activeElement.tagName.toLowerCase()
  const isLinkElement = tag === 'a'
  const isImageElement = tag === 'img'
  const canSectionEdit = typeof onSectionEdit === 'function'
  // Use the same logic as findTextElement — if the element can be
  // contentEditable text, it gets the full text toolbar.
  const isTextElement = isEditableTextLeaf(activeElement)
  const parentSectionElement = onSelectParentSection
    ? findParentSectionElement(activeElement)
    : null
  const pageElement = onSelectParentSection
    ? findPageElement(activeElement)
    : null
  const canSelectPageElement =
    pageElement !== null && pageElement !== activeElement
  const selectableParent = onSelectParent
    ? findSelectableParent(activeElement)
    : null

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={(node: HTMLDivElement | null) => {
          wrapperRef.current = node
          refs.setFloating(node)
        }}
        style={{
          ...floatingStyles,
          ...(viewportClampStyle ?? {}),
          maxHeight: 'calc(100vh - 16px)',
          zIndex: 2147483647,
          touchAction: 'manipulation',
        }}
        className="inline-edit-toolbar flex max-w-[calc(100vw-16px)] flex-col rounded-lg border border-white/10 bg-[#0b0d14]/95 shadow-2xl backdrop-blur-xl overflow-hidden"
        data-inline-edit-wrapper="true"
        tabIndex={-1}
        onMouseDown={preventFocusSteal}
      >
        <div
          ref={toolbarRef}
          className="flex items-center gap-2 border-b border-white/10 p-2"
        >
          <div
            data-inline-toolbar-scroll="true"
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {selectableParent && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onClick={() => onSelectParent?.(selectableParent)}
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded transition-colors',
                      'text-white/60 hover:bg-white/5 hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Select parent"
                  >
                    <SquareArrowUp className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Select parent element</TooltipContent>
              </Tooltip>
            )}
            {parentSectionElement && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onClick={() =>
                      onSelectParentSection?.(parentSectionElement)
                    }
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded transition-colors',
                      'text-white/60 hover:bg-white/5 hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Select section"
                  >
                    <PanelTop className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Select enclosing section</TooltipContent>
              </Tooltip>
            )}
            {canSelectPageElement && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onClick={() => onSelectParentSection?.(pageElement)}
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded transition-colors',
                      'text-white/60 hover:bg-white/5 hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Select page"
                  >
                    <PanelTop className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Select full page</TooltipContent>
              </Tooltip>
            )}
            {isTextElement && (
              <InputGroup className="h-7 max-w-32">
                <InputGroupAddon>
                  <Type className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  aria-label="Font size"
                  value={fontSize}
                  onChange={(e) => {
                    markUserModified()
                    setFontSize(e.target.value)
                  }}
                  disabled={isApplying || isForking}
                  min="1"
                  step="1"
                  className="text-xs text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <InputGroupAddon align="inline-end">
                  <select
                    aria-label="Font size unit"
                    value={fontSizeUnit}
                    onChange={(e) => {
                      markUserModified()
                      setFontSizeUnit(e.target.value)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isApplying || isForking}
                    className="bg-transparent text-xs outline-none cursor-pointer"
                  >
                    <option value="px">px</option>
                    <option value="em">em</option>
                    <option value="rem">rem</option>
                    <option value="pt">pt</option>
                    <option value="%">%</option>
                  </select>
                </InputGroupAddon>
              </InputGroup>
            )}

            {isTextElement && (
              <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setIsBold(!isBold)
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    isBold
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Bold"
                  aria-pressed={isBold}
                >
                  <Bold className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setIsItalic(!isItalic)
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    isItalic
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Italic"
                  aria-pressed={isItalic}
                >
                  <Italic className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setIsUnderline(!isUnderline)
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    isUnderline
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Underline"
                  aria-pressed={isUnderline}
                >
                  <Underline className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setIsStrikethrough(!isStrikethrough)
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    isStrikethrough
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Strikethrough"
                  aria-pressed={isStrikethrough}
                >
                  <Strikethrough className="size-3.5" />
                </button>
              </div>
            )}

            {isTextElement && (
              <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    markUserModified()
                    setColor(e.target.value)
                  }}
                  disabled={isApplying || isForking}
                  className="size-7 rounded cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Text color"
                />
              </div>
            )}

            {isTextElement && (
              <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setAlignment('left')
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    alignment === 'left'
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Align left"
                  aria-pressed={alignment === 'left'}
                >
                  <AlignLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setAlignment('center')
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    alignment === 'center'
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Align center"
                  aria-pressed={alignment === 'center'}
                >
                  <AlignCenter className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markUserModified()
                    setAlignment('right')
                  }}
                  disabled={isApplying || isForking}
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    alignment === 'right'
                      ? 'bg-cyan-300/20 text-cyan-100'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Align right"
                  aria-pressed={alignment === 'right'}
                >
                  <AlignRight className="size-3.5" />
                </button>
              </div>
            )}

            {/* Extended controls: Style, Typography, Link, Move, Undo/Redo */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanelWithCleanup(
                        activePanel === 'style' ? null : 'style',
                      )
                    }
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded transition-colors',
                      activePanel === 'style'
                        ? 'bg-cyan-300/20 text-cyan-100'
                        : 'text-white/60 hover:bg-white/5 hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Style controls"
                    aria-expanded={activePanel === 'style'}
                  >
                    <SlidersHorizontal className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Spacing, border, background, size
                </TooltipContent>
              </Tooltip>
              {isTextElement && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanelWithCleanup(
                          activePanel === 'typography' ? null : 'typography',
                        )
                      }
                      disabled={isApplying || isForking}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        activePanel === 'typography'
                          ? 'bg-cyan-300/20 text-cyan-100'
                          : 'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Typography controls"
                      aria-expanded={activePanel === 'typography'}
                    >
                      <Type className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Font family, line height, spacing, transform
                  </TooltipContent>
                </Tooltip>
              )}
              {isLinkElement && onLinkEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanelWithCleanup(
                          activePanel === 'link' ? null : 'link',
                        )
                      }
                      disabled={isApplying || isForking}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        activePanel === 'link'
                          ? 'bg-cyan-300/20 text-cyan-100'
                          : 'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Edit link"
                      aria-expanded={activePanel === 'link'}
                    >
                      <LinkIcon className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit link URL and text</TooltipContent>
                </Tooltip>
              )}
              {isImageElement && onImageSelect && sessionId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanelWithCleanup(
                          activePanel === 'image' ? null : 'image',
                        )
                      }
                      disabled={isApplying || isForking}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        activePanel === 'image'
                          ? 'bg-cyan-300/20 text-cyan-100'
                          : 'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Swap image"
                      aria-expanded={activePanel === 'image'}
                    >
                      <ImageIcon className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Search and swap image</TooltipContent>
                </Tooltip>
              )}
              {(onMoveUp || onMoveDown) && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={isApplying || isForking || !canMoveUp}
                        className={cn(
                          'grid size-7 place-items-center rounded transition-colors',
                          'text-white/60 hover:bg-white/5 hover:text-white',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                        aria-label="Move up"
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Move element up</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={isApplying || isForking || !canMoveDown}
                        className={cn(
                          'grid size-7 place-items-center rounded transition-colors',
                          'text-white/60 hover:bg-white/5 hover:text-white',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                        aria-label="Move down"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Move element down</TooltipContent>
                  </Tooltip>
                </>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleLayer('front')}
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded transition-colors',
                      'text-white/60 hover:bg-white/5 hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Bring to front"
                  >
                    <BringToFront className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Bring to front (top layer)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleLayer('back')}
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded transition-colors',
                      'text-white/60 hover:bg-white/5 hover:text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Send to back"
                  >
                    <SendToBack className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Send to back (bottom layer)</TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleCopyStyle}
                      disabled={isApplying || isForking}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Copy style"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Copy style</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handlePasteStyle}
                      disabled={isApplying || isForking || !hasCopiedStyle}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Paste style"
                    >
                      <ClipboardPaste className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Paste style</TooltipContent>
                </Tooltip>
              </div>
              {onUndo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onUndo}
                      disabled={isApplying || isForking || !canUndo}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Undo"
                    >
                      <Undo2 className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Undo last edit</TooltipContent>
                </Tooltip>
              )}
              {onRedo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onRedo}
                      disabled={isApplying || isForking || !canRedo}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="Redo"
                    >
                      <Redo2 className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Redo last undone edit</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={isApplying || isForking}
                    className={cn(
                      'grid size-7 place-items-center rounded text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    aria-label="Delete element"
                    title="Delete element"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this element?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will hide the selected element from the page. You can
                      undo this by reverting the edit.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {canSectionEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePanelWithCleanup(
                          activePanel === 'ai' ? null : 'ai',
                        )
                      }
                      disabled={isApplying || isForking}
                      className={cn(
                        'grid size-7 place-items-center rounded transition-colors',
                        activePanel === 'ai'
                          ? 'bg-cyan-300/15 text-cyan-200'
                          : 'text-white/60 hover:bg-white/5 hover:text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                      aria-label="AI edit"
                      aria-expanded={activePanel === 'ai'}
                    >
                      <Sparkles className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>AI edit</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div
            data-inline-toolbar-actions="true"
            className="flex shrink-0 items-center gap-2"
          >
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying || isForking}
              className={cn(
                'relative flex items-center gap-1.5 rounded bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 transition-transform hover:-translate-y-px',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
              )}
            >
              {isForking ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Forking...
                </span>
              ) : isApplying ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Apply'
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isApplying || isForking}
              className={cn(
                'grid size-7 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Extended panels — animated expand/collapse using grid-rows trick */}
        <div
          className="grid w-full grid-cols-[1fr] transition-[grid-template-rows,opacity] duration-200 ease-out"
          style={{
            gridTemplateRows: activePanel ? '1fr' : '0fr',
            opacity: activePanel ? 1 : 0,
          }}
        >
          <div className="overflow-hidden w-full">
            <div
              className="max-h-[min(60vh,420px)] w-[32.5rem] max-w-full overflow-y-auto overscroll-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent"
              data-inline-edit-wrapper="true"
            >
              {displayPanel === 'style' && (
                <StyleControlsPanel
                  activeElement={activeElement}
                  onModified={() => {
                    userModifiedRef.current = true
                  }}
                  onImageElementPreview={handleImagePreview}
                  sessionId={sessionId}
                />
              )}
              {displayPanel === 'typography' && (
                <TypographyControlsPanel
                  activeElement={activeElement}
                  onModified={() => {
                    userModifiedRef.current = true
                  }}
                />
              )}
              {displayPanel === 'link' && isLinkElement && onLinkEdit && (
                <LinkEditPopover
                  activeElement={activeElement as HTMLAnchorElement}
                  onApply={(payload) => {
                    onLinkEdit(payload)
                    clearRememberedLinkAttrs()
                    setActivePanel(null)
                  }}
                  onClose={() => {
                    restoreRememberedLinkAttrs()
                    setActivePanel(null)
                  }}
                />
              )}
              {displayPanel === 'ai' && canSectionEdit && (
                <div className="flex w-full flex-col">
                  <textarea
                    aria-label="Describe AI edit"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                    placeholder="Describe a change..."
                    autoFocus
                    disabled={isSectionSubmitting || isApplying || isForking}
                    className="min-h-[72px] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-0"
                  />
                  <div className="flex items-center gap-2 px-2 pb-1.5">
                    {sectionError && (
                      <span role="alert" className="text-xs text-red-400">
                        {sectionError}
                      </span>
                    )}
                    {isSectionSubmitting && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="text-xs text-cyan-300"
                      >
                        Generating...
                      </span>
                    )}
                    <Button
                      type="button"
                      size="xs"
                      onClick={handleGenerate}
                      disabled={
                        !aiPrompt.trim() ||
                        isSectionSubmitting ||
                        isApplying ||
                        isForking
                      }
                      className="ml-auto h-6 gap-1.5 rounded-md bg-cyan-300/90 px-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"
                    >
                      {isSectionSubmitting ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {displayPanel === 'image' &&
                isImageElement &&
                onImageSelect &&
                sessionId && (
                  <ImageSwapPanel
                    currentAlt={(activeElement as HTMLImageElement).alt ?? ''}
                    onImageSelect={handleImagePreview}
                    imageWidth={
                      (activeElement as HTMLImageElement).naturalWidth
                    }
                    imageHeight={
                      (activeElement as HTMLImageElement).naturalHeight
                    }
                    sessionId={sessionId}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
