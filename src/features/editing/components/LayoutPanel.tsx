import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react'
import { cn } from '#/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface LayoutPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
}

const FLEX_DIRECTION_OPTIONS = [
  { value: 'row', label: 'Row', icon: ArrowRight },
  { value: 'column', label: 'Column', icon: ArrowDown },
  { value: 'row-reverse', label: 'Row Reverse', icon: ArrowLeft },
  { value: 'column-reverse', label: 'Column Reverse', icon: ArrowUp },
] as const

const JUSTIFY_CONTENT_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Between' },
  { value: 'space-around', label: 'Around' },
  { value: 'space-evenly', label: 'Evenly' },
] as const

const ALIGN_ITEMS_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
] as const

const POSITION_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'sticky', label: 'Sticky' },
  { value: 'fixed', label: 'Fixed' },
] as const

const OFFSET_SIDES = [
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
] as const

export function LayoutPanel({ activeElement, onModified }: LayoutPanelProps) {
  const [display, setDisplay] = useState('block')
  const [flexDirection, setFlexDirection] = useState('row')
  const [justifyContent, setJustifyContent] = useState('flex-start')
  const [alignItems, setAlignItems] = useState('stretch')
  const [gap, setGap] = useState('0')
  const [gapUnit, setGapUnit] = useState('px')
  const [flexWrap, setFlexWrap] = useState('nowrap')
  const [position, setPosition] = useState('static')
  const [offsets, setOffsets] = useState({
    top: '',
    right: '',
    bottom: '',
    left: '',
  })
  const [zIndex, setZIndex] = useState('')

  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      userModifiedRef.current = false
    }
    const computed = window.getComputedStyle(activeElement)

    setDisplay(computed.display === 'flex' ? 'flex' : 'block')
    setFlexDirection(computed.flexDirection || 'row')
    setJustifyContent(computed.justifyContent || 'flex-start')
    setAlignItems(computed.alignItems || 'stretch')
    setFlexWrap(computed.flexWrap || 'nowrap')

    const computedGap = computed.gap || '0px'
    setGapUnit(
      computedGap.endsWith('rem')
        ? 'rem'
        : computedGap.endsWith('em')
          ? 'em'
          : 'px',
    )
    setGap(String(parseFloat(computedGap) || 0))

    setPosition(computed.position || 'static')
    const inline = activeElement.style
    const readOffset = (v: unknown) =>
      v && v !== 'auto' ? String(parseFloat(String(v)) || 0) : ''
    setOffsets({
      top: readOffset(inline.top),
      right: readOffset(inline.right),
      bottom: readOffset(inline.bottom),
      left: readOffset(inline.left),
    })
    setZIndex(inline.zIndex && inline.zIndex !== 'auto' ? inline.zIndex : '')
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

  const removeLiveStyle = (prop: string) => {
    if (activeElement) {
      activeElement.style.removeProperty(prop)
      markModified()
    }
  }

  const applyOffset = (side: string, value: string) => {
    setOffsets((prev) => ({ ...prev, [side]: value }))
    if (value === '') removeLiveStyle(side)
    else applyLiveStyle(side, `${value}px`)
  }

  const applyZIndex = (value: string) => {
    setZIndex(value)
    if (value === '') removeLiveStyle('z-index')
    else applyLiveStyle('z-index', value)
  }

  const onPositionChange = (v: string) => {
    setPosition(v)
    if (v === 'static') removeLiveStyle('position')
    else applyLiveStyle('position', v)
    // Sticky/fixed need an anchor offset to actually stick — seed top:0 if none set.
    const hasOffset =
      offsets.top || offsets.right || offsets.bottom || offsets.left
    if ((v === 'sticky' || v === 'fixed') && !hasOffset) {
      applyOffset('top', '0')
    }
  }

  const labelCls =
    'text-[10px] uppercase tracking-wider text-muted-foreground font-medium'
  const isFlex = display === 'flex'
  const isPositioned = position !== 'static'

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 p-2">
      {/* Display mode */}
      <div className="flex items-center gap-2">
        <span className={cn(labelCls, 'w-12 shrink-0')}>Display</span>
        <ToggleGroup
          type="single"
          aria-label="Display"
          value={display}
          onValueChange={(v) => {
            if (!v) return
            setDisplay(v)
            applyLiveStyle('display', v)
          }}
          variant="outline"
          size="sm"
          className="rounded-md border border-border"
        >
          <ToggleGroupItem
            value="block"
            className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
          >
            Block
          </ToggleGroupItem>
          <ToggleGroupItem
            value="flex"
            className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
          >
            Flex
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Position */}
      <div className="flex items-center gap-2">
        <span className={cn(labelCls, 'w-12 shrink-0')}>Position</span>
        <Select value={position} onValueChange={onPositionChange}>
          <SelectTrigger
            aria-label="Position"
            className="h-7 flex-1 text-xs text-foreground"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPositioned && (
        <>
          {/* Offsets */}
          <div className="grid grid-cols-2 gap-2">
            {OFFSET_SIDES.map((side) => (
              <div key={side.value} className="flex items-center gap-2">
                <span className={cn(labelCls, 'w-10 shrink-0')}>
                  {side.label}
                </span>
                <InputGroup>
                  <InputGroupInput
                    aria-label={side.label}
                    type="number"
                    placeholder="auto"
                    value={offsets[side.value]}
                    onChange={(e) => applyOffset(side.value, e.target.value)}
                    className="text-xs text-foreground"
                  />
                  <InputGroupAddon align="inline-end">
                    <span className="px-1 text-xs text-muted-foreground">
                      px
                    </span>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            ))}
          </div>

          {/* Z-Index */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Z-Index</span>
            <InputGroup>
              <InputGroupInput
                aria-label="Z-Index"
                type="number"
                placeholder="auto"
                value={zIndex}
                onChange={(e) => applyZIndex(e.target.value)}
                className="text-xs text-foreground"
              />
            </InputGroup>
          </div>
        </>
      )}

      {isFlex && (
        <>
          {/* Flex Direction */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Direction</span>
            <ToggleGroup
              type="single"
              aria-label="Direction"
              value={flexDirection}
              onValueChange={(v) => {
                if (!v) return
                setFlexDirection(v)
                applyLiveStyle('flex-direction', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-border"
            >
              {FLEX_DIRECTION_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  aria-label={opt.label}
                  className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
                >
                  <opt.icon className="size-3" />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Justify Content */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Justify</span>
            <ToggleGroup
              type="single"
              aria-label="Justify"
              value={justifyContent}
              onValueChange={(v) => {
                if (!v) return
                setJustifyContent(v)
                applyLiveStyle('justify-content', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-border"
            >
              {JUSTIFY_CONTENT_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Align Items */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Align</span>
            <ToggleGroup
              type="single"
              aria-label="Align"
              value={alignItems}
              onValueChange={(v) => {
                if (!v) return
                setAlignItems(v)
                applyLiveStyle('align-items', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-border"
            >
              {ALIGN_ITEMS_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Gap */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Gap</span>
            <InputGroup>
              <InputGroupInput
                aria-label="Gap"
                type="number"
                value={gap}
                onChange={(e) => {
                  setGap(e.target.value)
                  applyLiveStyle('gap', `${e.target.value}${gapUnit}`)
                }}
                className="text-xs text-foreground"
              />
              <InputGroupAddon align="inline-end">
                <Select
                  value={gapUnit}
                  onValueChange={(unit) => {
                    setGapUnit(unit)
                    applyLiveStyle('gap', `${gap}${unit}`)
                  }}
                >
                  <SelectTrigger
                    aria-label="Gap unit"
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

          {/* Flex Wrap */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Wrap</span>
            <ToggleGroup
              type="single"
              aria-label="Wrap"
              value={flexWrap}
              onValueChange={(v) => {
                if (!v) return
                setFlexWrap(v)
                applyLiveStyle('flex-wrap', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-border"
            >
              <ToggleGroupItem
                value="nowrap"
                className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
              >
                No Wrap
              </ToggleGroupItem>
              <ToggleGroupItem
                value="wrap"
                className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
              >
                Wrap
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </>
      )}
    </div>
  )
}
