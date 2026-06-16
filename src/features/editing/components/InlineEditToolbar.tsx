import { useState, useEffect, useRef } from 'react'
import { X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Loader2 } from 'lucide-react'
import { cn } from '#/lib/utils'

interface InlineEditToolbarProps {
  isOpen: boolean
  anchorRect: DOMRect | null
  activeElement: HTMLElement | null
  onStyleApply: (payload: { sourceAnchor: string; style: string; occurrenceIndex: number }) => void
  onClose: () => void
  isApplying?: boolean
  isForking?: boolean
}

export function InlineEditToolbar({
  isOpen,
  anchorRect,
  activeElement,
  onStyleApply,
  onClose,
  isApplying = false,
  isForking = false,
}: InlineEditToolbarProps) {
  const [fontSize, setFontSize] = useState('16')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [color, setColor] = useState('#ffffff')
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left')
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Read current computed styles when element changes
  useEffect(() => {
    if (!activeElement) return

    const computed = window.getComputedStyle(activeElement)
    setFontSize(computed.fontSize.replace('px', ''))
    setIsBold(computed.fontWeight === '700' || computed.fontWeight === 'bold')
    setIsItalic(computed.fontStyle === 'italic')
    // Convert rgb to hex for color picker
    const rgbColor = computed.color || '#ffffff'
    if (rgbColor.startsWith('rgb')) {
      const rgbMatch = rgbColor.match(/\d+/g)
      if (rgbMatch && rgbMatch.length >= 3) {
        const hex = rgbMatch.slice(0, 3).map((x) => parseInt(x, 10).toString(16).padStart(2, '0')).join('')
        setColor(`#${hex}`)
      } else {
        setColor('#ffffff')
      }
    } else {
      setColor(rgbColor)
    }
    
    const textAlign = computed.textAlign as 'left' | 'center' | 'right'
    if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') {
      setAlignment(textAlign)
    }
  }, [activeElement])

  // Apply styles to element immediately for preview
  useEffect(() => {
    if (!activeElement) return

    activeElement.style.fontSize = `${fontSize}px`
    activeElement.style.fontWeight = isBold ? '700' : '400'
    activeElement.style.fontStyle = isItalic ? 'italic' : 'normal'
    activeElement.style.color = color
    activeElement.style.textAlign = alignment
  }, [fontSize, isBold, isItalic, color, alignment, activeElement])

  // Close on click outside
  useEffect(() => {
    if (!isOpen || isApplying || isForking) return
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node) && !activeElement?.contains(e.target as Node)) {
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

  const handleClose = () => {
    if (!isApplying && !isForking) {
      onClose()
    }
  }

  if (!isOpen || !anchorRect || !activeElement) return null

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${anchorRect.left}px`,
    top: `${anchorRect.top - 60}px`,
    zIndex: 9999,
  }

  return (
    <div ref={toolbarRef} className="inline-edit-toolbar rounded-lg border border-white/10 bg-[#0b0d14]/95 shadow-2xl backdrop-blur-xl p-2 flex items-center gap-2" style={toolbarStyle}>
      <div className="flex items-center gap-1 border-r border-white/10 pr-2">
        <Type className="size-4 text-white/40" />
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          disabled={isApplying || isForking}
          className="bg-white/5 text-white text-xs rounded px-2 py-1 outline-none focus:ring-2 focus:ring-cyan-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
        </select>
      </div>

      <div className="flex items-center gap-1 border-r border-white/10 pr-2">
        <button
          type="button"
          onClick={() => setIsBold(!isBold)}
          disabled={isApplying || isForking}
          className={cn(
            'grid size-7 place-items-center rounded transition-colors',
            isBold ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Bold"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIsItalic(!isItalic)}
          disabled={isApplying || isForking}
          className={cn(
            'grid size-7 place-items-center rounded transition-colors',
            isItalic ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Italic"
        >
          <Italic className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-white/10 pr-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={isApplying || isForking}
          className="size-7 rounded cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Text color"
        />
      </div>

      <div className="flex items-center gap-1 border-r border-white/10 pr-2">
        <button
          type="button"
          onClick={() => setAlignment('left')}
          disabled={isApplying || isForking}
          className={cn(
            'grid size-7 place-items-center rounded transition-colors',
            alignment === 'left' ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Align left"
        >
          <AlignLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setAlignment('center')}
          disabled={isApplying || isForking}
          className={cn(
            'grid size-7 place-items-center rounded transition-colors',
            alignment === 'center' ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Align center"
        >
          <AlignCenter className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setAlignment('right')}
          disabled={isApplying || isForking}
          className={cn(
            'grid size-7 place-items-center rounded transition-colors',
            alignment === 'right' ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          aria-label="Align right"
        >
          <AlignRight className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying || isForking}
          className={cn(
            'rounded bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 transition-transform hover:-translate-y-px',
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
  )
}