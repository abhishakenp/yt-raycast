import { useState, useEffect, useRef } from 'react'
import { Search, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '#/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { searchStockImages, type StockImageResult } from '@/lib/stock-image'
import {
  generateContextAwareQuery,
  type ImageContext,
} from '@/lib/image-context'

interface BackgroundPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
}

type BgMode = 'solid' | 'gradient'
type GradientType = 'linear' | 'radial'

interface GradientState {
  type: GradientType
  color1: string
  color2: string
  pos1: number
  pos2: number
  angle: number
}

interface Preset {
  name: string
  gradient: string
}

const BG_PRESETS: Preset[] = [
  {
    name: 'Sunset',
    gradient: 'linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)',
  },
  {
    name: 'Ocean',
    gradient: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
  },
  {
    name: 'Forest',
    gradient: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    name: 'Purple Haze',
    gradient: 'linear-gradient(90deg, #8e2de2 0%, #4a00e0 100%)',
  },
  {
    name: 'Fire',
    gradient: 'linear-gradient(90deg, #f12711 0%, #f5af19 100%)',
  },
  {
    name: 'Midnight',
    gradient: 'linear-gradient(90deg, #0f2027 0%, #000000 100%)',
  },
  {
    name: 'Aurora',
    gradient: 'linear-gradient(90deg, #00f260 0%, #0575e6 50%, #8e2de2 100%)',
  },
  {
    name: 'Peach',
    gradient: 'linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)',
  },
]

const buildGradient = (g: GradientState): string => {
  if (g.type === 'linear') {
    return `linear-gradient(${g.angle}deg, ${g.color1} ${g.pos1}%, ${g.color2} ${g.pos2}%)`
  }
  return `radial-gradient(circle, ${g.color1} ${g.pos1}%, ${g.color2} ${g.pos2}%)`
}

const DEFAULT_GRADIENT: GradientState = {
  type: 'linear',
  color1: '#8e2de2',
  color2: '#4a00e0',
  pos1: 0,
  pos2: 100,
  angle: 90,
}

export function BackgroundPanel({
  activeElement,
  onModified,
}: BackgroundPanelProps) {
  const [bgMode, setBgMode] = useState<BgMode>('solid')
  const [bgColor, setBgColor] = useState('#000000')
  const [gradient, setGradient] = useState<GradientState>(DEFAULT_GRADIENT)
  const [backdropBlur, setBackdropBlur] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockImageResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasBgImage, setHasBgImage] = useState(false)

  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activeElement) return
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      userModifiedRef.current = false
    }
    const computed = window.getComputedStyle(activeElement)
    setBgColor(computed.backgroundColor || '#000000')

    const backgroundImage = computed.backgroundImage || ''
    if (backgroundImage && backgroundImage !== 'none') {
      setHasBgImage(true)
      const gradMatch = backgroundImage.match(
        /(linear|radial)-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/,
      )
      if (gradMatch) {
        const [, type, body] = gradMatch
        setBgMode('gradient')
        const parsed = parseGradientBody(type as GradientType, body)
        if (parsed) setGradient(parsed)
      }
    } else {
      setHasBgImage(false)
    }

    const backdrop =
      computed.backdropFilter || computed.webkitBackdropFilter || ''
    const blurMatch = backdrop.match(/blur\((\d+(?:\.\d+)?)px\)/)
    setBackdropBlur(blurMatch ? Math.round(parseFloat(blurMatch[1])) : 0)
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

  const applySolidColor = (color: string) => {
    setBgColor(color)
    setBgMode('solid')
    // Clear any gradient/image so the solid color shows
    if (activeElement) {
      activeElement.style.setProperty('background-image', '')
      activeElement.style.setProperty('background-color', color)
      markModified()
    }
  }

  const applyGradientValue = (next: GradientState) => {
    setGradient(next)
    setBgMode('gradient')
    setHasBgImage(false)
    applyLiveStyle('background-image', buildGradient(next))
  }

  const updateGradient = (patch: Partial<GradientState>) => {
    const next = { ...gradient, ...patch }
    applyGradientValue(next)
  }

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) return
    setSearching(true)
    try {
      const results = await searchStockImages({
        query,
        w: 400,
        h: 300,
        perPage: 12,
      })
      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }

  const handleInitialSearch = async () => {
    if (!activeElement) return
    const context: ImageContext = {
      section: activeElement.getAttribute('data-section') || undefined,
    }
    const query = generateContextAwareQuery(
      activeElement.getAttribute('data-alt') || 'background',
      context,
    )
    setSearchQuery(query)
    setSearching(true)
    try {
      const results = await searchStockImages({
        query,
        w: 400,
        h: 300,
        perPage: 12,
      })
      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }

  const applyBgImage = (url: string) => {
    if (!activeElement) return
    setHasBgImage(true)
    setBgMode('solid')
    activeElement.style.setProperty('background-image', `url("${url}")`)
    activeElement.style.setProperty('background-size', 'cover')
    activeElement.style.setProperty('background-position', 'center')
    markModified()
  }

  const removeBgImage = () => {
    if (!activeElement) return
    setHasBgImage(false)
    setSearchResults([])
    activeElement.style.setProperty('background-image', '')
    activeElement.style.setProperty('background-size', '')
    activeElement.style.setProperty('background-position', '')
    markModified()
  }

  const applyBackdropBlur = (value: number) => {
    setBackdropBlur(value)
    if (activeElement) {
      if (value > 0) {
        activeElement.style.setProperty('backdrop-filter', `blur(${value}px)`)
        activeElement.style.setProperty(
          '-webkit-backdrop-filter',
          `blur(${value}px)`,
        )
      } else {
        activeElement.style.setProperty('backdrop-filter', '')
        activeElement.style.setProperty('-webkit-backdrop-filter', '')
      }
      markModified()
    }
  }

  const labelCls =
    'text-[10px] uppercase tracking-wider text-white/40 font-medium'

  return (
    <div className="flex flex-col gap-2 p-2 w-full min-w-[420px] bg-[#0b0d14]/95">
      {/* Mode toggle: Solid / Gradient */}
      <div className="flex items-center gap-2">
        <span className={labelCls}>Mode</span>
        <ToggleGroup
          type="single"
          value={bgMode}
          onValueChange={(v) => {
            if (!v) return
            setBgMode(v as BgMode)
            if (v === 'gradient') applyGradientValue(gradient)
            else applySolidColor(bgColor)
          }}
          variant="outline"
          size="sm"
          className="rounded-md border border-white/10"
        >
          <ToggleGroupItem
            value="solid"
            className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
          >
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem
            value="gradient"
            className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
          >
            Gradient
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {bgMode === 'solid' && (
        <div className="flex items-center gap-1.5">
          <span className={cn(labelCls, 'w-10')}>Color</span>
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => applySolidColor(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
            <div
              className="size-7 rounded-md border border-input shadow-xs"
              style={{ backgroundColor: bgColor }}
            />
          </label>
          <span className="text-xs text-muted-foreground font-mono">
            {bgColor}
          </span>
        </div>
      )}

      {bgMode === 'gradient' && (
        <div className="flex flex-col gap-2">
          {/* Linear / Radial toggle */}
          <div className="flex items-center gap-2">
            <span className={labelCls}>Type</span>
            <ToggleGroup
              type="single"
              value={gradient.type}
              onValueChange={(v) => {
                if (!v) return
                updateGradient({ type: v as GradientType })
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-white/10"
            >
              <ToggleGroupItem
                value="linear"
                className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
              >
                Linear
              </ToggleGroupItem>
              <ToggleGroupItem
                value="radial"
                className="px-2 py-0.5 text-[10px] text-white/60 data-[state=on]:bg-cyan-300/15 data-[state=on]:text-cyan-200"
              >
                Radial
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Live preview swatch */}
          <div
            className="h-8 w-full rounded-md border border-white/10"
            style={{ backgroundImage: buildGradient(gradient) }}
          />

          {/* Color stops */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={gradient.color1}
                  onChange={(e) => updateGradient({ color1: e.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <div
                  className="size-7 rounded-md border border-input shadow-xs"
                  style={{ backgroundColor: gradient.color1 }}
                />
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={gradient.pos1}
                onChange={(e) =>
                  updateGradient({ pos1: Number(e.target.value) })
                }
                className="flex-1 accent-cyan-300"
              />
              <span className="text-[10px] text-white/50 w-8 text-right">
                {gradient.pos1}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={gradient.color2}
                  onChange={(e) => updateGradient({ color2: e.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <div
                  className="size-7 rounded-md border border-input shadow-xs"
                  style={{ backgroundColor: gradient.color2 }}
                />
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={gradient.pos2}
                onChange={(e) =>
                  updateGradient({ pos2: Number(e.target.value) })
                }
                className="flex-1 accent-cyan-300"
              />
              <span className="text-[10px] text-white/50 w-8 text-right">
                {gradient.pos2}%
              </span>
            </div>
          </div>

          {/* Angle slider (linear only) */}
          {gradient.type === 'linear' && (
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-10')}>Angle</span>
              <input
                type="range"
                min={0}
                max={360}
                value={gradient.angle}
                onChange={(e) =>
                  updateGradient({ angle: Number(e.target.value) })
                }
                className="flex-1 accent-cyan-300"
              />
              <span className="text-[10px] text-white/50 w-12 text-right">
                {gradient.angle}deg
              </span>
            </div>
          )}
        </div>
      )}

      {/* BG Presets */}
      <div className="flex flex-col gap-1">
        <span className={labelCls}>Presets</span>
        <div className="grid grid-cols-8 gap-1">
          {BG_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              onClick={() => {
                const parsed = parseGradientString(preset.gradient)
                if (parsed) {
                  applyGradientValue(parsed)
                } else {
                  applyLiveStyle('background-image', preset.gradient)
                }
              }}
              className="h-6 rounded border border-white/10 transition-transform hover:scale-105"
              style={{ backgroundImage: preset.gradient }}
            />
          ))}
        </div>
      </div>

      {/* Background image search */}
      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Image</span>
        <div className="flex items-center gap-1">
          <InputGroup className="flex-1">
            <InputGroupInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="Search stock images..."
              className="text-xs text-white"
            />
          </InputGroup>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            aria-label="Search images"
            className={cn(
              'size-7 grid place-items-center rounded transition-colors',
              'bg-cyan-300/15 text-cyan-200 hover:bg-cyan-300/25',
              searching && 'opacity-50',
            )}
          >
            {searching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Search className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleInitialSearch}
            disabled={searching}
            aria-label="Context search"
            title="Context-aware search"
            className={cn(
              'size-7 grid place-items-center rounded transition-colors',
              'text-white/60 hover:bg-white/5 hover:text-white',
              searching && 'opacity-50',
            )}
          >
            <ImageIcon className="size-3.5" />
          </button>
          {hasBgImage && (
            <button
              type="button"
              onClick={removeBgImage}
              aria-label="Remove image"
              title="Remove image"
              className="size-7 grid place-items-center rounded text-white/60 hover:bg-white/5 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={`${result.imageUrl}-${i}`}
                type="button"
                onClick={() => applyBgImage(result.imageUrl)}
                className="aspect-square rounded border border-white/10 overflow-hidden transition-transform hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.imageUrl}
                  alt={result.query}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop blur */}
      <div className="flex items-center gap-2">
        <span className={cn(labelCls, 'w-10')}>Blur</span>
        <input
          type="range"
          min={0}
          max={20}
          value={backdropBlur}
          onChange={(e) => applyBackdropBlur(Number(e.target.value))}
          className="flex-1 accent-cyan-300"
        />
        <span className="text-[10px] text-white/50 w-12 text-right">
          {backdropBlur}px
        </span>
      </div>
    </div>
  )
}

/** Parse a gradient body like "90deg, #fff 0%, #000 100%" into GradientState. */
function parseGradientBody(
  type: GradientType,
  body: string,
): GradientState | null {
  const parts = body.split(',').map((s) => s.trim())
  let angle = 90
  let colorParts = parts
  if (type === 'linear') {
    const first = parts[0] || ''
    const angleMatch = first.match(/^(-?\d+(?:\.\d+)?)deg$/)
    if (angleMatch) {
      angle = Math.round(parseFloat(angleMatch[1]))
      colorParts = parts.slice(1)
    }
  }
  const stops = colorParts.slice(0, 2)
  if (stops.length < 2) return null
  const parseStop = (stop: string): { color: string; pos: number } | null => {
    const m = stop.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/)
    if (m) return { color: m[1].trim(), pos: Math.round(parseFloat(m[2])) }
    return { color: stop.trim(), pos: 0 }
  }
  const s1 = parseStop(stops[0])
  const s2 = parseStop(stops[1])
  if (!s1 || !s2) return null
  return {
    type,
    color1: s1.color,
    color2: s2.color,
    pos1: s1.pos,
    pos2: s2.pos,
    angle,
  }
}

/** Parse a full gradient string like "linear-gradient(90deg, #fff 0%, #000 100%)". */
function parseGradientString(input: string): GradientState | null {
  const m = input.match(
    /(linear|radial)-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/,
  )
  if (!m) return null
  return parseGradientBody(m[1] as GradientType, m[2])
}
