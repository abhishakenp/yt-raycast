import { Link } from '@tanstack/react-router'
import { ArrowLeft, SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'

import {
  GalleryCategoryTabs,
  GalleryGrid,
  GalleryPagination,
  type GalleryCategory,
} from './PublicGallery'
import { useGalleryController } from '../hooks/useGalleryController'

const PAGE_SIZE = 12

export const GalleryPage = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<GalleryCategory>('all')
  const [page, setPage] = useState(1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hasActiveFilter = search.trim().length > 0 || category !== 'all'
  const { gallery } = useGalleryController({
    category: category === 'all' ? '' : category,
    limit: PAGE_SIZE,
    page,
    search,
  })

  const handleCategoryChange = (nextCategory: GalleryCategory) => {
    setCategory(nextCategory)
    setPage(1)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main className="sf-gallery-page min-h-screen w-full bg-[#030511] text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="sf-gallery-header sticky top-0 z-20 border-b border-white/10 bg-[#030511]/88 px-4 py-3 backdrop-blur-xl md:px-5">
          <div className="sf-gallery-header-inner mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.06] text-slate-200"
                to="/"
                aria-label="Back to home"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200">
                  Gallery
                </p>
                <h1 className="truncate text-lg font-bold tracking-normal">
                  Public Sessions
                </h1>
              </div>
            </div>

            <InputGroup className="h-10 max-w-xl border-white/10 bg-white/[0.055] text-white shadow-[0_12px_42px_rgba(0,0,0,0.18)] focus-within:border-white/10 focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:!border-white/10 has-[[data-slot=input-group-control]:focus-visible]:!ring-0">
              <InputGroupAddon>
                <SearchIcon className="text-white/45" />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchInputRef}
                className="placeholder:text-white/35 focus-visible:!border-transparent focus-visible:!outline-none focus-visible:!ring-0"
                placeholder="Search prompts, categories, sessions..."
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value)
                  setPage(1)
                }}
              />
              <InputGroupAddon align="inline-end" className="hidden sm:flex">
                <Kbd className="border-white/10 bg-white/[0.07] text-white/45">
                  ⌘K
                </Kbd>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </header>

        <section className="sf-gallery-section px-4 py-6 md:px-6">
          <div className="sf-gallery-container mx-auto flex max-w-7xl flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <GalleryCategoryTabs
                category={category}
                categories={gallery?.availableCategories}
                onChange={handleCategoryChange}
              />
              {gallery === undefined ? (
                <span className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
              ) : (
                <p className="text-sm text-white/45">
                  {gallery.total} previews
                </p>
              )}
            </div>

            <GalleryGrid
              emptyStateVariant={hasActiveFilter ? 'filtered' : 'gallery'}
              gallery={gallery}
              skeletonCount={PAGE_SIZE}
            />

            {gallery !== undefined ? (
              <GalleryPagination
                hasNext={gallery.hasNext}
                hasPrev={gallery.hasPrev}
                onNext={() =>
                  setPage((currentPage) =>
                    Math.min(currentPage + 1, gallery.totalPages),
                  )
                }
                onPrev={() =>
                  setPage((currentPage) => Math.max(currentPage - 1, 1))
                }
                page={gallery.page}
                totalPages={gallery.totalPages}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
