import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { Search, X, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import {
  generateContextAwareQuery,
  type ImageContext,
} from '@/lib/image-context'
import { searchStockImages, type StockImageResult } from '@/lib/stock-image'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

interface ImageSwapPopoverProps {
  isOpen: boolean
  onClose: () => void
  anchorRect: DOMRect | null
  currentAlt: string
  onImageSelect: (newSrc: string) => void
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
export function validateImageFile(file: {
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
export function extractImageFiles(files: File[]): File[] {
  return files.filter((f) => f.type.startsWith('image/'))
}

type DisplayImage = {
  imageUrl: string
  /** "stock" for search results, "upload" for user-uploaded images */
  kind: 'stock' | 'upload'
  alt: string
}

export function ImageSwapPopover({
  isOpen,
  onClose,
  anchorRect,
  currentAlt,
  onImageSelect,
  context,
  imageWidth,
  imageHeight,
  sessionId,
}: ImageSwapPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<StockImageResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string>()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const w = imageWidth || DEFAULT_W
  const h = imageHeight || DEFAULT_H

  const generateUploadUrl = useMutation(api.sessions.generateImageUploadUrl)
  const saveUserImage = useMutation(api.sessions.saveUserImage)
  const userImages = useQuery(api.sessions.listUserImages, {
    sessionId: sessionId as Id<'sessions'>,
  })

  useEffect(() => {
    if (isOpen && currentAlt) {
      const initialQuery = generateContextAwareQuery(currentAlt, context)
      setSearchQuery(initialQuery)
    }
  }, [isOpen, currentAlt, context])

  // Reset results when query changes
  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setResults([])
      setHasMore(false)
      return
    }

    let cancelled = false

    const searchImages = async () => {
      setIsLoading(true)
      setError(undefined)
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
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchImages, 300)
    return () => {
      cancelled = true
      clearTimeout(debounceTimer)
    }
  }, [searchQuery, isOpen])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isLoading || !hasMore || !searchQuery.trim()) return

    const nextPage = page + 1
    setIsLoadingMore(true)

    try {
      const pageResults = await searchStockImages({
        query: searchQuery,
        w,
        h,
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
  }, [isLoadingMore, isLoading, hasMore, page, searchQuery])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen, loadMore])

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

        const { storageId } = (await res.json()) as {
          storageId: Id<'_storage'>
        }

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

  if (!anchorRect) return null

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <PopoverPrimitive.Anchor asChild>
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: anchorRect?.left ?? 0,
            top: anchorRect?.top ?? 0,
            width: anchorRect?.width ?? 0,
            height: anchorRect?.height ?? 0,
            pointerEvents: 'none',
          }}
        />
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="image-swap-popover z-[9999] flex max-h-[var(--radix-popover-content-available-height)] w-[520px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/95 shadow-2xl outline-none backdrop-blur-xl data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          {/* Search bar with upload button — input group */}
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 p-3.5">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-white/40" />
              <input
                type="text"
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
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
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
            ) : error ? (
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
            ) : !hasContent && searchQuery.trim() ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ImageIcon className="size-8 text-white/20" />
                <p className="text-sm text-white/40">No results found</p>
              </div>
            ) : (
              <>
                {uploadedImages.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                      Your uploads
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((result, index) => (
                        <button
                          key={`upload-${result.imageUrl}-${index}`}
                          type="button"
                          onClick={() => {
                            onImageSelect(result.imageUrl)
                            onClose()
                          }}
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

                {stockImages.length > 0 && (
                  <div>
                    {uploadedImages.length > 0 && (
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                        Stock photos
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {stockImages.map((result, index) => (
                        <button
                          key={`stock-${result.imageUrl}-${index}`}
                          type="button"
                          onClick={() => {
                            onImageSelect(result.imageUrl)
                            onClose()
                          }}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:border-cyan-300/50 hover:ring-2 hover:ring-cyan-300/30"
                          aria-label={`Select image ${index + 1}`}
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

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-1" />
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Loader2 className="size-4 animate-spin text-white/40" />
                    <span className="text-xs text-white/40">
                      Loading more...
                    </span>
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
