import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Search, Loader2, X, Upload } from 'lucide-react'
import { cn } from '#/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { Slider } from '#/components/ui/slider'
import { searchStockImages, type StockImageResult } from '@/lib/stock-image'
import { readJsonOrThrow } from '@/lib/safe-fetch'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const PER_PAGE = 10
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

function validateImageFile(file: {
  type: string
  size: number
  name: string
}): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`
  }
  return null
}

function extractImageFiles(files: File[]): File[] {
  return files.filter((f) => f.type.startsWith('image/'))
}

interface BackgroundPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
  onImageElementPreview?: (newSrc: string | null) => void
  sessionId?: string
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
  onImageElementPreview,
  sessionId,
}: BackgroundPanelProps) {
  const [bgMode, setBgMode] = useState<BgMode>('solid')
  const [bgColor, setBgColor] = useState('#000000')
  const [gradient, setGradient] = useState<GradientState>(DEFAULT_GRADIENT)
  const [backdropBlur, setBackdropBlur] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockImageResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string>()
  const [hasSearchedImages, setHasSearchedImages] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hasBgImage, setHasBgImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()

  const userModifiedRef = useRef(false)
  const prevElementRef = useRef<HTMLElement | null>(null)
  const originalImageSrcRef = useRef<string | null>(null)
  const originalHadBgImageRef = useRef(false)
  const originalInlineBgImageRef = useRef('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchRequestIdRef = useRef(0)

  const generateUploadUrl = useMutation(api.sessions.generateImageUploadUrl)
  const saveUserImage = useMutation(api.sessions.saveUserImage)
  const userImages = useQuery(
    api.sessions.listUserImages,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  )

  useEffect(() => {
    if (!activeElement) return
    const computed = window.getComputedStyle(activeElement)
    const backgroundImage = computed.backgroundImage || ''
    const hasComputedBgImage =
      Boolean(backgroundImage) && backgroundImage !== 'none'
    if (prevElementRef.current !== activeElement) {
      prevElementRef.current = activeElement
      userModifiedRef.current = false
      originalImageSrcRef.current =
        activeElement.tagName.toLowerCase() === 'img'
          ? (activeElement as HTMLImageElement).src
          : null
      originalHadBgImageRef.current = hasComputedBgImage
      originalInlineBgImageRef.current = activeElement.style.backgroundImage
    }
    setBgColor(computed.backgroundColor || '#000000')

    if (hasComputedBgImage) {
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
      computed.backdropFilter ||
      (computed as unknown as Record<string, string>).webkitBackdropFilter ||
      ''
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
    const requestId = searchRequestIdRef.current + 1
    searchRequestIdRef.current = requestId
    setSearching(true)
    setSearchError(undefined)
    setHasSearchedImages(false)
    setPage(1)
    setHasMore(true)
    try {
      const results = await searchStockImages({
        query,
        w: 400,
        h: 300,
        page: 1,
        perPage: PER_PAGE,
      })
      if (searchRequestIdRef.current !== requestId) return
      setSearchResults(results)
      setHasMore(results.length === PER_PAGE)
      setHasSearchedImages(true)
    } catch (err) {
      if (searchRequestIdRef.current !== requestId) return
      setHasMore(false)
      setHasSearchedImages(false)
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      if (searchRequestIdRef.current === requestId) {
        setSearching(false)
      }
    }
  }

  const loadMore = useCallback(async () => {
    if (isLoadingMore || searching || !hasMore || !searchQuery.trim()) return
    const nextPage = page + 1
    setIsLoadingMore(true)
    try {
      const results = await searchStockImages({
        query: searchQuery.trim(),
        w: 400,
        h: 300,
        page: nextPage,
        perPage: PER_PAGE,
      })
      setSearchResults((prev) => [...prev, ...results])
      setPage(nextPage)
      setHasMore(results.length === PER_PAGE)
      setSearchError(undefined)
    } catch (err) {
      setHasMore(false)
      setSearchError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, searching, hasMore, page, searchQuery])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { root: scrollRef.current, rootMargin: '100px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const applyBgImage = (url: string) => {
    if (!activeElement) return
    setHasBgImage(true)
    setBgMode('solid')
    if (activeElement.tagName.toLowerCase() === 'img') {
      if (originalImageSrcRef.current === null) {
        originalImageSrcRef.current = (activeElement as HTMLImageElement).src
      }
      activeElement.style.setProperty('background-image', '')
      activeElement.style.setProperty('background-size', '')
      activeElement.style.setProperty('background-position', '')
      if (onImageElementPreview) {
        onImageElementPreview(url)
      } else {
        ;(activeElement as HTMLImageElement).src = url
      }
      markModified()
      return
    }
    activeElement.style.setProperty('background-image', `url("${url}")`)
    activeElement.style.setProperty('background-size', 'cover')
    activeElement.style.setProperty('background-position', 'center')
    markModified()
  }

  const removeBgImage = () => {
    if (!activeElement) return
    setHasBgImage(false)
    setSearchResults([])
    if (activeElement.tagName.toLowerCase() === 'img') {
      if (onImageElementPreview) {
        onImageElementPreview(null)
      } else if (originalImageSrcRef.current) {
        ;(activeElement as HTMLImageElement).src = originalImageSrcRef.current
      }
      markModified()
      return
    }
    if (
      originalHadBgImageRef.current &&
      !originalInlineBgImageRef.current.trim()
    ) {
      activeElement.style.setProperty('background-image', 'none')
    } else {
      activeElement.style.setProperty('background-image', '')
    }
    activeElement.style.setProperty('background-size', '')
    activeElement.style.setProperty('background-position', '')
    markModified()
  }

  // ── File upload ──────────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateImageFile(file)
      if (validationError) {
        setUploadError(validationError)
        return
      }
      if (!sessionId) {
        setUploadError('Session ID required for uploads')
        return
      }
      setIsUploading(true)
      setUploadError(undefined)
      try {
        const anonymousOwnerSecret =
          typeof window === 'undefined'
            ? undefined
            : readAnonymousOwnerSecret(window.localStorage, sessionId)
        const uploadUrl = await generateUploadUrl({
          sessionId: sessionId as Id<'sessions'>,
          anonymousOwnerSecret,
        })
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
        const { storageId } = await readJsonOrThrow<{
          storageId: Id<'_storage'>
        }>(res, 'Upload failed')
        await saveUserImage({
          sessionId: sessionId as Id<'sessions'>,
          anonymousOwnerSecret,
          storageId,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        })
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [generateUploadUrl, saveUserImage, sessionId],
  )

  // ── Drag-and-drop ────────────────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragging(false)
      const files = extractImageFiles(Array.from(e.dataTransfer.files))
      for (const file of files) {
        uploadFile(file)
      }
    },
    [uploadFile],
  )

  // ── Build display list: uploaded images first, then stock results ────
  type UserImage = { url: string | null; filename: string | null }
  const uploadedImages: { imageUrl: string; alt: string }[] =
    (userImages as UserImage[] | undefined)
      ?.filter((img): img is UserImage & { url: string } => img.url !== null)
      .map((img) => ({
        imageUrl: img.url,
        alt: img.filename ?? 'Uploaded image',
      })) ?? []

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
    'text-[10px] uppercase tracking-wider text-muted-foreground font-medium'

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 bg-background/95 p-2">
      {/* Mode toggle: Solid / Gradient */}
      <div className="flex items-center gap-2">
        <span className={labelCls}>Mode</span>
        <ToggleGroup
          aria-label="Background mode"
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
          className="rounded-md border border-border"
        >
          <ToggleGroupItem
            value="solid"
            className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
          >
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem
            value="gradient"
            className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
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
              aria-label="Background color"
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
              aria-label="Gradient type"
              type="single"
              value={gradient.type}
              onValueChange={(v) => {
                if (!v) return
                updateGradient({ type: v as GradientType })
              }}
              variant="outline"
              size="sm"
              className="rounded-md border border-border"
            >
              <ToggleGroupItem
                value="linear"
                className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
              >
                Linear
              </ToggleGroupItem>
              <ToggleGroupItem
                value="radial"
                className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
              >
                Radial
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Live preview swatch */}
          <div
            className="h-8 w-full rounded-md border border-border"
            style={{ backgroundImage: buildGradient(gradient) }}
          />

          {/* Color stops */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  aria-label="Gradient first color"
                  value={gradient.color1}
                  onChange={(e) => updateGradient({ color1: e.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <div
                  className="size-7 rounded-md border border-input shadow-xs"
                  style={{ backgroundColor: gradient.color1 }}
                />
              </label>
              <Slider
                aria-label="Gradient stop 1 position"
                min={0}
                max={100}
                value={[gradient.pos1]}
                onValueChange={(v) => updateGradient({ pos1: v[0] })}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground/70 w-8 text-right">
                {gradient.pos1}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  aria-label="Gradient second color"
                  value={gradient.color2}
                  onChange={(e) => updateGradient({ color2: e.target.value })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <div
                  className="size-7 rounded-md border border-input shadow-xs"
                  style={{ backgroundColor: gradient.color2 }}
                />
              </label>
              <Slider
                aria-label="Gradient stop 2 position"
                min={0}
                max={100}
                value={[gradient.pos2]}
                onValueChange={(v) => updateGradient({ pos2: v[0] })}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground/70 w-8 text-right">
                {gradient.pos2}%
              </span>
            </div>
          </div>

          {/* Angle slider (linear only) */}
          {gradient.type === 'linear' && (
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-10')}>Angle</span>
              <Slider
                aria-label="Gradient angle"
                min={0}
                max={360}
                value={[gradient.angle]}
                onValueChange={(v) => updateGradient({ angle: v[0] })}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground/70 w-12 text-right">
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
              className="h-6 rounded border border-border transition-transform hover:scale-105"
              style={{ backgroundImage: preset.gradient }}
            />
          ))}
        </div>
      </div>

      {/* Background image search + upload */}
      <div
        className="flex flex-col gap-1.5"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className={labelCls}>Image</span>
        <div className="relative flex items-center gap-1">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-2.5 size-3.5 text-white/40" />
            <input
              type="text"
              aria-label="Search background images"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="Search stock images..."
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-9 text-xs text-white placeholder:text-white/40 outline-none transition-colors focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
            />
            {sessionId && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Upload image"
                className="absolute right-1.5 grid size-5 place-items-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-cyan-300 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Upload className="size-3" />
                )}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              for (const file of files) {
                uploadFile(file)
              }
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
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
          {hasBgImage && (
            <button
              type="button"
              onClick={removeBgImage}
              aria-label="Remove image"
              title="Remove image"
              className="size-7 grid place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {uploadError && (
          <div className="rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] text-red-300">
            {uploadError}
          </div>
        )}

        {searchError && (
          <div className="rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] text-red-300">
            {searchError}
          </div>
        )}

        {!searchError &&
          hasSearchedImages &&
          uploadedImages.length === 0 &&
          searchResults.length === 0 && (
            <div className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/40">
              No results found
            </div>
          )}

        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-cyan-300/50 bg-[#0b0d14]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1">
              <Upload className="size-6 text-cyan-300" />
              <p className="text-xs text-cyan-300">Drop images to upload</p>
            </div>
          </div>
        )}

        {/* Image grid — uploaded images first, then stock results */}
        {(uploadedImages.length > 0 || searchResults.length > 0) && (
          <div ref={scrollRef} className="max-h-48 overflow-y-auto p-0.5">
            {uploadedImages.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/40">
                  Your uploads
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {uploadedImages.map((result, index) => (
                    <button
                      key={`upload-${result.imageUrl}-${index}`}
                      type="button"
                      onClick={() => applyBgImage(result.imageUrl)}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-cyan-300/30 bg-white/5 transition-all hover:border-cyan-300/60 hover:ring-2 hover:ring-cyan-300/30"
                      aria-label={`Select uploaded image ${index + 1}`}
                    >
                      <img
                        src={result.imageUrl}
                        alt={result.alt}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div>
                {uploadedImages.length > 0 && (
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/40">
                    Stock photos
                  </p>
                )}
                <div className="grid grid-cols-3 gap-1.5">
                  {searchResults.map((result, index) => (
                    <button
                      key={`stock-${result.imageUrl}-${index}`}
                      type="button"
                      onClick={() => applyBgImage(result.imageUrl)}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:border-cyan-300/50 hover:ring-2 hover:ring-cyan-300/30"
                      aria-label={`Select image ${index + 1}`}
                    >
                      <img
                        src={result.imageUrl}
                        alt={result.query}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-1" />
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-1.5 py-2">
                <Loader2 className="size-3 animate-spin text-white/40" />
                <span className="text-[10px] text-white/40">
                  Loading more...
                </span>
              </div>
            )}
            {!hasMore && searchResults.length > 0 && (
              <p className="py-2 text-center text-[10px] text-white/30">
                No more images
              </p>
            )}
          </div>
        )}
      </div>

      {/* Backdrop blur */}
      <div className="flex items-center gap-2">
        <span className={cn(labelCls, 'w-10')}>Blur</span>
        <Slider
          aria-label="Backdrop blur"
          min={0}
          max={100}
          value={[backdropBlur]}
          onValueChange={(v) => applyBackdropBlur(v[0])}
          className="flex-1"
        />
        <span className="text-[10px] text-muted-foreground/70 w-12 text-right">
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
