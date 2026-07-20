import { Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Timer,
  UserIcon,
} from 'lucide-react'
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

type DeleteMineFn = (args: {
  anonymousClientId: string
  sessionId: Id<'sessions'>
}) => Promise<{ deleted: number }>

class SilentErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Swallow errors silently — delete functionality is optional.
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function DeleteMineProvider({
  mutationRef,
}: {
  mutationRef: RefObject<DeleteMineFn | null>
}) {
  const deleteMine = useMutation(api.sessions.deleteMine)
  mutationRef.current = deleteMine as DeleteMineFn
  return null
}

import { Button } from '@/components/ui/button'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'
import { cn } from '@/lib/utils'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

import { useGalleryController } from '../hooks/useGalleryController'

export type GalleryCategory = string

export type GalleryCategoryOption = {
  count: number
  label: string
  value: string
}

/**
 * Minimal metadata returned by the gallery LIST endpoints.
 *
 * Only what the card chrome needs: sessionId (for link + preview fetch),
 * prompt (title), categories (tags), elapsed (generation time), and
 * openuiReady (status badge).  Preview HTML is fetched per-card by
 * `GalleryCardPreview` via the per-session thumbnail endpoint.
 */
export type GallerySession = {
  sessionId: string
  prompt?: string
  categories?: string[]
  elapsed?: number | null
  openuiReady?: boolean | null
  updatedAt?: number | null
}

export type GalleryPayload = {
  items: GallerySession[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  availableCategories?: GalleryCategoryOption[]
}

function getPromptTitle(prompt?: string) {
  const cleaned = prompt?.trim()
  if (cleaned === undefined || cleaned.length === 0) return 'Generated website'

  return cleaned
}

function isEditableElement(element: Element | null): boolean {
  return (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLInputElement ||
    (element as HTMLElement | null)?.isContentEditable === true
  )
}

function formatGenerationTime(elapsed?: number | null) {
  if (typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < 0)
    return undefined

  const seconds = elapsed / 1000
  if (seconds < 1) return '<1s'
  if (seconds < 10) return `${seconds.toFixed(1)}s`

  const roundedSeconds = Math.round(seconds)
  if (roundedSeconds < 60) return `${roundedSeconds}s`

  if (roundedSeconds >= 3600) {
    const hours = Math.floor(roundedSeconds / 3600)
    const minutes = Math.floor((roundedSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const minutes = Math.floor(roundedSeconds / 60)
  const remainingSeconds = roundedSeconds % 60
  if (remainingSeconds === 0) return `${minutes}m`

  return `${minutes}m ${remainingSeconds}s`
}

function getGalleryCardAriaLabel(session: GallerySession): string {
  const title = getPromptTitle(session.prompt)
  const generationTime = formatGenerationTime(session.elapsed)
  return generationTime
    ? `${title}, generated in ${generationTime}`
    : `Open ${title}`
}

function getGalleryPreviewImageSrc(session: GallerySession): string {
  const base = `/api/images/${encodeURIComponent(session.sessionId)}`
  if (
    typeof session.updatedAt !== 'number' ||
    !Number.isFinite(session.updatedAt)
  ) {
    return base
  }

  return `${base}?v=${encodeURIComponent(String(session.updatedAt))}`
}

function GalleryCardPreview({ session }: { session: GallerySession }) {
  const title = getPromptTitle(session.prompt)

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#050816]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_78%_30%,rgba(168,85,247,0.16),transparent_36%),linear-gradient(135deg,#050816,#111827)]"
        aria-label={title}
      />
      <img
        src={getGalleryPreviewImageSrc(session)}
        alt=""
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/8" />
    </div>
  )
}

export function GalleryCategoryTabs({
  category,
  categories,
  onChange,
}: {
  category: GalleryCategory
  categories?: GalleryCategoryOption[]
  onChange: (category: GalleryCategory) => void
}) {
  if (categories === undefined) {
    return (
      <div
        className="flex min-w-0 flex-wrap items-center gap-2"
        aria-label="Gallery categories"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-9 animate-pulse rounded-full border border-white/10 bg-white/[0.055]',
              index === 0 ? 'w-16' : 'w-24',
            )}
          />
        ))}
      </div>
    )
  }

  const tabs = [{ label: 'All', value: 'all', count: 0 }, ...categories]

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-2"
      aria-label="Gallery categories"
    >
      {tabs.map((item) => (
        <button
          key={item.value}
          type="button"
          className={cn(
            'h-9 rounded-full border px-3 text-xs font-semibold text-white/58 transition-colors hover:border-cyan-200/45 hover:text-white',
            category === item.value
              ? 'border-cyan-200/55 bg-cyan-300/12 text-cyan-100'
              : 'border-white/10 bg-white/[0.045]',
          )}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function GalleryCard({
  onHoverEnd,
  onHoverStart,
  session,
}: {
  onHoverEnd: (sessionId: string) => void
  onHoverStart: (sessionId: string) => void
  session: GallerySession
}) {
  const generationTime = formatGenerationTime(session.elapsed)

  return (
    <Link
      className="group block overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-colors hover:border-cyan-200/50 hover:bg-white/[0.075]"
      to="/generate/$sessionId/$"
      params={{ sessionId: session.sessionId }}
      preload="intent"
      aria-label={getGalleryCardAriaLabel(session)}
      data-gallery-session-id={session.sessionId}
      onPointerEnter={() => onHoverStart(session.sessionId)}
      onPointerLeave={() => onHoverEnd(session.sessionId)}
    >
      <GalleryCardPreview session={session} />
      <div className="sf-gallery-card-body p-4">
        <p className="mb-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-100">
          {getPromptTitle(session.prompt)}
        </p>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {(session.categories?.length
              ? session.categories
              : ['website']
            ).map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-[11px] capitalize text-white/48"
              >
                {category}
              </span>
            ))}
          </div>
          {generationTime !== undefined ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan-200/15 bg-cyan-300/[0.055] px-2 py-0.5 text-[11px] font-medium text-cyan-100/72"
              aria-label={`Generated in ${generationTime}`}
            >
              <Timer className="size-3" aria-hidden="true" />
              {generationTime}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function GallerySkeletonCard({ index }: { index: number }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.22)]',
        index % 3 === 1 && 'opacity-90',
        index % 3 === 2 && 'opacity-80',
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#050816]">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_26%,rgba(168,85,247,0.18),transparent_35%),linear-gradient(135deg,#050816,#111827)]" />
      </div>
      <div className="sf-gallery-card-body p-4">
        <div className="mb-3 min-h-10 text-sm leading-5">
          <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            <span className="h-5 w-14 animate-pulse rounded-full bg-white/10" />
            <span className="h-5 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
          <span className="h-5 w-12 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}

type GalleryEmptyStateVariant = 'filtered' | 'gallery' | 'home'

function GalleryEmptyState({
  variant = 'gallery',
}: {
  variant?: GalleryEmptyStateVariant
}) {
  const isFilteredVariant = variant === 'filtered'
  const isHomeVariant = variant === 'home'

  return (
    <div className="sf-gallery-empty col-span-full grid min-h-[360px] place-items-center rounded-[8px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_28rem),linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-6 py-14 text-center shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
      <div className="max-w-md">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">
          No previews yet
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-normal text-white">
          {isFilteredVariant
            ? 'No matching previews'
            : isHomeVariant
              ? 'Fresh launches will appear here'
              : 'Generate a site to fill this wall'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/52">
          {isFilteredVariant
            ? 'Try a different search or category, or start a fresh generation from the homepage.'
            : isHomeVariant
              ? 'The first public previews will land in this gallery as soon as a website is ready.'
              : 'Public previews appear here after a website is ready. Start a new generation from the homepage and come back when it lands.'}
        </p>
        {isHomeVariant ? null : (
          <Link
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/12 px-4 text-sm font-semibold text-cyan-50 transition-colors hover:border-cyan-100/45 hover:bg-cyan-300/18"
            to="/"
          >
            Start from home
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  )
}

export function GalleryGrid({
  className,
  emptyStateVariant = 'gallery',
  gallery,
  skeletonCount = 6,
}: {
  className?: string
  emptyStateVariant?: GalleryEmptyStateVariant
  gallery?: GalleryPayload
  skeletonCount?: number
}) {
  const deleteMineRef = useRef<DeleteMineFn | null>(null)

  return (
    <>
      <SilentErrorBoundary>
        <DeleteMineProvider mutationRef={deleteMineRef} />
      </SilentErrorBoundary>
      <GalleryGridInner
        className={className}
        emptyStateVariant={emptyStateVariant}
        gallery={gallery}
        skeletonCount={skeletonCount}
        deleteMineRef={deleteMineRef}
      />
    </>
  )
}

function GalleryGridInner({
  className,
  emptyStateVariant = 'gallery',
  gallery,
  skeletonCount = 6,
  deleteMineRef,
}: {
  className?: string
  emptyStateVariant?: GalleryEmptyStateVariant
  gallery?: GalleryPayload
  skeletonCount?: number
  deleteMineRef: RefObject<DeleteMineFn | null>
}) {
  const hoveredSessionIdRef = useRef<string | null>(null)
  const deletionInFlightRef = useRef(new Set<string>())
  const [deleteError, setDeleteError] = useState<string>()
  const [deletedSessionIds, setDeletedSessionIds] = useState<Set<string>>(
    () => new Set(),
  )

  const handleCardHoverStart = useCallback((sessionId: string) => {
    hoveredSessionIdRef.current = sessionId
  }, [])

  const handleCardHoverEnd = useCallback((sessionId: string) => {
    if (hoveredSessionIdRef.current === sessionId) {
      hoveredSessionIdRef.current = null
    }
  }, [])

  const deleteHoveredSession = useCallback(
    (sessionId: string) => {
      if (deletionInFlightRef.current.has(sessionId)) return
      const deleteMine = deleteMineRef.current
      if (!deleteMine) {
        setDeleteError('Delete unavailable')
        return
      }

      deletionInFlightRef.current.add(sessionId)
      setDeleteError(undefined)
      const anonymousClientId = createAnonymousClientId(window.localStorage)
      void deleteMine({
        anonymousClientId,
        sessionId: sessionId as Id<'sessions'>,
      })
        .then((result) => {
          if (result.deleted <= 0) return
          if (hoveredSessionIdRef.current === sessionId) {
            hoveredSessionIdRef.current = null
          }
          setDeletedSessionIds((current) => {
            const next = new Set(current)
            next.add(sessionId)
            return next
          })
        })
        .catch((error: unknown) => {
          setDeleteError(
            error instanceof Error && error.message.trim()
              ? error.message
              : 'Delete unavailable',
          )
        })
        .finally(() => {
          deletionInFlightRef.current.delete(sessionId)
        })
    },
    [deleteMineRef],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'd' ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        isEditableElement(document.activeElement)
      ) {
        return
      }

      const hoveredSessionId = hoveredSessionIdRef.current
      if (hoveredSessionId === null) return

      event.preventDefault()
      event.stopImmediatePropagation()
      deleteHoveredSession(hoveredSessionId)
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [deleteHoveredSession])

  if (gallery === undefined) {
    return (
      <div
        className={cn(
          'sf-gallery-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
          className,
        )}
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <GallerySkeletonCard key={index} index={index} />
        ))}
      </div>
    )
  }

  const rawItems = Array.isArray(gallery?.items) ? gallery.items : []
  // Ignore malformed gallery rows (null entries, non-object shapes, or rows
  // missing a sessionId) instead of crashing the preview grid.
  const validItems = rawItems.filter(
    (session): session is GallerySession =>
      session !== null &&
      typeof session === 'object' &&
      typeof session.sessionId === 'string' &&
      session.sessionId !== '',
  )
  const items = validItems.filter(
    (session) => !deletedSessionIds.has(session.sessionId),
  )
  const isEmpty = items.length === 0

  return (
    <>
      {deleteError ? (
        <p
          className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"
          role="alert"
        >
          {deleteError}
        </p>
      ) : null}
      <div
        className={cn(
          'sf-gallery-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
          className,
        )}
      >
        {isEmpty ? (
          <GalleryEmptyState variant={emptyStateVariant} />
        ) : (
          items.map((session) => (
            <GalleryCard
              key={session.sessionId}
              session={session}
              onHoverEnd={handleCardHoverEnd}
              onHoverStart={handleCardHoverStart}
            />
          ))
        )}
      </div>
    </>
  )
}
export function GalleryPagination({
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  page,
  totalPages,
}: {
  hasNext: boolean
  hasPrev: boolean
  onNext: () => void
  onPrev: () => void
  page: number
  totalPages: number
}) {
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Gallery pages"
    >
      <p className="text-sm text-white/48">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          disabled={!hasPrev}
          onClick={onPrev}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          disabled={!hasNext}
          onClick={onNext}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}

export const HomeGallerySection = () => {
  const { gallery } = useGalleryController({ limit: 12 })

  return (
    <section
      className="sf-home-gallery-section mb-16 mt-12 rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] md:p-6"
      aria-live="polite"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200">
            Gallery
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-white">
            See what other speedsters generated
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/80 transition-colors hover:border-cyan-200/45 hover:text-white"
            to="/mine"
          >
            <UserIcon className="size-4" />
            My generations
          </Link>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/80 transition-colors hover:border-cyan-200/45 hover:text-white"
            to="/gallery"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <GalleryGrid
        emptyStateVariant="home"
        gallery={gallery}
        skeletonCount={12}
        className="lg:grid-cols-4"
      />
    </section>
  )
}
