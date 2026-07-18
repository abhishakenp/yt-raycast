import { useState, useEffect, useRef } from 'react'
import {
  Square,
  Palette,
  Maximize2,
  Layers,
  Link2,
  Unlink,
  Sparkles,
  Columns3,
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
  InputGroupText,
} from '#/components/ui/input-group'
import { BackgroundPanel } from './BackgroundPanel'
import { EffectsPanel } from './EffectsPanel'
import { LayoutPanel } from './LayoutPanel'

interface StyleControlsPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
  onImageElementPreview?: (newSrc: string | null) => void
  sessionId?: string
}

type Tab = 'spacing' | 'border' | 'background' | 'size' | 'effects' | 'layout'

function formatDimensionValue(value: string, unit: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (unit === 'auto') return 'auto'
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return `${trimmed}${unit}`
  const unitMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)(?:px|%|rem|em|vw|vh)$/i)
  if (unitMatch) return `${unitMatch[1]}${unit}`
  return trimmed
}

function detectDimensionUnit(value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (trimmed === 'auto') return 'auto'
  const match = trimmed.match(/(?:px|%|rem|em|vw|vh)$/i)
  return match?.[0] ?? 'px'
}

function detectLengthUnit(value: string | undefined): string {
  const match = value?.trim().match(/(?:px|rem|em)$/i)
  return match?.[0] ?? 'px'
}

export function StyleControlsPanel({
  activeElement,
  onModified,
  onImageElementPreview,
  sessionId,
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
  const [borderWidthUnit, setBorderWidthUnit] = useState('px')
  const [borderRadiusUnit, setBorderRadiusUnit] = useState('px')

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [widthUnit, setWidthUnit] = useState('px')
  const [heightUnit, setHeightUnit] = useState('px')

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
    setBorderWidthUnit(detectLengthUnit(computed.borderTopWidth))
    setBorderRadiusUnit(detectLengthUnit(computed.borderRadius))

    setWidth(computed.width ?? '')
    setHeight(computed.height ?? '')
    setWidthUnit(detectDimensionUnit(computed.width))
    setHeightUnit(detectDimensionUnit(computed.height))
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

  const setPaddingValue = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const next = paddingLinked
      ? { top: value, right: value, bottom: value, left: value }
      : { ...padding, [side]: value }
    setPadding(next)
    applyLiveStyle(
      'padding',
      `${next.top}${paddingUnit} ${next.right}${paddingUnit} ${next.bottom}${paddingUnit} ${next.left}${paddingUnit}`,
    )
  }

  const setPaddingUnitValue = (unit: string) => {
    setPaddingUnit(unit)
    applyLiveStyle(
      'padding',
      `${padding.top}${unit} ${padding.right}${unit} ${padding.bottom}${unit} ${padding.left}${unit}`,
    )
  }

  const setMarginValue = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const next = marginLinked
      ? { top: value, right: value, bottom: value, left: value }
      : { ...margin, [side]: value }
    setMargin(next)
    applyLiveStyle(
      'margin',
      `${next.top}${marginUnit} ${next.right}${marginUnit} ${next.bottom}${marginUnit} ${next.left}${marginUnit}`,
    )
  }

  const setMarginUnitValue = (unit: string) => {
    setMarginUnit(unit)
    applyLiveStyle(
      'margin',
      `${margin.top}${unit} ${margin.right}${unit} ${margin.bottom}${unit} ${margin.left}${unit}`,
    )
  }

  const setBorderWidthUnitValue = (unit: string) => {
    setBorderWidthUnit(unit)
    applyLiveStyle('border-width', `${borderWidth}${unit}`)
  }

  const setBorderRadiusUnitValue = (unit: string) => {
    setBorderRadiusUnit(unit)
    applyLiveStyle('border-radius', `${borderRadius}${unit}`)
  }

  const setWidthUnitValue = (unit: string) => {
    setWidthUnit(unit)
    applyLiveStyle('width', formatDimensionValue(width, unit))
  }

  const setHeightUnitValue = (unit: string) => {
    setHeightUnit(unit)
    applyLiveStyle('height', formatDimensionValue(height, unit))
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof Layers }> = [
    { id: 'spacing', label: 'Spacing', icon: Maximize2 },
    { id: 'border', label: 'Border', icon: Square },
    { id: 'background', label: 'BG', icon: Palette },
    { id: 'size', label: 'Size', icon: Layers },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'layout', label: 'Layout', icon: Columns3 },
  ]

  const labelCls =
    'text-[10px] uppercase tracking-wider text-muted-foreground font-medium'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex w-full min-w-0 max-w-full flex-col gap-2 p-2">
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-label={t.label}
                  aria-pressed={tab === t.id}
                  className={cn(
                    'size-7 grid place-items-center rounded transition-colors',
                    tab === t.id
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground/70 hover:bg-muted hover:text-foreground',
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
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    aria-label={
                      paddingLinked ? 'Unlink padding' : 'Link padding'
                    }
                    aria-pressed={paddingLinked}
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
                        aria-label={`Padding ${side}`}
                        type="number"
                        value={padding[side]}
                        onChange={(e) => setPaddingValue(side, e.target.value)}
                        className="text-xs text-foreground"
                      />
                      <InputGroupAddon align="inline-end">
                        <Select
                          value={paddingUnit}
                          onValueChange={setPaddingUnitValue}
                        >
                          <SelectTrigger
                            aria-label={`Padding ${side} unit`}
                            className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-muted-foreground"
                          >
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
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    aria-label={marginLinked ? 'Unlink margin' : 'Link margin'}
                    aria-pressed={marginLinked}
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
                        aria-label={`Margin ${side}`}
                        type="number"
                        value={margin[side]}
                        onChange={(e) => setMarginValue(side, e.target.value)}
                        className="text-xs text-foreground"
                      />
                      <InputGroupAddon align="inline-end">
                        <Select
                          value={marginUnit}
                          onValueChange={setMarginUnitValue}
                        >
                          <SelectTrigger
                            aria-label={`Margin ${side} unit`}
                            className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-muted-foreground"
                          >
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
                  aria-label="Border width"
                  type="number"
                  value={borderWidth}
                  onChange={(e) => {
                    setBorderWidth(e.target.value)
                    applyLiveStyle(
                      'border-width',
                      `${e.target.value}${borderWidthUnit}`,
                    )
                  }}
                  className="text-xs text-foreground"
                />
                <InputGroupAddon align="inline-end">
                  <Select
                    value={borderWidthUnit}
                    onValueChange={setBorderWidthUnitValue}
                  >
                    <SelectTrigger
                      aria-label="Border width unit"
                      className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-muted-foreground"
                    >
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
                  <SelectTrigger
                    aria-label="Border style"
                    className="h-auto w-full border-0 bg-transparent px-1 text-xs text-muted-foreground"
                  >
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
                    aria-label="Border color"
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
                  aria-label="Border radius"
                  type="number"
                  value={borderRadius}
                  onChange={(e) => {
                    setBorderRadius(e.target.value)
                    applyLiveStyle(
                      'border-radius',
                      `${e.target.value}${borderRadiusUnit}`,
                    )
                  }}
                  className="text-xs text-foreground"
                />
                <InputGroupAddon align="inline-end">
                  <Select
                    value={borderRadiusUnit}
                    onValueChange={setBorderRadiusUnitValue}
                  >
                    <SelectTrigger
                      aria-label="Border radius unit"
                      className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-muted-foreground"
                    >
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
          <BackgroundPanel
            activeElement={activeElement}
            onModified={onModified}
            onImageElementPreview={onImageElementPreview}
            sessionId={sessionId}
          />
        )}

        {tab === 'effects' && (
          <EffectsPanel activeElement={activeElement} onModified={onModified} />
        )}

        {tab === 'layout' && (
          <LayoutPanel activeElement={activeElement} onModified={onModified} />
        )}

        {tab === 'size' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className={cn(labelCls, 'w-10')}>W</span>
              <InputGroup>
                <InputGroupInput
                  aria-label="Width"
                  type="text"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value)
                    applyLiveStyle(
                      'width',
                      formatDimensionValue(e.target.value, widthUnit),
                    )
                  }}
                  placeholder="auto"
                  className="text-xs text-foreground"
                />
                <InputGroupAddon align="inline-end">
                  <Select value={widthUnit} onValueChange={setWidthUnitValue}>
                    <SelectTrigger
                      aria-label="Width unit"
                      className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-muted-foreground"
                    >
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
                  aria-label="Height"
                  type="text"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value)
                    applyLiveStyle(
                      'height',
                      formatDimensionValue(e.target.value, heightUnit),
                    )
                  }}
                  placeholder="auto"
                  className="text-xs text-foreground"
                />
                <InputGroupAddon align="inline-end">
                  <Select value={heightUnit} onValueChange={setHeightUnitValue}>
                    <SelectTrigger
                      aria-label="Height unit"
                      className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-muted-foreground"
                    >
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
