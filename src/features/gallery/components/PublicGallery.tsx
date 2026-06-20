import { Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { ArrowRight, ChevronLeft, ChevronRight, Timer } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'
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

export type GallerySession = {
  id?: string
  sessionId: string
  prompt?: string
  status?: string | null
  previewVersion?: number
  createdAt?: number
  updatedAt?: number
  elapsed?: number | null
  cost?: number | null
  html?: string | null
  moduleSource?: string | null
  preferredLanguage?: string | null
  siteSpecJson?: string | null
  imageUrl?: string | null
  categories?: string[]
  homepageReady?: boolean | null
  siteSpecReady?: boolean | null
  openuiReady?: boolean | null
  readiness?: {
    homepageReady?: boolean | null
    siteSpecReady?: boolean | null
    openuiReady?: boolean | null
    previewReady?: boolean | null
  }
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

const getPromptTitle = (prompt?: string) => {
  const cleaned = prompt?.trim()
  if (cleaned === undefined || cleaned.length === 0) return 'Generated website'

  return cleaned
}

const isEditableElement = (element: Element | null): boolean =>
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLInputElement ||
  (element as HTMLElement | null)?.isContentEditable === true

const formatGenerationTime = (elapsed?: number | null) => {
  if (typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < 0)
    return undefined

  const seconds = elapsed / 1000
  if (seconds < 1) return '<1s'
  if (seconds < 10) return `${seconds.toFixed(1)}s`
  if (seconds < 60) return `${Math.round(seconds)}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  if (remainingSeconds === 0) return `${minutes}m`

  return `${minutes}m ${remainingSeconds}s`
}

const getGalleryImageUrl = (session: GallerySession): string => {
  const imageUrl = session.imageUrl?.trim()
  if (imageUrl) return imageUrl

  const version = encodeURIComponent(String(session.previewVersion ?? 0))
  return `/api/sessions/${encodeURIComponent(session.sessionId)}/gallery-thumb?v=${version}`
}

const getPreviewDocument = (html?: string | null) => {
  if (!html?.trim()?.length) return undefined
  if (
    html.includes('id="ship-fast-generated-module"') &&
    !html.includes('<main')
  ) {
    return undefined
  }

  return html
}

const getModuleSource = (source?: string | null) => {
  const cleaned = source?.trim()
  return cleaned && cleaned.length > 0 ? cleaned : undefined
}

export const GalleryCategoryTabs = ({
  category,
  categories,
  onChange,
}: {
  category: GalleryCategory
  categories?: GalleryCategoryOption[]
  onChange: (category: GalleryCategory) => void
}) => {
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

const GalleryPreview = ({ session }: { session: GallerySession }) => {
  const title = getPromptTitle(session.prompt)
  const moduleSource = getModuleSource(session.moduleSource)
  const previewDocument = getPreviewDocument(session.html)
  const imageSrc =
    moduleSource === undefined && previewDocument === undefined
      ? getGalleryImageUrl(session)
      : ''
  const [resolvedImageSrc, setResolvedImageSrc] = useState(() =>
    imageSrc.startsWith('/api/sessions/') ? '' : imageSrc,
  )

  useEffect(() => {
    if (!imageSrc.startsWith('/api/sessions/')) {
      setResolvedImageSrc(imageSrc)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | undefined
    setResolvedImageSrc('')

    const resolveImage = async () => {
      try {
        const response = await fetch(imageSrc, { signal: controller.signal })
        if (!response.ok) throw new Error(`thumbnail ${response.status}`)
        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setResolvedImageSrc(objectUrl)
      } catch {
        if (!controller.signal.aborted) setResolvedImageSrc('')
      }
    }

    void resolveImage()

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [imageSrc])

  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#050816]">
      {moduleSource !== undefined ? (
        <div className="pointer-events-none h-[250%] w-[250%] origin-top-left scale-[0.4] overflow-hidden bg-background text-foreground">
          <GeneratedModulePreview
            source={moduleSource}
            sessionId={session.sessionId}
            siteSpecJson={session.siteSpecJson ?? undefined}
            locale={session.preferredLanguage ?? undefined}
            prompt={session.prompt}
            isDark
          />
        </div>
      ) : previewDocument !== undefined ? (
        <div className="pointer-events-none h-[250%] w-[250%] origin-top-left scale-[0.4] overflow-hidden bg-background text-foreground">
          <div
            className="size-full"
            dangerouslySetInnerHTML={{ __html: previewDocument }}
          />
        </div>
      ) : resolvedImageSrc ? (
        <img
          src={resolvedImageSrc}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_78%_30%,rgba(168,85,247,0.16),transparent_36%),linear-gradient(135deg,#050816,#111827)]"
          aria-label={title}
        />
      )}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/8" />
    </div>
  )
}

const GalleryCard = ({
  onHoverEnd,
  onHoverStart,
  session,
}: {
  onHoverEnd: (sessionId: string) => void
  onHoverStart: (sessionId: string) => void
  session: GallerySession
}) => {
  const generationTime = formatGenerationTime(session.elapsed)

  return (
    <Link
      className="group block overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-colors hover:border-cyan-200/50 hover:bg-white/[0.075]"
      to="/generate/$sessionId"
      params={{ sessionId: session.sessionId }}
      data-gallery-session-id={session.sessionId}
      onPointerEnter={() => onHoverStart(session.sessionId)}
      onPointerLeave={() => onHoverEnd(session.sessionId)}
    >
      <GalleryPreview session={session} />
      <div className="sf-gallery-card-body p-4">
        <p className="mb-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-100">
          {getPromptTitle(session.prompt)}
        </p>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {(session.categories?.length ? session.categories : ['website'])
              .slice(0, 2)
              .map((category) => (
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

const GallerySkeletonCard = ({ index }: { index: number }) => (
  <div
    className={cn(
      'overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.22)]',
      index % 3 === 1 && 'opacity-90',
      index % 3 === 2 && 'opacity-80',
    )}
  >
    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#050816]">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_26%,rgba(168,85,247,0.18),transparent_35%),linear-gradient(135deg,#050816,#111827)]" />
      <div className="absolute left-5 right-5 top-4 flex items-center justify-between">
        <div className="h-2 w-24 rounded-full bg-white/15" />
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-white/18" />
          <span className="size-2 rounded-full bg-white/18" />
          <span className="size-2 rounded-full bg-white/18" />
        </div>
      </div>
      <div className="absolute left-5 top-14 h-5 w-2/3 rounded bg-white/14" />
      <div className="absolute bottom-4 left-5 right-5 grid grid-cols-3 gap-2">
        <span className="h-8 rounded-md bg-white/10" />
        <span className="h-8 rounded-md bg-white/10" />
        <span className="h-8 rounded-md bg-white/10" />
      </div>
    </div>
    <div className="space-y-3 p-4">
      <div className="h-3 w-28 rounded bg-white/12" />
      <div className="h-4 w-full rounded bg-white/10" />
      <div className="h-4 w-4/5 rounded bg-white/10" />
      <div className="flex justify-between">
        <div className="h-5 w-24 rounded-full bg-white/10" />
        <div className="h-3 w-8 rounded bg-white/10" />
      </div>
    </div>
  </div>
)

export const GalleryGrid = ({
  className,
  gallery,
  skeletonCount = 6,
}: {
  className?: string
  gallery?: GalleryPayload
  skeletonCount?: number
}) => {
  const deleteMine = useMutation(api.sessions.deleteMine)
  const hoveredSessionIdRef = useRef<string | null>(null)
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
        .catch(() => undefined)
    },
    [deleteMine],
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

  const items = gallery.items.filter(
    (session) => !deletedSessionIds.has(session.sessionId),
  )

  return (
    <div
      className={cn(
        'sf-gallery-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((session) => (
        <GalleryCard
          key={session.sessionId}
          session={session}
          onHoverEnd={handleCardHoverEnd}
          onHoverStart={handleCardHoverStart}
        />
      ))}
    </div>
  )
}

export const GalleryPagination = ({
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
}) => (
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
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/80 transition-colors hover:border-cyan-200/45 hover:text-white"
          to="/gallery"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <GalleryGrid
        gallery={gallery}
        skeletonCount={12}
        className="lg:grid-cols-4"
      />
    </section>
  )
}
