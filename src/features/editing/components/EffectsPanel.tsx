import { useState, useEffect, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface EffectsPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
}

interface FilterState {
  blur: number
  brightness: number
  contrast: number
  saturate: number
  grayscale: number
}

interface TransformState {
  rotate: number
  scale: number
  skewX: number
  skewY: number
  translateX: number
  translateY: number
}

interface TransitionState {
  duration: number
  easing: string
  property: string
}

const DEFAULT_FILTERS: FilterState = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
}

const DEFAULT_TRANSFORM: TransformState = {
  rotate: 0,
  scale: 1,
  skewX: 0,
  skewY: 0,
  translateX: 0,
  translateY: 0,
}

const DEFAULT_TRANSITION: TransitionState = {
  duration: 0,
  easing: 'ease',
  property: 'all',
}

const EASING_PRESETS = [
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
  'cubic-bezier',
]

const TRANSITION_PROPERTIES = [
  'all',
  'opacity',
  'transform',
  'background-color',
  'color',
  'border-radius',
]

const filterString = (f: FilterState): string =>
  `blur(${f.blur}px) brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) grayscale(${f.grayscale}%)`

const transformString = (t: TransformState): string =>
  `rotate(${t.rotate}deg) scale(${t.scale}) skew(${t.skewX}deg, ${t.skewY}deg) translate(${t.translateX}px, ${t.translateY}px)`

const transitionString = (t: TransitionState): string =>
  `${t.property} ${t.duration}ms ${t.easing}`

const num = (match: RegExpMatchArray | null, fallback: number): number =>
  match && match[1] !== undefined ? parseFloat(match[1]) : fallback

const parseFilter = (raw: string): FilterState => {
  if (!raw || raw === 'none') return { ...DEFAULT_FILTERS }
  return {
    blur: num(raw.match(/blur\(([\d.]+)px\)/), DEFAULT_FILTERS.blur),
    brightness: num(
      raw.match(/brightness\(([\d.]+)%\)/),
      DEFAULT_FILTERS.brightness,
    ),
    contrast: num(raw.match(/contrast\(([\d.]+)%\)/), DEFAULT_FILTERS.contrast),
    saturate: num(raw.match(/saturate\(([\d.]+)%\)/), DEFAULT_FILTERS.saturate),
    grayscale: num(
      raw.match(/grayscale\(([\d.]+)%\)/),
      DEFAULT_FILTERS.grayscale,
    ),
  }
}

const parseTransform = (raw: string): TransformState => {
  if (!raw || raw === 'none') return { ...DEFAULT_TRANSFORM }
  const skew = raw.match(/skew\(([\d.-]+)deg,?\s*([\d.-]+)deg\)/)
  const translate = raw.match(/translate\(([\d.-]+)px,?\s*([\d.-]+)px\)/)
  return {
    rotate: num(raw.match(/rotate\(([\d.-]+)deg\)/), DEFAULT_TRANSFORM.rotate),
    scale: num(raw.match(/scale\(([\d.]+)\)/), DEFAULT_TRANSFORM.scale),
    skewX: skew ? parseFloat(skew[1]) : DEFAULT_TRANSFORM.skewX,
    skewY: skew ? parseFloat(skew[2]) : DEFAULT_TRANSFORM.skewY,
    translateX: translate
      ? parseFloat(translate[1])
      : DEFAULT_TRANSFORM.translateX,
    translateY: translate
      ? parseFloat(translate[2])
      : DEFAULT_TRANSFORM.translateY,
  }
}

const parseTransition = (raw: string): TransitionState => {
  if (!raw || raw === 'none') return { ...DEFAULT_TRANSITION }
  const durationMatch = raw.match(/([\d.]+)m?s/)
  const duration = durationMatch
    ? parseFloat(durationMatch[1])
    : DEFAULT_TRANSITION.duration
  const easing = EASING_PRESETS.find((e) => raw.includes(e)) ?? 'ease'
  const property =
    TRANSITION_PROPERTIES.find((p) =>
      raw.toLowerCase().startsWith(p.toLowerCase()),
    ) ?? 'all'
  return { duration, easing, property }
}

export function EffectsPanel({ activeElement, onModified }: EffectsPanelProps) {
  const [opacity, setOpacity] = useState(100)
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS })
  const [transform, setTransform] = useState<TransformState>({
    ...DEFAULT_TRANSFORM,
  })
  const [transition, setTransition] = useState<TransitionState>({
    ...DEFAULT_TRANSITION,
  })

  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      userModifiedRef.current = false
    }
    const computed = window.getComputedStyle(activeElement)
    setOpacity(Math.round((parseFloat(computed.opacity) || 1) * 100))
    setFilters(parseFilter(computed.filter))
    setTransform(parseTransform(computed.transform))
    setTransition(parseTransition(computed.transition))
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

  const updateOpacity = (value: number) => {
    setOpacity(value)
    applyLiveStyle('opacity', String(value / 100))
  }

  const updateFilter = (key: keyof FilterState, value: number) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    applyLiveStyle('filter', filterString(next))
  }

  const updateTransform = (key: keyof TransformState, value: number) => {
    const next = { ...transform, [key]: value }
    setTransform(next)
    applyLiveStyle('transform', transformString(next))
  }

  const updateTransition = (key: keyof TransitionState, value: string) => {
    const next = { ...transition, [key]: value }
    setTransition(next)
    applyLiveStyle('transition', transitionString(next))
  }

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS })
    applyLiveStyle('filter', 'none')
  }

  const resetTransform = () => {
    setTransform({ ...DEFAULT_TRANSFORM })
    applyLiveStyle('transform', 'none')
  }

  const resetTransition = () => {
    setTransition({ ...DEFAULT_TRANSITION })
    applyLiveStyle('transition', 'none')
  }

  const labelCls =
    'text-[10px] uppercase tracking-wider text-white/40 font-medium'
  const valueCls = 'text-[10px] text-white/60 w-12 text-right tabular-nums'
  const sliderCls = 'accent-cyan-400 h-1 w-full'
  const resetBtnCls =
    'flex items-center gap-1 text-white/40 hover:text-white/80 text-[10px] transition-colors'

  return (
    <div className="flex flex-col gap-2 p-2 w-full min-w-[420px]">
      {/* Opacity */}
      <section className="flex flex-col gap-1.5">
        <span className={labelCls}>Opacity</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            aria-label="Opacity"
            min={0}
            max={100}
            step={1}
            value={opacity}
            onChange={(e) => updateOpacity(Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{opacity}%</span>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Filters</span>
          <button
            type="button"
            aria-label="Reset filters"
            onClick={resetFilters}
            className={resetBtnCls}
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Blur</span>
          <input
            type="range"
            aria-label="Blur"
            min={0}
            max={10}
            step={0.1}
            value={filters.blur}
            onChange={(e) => updateFilter('blur', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{filters.blur}px</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Brightness</span>
          <input
            type="range"
            aria-label="Brightness"
            min={0}
            max={200}
            step={1}
            value={filters.brightness}
            onChange={(e) => updateFilter('brightness', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{filters.brightness}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Contrast</span>
          <input
            type="range"
            aria-label="Contrast"
            min={0}
            max={200}
            step={1}
            value={filters.contrast}
            onChange={(e) => updateFilter('contrast', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{filters.contrast}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Saturate</span>
          <input
            type="range"
            aria-label="Saturate"
            min={0}
            max={200}
            step={1}
            value={filters.saturate}
            onChange={(e) => updateFilter('saturate', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{filters.saturate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Grayscale</span>
          <input
            type="range"
            aria-label="Grayscale"
            min={0}
            max={100}
            step={1}
            value={filters.grayscale}
            onChange={(e) => updateFilter('grayscale', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{filters.grayscale}%</span>
        </div>
      </section>

      {/* Transform */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Transform</span>
          <button
            type="button"
            aria-label="Reset transform"
            onClick={resetTransform}
            className={resetBtnCls}
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Rotate</span>
          <input
            type="range"
            aria-label="Rotate"
            min={-180}
            max={180}
            step={1}
            value={transform.rotate}
            onChange={(e) => updateTransform('rotate', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{transform.rotate}deg</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Scale</span>
          <input
            type="range"
            aria-label="Scale"
            min={0.5}
            max={2}
            step={0.1}
            value={transform.scale}
            onChange={(e) => updateTransform('scale', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{transform.scale}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Skew X</span>
          <input
            type="range"
            aria-label="Skew X"
            min={-45}
            max={45}
            step={1}
            value={transform.skewX}
            onChange={(e) => updateTransform('skewX', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{transform.skewX}deg</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Skew Y</span>
          <input
            type="range"
            aria-label="Skew Y"
            min={-45}
            max={45}
            step={1}
            value={transform.skewY}
            onChange={(e) => updateTransform('skewY', Number(e.target.value))}
            className={sliderCls}
          />
          <span className={valueCls}>{transform.skewY}deg</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Translate X</span>
          <input
            type="number"
            aria-label="Translate X"
            min={-200}
            max={200}
            value={transform.translateX}
            onChange={(e) =>
              updateTransform('translateX', Number(e.target.value))
            }
            className="h-6 w-full rounded border border-white/10 bg-white/5 px-1.5 text-xs text-white outline-none focus-visible:border-cyan-300/50"
          />
          <span className={valueCls}>px</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Translate Y</span>
          <input
            type="number"
            aria-label="Translate Y"
            min={-200}
            max={200}
            value={transform.translateY}
            onChange={(e) =>
              updateTransform('translateY', Number(e.target.value))
            }
            className="h-6 w-full rounded border border-white/10 bg-white/5 px-1.5 text-xs text-white outline-none focus-visible:border-cyan-300/50"
          />
          <span className={valueCls}>px</span>
        </div>
      </section>

      {/* Transitions */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Transition</span>
          <button
            type="button"
            aria-label="Reset transition"
            onClick={resetTransition}
            className={resetBtnCls}
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Duration</span>
          <input
            type="range"
            aria-label="Duration"
            min={0}
            max={2000}
            step={50}
            value={transition.duration}
            onChange={(e) => updateTransition('duration', e.target.value)}
            className={sliderCls}
          />
          <span className={valueCls}>{transition.duration}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Easing</span>
          <Select
            value={transition.easing}
            onValueChange={(v) => updateTransition('easing', v)}
          >
            <SelectTrigger className="h-6 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EASING_PRESETS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(labelCls, 'w-20')}>Property</span>
          <Select
            value={transition.property}
            onValueChange={(v) => updateTransition('property', v)}
          >
            <SelectTrigger className="h-6 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSITION_PROPERTIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  )
}
