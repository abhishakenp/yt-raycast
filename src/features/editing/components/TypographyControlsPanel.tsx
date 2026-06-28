import { useState, useLayoutEffect, useRef } from 'react'
import { X, Check, Type } from 'lucide-react'
import { cn } from '#/lib/utils'

const safeEscape = (str: string): string => {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(str)
  return str.replace(/[^\w-]/g, '\\$&')
}

interface TypographyControlsPanelProps {
  activeElement: HTMLElement | null
  onApply: (payload: {
    sourceAnchor: string
    style: string
    occurrenceIndex: number
  }) => void
  onClose: () => void
}

const FONT_FAMILIES: Array<{ label: string; value: string }> = [
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Courier New', value: '"Courier New", monospace' },
]

const TEXT_TRANSFORMS = [
  { label: 'None', value: 'none' },
  { label: 'Upper', value: 'uppercase' },
  { label: 'Lower', value: 'lowercase' },
  { label: 'Cap', value: 'capitalize' },
] as const

export function TypographyControlsPanel({
  activeElement,
  onApply,
  onClose,
}: TypographyControlsPanelProps) {
  const [fontFamily, setFontFamily] = useState('')
  const [lineHeight, setLineHeight] = useState('')
  const [lineHeightNormal, setLineHeightNormal] = useState(true)
  const [letterSpacing, setLetterSpacing] = useState('')
  const [letterSpacingUnit, setLetterSpacingUnit] = useState('em')
  const [wordSpacing, setWordSpacing] = useState('')
  const [wordSpacingUnit, setWordSpacingUnit] = useState('em')
  const [textTransform, setTextTransform] = useState<string>('none')

  const originalStyleRef = useRef<string | null>(null)
  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)

  // Capture original style synchronously during render (not in effect)
  // so it's available before any fireEvent interactions in tests
  if (activeElement && prevElementRef.current !== activeElement) {
    prevElementRef.current = activeElement
    originalStyleRef.current = activeElement.getAttribute('style')
    userModifiedRef.current = false
  }

  useLayoutEffect(() => {
    if (!activeElement) return
    const computed = window.getComputedStyle(activeElement)
    setFontFamily(computed.fontFamily || '')
    const lh = computed.lineHeight
    setLineHeight(lh)
    setLineHeightNormal(lh === 'normal')
    setLetterSpacing(String(parseFloat(computed.letterSpacing) || 0))
    setWordSpacing(String(parseFloat(computed.wordSpacing) || 0))
    setTextTransform(computed.textTransform || 'none')
  }, [activeElement])

  const markModified = () => {
    userModifiedRef.current = true
  }

  const applyLiveStyle = (prop: string, value: string) => {
    if (activeElement) {
      activeElement.style.setProperty(prop, value)
      markModified()
    }
  }

  const handleApply = () => {
    if (!activeElement) {
      onClose()
      return
    }
    const currentStyle = activeElement.getAttribute('style') ?? ''
    const originalStyle = originalStyleRef.current ?? ''
    if (currentStyle === originalStyle) {
      onClose()
      return
    }
    const sourceAnchor = activeElement.getAttribute('class') ?? ''
    const style = currentStyle
    let occurrenceIndex = 0
    if (sourceAnchor) {
      const doc = activeElement.ownerDocument
      const peers = Array.from(
        doc.querySelectorAll(`[class="${safeEscape(sourceAnchor)}"]`),
      )
      const at = peers.indexOf(activeElement)
      occurrenceIndex = at < 0 ? 0 : at
    }
    onApply({ sourceAnchor, style, occurrenceIndex })
  }

  const handleClose = () => {
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

  return (
    <div className="flex flex-col gap-2 border-t border-white/10 p-2">
      <div className="flex items-center gap-1.5">
        <Type className="size-3.5 text-cyan-300" />
        <span className="text-xs font-medium text-white/60">Typography</span>
      </div>

      {/* Font Family */}
      <div className="flex items-center gap-2">
        <Type className="size-3 shrink-0 text-white/40" />
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value)
            applyLiveStyle('font-family', e.target.value)
          }}
          className="h-7 flex-1 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Line Height */}
      <div className="flex items-center gap-2">
        <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Line
        </span>
        <input
          type="number"
          step="0.1"
          min="0.5"
          max="3"
          value={lineHeightNormal ? '' : lineHeight}
          disabled={lineHeightNormal}
          onChange={(e) => {
            setLineHeight(e.target.value)
            applyLiveStyle('line-height', e.target.value)
          }}
          placeholder="normal"
          className="h-7 flex-1 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={() => {
            const isNormal = !lineHeightNormal
            setLineHeightNormal(isNormal)
            if (isNormal) {
              applyLiveStyle('line-height', 'normal')
            }
          }}
          className={cn(
            'h-7 rounded px-2 text-xs transition-colors',
            lineHeightNormal
              ? 'bg-cyan-300/20 text-cyan-100'
              : 'text-white/40 hover:bg-white/5',
          )}
        >
          Auto
        </button>
      </div>

      {/* Letter Spacing */}
      <div className="flex items-center gap-2">
        <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Letter
        </span>
        <input
          type="number"
          step="0.01"
          value={letterSpacing}
          onChange={(e) => {
            setLetterSpacing(e.target.value)
            applyLiveStyle(
              'letter-spacing',
              `${e.target.value}${letterSpacingUnit}`,
            )
          }}
          className="h-7 flex-1 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
        />
        <select
          value={letterSpacingUnit}
          onChange={(e) => setLetterSpacingUnit(e.target.value)}
          className="h-7 w-14 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50"
        >
          <option value="em">em</option>
          <option value="px">px</option>
          <option value="rem">rem</option>
        </select>
      </div>

      {/* Word Spacing */}
      <div className="flex items-center gap-2">
        <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Word
        </span>
        <input
          type="number"
          step="0.01"
          value={wordSpacing}
          onChange={(e) => {
            setWordSpacing(e.target.value)
            applyLiveStyle(
              'word-spacing',
              `${e.target.value}${wordSpacingUnit}`,
            )
          }}
          className="h-7 flex-1 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
        />
        <select
          value={wordSpacingUnit}
          onChange={(e) => setWordSpacingUnit(e.target.value)}
          className="h-7 w-14 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50"
        >
          <option value="em">em</option>
          <option value="px">px</option>
          <option value="rem">rem</option>
        </select>
      </div>

      {/* Text Transform */}
      <div className="flex items-center gap-2">
        <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Case
        </span>
        <div className="flex flex-1 flex-wrap gap-1">
          {TEXT_TRANSFORMS.map((tt) => (
            <button
              key={tt.value}
              type="button"
              onClick={() => {
                setTextTransform(tt.value)
                applyLiveStyle('text-transform', tt.value)
              }}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] transition-colors',
                textTransform === tt.value
                  ? 'bg-cyan-300/15 text-cyan-200'
                  : 'text-white/40 hover:bg-white/5',
              )}
            >
              {tt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-white/10 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex items-center gap-1 rounded bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-200"
        >
          <Check className="size-3" />
          Apply
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="grid size-7 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
