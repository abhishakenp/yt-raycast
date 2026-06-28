import { useState, useEffect, useRef } from 'react'
import {
  X,
  Check,
  Square,
  Palette,
  Maximize2,
  Layers,
  Link2,
  Unlink,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

interface StyleControlsPanelProps {
  activeElement: HTMLElement | null
  onApply: (payload: {
    sourceAnchor: string
    style: string
    occurrenceIndex: number
  }) => void
  onClose: () => void
}

type Tab = 'spacing' | 'border' | 'background' | 'size'

const SHADOW_PRESETS: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

export function StyleControlsPanel({
  activeElement,
  onApply,
  onClose,
}: StyleControlsPanelProps) {
  const [tab, setTab] = useState<Tab>('spacing')
  const [padding, setPadding] = useState({
    top: '',
    right: '',
    bottom: '',
    left: '',
  })
  const [margin, setMargin] = useState({
    top: '',
    right: '',
    bottom: '',
    left: '',
  })
  const [paddingLinked, setPaddingLinked] = useState(true)
  const [marginLinked, setMarginLinked] = useState(true)
  const [spacingUnit, setSpacingUnit] = useState('px')

  const [borderWidth, setBorderWidth] = useState('')
  const [borderStyle, setBorderStyle] = useState('none')
  const [borderColor, setBorderColor] = useState('#000000')
  const [borderRadius, setBorderRadius] = useState('')
  const [borderUnit, setBorderUnit] = useState('px')

  const [bgColor, setBgColor] = useState('#000000')
  const [shadow, setShadow] = useState('none')

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [sizeUnit, setSizeUnit] = useState('px')

  const originalStyleRef = useRef<string | null>(null)
  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    // Only reset modification state when the element actually changes
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      originalStyleRef.current = activeElement.getAttribute('style')
      userModifiedRef.current = false
    }
    const computed = window.getComputedStyle(activeElement)

    setPadding({
      top: parseFloat(computed.paddingTop) || 0,
      right: parseFloat(computed.paddingRight) || 0,
      bottom: parseFloat(computed.paddingBottom) || 0,
      left: parseFloat(computed.paddingLeft) || 0,
    } as Record<string, string | number> as typeof padding)
    setMargin({
      top: parseFloat(computed.marginTop) || 0,
      right: parseFloat(computed.marginRight) || 0,
      bottom: parseFloat(computed.marginBottom) || 0,
      left: parseFloat(computed.marginLeft) || 0,
    } as Record<string, string | number> as typeof margin)

    setBorderWidth(String(parseFloat(computed.borderTopWidth) || 0))
    setBorderStyle(computed.borderStyle || 'none')
    setBorderColor(computed.borderColor || '#000000')
    setBorderRadius(String(parseFloat(computed.borderRadius) || 0))

    setBgColor(computed.backgroundColor || '#000000')
    setShadow(computed.boxShadow || 'none')

    setWidth(computed.width)
    setHeight(computed.height)
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

  const setPaddingValue = (side: keyof typeof padding, value: string) => {
    const next = paddingLinked
      ? { top: value, right: value, bottom: value, left: value }
      : { ...padding, [side]: value }
    setPadding(next)
    applyLiveStyle(
      'padding',
      `${next.top}${spacingUnit} ${next.right}${spacingUnit} ${next.bottom}${spacingUnit} ${next.left}${spacingUnit}`,
    )
  }

  const setMarginValue = (side: keyof typeof margin, value: string) => {
    const next = marginLinked
      ? { top: value, right: value, bottom: value, left: value }
      : { ...margin, [side]: value }
    setMargin(next)
    applyLiveStyle(
      'margin',
      `${next.top}${spacingUnit} ${next.right}${spacingUnit} ${next.bottom}${spacingUnit} ${next.left}${spacingUnit}`,
    )
  }

  const handleApply = () => {
    if (!activeElement || !userModifiedRef.current) {
      onClose()
      return
    }
    const sourceAnchor = activeElement.getAttribute('class') ?? ''
    const style = activeElement.getAttribute('style') ?? ''
    let occurrenceIndex = 0
    if (sourceAnchor) {
      const doc = activeElement.ownerDocument
      const escapeFn =
        doc.defaultView?.CSS?.escape ??
        ((s: string) => s.replace(/["\\]/g, '\\$&'))
      const peers = Array.from(
        doc.querySelectorAll(`[class="${escapeFn(sourceAnchor)}"]`),
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

  const tabs: Array<{ id: Tab; label: string; icon: typeof Layers }> = [
    { id: 'spacing', label: 'Spacing', icon: Maximize2 },
    { id: 'border', label: 'Border', icon: Square },
    { id: 'background', label: 'BG', icon: Palette },
    { id: 'size', label: 'Size', icon: Layers },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-2 border-t border-white/10 p-2 w-full min-w-[260px]">
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-label={t.label}
                  className={cn(
                    'size-7 grid place-items-center rounded transition-colors',
                    tab === t.id
                      ? 'bg-cyan-300/15 text-cyan-200'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80',
                  )}
                >
                  <t.icon className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {tab === 'spacing' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                Padding
              </span>
              <button
                type="button"
                onClick={() => setPaddingLinked(!paddingLinked)}
                className={cn(
                  'size-7 grid place-items-center rounded transition-colors',
                  paddingLinked
                    ? 'bg-cyan-300/15 text-cyan-200'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80',
                )}
                aria-label={paddingLinked ? 'Unlink padding' : 'Link padding'}
              >
                {paddingLinked ? (
                  <Link2 className="size-3.5" />
                ) : (
                  <Unlink className="size-3.5" />
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side} className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50 w-3">
                    {side[0].toUpperCase()}
                  </span>
                  <input
                    type="number"
                    value={padding[side]}
                    onChange={(e) => setPaddingValue(side, e.target.value)}
                    className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 transition-colors"
                  />
                </div>
              ))}
            </div>
            <select
              value={spacingUnit}
              onChange={(e) => setSpacingUnit(e.target.value)}
              className="h-7 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50"
            >
              <option value="px">px</option>
              <option value="rem">rem</option>
              <option value="em">em</option>
            </select>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                Margin
              </span>
              <button
                type="button"
                onClick={() => setMarginLinked(!marginLinked)}
                className={cn(
                  'size-7 grid place-items-center rounded transition-colors',
                  marginLinked
                    ? 'bg-cyan-300/15 text-cyan-200'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80',
                )}
                aria-label={marginLinked ? 'Unlink margin' : 'Link margin'}
              >
                {marginLinked ? (
                  <Link2 className="size-3.5" />
                ) : (
                  <Unlink className="size-3.5" />
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side} className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50 w-3">
                    {side[0].toUpperCase()}
                  </span>
                  <input
                    type="number"
                    value={margin[side]}
                    onChange={(e) => setMarginValue(side, e.target.value)}
                    className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'border' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Width</span>
              <input
                type="number"
                value={borderWidth}
                onChange={(e) => {
                  setBorderWidth(e.target.value)
                  applyLiveStyle(
                    'border-width',
                    `${e.target.value}${borderUnit}`,
                  )
                }}
                className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 transition-colors"
              />
              <select
                value={borderUnit}
                onChange={(e) => setBorderUnit(e.target.value)}
                className="h-7 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50"
              >
                <option value="px">px</option>
                <option value="rem">rem</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Style</span>
              <select
                value={borderStyle}
                onChange={(e) => {
                  setBorderStyle(e.target.value)
                  applyLiveStyle('border-style', e.target.value)
                }}
                className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50"
              >
                <option value="none">none</option>
                <option value="solid">solid</option>
                <option value="dashed">dashed</option>
                <option value="dotted">dotted</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Color</span>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => {
                  setBorderColor(e.target.value)
                  applyLiveStyle('border-color', e.target.value)
                }}
                className="h-7 w-9 rounded border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-xs text-white/40">{borderColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Radius</span>
              <input
                type="number"
                value={borderRadius}
                onChange={(e) => {
                  setBorderRadius(e.target.value)
                  applyLiveStyle(
                    'border-radius',
                    `${e.target.value}${borderUnit}`,
                  )
                }}
                className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 transition-colors"
              />
            </div>
          </div>
        )}

        {tab === 'background' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Color</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value)
                  applyLiveStyle('background-color', e.target.value)
                }}
                className="h-7 w-9 rounded border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-xs text-white/40">{bgColor}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                Shadow
              </span>
              <div className="flex flex-wrap gap-1">
                {Object.keys(SHADOW_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setShadow(preset)
                      applyLiveStyle('box-shadow', SHADOW_PRESETS[preset])
                    }}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] transition-colors',
                      shadow === preset
                        ? 'bg-cyan-300/15 text-cyan-200'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/80',
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'size' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Width</span>
              <input
                type="text"
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value)
                  applyLiveStyle('width', e.target.value)
                }}
                placeholder="auto"
                className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 w-14">Height</span>
              <input
                type="text"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value)
                  applyLiveStyle('height', e.target.value)
                }}
                placeholder="auto"
                className="h-7 flex-1 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20 transition-colors"
              />
            </div>
            <select
              value={sizeUnit}
              onChange={(e) => setSizeUnit(e.target.value)}
              className="h-7 rounded bg-white/5 border border-white/10 px-2 text-xs text-white outline-none focus-visible:border-cyan-300/50"
            >
              <option value="px">px</option>
              <option value="%">%</option>
              <option value="rem">rem</option>
              <option value="vw">vw</option>
              <option value="vh">vh</option>
              <option value="auto">auto</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5 border-t border-white/10 pt-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1 rounded bg-cyan-300 px-3 h-7 text-xs font-bold text-slate-950 hover:bg-cyan-200 transition-colors"
          >
            <Check className="size-3" />
            Apply
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="grid size-7 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </TooltipProvider>
  )
}
