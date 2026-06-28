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

export function LayoutPanel({ activeElement, onModified }: LayoutPanelProps) {
  const [display, setDisplay] = useState('block')
  const [flexDirection, setFlexDirection] = useState('row')
  const [justifyContent, setJustifyContent] = useState('flex-start')
  const [alignItems, setAlignItems] = useState('stretch')
  const [gap, setGap] = useState('0')
  const [gapUnit, setGapUnit] = useState('px')
  const [flexWrap, setFlexWrap] = useState('nowrap')

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

  const labelCls =
    'text-[10px] uppercase tracking-wider text-white/40 font-medium'
  const isFlex = display === 'flex'

  return (
    <div className="flex flex-col gap-2 p-2 w-full min-w-[420px]">
      {/* Display mode */}
      <div className="flex items-center gap-2">
        <span className={cn(labelCls, 'w-12 shrink-0')}>Display</span>
        <ToggleGroup
          type="single"
          value={display}
          onValueChange={(v) => {
            if (!v) return
            setDisplay(v)
            applyLiveStyle('display', v)
          }}
          variant="outline"
          size="sm"
          className="rounded-md border border-white/10"
        >
          <ToggleGroupItem
            value="block"
            className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
          >
            Block
          </ToggleGroupItem>
          <ToggleGroupItem
            value="flex"
            className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
          >
            Flex
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isFlex && (
        <>
          {/* Flex Direction */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Direction</span>
            <ToggleGroup
              type="single"
              value={flexDirection}
              onValueChange={(v) => {
                if (!v) return
                setFlexDirection(v)
                applyLiveStyle('flex-direction', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-white/10"
            >
              {FLEX_DIRECTION_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  aria-label={opt.label}
                  className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
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
              value={justifyContent}
              onValueChange={(v) => {
                if (!v) return
                setJustifyContent(v)
                applyLiveStyle('justify-content', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-white/10"
            >
              {JUSTIFY_CONTENT_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
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
              value={alignItems}
              onValueChange={(v) => {
                if (!v) return
                setAlignItems(v)
                applyLiveStyle('align-items', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-white/10"
            >
              {ALIGN_ITEMS_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
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
                type="number"
                value={gap}
                onChange={(e) => {
                  setGap(e.target.value)
                  applyLiveStyle('gap', `${e.target.value}${gapUnit}`)
                }}
                className="text-xs text-white"
              />
              <InputGroupAddon align="inline-end">
                <Select value={gapUnit} onValueChange={setGapUnit}>
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

          {/* Flex Wrap */}
          <div className="flex items-center gap-2">
            <span className={cn(labelCls, 'w-12 shrink-0')}>Wrap</span>
            <ToggleGroup
              type="single"
              value={flexWrap}
              onValueChange={(v) => {
                if (!v) return
                setFlexWrap(v)
                applyLiveStyle('flex-wrap', v)
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-white/10"
            >
              <ToggleGroupItem
                value="nowrap"
                className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
              >
                No Wrap
              </ToggleGroupItem>
              <ToggleGroupItem
                value="wrap"
                className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
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
