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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'

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

  const labelCls =
    'text-[10px] uppercase tracking-wider text-white/40 font-medium'
  const inputCls =
    'h-7 w-full rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20'
  const groupCls =
    'h-7 flex-1 rounded border border-white/10 bg-white/5 focus-within:border-cyan-300/50'
  const addonSelectCls =
    'h-auto w-auto border-0 bg-transparent px-0 text-xs text-white/60'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-2 p-2 w-full min-w-[280px]">
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
              <span className={labelCls}>Padding</span>
              <button
                type="button"
                onClick={() => setPaddingLinked(!paddingLinked)}
                className={cn(
                  'size-6 grid place-items-center rounded transition-colors',
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
                <div key={side} className="relative">
                  <span className="absolute left-1 top-0.5 text-[9px] text-white/30">
                    {side[0].toUpperCase()}
                  </span>
                  <input
                    type="number"
                    value={padding[side]}
                    onChange={(e) => setPaddingValue(side, e.target.value)}
                    className="h-7 w-full rounded border border-white/10 bg-white/5 pl-5 pr-1 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
                  />
                </div>
              ))}
            </div>
            <Select value={spacingUnit} onValueChange={setSpacingUnit}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="rem">rem</SelectItem>
                <SelectItem value="em">em</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between pt-1">
              <span className={labelCls}>Margin</span>
              <button
                type="button"
                onClick={() => setMarginLinked(!marginLinked)}
                className={cn(
                  'size-6 grid place-items-center rounded transition-colors',
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
                <div key={side} className="relative">
                  <span className="absolute left-1 top-0.5 text-[9px] text-white/30">
                    {side[0].toUpperCase()}
                  </span>
                  <input
                    type="number"
                    value={margin[side]}
                    onChange={(e) => setMarginValue(side, e.target.value)}
                    className="h-7 w-full rounded border border-white/10 bg-white/5 pl-5 pr-1 text-xs text-white outline-none transition-colors focus-visible:border-cyan-300/50 focus-visible:ring-1 focus-visible:ring-cyan-300/20"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'border' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14 shrink-0')}>Width</span>
              <InputGroup className={groupCls}>
                <InputGroupInput
                  type="number"
                  value={borderWidth}
                  onChange={(e) => {
                    setBorderWidth(e.target.value)
                    applyLiveStyle(
                      'border-width',
                      `${e.target.value}${borderUnit}`,
                    )
                  }}
                  className="text-xs text-white"
                />
                <InputGroupAddon align="inline-end">
                  <Select value={borderUnit} onValueChange={setBorderUnit}>
                    <SelectTrigger className={addonSelectCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                    </SelectContent>
                  </Select>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14 shrink-0')}>Style</span>
              <Select
                value={borderStyle}
                onValueChange={(v) => {
                  setBorderStyle(v)
                  applyLiveStyle('border-style', v)
                }}
              >
                <SelectTrigger className={cn(inputCls, 'flex-1')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">none</SelectItem>
                  <SelectItem value="solid">solid</SelectItem>
                  <SelectItem value="dashed">dashed</SelectItem>
                  <SelectItem value="dotted">dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14 shrink-0')}>Color</span>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => {
                  setBorderColor(e.target.value)
                  applyLiveStyle('border-color', e.target.value)
                }}
                className="h-7 w-9 rounded border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-[10px] text-white/40">{borderColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14 shrink-0')}>Radius</span>
              <InputGroup className={groupCls}>
                <InputGroupInput
                  type="number"
                  value={borderRadius}
                  onChange={(e) => {
                    setBorderRadius(e.target.value)
                    applyLiveStyle(
                      'border-radius',
                      `${e.target.value}${borderUnit}`,
                    )
                  }}
                  className="text-xs text-white"
                />
                <InputGroupAddon align="inline-end">
                  <Select value={borderUnit} onValueChange={setBorderUnit}>
                    <SelectTrigger className={addonSelectCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                    </SelectContent>
                  </Select>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        )}

        {tab === 'background' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14 shrink-0')}>Color</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value)
                  applyLiveStyle('background-color', e.target.value)
                }}
                className="h-7 w-9 rounded border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-[10px] text-white/40">{bgColor}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Shadow</span>
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
              <span className={cn(labelCls, 'w-14 shrink-0')}>Width</span>
              <InputGroup className={groupCls}>
                <InputGroupInput
                  type="text"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value)
                    applyLiveStyle('width', e.target.value)
                  }}
                  placeholder="auto"
                  className="text-xs text-white"
                />
                <InputGroupAddon align="inline-end">
                  <Select value={sizeUnit} onValueChange={setSizeUnit}>
                    <SelectTrigger className={addonSelectCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                      <SelectItem value="vw">vw</SelectItem>
                      <SelectItem value="vh">vh</SelectItem>
                      <SelectItem value="auto">auto</SelectItem>
                    </SelectContent>
                  </Select>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14 shrink-0')}>Height</span>
              <InputGroup className={groupCls}>
                <InputGroupInput
                  type="text"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value)
                    applyLiveStyle('height', e.target.value)
                  }}
                  placeholder="auto"
                  className="text-xs text-white"
                />
                <InputGroupAddon align="inline-end">
                  <Select value={sizeUnit} onValueChange={setSizeUnit}>
                    <SelectTrigger className={addonSelectCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                      <SelectItem value="vw">vw</SelectItem>
                      <SelectItem value="vh">vh</SelectItem>
                      <SelectItem value="auto">auto</SelectItem>
                    </SelectContent>
                  </Select>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={handleApply}
            className="flex h-7 items-center gap-1 rounded bg-cyan-300 px-3 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-200"
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
    </TooltipProvider>
  )
}
