import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '#/components/ui/carousel.tsx'
import { cn } from '#/lib/utils.ts'
import { buildImageSearchQuery, type ImageContext } from './image-search-query'
import { decodeMultiImageSrc } from './multi-image-src'

export type { ImageContext }

/** Ambient page-level context (user prompt / brand) so every generated <Image>
 *  can bias its stock-photo query toward the actual business — without threading
 *  a prop through every capsule. Set once around the rendered page. */
const ImageContextContext = createContext<ImageContext | null>(null)

export function ImageContextProvider({
  value,
  children,
}: {
  value: ImageContext | null | undefined
  children?: ReactNode
}) {
  return (
    <ImageContextContext.Provider value={value ?? null}>
      {children}
    </ImageContextContext.Provider>
  )
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'with',
  'and',
  'or',
  'in',
  'on',
  'at',
  'for',
  'to',
  'from',
  'by',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'shall',
  'can',
  'need',
  'showing',
  'featuring',
  'during',
  'while',
  'against',
  'between',
  'into',
  'through',
  'across',
  'over',
  'under',
  'above',
  'below',
  'their',
  'they',
  'them',
  'his',
  'her',
  'its',
  'our',
  'your',
  'who',
  'which',
  'that',
  'this',
  'these',
  'those',
  'very',
  'really',
  'beautiful',
  'stunning',
  'elegant',
  'professional',
  'natural',
  'warm',
  'soft',
  'bright',
  'dark',
  'light',
  'small',
  'large',
  'high',
  'quality',
  'detail',
  'close',
  'up',
  'view',
  'scene',
  'image',
  'photo',
  'picture',
  'background',
])

const VISUAL_HINTS: Array<{ match: RegExp; query: string }> = [
  { match: /\bheadshot\b/, query: 'professional headshot portrait' },
  { match: /\bportrait\b/, query: 'portrait photography' },
  { match: /\bavatar\b/, query: 'portrait person' },
  { match: /\blogo\b/, query: 'logo brand' },
  { match: /\binterior\b/, query: 'interior design' },
  { match: /\bexterior\b/, query: 'architecture exterior' },
  {
    match: /\bfood\b|\bmeal\b|\bdish\b|\bcuisine\b/,
    query: 'food photography',
  },
  { match: /\bproduct\b/, query: 'product photography' },
  { match: /\bwedding\b/, query: 'wedding photography' },
  { match: /\boffice\b|\bworkspace\b/, query: 'modern office workspace' },
  { match: /\bbeach\b|\bocean\b|\bcoast\b/, query: 'beach ocean' },
  { match: /\bcoffee\b|\bcafe\b/, query: 'coffee shop cafe' },
  { match: /\bgym\b|\bfitness\b|\bworkout\b/, query: 'fitness gym workout' },
  {
    match: /\bhospital\b|\bmedical\b|\bdental\b|\bclinic\b/,
    query: 'medical clinic healthcare',
  },
  {
    match: /\breal\s*estate\b|\bproperty\b|\bapartment\b|\bhome\b/,
    query: 'real estate home interior',
  },
]

function normalizeAlt(alt: unknown): string {
  if (typeof alt === 'string') return alt.trim() || 'image'
  if (
    typeof alt === 'number' ||
    typeof alt === 'boolean' ||
    typeof alt === 'bigint'
  )
    return String(alt)
  if (alt && typeof alt === 'object') {
    for (const key of ['alt', 'label', 'title', 'name', 'description']) {
      const value = (alt as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim().length > 0)
        return value.trim()
    }
  }

  return 'image'
}

function searchQueryFromAlt(alt: string): string {
  const trimmed = alt.trim()
  if (!trimmed) return 'nature'

  const lower = trimmed.toLowerCase()
  const hint = VISUAL_HINTS.find((entry) => entry.match.test(lower))?.query
  const words = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

  const hintWords = new Set((hint ?? '').split(/\s+/).filter(Boolean))
  const uniqueWords = words.filter((word) => !hintWords.has(word))
  const core = uniqueWords.slice(0, 4).join(' ')

  if (hint && core) return `${hint} ${core}`.trim().slice(0, 96)
  if (hint) return hint
  if (core) return core.slice(0, 96)
  return 'nature'
}

function slugify(alt: unknown): string {
  return (
    normalizeAlt(alt)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image'
  )
}

/** Legacy fallback — deterministic placeholder from alt text. */
export function picsum(alt: unknown, w = 800, h = 600): string {
  const seed = slugify(alt)
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

/** Generate proxy URL for Pexels image. */
function getPexelsProxyUrl(
  alt: unknown,
  w: number,
  h: number,
  context?: ImageContext,
): string {
  const normalizedAlt = normalizeAlt(alt)
  const baseQuery = searchQueryFromAlt(normalizedAlt)
  // Blend the page domain (prompt/brand) into the query so the photo matches the
  // actual business, not just the capsule's generic alt. No context → unchanged.
  const query = buildImageSearchQuery(normalizedAlt, baseQuery, context)

  // URLSearchParams already percent-encodes values; pass them raw to avoid
  // double-encoding (which would send literal "%20" to Pexels and break relevance).
  const params = new URLSearchParams({
    query,
    w: w.toString(),
    h: h.toString(),
    seed: normalizedAlt,
  })

  return `/api/pexels?${params.toString()}`
}

const IMAGE_CAROUSEL_INTERVAL_MS = 5000

type ImageCarouselProps = {
  srcs: string[]
  alt: string
  w: number
  h: number
  className?: string
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading']
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height'
>

/** Auto-advancing image carousel rendered when an inline-edit override holds
 *  multiple URLs (multi-select in the image swap panel). Same embla carousel
 *  as the gov-portal hero, with prev/next arrows on both sides. Each slide
 *  keeps the original img className and alt so inline-edit anchors (alt +
 *  occurrence index) keep resolving. */
function ImageCarousel({
  srcs,
  alt,
  w,
  h,
  className,
  loading,
  style,
  ...rest
}: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi | null>(null)
  const wrapperStyle: ImgHTMLAttributes<HTMLImageElement>['style'] = {
    aspectRatio: `${w}/${h}`,
    ...(!className ? { width: w, maxWidth: '100%' } : {}),
    ...style,
  }

  useEffect(() => {
    if (!api) return
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, IMAGE_CAROUSEL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [api])

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      className={cn(
        'relative overflow-hidden [&_[data-slot=carousel-item]]:h-full',
        !className && 'inline-block max-w-full',
        className,
      )}
      style={wrapperStyle}
      data-ship-image-carousel=""
    >
      <CarouselContent className="ml-0 h-full" viewportClassName="h-full">
        {srcs.map((src, index) => (
          <CarouselItem key={`${src}-${index}`} className="basis-full pl-0">
            <ImgElement
              src={src}
              alt={alt}
              width={w}
              height={h}
              className={cn('h-full w-full object-cover', className)}
              loading={index === 0 ? loading : 'lazy'}
              {...rest}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-3 z-10 border-white/40 bg-black/25 text-white backdrop-blur hover:bg-black/45 hover:text-white" />
      <CarouselNext className="right-3 z-10 border-white/40 bg-black/25 text-white backdrop-blur hover:bg-black/45 hover:text-white" />
    </Carousel>
  )
}

/** Internal <img> wrapper that shows a pulsing skeleton background until the
 *  image has loaded (or errored). Prevents the dark-mode "empty box" flash
 *  before network images resolve. The skeleton uses the theme-aware
 *  `bg-accent` + `animate-pulse` tokens so it adapts to light/dark modes. */
function ImgElement({
  className,
  onLoad,
  onError,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [])
  return (
    <img
      ref={ref}
      className={cn(className, !loaded && 'animate-pulse bg-accent')}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      onError={(e) => {
        setLoaded(true)
        onError?.(e)
      }}
      {...rest}
    />
  )
}

/** Drop-in replacement for `<img>` that resolves a relevant Pexels image from `alt` text.
 *  Uses server-side proxy for SSR compatibility. Pass an explicit `src` to use a pre-resolved URL verbatim
 *  (e.g. a photo already synced to Medusa), bypassing Pexels resolution entirely. */
export function Image({
  alt,
  src,
  w = 800,
  h = 600,
  className,
  loading,
  context,
  ...rest
}: {
  alt?: unknown
  src?: string
  w?: number
  h?: number
  context?: ImageContext
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height'
>) {
  const normalizedAlt = normalizeAlt(alt)
  // Explicit prop wins; otherwise inherit the ambient page-level context.
  const ambientContext = useContext(ImageContextContext)
  const effectiveContext = context ?? ambientContext ?? undefined
  const trimmedSrc = typeof src === 'string' ? src.trim() : ''
  const overrideSrc =
    effectiveContext?.overrides?.[normalizedAlt] ??
    (trimmedSrc ? effectiveContext?.overrides?.[trimmedSrc] : undefined)
  // Multi-select in the image swap panel stores the whole selection as one
  // JSON-array payload — 2+ URLs become an auto-advancing carousel in place
  // of the single img.
  const overrideSrcs = decodeMultiImageSrc(overrideSrc)
  if (overrideSrcs && overrideSrcs.length > 1) {
    return (
      <ImageCarousel
        srcs={overrideSrcs}
        alt={normalizedAlt}
        w={w}
        h={h}
        className={className}
        loading={loading}
        {...rest}
      />
    )
  }
  const resolvedOverrideSrc = overrideSrcs?.[0] ?? overrideSrc
  const imageSrc =
    typeof resolvedOverrideSrc === 'string' && resolvedOverrideSrc.trim()
      ? resolvedOverrideSrc
      : trimmedSrc
        ? trimmedSrc
        : getPexelsProxyUrl(normalizedAlt, w, h, effectiveContext)

  return (
    <ImgElement
      src={imageSrc}
      alt={normalizedAlt}
      width={w}
      height={h}
      className={className}
      loading={loading}
      {...rest}
    />
  )
}
