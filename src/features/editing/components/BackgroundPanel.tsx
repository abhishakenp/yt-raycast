import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Search, Loader2, X, Upload, Sparkles } from 'lucide-react'
import { cn } from '#/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { Slider } from '#/components/ui/slider'
import {
  searchStockImages,
  buildBackgroundImageUrl,
  type StockImageResult,
  type BackgroundImageResolution,
} from '@/lib/stock-image'
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

// ── Color + alpha helpers ──────────────────────────────────────────────
function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}
function toHex2(n: number): string {
  return clamp255(n).toString(16).padStart(2, '0')
}

function expandHex(h: string): string {
  const clean = h.replace(/[^0-9a-fA-F]/g, '')
  if (clean.length === 3)
    return clean
      .split('')
      .map((c) => c + c)
      .join('')
  return clean.slice(0, 6).padEnd(6, '0')
}

/** Parse any CSS color (hex, rgb, rgba, transparent) into a hex + 0–100 alpha. */
export function parseColor(value: string): { hex: string; alpha: number } {
  const v = (value || '').trim().toLowerCase()
  if (!v || v === 'transparent') return { hex: '#000000', alpha: 0 }
  if (v.startsWith('#')) return { hex: `#${expandHex(v.slice(1))}`, alpha: 100 }
  const m = v.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim())
    const [r, g, b] = parts
    const rawAlpha = parts[3] !== undefined ? parseFloat(parts[3]) : 1
    const alpha = Number.isNaN(rawAlpha) ? 1 : rawAlpha
    return {
      hex: `#${toHex2(parseFloat(r))}${toHex2(parseFloat(g))}${toHex2(parseFloat(b))}`,
      alpha: Math.round(alpha * 100),
    }
  }
  return { hex: '#000000', alpha: 100 }
}

/** Combine a hex color + 0–100 alpha into a CSS color string. */
export function toCssColor(hex: string, alpha: number): string {
  if (alpha >= 100) return hex
  if (alpha <= 0) return 'transparent'
  const h = expandHex(hex.replace('#', ''))
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`
}

/** The effective opaque color painted behind an element — the nearest ancestor
 *  with a non-transparent background. Used to fade a background image toward
 *  its surroundings (simulating see-through) without touching the element's own
 *  opacity, so foreground text stays fully opaque. Falls back to white. */
function resolveBackdropColor(el: HTMLElement): string {
  let node: HTMLElement | null = el.parentElement
  let guard = 0
  while (node && guard < 50) {
    const parsed = parseColor(window.getComputedStyle(node).backgroundColor)
    if (parsed.alpha > 0) return parsed.hex
    node = node.parentElement
    guard++
  }
  return '#ffffff'
}

/** A CSS property on an ancestor that flattens the backdrop and so silently
 *  disables `backdrop-filter` on any descendant. Verified in a real compositor:
 *  overflow-clipping AND transform both kill descendant blur. */
export function backdropDefeatReason(s: CSSStyleDeclaration): string | null {
  if (s.transform && s.transform !== 'none') return 'transform'
  if (s.perspective && s.perspective !== 'none') return 'perspective'
  if (s.filter && s.filter !== 'none') return 'filter'
  const bf =
    s.backdropFilter ||
    (s as unknown as Record<string, string>).webkitBackdropFilter ||
    ''
  if (bf && bf !== 'none') return 'backdrop-filter'
  if (/\b(transform|perspective|filter)\b/.test(s.willChange || ''))
    return 'will-change'
  if (/\b(paint|strict|content|layout)\b/.test(s.contain || ''))
    return 'contain'
  const op = parseFloat(s.opacity || '1')
  if (!Number.isNaN(op) && op < 1) return 'opacity'
  const ox = s.overflowX || ''
  const oy = s.overflowY || ''
  if ((ox && ox !== 'visible') || (oy && oy !== 'visible')) return 'overflow'
  return null
}

/** Walk ancestors looking for the first element that would defeat a
 *  `backdrop-filter` on `el`. Returns the offending element + which property,
 *  or null when the blur will render. */
export function findBackdropDefeatingAncestor(
  el: HTMLElement | null,
): { element: HTMLElement; reason: string } | null {
  if (!el) return null
  const view =
    el.ownerDocument?.defaultView ??
    (typeof window !== 'undefined' ? window : null)
  if (!view) return null
  const root = el.ownerDocument?.documentElement ?? null
  let node = el.parentElement
  let guard = 0
  while (node && node !== root && guard < 100) {
    const reason = backdropDefeatReason(view.getComputedStyle(node))
    if (reason) return { element: node, reason }
    node = node.parentElement
    guard++
  }
  return null
}

const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    'conic-gradient(#c8c8c8 25%, #fff 0 50%, #c8c8c8 0 75%, #fff 0)',
  backgroundSize: '8px 8px',
}

/** A hue swatch: native color input over a checkerboard so any bound-in
 *  transparency shows through. Opacity itself is a separate panel-level
 *  control (the Opacity slider), so this only deals with the color. */
function ColorSwatch({
  label,
  hex,
  display,
  onChange,
}: {
  label: string
  hex: string
  display: string
  onChange: (hex: string) => void
}) {
  return (
    <label className="relative cursor-pointer">
      <input
        type="color"
        aria-label={label}
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
      <div
        className="relative size-7 overflow-hidden rounded-md border border-input shadow-xs"
        style={CHECKER_STYLE}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: display }}
        />
      </div>
    </label>
  )
}

type BgFit = 'cover' | 'contain' | 'fill' | 'auto'

const FIT_OPTIONS: { value: BgFit; label: string; backgroundSize: string }[] = [
  { value: 'cover', label: 'Cover', backgroundSize: 'cover' },
  { value: 'contain', label: 'Contain', backgroundSize: 'contain' },
  { value: 'fill', label: 'Fill', backgroundSize: '100% 100%' },
  { value: 'auto', label: 'Auto', backgroundSize: 'auto' },
]

const RESOLUTION_OPTIONS: {
  value: BackgroundImageResolution
  label: string
}[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
  { value: 'max', label: 'Max' },
]

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

function buildGradient(g: GradientState, opacity = 100): string {
  // Apply the panel-level opacity to each stop so the Opacity slider dims the
  // whole gradient, not just a solid fill.
  const c1 = toCssColor(parseColor(g.color1).hex, opacity)
  const c2 = toCssColor(parseColor(g.color2).hex, opacity)
  if (g.type === 'linear') {
    return `linear-gradient(${g.angle}deg, ${c1} ${g.pos1}%, ${c2} ${g.pos2}%)`
  }
  return `radial-gradient(circle, ${c1} ${g.pos1}%, ${c2} ${g.pos2}%)`
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
  const [bgOpacity, setBgOpacity] = useState(100)
  const [gradient, setGradient] = useState<GradientState>(DEFAULT_GRADIENT)
  const [backdropBlur, setBackdropBlur] = useState(0)
  const [blurDefeatedBy, setBlurDefeatedBy] = useState<{
    tag: string
    reason: string
  } | null>(null)
  const [bgFit, setBgFit] = useState<BgFit>('cover')
  const [bgResolution, setBgResolution] =
    useState<BackgroundImageResolution>('standard')
  const [appliedStockResult, setAppliedStockResult] =
    useState<StockImageResult | null>(null)
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
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
      // A newly selected element has no remembered stock pick to re-resolve.
      setAppliedStockResult(null)
    }
    // Split the current fill into an opaque hue (for the swatch) and an
    // opacity (for the Opacity slider) — the two are edited independently.
    const parsedBg = parseColor(computed.backgroundColor || '#000000')
    setBgColor(parsedBg.hex)

    // Initialise the fit control from the element's current background-size.
    const size = (computed.backgroundSize || '').trim().toLowerCase()
    const matchedFit = FIT_OPTIONS.find((o) => o.backgroundSize === size)
    setBgFit(matchedFit ? matchedFit.value : 'cover')

    const grad = hasComputedBgImage ? extractGradient(backgroundImage) : null
    if (hasComputedBgImage) {
      setHasBgImage(true)
      if (grad) {
        setBgMode('gradient')
        const parsed = parseGradientBody(grad.type, grad.body)
        if (parsed) setGradient(parsed)
      }
    } else {
      setHasBgImage(false)
    }

    // Seed the Opacity slider from the current fill. A background image has no
    // per-pixel alpha, so its opacity is the element's `opacity`. For a
    // gradient it's the first stop's alpha; for a solid fill the color alpha.
    // A fully transparent (alpha 0) fill means "no background yet" — default to
    // full so the next color/gradient is visible rather than invisible.
    if (hasComputedBgImage && !grad) {
      const op = parseFloat(computed.opacity || '1')
      setBgOpacity(Number.isNaN(op) ? 100 : Math.round(op * 100))
    } else if (grad) {
      const parsed = parseGradientBody(grad.type, grad.body)
      const stopAlpha = parsed ? parseColor(parsed.color1).alpha : 100
      setBgOpacity(stopAlpha === 0 ? 100 : stopAlpha)
    } else {
      setBgOpacity(parsedBg.alpha === 0 ? 100 : parsedBg.alpha)
    }

    const backdrop =
      computed.backdropFilter ||
      (computed as unknown as Record<string, string>).webkitBackdropFilter ||
      ''
    const blurMatch = backdrop.match(/blur\((\d+(?:\.\d+)?)px\)/)
    setBackdropBlur(blurMatch ? Math.round(parseFloat(blurMatch[1])) : 0)

    const defeat = findBackdropDefeatingAncestor(activeElement)
    setBlurDefeatedBy(
      defeat
        ? { tag: defeat.element.tagName.toLowerCase(), reason: defeat.reason }
        : null,
    )
  }, [activeElement])

  const markModified = () => {
    userModifiedRef.current = true
    onModified?.()
  }

  const applyLiveStyle = (prop, value) => {
    if (activeElement) {
      activeElement.style.setProperty(prop, value)
      markModified()
    }
  }

  const applySolidColor = (hex) => {
    // Picking a hue implies wanting it visible: if the fill was fully
    // transparent, restore full opacity; otherwise keep the chosen opacity.
    const nextOpacity = bgOpacity === 0 ? 100 : bgOpacity
    setBgColor(hex)
    setBgOpacity(nextOpacity)
    setBgMode('solid')
    // Clear any gradient/image so the solid color shows
    if (activeElement) {
      activeElement.style.setProperty('background-image', '')
      activeElement.style.setProperty(
        'background-color',
        toCssColor(hex, nextOpacity),
      )
      markModified()
    }
  }

  const applyGradientValue = (next) => {
    setGradient(next)
    setBgMode('gradient')
    setHasBgImage(false)
    applyLiveStyle('background-image', buildGradient(next, bgOpacity))
  }

  const updateGradient = (patch) => {
    const next = { ...gradient, ...patch }
    applyGradientValue(next)
  }

  // Panel-level Opacity slider — dims whatever the current background is,
  // never the foreground.
  const applyBackgroundOpacity = (value) => {
    setBgOpacity(value)
    if (!activeElement) return
    if (hasBgImage) {
      if (activeElement.tagName.toLowerCase() === 'img') {
        // An <img> has no foreground content, so element opacity == image
        // opacity and text is not a concern.
        activeElement.style.setProperty(
          'opacity',
          value >= 100 ? '' : (value / 100).toString(),
        )
      } else if (bgImageUrl) {
        // A div's background image fades via a translucent overlay layer so
        // its foreground text stays fully opaque.
        paintDivImageBackground(activeElement, bgImageUrl, bgFit, value)
      }
    } else if (bgMode === 'gradient') {
      activeElement.style.setProperty(
        'background-image',
        buildGradient(gradient, value),
      )
    } else {
      activeElement.style.setProperty(
        'background-color',
        toCssColor(bgColor, value),
      )
    }
    markModified()
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

  const fitBackgroundSize = (fit) =>
    FIT_OPTIONS.find((o) => o.value === fit)?.backgroundSize ?? 'cover'

  const fitObjectFit = (fit) =>
    fit === 'fill' ? 'fill' : fit === 'auto' ? 'none' : fit

  // Paint a background image on a (non-<img>) element, fading it toward the
  // color behind the element when opacity < 100 via a translucent overlay
  // LAYER — the background alone dims; foreground text is never affected
  // (unlike element `opacity`).
  const paintDivImageBackground = (el, url, fit, opacity) => {
    const fitSize = fitBackgroundSize(fit)
    if (opacity >= 100) {
      el.style.setProperty('background-image', `url("${url}")`)
      el.style.setProperty('background-size', fitSize)
      el.style.setProperty('background-position', 'center')
      el.style.setProperty('background-repeat', '')
    } else {
      const overlay = toCssColor(resolveBackdropColor(el), 100 - opacity)
      el.style.setProperty(
        'background-image',
        `linear-gradient(${overlay}, ${overlay}), url("${url}")`,
      )
      el.style.setProperty('background-size', `cover, ${fitSize}`)
      el.style.setProperty('background-position', 'center, center')
      el.style.setProperty('background-repeat', 'no-repeat')
    }
  }

  const applyBgImage = (url, fit = bgFit) => {
    if (!activeElement) return
    setHasBgImage(true)
    setBgMode('solid')
    setBgImageUrl(url)
    if (activeElement.tagName.toLowerCase() === 'img') {
      if (originalImageSrcRef.current === null) {
        originalImageSrcRef.current = (activeElement as HTMLImageElement).src
      }
      activeElement.style.setProperty('background-image', '')
      activeElement.style.setProperty('background-size', '')
      activeElement.style.setProperty('background-position', '')
      // For an <img>, fit is object-fit and opacity is the element's opacity
      // (an <img> has no foreground content of its own to fade).
      activeElement.style.setProperty('object-fit', fitObjectFit(fit))
      activeElement.style.setProperty(
        'opacity',
        bgOpacity >= 100 ? '' : (bgOpacity / 100).toString(),
      )
      if (onImageElementPreview) {
        onImageElementPreview(url)
      } else {
        ;(activeElement as HTMLImageElement).src = url
      }
      markModified()
      return
    }
    paintDivImageBackground(activeElement, url, fit, bgOpacity)
    markModified()
  }

  // Selecting a stock result resolves a high-resolution URL at the chosen
  // quality tier and remembers the pick so resolution changes can re-resolve.
  const handleSelectStock = (result) => {
    setAppliedStockResult(result)
    applyBgImage(buildBackgroundImageUrl(result, bgResolution))
  }

  const handleSelectUpload = (url) => {
    // Uploaded images have no provider variants — apply the stored URL as-is.
    setAppliedStockResult(null)
    applyBgImage(url)
  }

  const applyFit = (fit) => {
    setBgFit(fit)
    if (!activeElement) return
    if (activeElement.tagName.toLowerCase() === 'img') {
      activeElement.style.setProperty('object-fit', fitObjectFit(fit))
    } else if (bgImageUrl) {
      // Recompose so the overlay layer (if opacity < 100) stays intact.
      paintDivImageBackground(activeElement, bgImageUrl, fit, bgOpacity)
    } else {
      activeElement.style.setProperty('background-size', fitBackgroundSize(fit))
    }
    markModified()
  }

  const applyResolution = (res) => {
    setBgResolution(res)
    if (appliedStockResult) {
      applyBgImage(buildBackgroundImageUrl(appliedStockResult, res))
    }
  }

  const removeBgImage = () => {
    if (!activeElement) return
    setHasBgImage(false)
    setSearchResults([])
    setAppliedStockResult(null)
    setBgImageUrl(null)
    setBgOpacity(100)
    if (activeElement.tagName.toLowerCase() === 'img') {
      // <img> opacity was used for fading; clear it so a removed image isn't
      // left faded. (Div backgrounds fade via an overlay, not element opacity.)
      activeElement.style.setProperty('opacity', '')
      activeElement.style.setProperty('object-fit', '')
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
    activeElement.style.setProperty('background-repeat', '')
    markModified()
  }

  // ── File upload ──────────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (file) => {
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
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e) => {
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

  const applyBackdropBlur = (value) => {
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

  // One-click frosted glass: a translucent tint + a moderate backdrop blur set
  // together, since blur alone over a transparent fill reads as almost nothing.
  // Tint follows the element's own fill when it has one, else the nearest opaque
  // surface behind it — so dark bars stay dark (text stays readable) and light
  // bars stay light, instead of forcing a white wash.
  const applyFrostedGlass = () => {
    if (!activeElement) return
    const own = parseColor(
      window.getComputedStyle(activeElement).backgroundColor,
    )
    const tint = own.alpha > 0 ? own.hex : resolveBackdropColor(activeElement)
    const tintOpacity = 60
    const blur = 16
    setBgMode('solid')
    setBgColor(tint)
    setBgOpacity(tintOpacity)
    setBackdropBlur(blur)
    activeElement.style.setProperty('background-image', '')
    activeElement.style.setProperty(
      'background-color',
      toCssColor(tint, tintOpacity),
    )
    activeElement.style.setProperty('backdrop-filter', `blur(${blur}px)`)
    activeElement.style.setProperty(
      '-webkit-backdrop-filter',
      `blur(${blur}px)`,
    )
    markModified()
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

      {/* One-click frosted glass preset */}
      <button
        type="button"
        onClick={applyFrostedGlass}
        aria-label="Frosted glass"
        className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <Sparkles className="size-3" />
        Frosted glass
      </button>

      {bgMode === 'solid' && (
        <div className="flex items-center gap-1.5">
          <span className={cn(labelCls, 'w-10')}>Color</span>
          <ColorSwatch
            label="Background color"
            hex={bgColor}
            display={toCssColor(bgColor, bgOpacity)}
            onChange={applySolidColor}
          />
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
            style={{ backgroundImage: buildGradient(gradient, bgOpacity) }}
          />

          {/* Color stops — each stop has a color swatch and a position */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <ColorSwatch
                label="Gradient first color"
                hex={parseColor(gradient.color1).hex}
                display={toCssColor(parseColor(gradient.color1).hex, bgOpacity)}
                onChange={(hex) => updateGradient({ color1: hex })}
              />
              <div className="flex items-center gap-1.5">
                <span className={cn(labelCls, 'w-6')}>Pos</span>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <ColorSwatch
                label="Gradient second color"
                hex={parseColor(gradient.color2).hex}
                display={toCssColor(parseColor(gradient.color2).hex, bgOpacity)}
                onChange={(hex) => updateGradient({ color2: hex })}
              />
              <div className="flex items-center gap-1.5">
                <span className={cn(labelCls, 'w-6')}>Pos</span>
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

        {hasBgImage && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14')}>Fit</span>
              <ToggleGroup
                aria-label="Background image fit"
                type="single"
                value={bgFit}
                onValueChange={(v) => {
                  if (v) applyFit(v as BgFit)
                }}
                variant="outline"
                size="sm"
                className="rounded-md border border-border"
              >
                {FIT_OPTIONS.map((o) => (
                  <ToggleGroupItem
                    key={o.value}
                    value={o.value}
                    className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
                  >
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(labelCls, 'w-14')}>Quality</span>
              <ToggleGroup
                aria-label="Background image resolution"
                type="single"
                value={bgResolution}
                onValueChange={(v) => {
                  if (v) applyResolution(v as BackgroundImageResolution)
                }}
                variant="outline"
                size="sm"
                className="rounded-md border border-border"
              >
                {RESOLUTION_OPTIONS.map((o) => (
                  <ToggleGroupItem
                    key={o.value}
                    value={o.value}
                    className="px-2 py-0.5 text-[10px] text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
                  >
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        )}

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
                      onClick={() => handleSelectUpload(result.imageUrl)}
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
                      onClick={() => handleSelectStock(result)}
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
        <span className={cn(labelCls, 'w-14')}>Blur</span>
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

      {blurDefeatedBy && backdropBlur > 0 && (
        <p
          role="alert"
          className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] leading-snug text-amber-600 dark:text-amber-400"
        >
          Backdrop blur won&apos;t render here — parent{' '}
          <code className="font-mono">&lt;{blurDefeatedBy.tag}&gt;</code> has{' '}
          <span className="font-medium">{blurDefeatedBy.reason}</span>, which
          flattens the backdrop. Select that parent and clear it, or apply the
          glass to that element instead.
        </p>
      )}

      {/* Background opacity */}
      <div className="flex items-center gap-2">
        <span className={cn(labelCls, 'w-14')}>Opacity</span>
        <Slider
          aria-label="Background opacity"
          min={0}
          max={100}
          value={[bgOpacity]}
          onValueChange={(v) => applyBackgroundOpacity(v[0])}
          className="flex-1"
        />
        <span className="text-[10px] text-muted-foreground/70 w-12 text-right">
          {bgOpacity}%
        </span>
      </div>
    </div>
  )
}

/** Split a gradient body on top-level commas, ignoring commas nested inside
 *  parentheses (e.g. within rgba(…) color stops). */
function splitTopLevel(body: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of body) {
    if (ch === '(') {
      depth++
      current += ch
    } else if (ch === ')') {
      depth--
      current += ch
    } else if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

/** Extract a gradient's type + body from a full CSS value, correctly matching
 *  the outer parenthesis even when the body contains nested rgba(…) parens. */
function extractGradient(
  input: string,
): { type: GradientType; body: string } | null {
  const m = input.match(/(linear|radial)-gradient\(/)
  if (!m || m.index === undefined) return null
  const type = m[1] as GradientType
  const start = m.index + m[0].length
  let depth = 1
  let i = start
  for (; i < input.length && depth > 0; i++) {
    if (input[i] === '(') depth++
    else if (input[i] === ')') depth--
  }
  return { type, body: input.slice(start, i - 1) }
}

/** Parse a gradient body like "90deg, #fff 0%, #000 100%" into GradientState. */
function parseGradientBody(
  type: GradientType,
  body: string,
): GradientState | null {
  const parts = splitTopLevel(body)
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
  const parseStop = (stop) => {
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
  const g = extractGradient(input)
  if (!g) return null
  return parseGradientBody(g.type, g.body)
}
