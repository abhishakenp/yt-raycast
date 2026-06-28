import { useState, useEffect, useRef } from 'react'
import { Square, Palette, Maximize2, Layers, Link2, Unlink } from 'lucide-react'
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
  InputGroupText,
} from '#/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'

interface StyleControlsPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
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
  onModified,
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
  const [paddingUnit, setPaddingUnit] = useState('px')
  const [marginUnit, setMarginUnit] = useState('px')

  const [borderWidth, setBorderWidth] = useState('')
  const [borderStyle, setBorderStyle] = useState('none')
  const [borderColor, setBorderColor] = useState('#000000')
  const [borderRadius, setBorderRadius] = useState('')
  const [borderUnit, setBorderUnit] = useState('px')

  const [bgColor, setBgColor] = useState('#000000')
  const [shadowPreset, setShadowPreset] = useState('none')

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [sizeUnit, setSizeUnit] = useState('px')

  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    // Only reset modification state when the element actually changes
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
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

    // Detect units from computed values (default to px)
    const padTop = computed.paddingTop || '0px'
    setPaddingUnit(
      padTop.endsWith('rem') ? 'rem' : padTop.endsWith('em') ? 'em' : 'px',
    )
    const marTop = computed.marginTop || '0px'
    setMarginUnit(
      marTop.endsWith('rem') ? 'rem' : marTop.endsWith('em') ? 'em' : 'px',
    )

    setBorderWidth(String(parseFloat(computed.borderTopWidth) || 0))
    setBorderStyle(computed.borderStyle || 'none')
    setBorderColor(computed.borderColor || '#000000')
    setBorderRadius(String(parseFloat(computed.borderRadius) || 0))

    setBgColor(computed.backgroundColor || '#000000')
    // Detect which shadow preset matches the computed box-shadow
    const computedShadow = computed.boxShadow || 'none'
    const matchedPreset =
      Object.entries(SHADOW_PRESETS).find(
        ([, val]) => val === computedShadow,
      )?.[0] ?? 'none'
    setShadowPreset(matchedPreset)

    setWidth(computed.width)
    setHeight(computed.height)
  }, [activeElement])

  const markModified = () => {
    userModifiedRef.current = true
    onModified?.()
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
      `${next.top}${paddingUnit} ${next.right}${paddingUnit} ${next.bottom}${paddingUnit} ${next.left}${paddingUnit}`,
    )
  }

  const setMarginValue = (side: keyof typeof margin, value: string) => {
    const next = marginLinked
      ? { top: value, right: value, bottom: value, left: value }
      : { ...margin, [side]: value }
    setMargin(next)
    applyLiveStyle(
      'margin',
      `${next.top}${marginUnit} ${next.right}${marginUnit} ${next.bottom}${marginUnit} ${next.left}${marginUnit}`,
    )
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof Layers }> = [
    { id: 'spacing', label: 'Spacing', icon: Maximize2 },
    { id: 'border', label: 'Border', icon: Square },
    { id: 'background', label: 'BG', icon: Palette },
    { id: 'size', label: 'Size', icon: Layers },
  ]

  const labelCls =
    'text-[10px] uppercase tracking-wider text-white/40 font-medium'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-2 p-2 w-full min-w-[420px]">
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
            <div className="grid grid-cols-2 gap-3">
              {/* Padding column */}
              <div className="flex flex-col gap-1.5">
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
                    aria-label={
                      paddingLinked ? 'Unlink padding' : 'Link padding'
                    }
                  >
                    {paddingLinked ? (
                      <Link2 className="size-3.5" />
                    ) : (
                      <Unlink className="size-3.5" />
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <InputGroup key={side}>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>{side[0].toUpperCase()}</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        value={padding[side]}
                        onChange={(e) => setPaddingValue(side, e.target.value)}
                        className="text-xs text-white"
                      />
                      <InputGroupAddon align="inline-end">
                        <Select
                          value={paddingUnit}
                          onValueChange={setPaddingUnit}
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="em">em</SelectItem>
                          </SelectContent>
                        </Select>
                      </InputGroupAddon>
                    </InputGroup>
                  ))}
                </div>
              </div>
              {/* Margin column */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
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
                <div className="grid grid-cols-2 gap-1">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <InputGroup key={side}>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>{side[0].toUpperCase()}</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        value={margin[side]}
                        onChange={(e) => setMarginValue(side, e.target.value)}
                        className="text-xs text-white"
                      />
                      <InputGroupAddon align="inline-end">
                        <Select
                          value={marginUnit}
                          onValueChange={setMarginUnit}
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="em">em</SelectItem>
                          </SelectContent>
                        </Select>
                      </InputGroupAddon>
                    </InputGroup>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'border' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-12')}>W</span>
              <InputGroup>
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
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60">
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
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-12')}>Style</span>
              <InputGroup>
                <Select
                  value={borderStyle}
                  onValueChange={(v) => {
                    setBorderStyle(v)
                    applyLiveStyle('border-style', v)
                  }}
                >
                  <SelectTrigger className="h-auto w-full border-0 bg-transparent px-1 text-xs text-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">none</SelectItem>
                    <SelectItem value="solid">solid</SelectItem>
                    <SelectItem value="dashed">dashed</SelectItem>
                    <SelectItem value="dotted">dotted</SelectItem>
                  </SelectContent>
                </Select>
              </InputGroup>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-12')}>Color</span>
              <div className="flex items-center gap-1.5 flex-1">
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => {
                      setBorderColor(e.target.value)
                      applyLiveStyle('border-color', e.target.value)
                    }}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                  <div
                    className="size-7 rounded-md border border-input shadow-xs"
                    style={{ backgroundColor: borderColor }}
                  />
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {borderColor}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-12')}>R</span>
              <InputGroup>
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
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60">
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-10')}>Color</span>
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value)
                    applyLiveStyle('background-color', e.target.value)
                  }}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <div
                  className="size-7 rounded-md border border-input shadow-xs"
                  style={{ backgroundColor: bgColor }}
                />
              </label>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className={labelCls}>Shadow</span>
              <ToggleGroup
                type="single"
                value={shadowPreset}
                onValueChange={(v) => {
                  if (!v) return
                  setShadowPreset(v)
                  applyLiveStyle('box-shadow', SHADOW_PRESETS[v])
                }}
                variant="outline"
                size="sm"
                className="rounded-md border border-white/10"
              >
                {Object.keys(SHADOW_PRESETS).map((preset) => (
                  <ToggleGroupItem
                    key={preset}
                    value={preset}
                    className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
                  >
                    {preset}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        )}

        {tab === 'size' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-10')}>W</span>
              <InputGroup>
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
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60">
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
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-10')}>H</span>
              <InputGroup>
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
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60">
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
      </div>
    </TooltipProvider>
  )
}
