import { useState, useEffect, useRef, useCallback } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { Search, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import {
  generateContextAwareQuery,
  type ImageContext,
} from '@/lib/image-context'
import { searchStockImages, type StockImageResult } from '@/lib/stock-image'

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
}

const PER_PAGE = 10
const DEFAULT_W = 1200
const DEFAULT_H = 800

export function ImageSwapPopover({
  isOpen,
  onClose,
  anchorRect,
  currentAlt,
  onImageSelect,
  context,
  imageWidth,
  imageHeight,
}: ImageSwapPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<StockImageResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const w = imageWidth || DEFAULT_W
  const h = imageHeight || DEFAULT_H

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
          className="image-swap-popover z-[9999] flex max-h-[var(--radix-popover-content-available-height)] w-[420px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/95 shadow-2xl outline-none backdrop-blur-xl data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 p-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="w-full rounded-lg bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-300/50"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video animate-pulse rounded-lg bg-white/5"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ImageIcon className="size-8 text-white/20" />
                <p className="text-sm text-white/40">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ImageIcon className="size-8 text-white/20" />
                <p className="text-sm text-white/40">
                  {searchQuery.trim()
                    ? 'No results found'
                    : 'Enter a search query'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.imageUrl}-${index}`}
                      type="button"
                      onClick={() => {
                        onImageSelect(result.imageUrl)
                        onClose()
                      }}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:border-cyan-300/50 hover:ring-2 hover:ring-cyan-300/30"
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
                {!hasMore && results.length > 0 && (
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
