import { useState, useEffect, useRef } from 'react'
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
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Textarea } from '#/components/ui/textarea'
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
    occurrenceIndex: number
  }) => void
  /** Move/reorder element in Stack */
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  /** Image swap */
  onImageSelect?: (newSrc: string) => void
  sessionId?: string
  /** Section AI edit */
  onSectionEdit?: (prompt: string) => void
  isSectionSubmitting?: boolean
  sectionError?: string
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
  sessionId,
  onSectionEdit,
  isSectionSubmitting = false,
  sectionError,
}: InlineEditToolbarProps) {
  const [fontSize, setFontSize] = useState('16')
  const [fontSizeUnit, setFontSizeUnit] = useState('px')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
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
  // AI edit prompt text
  const [aiPrompt, setAiPrompt] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const originalStyleRef = useRef<string | null>(null)

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

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement,
    middleware: [offset(8), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

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

    styleReadCompleteRef.current = false
    userModifiedRef.current = false
    originalStyleRef.current = activeElement.getAttribute('style')
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
    activeElement.style.fontWeight = isBold ? '700' : '400'
    activeElement.style.fontStyle = isItalic ? 'italic' : 'normal'
    activeElement.style.color = color
    activeElement.style.textAlign = alignment
  }, [
    fontSize,
    fontSizeUnit,
    isBold,
    isItalic,
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
    e.preventDefault()
  }

  // Close on click outside — use wrapperRef so clicks on panels don't close.
  // Also check for closest [data-inline-edit-wrapper] as a fallback in case
  // the callback ref is temporarily null during React re-renders.
  // Radix Select/Tooltip portal their content to document.body, so also
  // check for Radix portal elements (options, popper content) — clicking
  // those should NOT close the toolbar.
  useEffect(() => {
    if (!isOpen || isApplying || isForking) return
    const handleClickOutside = (e: MouseEvent) => {
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
        target.closest?.('[data-radix-select-content]')
      if (
        !isInWrapper &&
        !isInRadixPortal &&
        !activeElement?.contains(target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, activeElement, isApplying, isForking])

  // Close on escape
  useEffect(() => {
    if (!isOpen || isApplying || isForking) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, isApplying, isForking])

  const handleApply = () => {
    if (activeElement && !isApplying && !isForking) {
      // If AI panel is open with a prompt, submit via AI edit handler
      if (activePanel === 'ai' && aiPrompt.trim() && onSectionEdit) {
        onSectionEdit(aiPrompt.trim())
        setAiPrompt('')
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
      // Anchor on the exact `class` attribute: it's the only stable identifier
      // present in BOTH this live DOM and the server-rendered stored preview
      // HTML (which has no data-tsd-source). occurrenceIndex disambiguates
      // elements that share the same class string, in document order.
      const sourceAnchor = activeElement.getAttribute('class') ?? ''
      const style = activeElement.getAttribute('style') ?? ''
      let occurrenceIndex = 0
      if (sourceAnchor) {
        const doc = activeElement.ownerDocument
        const peers = Array.from(
          doc.querySelectorAll(`[class="${CSS.escape(sourceAnchor)}"]`),
        )
        const at = peers.indexOf(activeElement)
        occurrenceIndex = at < 0 ? 0 : at
      }
      onStyleApply({ sourceAnchor, style, occurrenceIndex })
    }
  }

  const handleDelete = () => {
    if (!activeElement || isApplying || isForking) return
    // Commit any pending text edit first
    onCommitText?.()
    // Apply display:none via the same style-override mechanism used by
    // handleApply. The element is hidden (not removed from the DOM) so
    // the override persists across re-renders via styleOverrides.
    const sourceAnchor = activeElement.getAttribute('class') ?? ''
    let occurrenceIndex = 0
    if (sourceAnchor) {
      const doc = activeElement.ownerDocument
      const peers = Array.from(
        doc.querySelectorAll(`[class="${CSS.escape(sourceAnchor)}"]`),
      )
      const at = peers.indexOf(activeElement)
      occurrenceIndex = at < 0 ? 0 : at
    }
    onStyleApply({
      sourceAnchor,
      style: 'display: none',
      occurrenceIndex,
    })
    onClose()
  }

  const handleClose = () => {
    if (!isApplying && !isForking) {
      if (activeElement) {
        const saved = originalStyleRef.current
        if (saved === null) {
          activeElement.removeAttribute('style')
        } else {
          activeElement.setAttribute('style', saved)
        }
      }
      onClose()
    }
  }

  // Mark that the user has started modifying styles. The style-applying
  // useEffect only runs after this is set, preventing the initial mount from
  // applying default values before the computed styles are read.
  const markUserModified = () => {
    userModifiedRef.current = true
  }

  if (!isOpen || !anchorRect || !activeElement) return null

  const tag = activeElement.tagName.toLowerCase()
  const isLinkElement = tag === 'a'
  const isImageElement = tag === 'img'
  // Text elements: show font size, bold, italic, color, alignment, typography.
  // Mirrors findTextElement in useTextEdit.ts — any tag that can be a
  // contentEditable text leaf gets the full text toolbar.
  const isTextElement = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'div',
    'a',
    'button',
    'label',
    'li',
    'td',
    'th',
    'strong',
    'em',
    'small',
    'blockquote',
    'figcaption',
  ].includes(tag)

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={(node: HTMLDivElement | null) => {
          wrapperRef.current = node
          refs.setFloating(node)
        }}
        style={{ ...floatingStyles, zIndex: 2147483647 }}
        className="inline-edit-toolbar flex flex-col rounded-lg border border-white/10 bg-[#0b0d14]/95 shadow-2xl backdrop-blur-xl overflow-hidden"
        data-inline-edit-wrapper="true"
        onMouseDown={preventFocusSteal}
      >
        <div
          ref={toolbarRef}
          className="p-2 flex items-center gap-2 border-b border-white/10"
        >
          {isTextElement && (
            <InputGroup className="h-7 max-w-32">
              <InputGroupAddon>
                <Type className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                type="number"
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
              >
                <Italic className="size-3.5" />
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
                    setActivePanel(activePanel === 'style' ? null : 'style')
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
                >
                  <SlidersHorizontal className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Spacing, border, background, size</TooltipContent>
            </Tooltip>
            {isTextElement && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel(
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
                      setActivePanel(activePanel === 'link' ? null : 'link')
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
                      setActivePanel(activePanel === 'image' ? null : 'image')
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

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    setActivePanel(activePanel === 'ai' ? null : 'ai')
                  }
                  className={cn(
                    'grid size-7 place-items-center rounded transition-colors',
                    activePanel === 'ai'
                      ? 'bg-cyan-300/15 text-cyan-200'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                  )}
                  aria-label="AI edit"
                >
                  <Sparkles className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>AI edit</TooltipContent>
            </Tooltip>

            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying || isForking}
              className={cn(
                'flex items-center gap-1.5 rounded bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 transition-transform hover:-translate-y-px',
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
              ) : activePanel === 'ai' ? (
                <>
                  Apply
                  <Sparkles className="size-3" />
                </>
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
          className="grid w-full transition-[grid-template-rows,opacity] duration-200 ease-out"
          style={{
            gridTemplateRows: activePanel ? '1fr' : '0fr',
            opacity: activePanel ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            {displayPanel === 'style' && (
              <StyleControlsPanel
                activeElement={activeElement}
                onModified={() => {
                  userModifiedRef.current = true
                }}
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
                  setActivePanel(null)
                }}
                onClose={() => setActivePanel(null)}
              />
            )}
            {displayPanel === 'ai' && (
              <div className="flex flex-col gap-1 w-full">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleApply()
                    }
                  }}
                  placeholder="Describe a change..."
                  className="min-h-[72px] text-sm border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-0 px-3 py-2"
                  autoFocus
                  disabled={isSectionSubmitting}
                />
                {sectionError && (
                  <p className="px-3 text-xs text-red-400">{sectionError}</p>
                )}
                {isSectionSubmitting && (
                  <p className="px-3 text-xs text-cyan-300">Generating...</p>
                )}
              </div>
            )}
            {displayPanel === 'image' &&
              isImageElement &&
              onImageSelect &&
              sessionId && (
                <ImageSwapPanel
                  currentAlt={(activeElement as HTMLImageElement).alt ?? ''}
                  onImageSelect={onImageSelect}
                  imageWidth={(activeElement as HTMLImageElement).naturalWidth}
                  imageHeight={
                    (activeElement as HTMLImageElement).naturalHeight
                  }
                  sessionId={sessionId}
                />
              )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
