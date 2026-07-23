import { Link } from '@tanstack/react-router'
import { ArrowLeft, Globe, SearchIcon } from 'lucide-react'
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
import {
  getOwnedAnonymousClientId,
  useOwnedGalleryController,
} from '../hooks/useGalleryController'

const PAGE_SIZE = 12

export const MinePage = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<GalleryCategory>('all')
  const [page, setPage] = useState(1)
  const [anonymousClientId, setAnonymousClientId] = useState<string>()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Resolve the stable anonymous owner id on the client. Signed-in users are
  // identified server-side via Convex auth, so this only scopes the anonymous
  // fallback path.
  useEffect(() => {
    setAnonymousClientId(getOwnedAnonymousClientId())
  }, [])

  const { gallery } = useOwnedGalleryController({
    category: category === 'all' ? '' : category,
    limit: PAGE_SIZE,
    page,
    search,
    anonymousClientId,
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
    <main className="sf-gallery-page sf-mine-page min-h-screen w-full bg-[#030511] text-slate-100">
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
                  My generations
                </p>
                <h1 className="truncate text-lg font-bold tracking-normal">
                  Your sessions
                </h1>
              </div>
              <Link
                className="ml-1 inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-semibold text-white/80 transition-colors hover:border-cyan-200/45 hover:text-white"
                to="/gallery"
              >
                <Globe className="size-3.5" />
                Public gallery
              </Link>
            </div>

            <InputGroup className="h-10 max-w-xl border-white/10 bg-white/[0.055] text-white shadow-[0_12px_42px_rgba(0,0,0,0.18)] focus-within:border-white/10 focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:!border-white/10 has-[[data-slot=input-group-control]:focus-visible]:!ring-0">
              <InputGroupAddon>
                <SearchIcon className="text-white/45" />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchInputRef}
                className="placeholder:text-white/35 focus-visible:!border-transparent focus-visible:!outline-none focus-visible:!ring-0"
                placeholder="Search your prompts, categories, sessions..."
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

            <GalleryGrid gallery={gallery} skeletonCount={PAGE_SIZE} />

            {gallery !== undefined && gallery.items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-8 text-center">
                <p className="text-sm text-white/56">
                  You haven&apos;t generated anything yet. Start a new website
                  from the home page and it will show up here — including
                  private generations.
                </p>
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px"
                  to="/"
                >
                  Start generating
                </Link>
              </div>
            ) : null}

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
