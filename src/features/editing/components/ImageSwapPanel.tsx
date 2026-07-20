import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type DragEvent as ReactDragEvent,
} from 'react'
import { useMutation, useQuery } from 'convex/react'
import {
  Search,
  Image as ImageIcon,
  Loader2,
  Upload,
  GalleryHorizontal,
  X,
} from 'lucide-react'
import { encodeMultiImageSrc } from '@ship-fast/blocks/multi-image-src'
import {
  generateContextAwareQuery,
  type ImageContext,
} from '@/lib/image-context'
import { searchStockImages, type StockImageResult } from '@/lib/stock-image'
import { readJsonOrThrow } from '@/lib/safe-fetch'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

/** Pure validation for user-uploaded image files. Returns null if valid,
 *  or an error message string explaining why the file is rejected. */
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

/** Extract image files from a FileList / drag-drop payload. */
function extractImageFiles(files: File[]): File[] {
  return files.filter((f) => f.type.startsWith('image/'))
}

interface ImageSwapPanelProps {
  currentAlt: string
  /** Fires on every selection change. Payload is a single URL (one image
   *  selected), an encodeMultiImageSrc JSON payload (multi-select → rendered
   *  as an auto-sliding carousel), or null (selection cleared). */
  onImageSelect: (payload: string | null) => void
  context?: ImageContext
  /** Target image's natural dimensions — used to request appropriately-sized
   *  photos from Pexels/Unsplash. Falls back to 1200x800 if unknown. */
  imageWidth?: number
  imageHeight?: number
  /** Session ID — required for user image uploads to Convex storage. */
  sessionId: string
}

const PER_PAGE = 10
const DEFAULT_W = 1200
const DEFAULT_H = 800

type DisplayImage = {
  imageUrl: string
  /** "stock" for search results, "upload" for user-uploaded images */
  kind: 'stock' | 'upload'
  alt: string
}

export function ImageSwapPanel({
  currentAlt,
  onImageSelect,
  context,
  imageWidth,
  imageHeight,
  sessionId,
}: ImageSwapPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<StockImageResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hasSearchedImages, setHasSearchedImages] = useState(false)
  const [error, setError] = useState<string>()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()
  // Ordered multi-selection — click toggles membership; order = slide order.
  const [selectedSrcs, setSelectedSrcs] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const appliedInitialQueryKeyRef = useRef<string | null>(null)
  const w = imageWidth || DEFAULT_W
  const h = imageHeight || DEFAULT_H
  const loadMoreStateRef = useRef({
    hasMore: true,
    h,
    isLoading: false,
    isLoadingMore: false,
    page: 1,
    searchQuery: '',
    w,
  })

  const generateUploadUrl = useMutation(api.sessions.generateImageUploadUrl)
  const saveUserImage = useMutation(api.sessions.saveUserImage)
  const userImages = useQuery(api.sessions.listUserImages, {
    sessionId: sessionId as Id<'sessions'>,
  })

  // Set the contextual default query when the selected image changes. The
  // toolbar keeps the panel mounted briefly during collapse animations, so a
  // fast image-to-image selection can reuse this component instance.
  useEffect(() => {
    const queryKey = JSON.stringify([currentAlt, context ?? null])
    if (appliedInitialQueryKeyRef.current === queryKey) return
    appliedInitialQueryKeyRef.current = queryKey
    // New target image → start from an empty selection.
    setSelectedSrcs([])

    if (!currentAlt.trim()) {
      setSearchQuery('')
      return
    }

    setSearchQuery(generateContextAwareQuery(currentAlt, context))
  }, [context, currentAlt])

  // Reset results when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasMore(false)
      setHasSearchedImages(false)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(undefined)
    setHasSearchedImages(false)

    const searchImages = async () => {
      setPage(1)
      setHasMore(true)

      try {
        const pageResults = await searchStockImages({
          query: searchQuery,
          w,
          h,
          page: 1,
          perPage: PER_PAGE,
        })
        if (cancelled) return
        setResults(pageResults)
        setHasMore(pageResults.length === PER_PAGE)
        setHasSearchedImages(true)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Search failed')
        setHasSearchedImages(false)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchImages, 300)
    return () => {
      cancelled = true
      clearTimeout(debounceTimer)
    }
  }, [searchQuery, w, h])

  useEffect(() => {
    loadMoreStateRef.current = {
      hasMore,
      h,
      isLoading,
      isLoadingMore,
      page,
      searchQuery,
      w,
    }
  }, [hasMore, h, isLoading, isLoadingMore, page, searchQuery, w])

  const loadMore = useCallback(async () => {
    const state = loadMoreStateRef.current
    const query = state.searchQuery.trim()
    if (state.isLoadingMore || state.isLoading || !state.hasMore || !query)
      return

    const nextPage = state.page + 1
    setIsLoadingMore(true)

    try {
      const pageResults = await searchStockImages({
        query,
        w: state.w,
        h: state.h,
        page: nextPage,
        perPage: PER_PAGE,
      })
      setResults((prev) => [...prev, ...pageResults])
      setPage(nextPage)
      setHasMore(pageResults.length === PER_PAGE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setIsLoadingMore(false)
    }
  }, [])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { root: scrollRef.current, rootMargin: '100px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, results.length])

  // ── File upload ──────────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateImageFile(file)
      if (validationError) {
        setUploadError(validationError)
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

  const handleDragEnter = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: ReactDragEvent<HTMLDivElement>) => {
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

  // ── Multi-select toggle ──────────────────────────────────────────────
  // 1 selected → plain URL (single swap, as before). 2+ selected → encoded
  // payload rendered as an auto-sliding carousel. 0 → clear the preview.
  const toggleImage = (url: string) => {
    const next = selectedSrcs.includes(url)
      ? selectedSrcs.filter((selected) => selected !== url)
      : [...selectedSrcs, url]
    setSelectedSrcs(next)
    onImageSelect(
      next.length === 0
        ? null
        : next.length === 1
          ? next[0]
          : encodeMultiImageSrc(next),
    )
  }

  // ── Build display list: uploaded images first, then stock results ────

  const uploadedImages: DisplayImage[] =
    userImages
      ?.filter((img): img is typeof img & { url: string } => img.url !== null)
      .map((img) => ({
        imageUrl: img.url,
        kind: 'upload' as const,
        alt: img.filename ?? 'Uploaded image',
      })) ?? []

  const stockImages: DisplayImage[] = results.map((r) => ({
    imageUrl: r.imageUrl,
    kind: 'stock' as const,
    alt: r.query,
  }))

  const allImages = [...uploadedImages, ...stockImages]
  const hasContent = allImages.length > 0

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex max-h-[400px] w-[32.5rem] max-w-[90vw] flex-col overflow-hidden"
    >
      {/* Search bar with upload button — input group */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 p-3.5">
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-white/40" />
          <input
            type="text"
            aria-label="Search stock images"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stock images..."
            autoFocus
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload image"
            className="absolute right-1.5 grid size-6 place-items-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-cyan-300 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
          </button>
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
      </div>

      {/* Pinned selection strip — selected images stay visible (and
          deselectable) even after the grid below re-searches or paginates
          them out of view. */}
      {selectedSrcs.length > 0 && (
        <div className="shrink-0 border-b border-cyan-300/20 bg-cyan-300/10 px-3 py-2">
          {selectedSrcs.length > 1 && (
            <div className="mb-1.5 flex items-center gap-2 text-xs text-cyan-200">
              <GalleryHorizontal className="size-3.5 shrink-0" />
              {selectedSrcs.length} images selected — they will display as an
              auto-sliding carousel
            </div>
          )}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
            {selectedSrcs.map((src, index) => (
              <button
                key={`selected-${src}-${index}`}
                type="button"
                onClick={() => {
                  toggleImage(src)
                }}
                aria-label={`Deselect image ${index + 1}`}
                className="group relative size-12 shrink-0 overflow-hidden rounded-md border border-cyan-300/60 ring-1 ring-cyan-300/30 transition-all hover:border-red-400/70 hover:ring-red-400/40"
              >
                <img
                  src={src}
                  alt={`Selected image ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-cyan-300 text-[10px] font-bold text-black">
                  {index + 1}
                </span>
                <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="size-4 text-red-300" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload error banner */}
      {uploadError && (
        <div className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
          {uploadError}
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-cyan-300/50 bg-[#0b0d14]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Upload className="size-8 text-cyan-300" />
            <p className="text-sm text-cyan-300">Drop images to upload</p>
          </div>
        </div>
      )}

      {/* Image grid — uploaded images first, then stock results */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading && !hasContent ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-white/5"
              />
            ))}
          </div>
        ) : error && !hasContent ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ImageIcon className="size-8 text-white/20" />
            <p className="text-sm text-white/40">{error}</p>
          </div>
        ) : !hasContent && !searchQuery.trim() ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ImageIcon className="size-8 text-white/20" />
            <p className="text-sm text-white/40">
              Search for images or upload your own
            </p>
          </div>
        ) : !hasContent && searchQuery.trim() && hasSearchedImages ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ImageIcon className="size-8 text-white/20" />
            <p className="text-sm text-white/40">No results found</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                {error}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                  Your uploads
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((result, index) => {
                    const selectionIndex = selectedSrcs.indexOf(result.imageUrl)
                    return (
                      <button
                        key={`upload-${result.imageUrl}-${index}`}
                        type="button"
                        onClick={() => {
                          toggleImage(result.imageUrl)
                        }}
                        aria-pressed={selectionIndex !== -1}
                        className={`group relative aspect-square overflow-hidden rounded-lg border bg-white/5 transition-all ${
                          selectionIndex !== -1
                            ? 'border-cyan-300 ring-2 ring-cyan-300/60'
                            : 'border-cyan-300/30 hover:border-cyan-300/60 hover:ring-2 hover:ring-cyan-300/30'
                        }`}
                        aria-label={`Select uploaded image ${index + 1}`}
                      >
                        <img
                          src={result.imageUrl}
                          alt={result.alt}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        {selectionIndex !== -1 && (
                          <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-cyan-300 text-[11px] font-bold text-black">
                            {selectionIndex + 1}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {stockImages.length > 0 && (
              <div>
                {uploadedImages.length > 0 && (
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                    Stock photos
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {stockImages.map((result, index) => {
                    const selectionIndex = selectedSrcs.indexOf(result.imageUrl)
                    return (
                      <button
                        key={`stock-${result.imageUrl}-${index}`}
                        type="button"
                        onClick={() => {
                          toggleImage(result.imageUrl)
                        }}
                        aria-pressed={selectionIndex !== -1}
                        className={`group relative aspect-square overflow-hidden rounded-lg border bg-white/5 transition-all ${
                          selectionIndex !== -1
                            ? 'border-cyan-300 ring-2 ring-cyan-300/60'
                            : 'border-white/10 hover:border-cyan-300/50 hover:ring-2 hover:ring-cyan-300/30'
                        }`}
                        aria-label={`Select image ${index + 1}`}
                      >
                        <img
                          src={result.imageUrl}
                          alt={result.alt}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        {selectionIndex !== -1 && (
                          <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-cyan-300 text-[11px] font-bold text-black">
                            {selectionIndex + 1}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-1" />
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="size-4 animate-spin text-white/40" />
                <span className="text-xs text-white/40">Loading more...</span>
              </div>
            )}
            {!hasMore && stockImages.length > 0 && (
              <p className="py-3 text-center text-xs text-white/30">
                No more images
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
