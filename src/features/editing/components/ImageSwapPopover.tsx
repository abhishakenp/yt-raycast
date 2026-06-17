import { useState, useEffect } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { Search, X, Image as ImageIcon } from 'lucide-react'
import { generateContextAwareQuery, type ImageContext } from '@/lib/image-context'
import { resolveStockImage } from '@/lib/stock-image'
import { cn } from '#/lib/utils'

interface ImageSwapPopoverProps {
  isOpen: boolean
  onClose: () => void
  anchorRect: DOMRect | null
  currentAlt: string
  onImageSelect: (newSrc: string) => void
  context?: ImageContext
}

type Source = 'pexels' | 'unsplash'

interface SearchResult {
  url: string
  source: 'pexels' | 'unsplash' | 'picsum'
  query: string
}

export function ImageSwapPopover({
  isOpen,
  onClose,
  anchorRect,
  currentAlt,
  onImageSelect,
  context,
}: ImageSwapPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [source, setSource] = useState<Source>('pexels')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (isOpen && currentAlt) {
      const initialQuery = generateContextAwareQuery(currentAlt, context)
      setSearchQuery(initialQuery)
    }
  }, [isOpen, currentAlt, context])

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setResults([])
      return
    }

    const searchImages = async () => {
      setIsLoading(true)
      setError(undefined)

      try {
        const queries = [searchQuery, `${searchQuery} professional`, `${searchQuery} high quality`]
        const searchResults: SearchResult[] = []

        for (const query of queries.slice(0, 6)) {
          const result = await resolveStockImage({ alt: query, w: 400, h: 300, context })
          searchResults.push({ url: result.imageUrl, source: result.source, query: result.query })
        }

        setResults(searchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchImages, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, source, isOpen, context])

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
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search images..." className="w-full rounded-lg bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-300/50" autoFocus />
            </div>
            <button type="button" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close"><X className="size-4" /></button>
          </div>
          <div className="flex shrink-0 gap-1 border-b border-white/10 p-2">
            <button type="button" onClick={() => setSource('pexels')} className={cn('flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors', source === 'pexels' ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white')}>Pexels</button>
            <button type="button" onClick={() => setSource('unsplash')} className={cn('flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors', source === 'unsplash' ? 'bg-cyan-300/20 text-cyan-100' : 'text-white/60 hover:bg-white/5 hover:text-white')}>Unsplash</button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {isLoading ? <div className="grid gap-2">{[...Array(6)].map((_, i) => <div key={i} className="aspect-video animate-pulse rounded-lg bg-white/5" />)}</div> : error ? <div className="flex flex-col items-center gap-2 py-8 text-center"><ImageIcon className="size-8 text-white/20" /><p className="text-sm text-white/40">{error}</p></div> : results.length === 0 ? <div className="flex flex-col items-center gap-2 py-8 text-center"><ImageIcon className="size-8 text-white/20" /><p className="text-sm text-white/40">{searchQuery.trim() ? 'No results found' : 'Enter a search query'}</p></div> : <div className="grid grid-cols-2 gap-2">{results.map((result, index) => <button key={`${result.url}-${index}`} type="button" onClick={() => { onImageSelect(result.url); onClose() }} className="group relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:border-cyan-300/50 hover:ring-2 hover:ring-cyan-300/30" aria-label={`Select image ${index + 1}`}><img src={result.url} alt={result.query} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" /><div className="absolute bottom-1.5 left-1.5 right-1.5"><span className="inline-block max-w-full truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/90">{result.source}</span></div></button>)}</div>}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
