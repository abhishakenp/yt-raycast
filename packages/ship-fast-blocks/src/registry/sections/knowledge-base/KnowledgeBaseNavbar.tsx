import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * KnowledgeBaseNavbar — sticky, translucent top navigation bar for a help-center
 * / knowledge-base / support site. A backdrop-blurred, border-bottomed header
 * pinned to the top: a solid rounded brand tile with a book glyph + wordmark on
 * the left, a horizontal set of nav links in the center, and a compact muted
 * "Search" pill with a ⌘K hint on the right (desktop), plus a hamburger menu on
 * mobile. Calm, light, editorial documentation aesthetic. Brand button, nav
 * links and the search pill all route through useNavigate. Use as the sticky
 * site header for help centers, support portals, knowledge bases, docs landings
 * or FAQ hubs. Renders fully with no props via baked-in "Help Center" defaults.
 */
export const KnowledgeBaseNavbar = defineCapsule({
  name: 'KnowledgeBaseNavbar',
  description:
    "Sticky translucent top navigation bar for a help-center / knowledge-base / support site: backdrop-blurred, border-bottomed header pinned to the top with a solid rounded brand tile (book glyph) + wordmark on the left, horizontal nav links in the center, and a compact muted 'Search' pill with a ⌘K hint on the right (desktop), plus a hamburger menu on mobile. Calm, light, editorial documentation aesthetic; brand, nav links and search pill route through useNavigate for page-switching. Use as the sticky site header for help centers, support portals, knowledge bases, docs landings or FAQ hubs.",
  props: z.object({
    /** Brand / help-center name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the compact search pill on the right. */
    searchLabel: z.string().optional(),
    /** Navigation target for the brand button / mobile menu (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Help Center'
    const nav = props.nav?.length
      ? props.nav
      : ['Categories', 'Guides', 'FAQ', 'Contact']
    const searchLabel = props.searchLabel ?? 'Search'
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Categories'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="15" y2="15" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2"
            aria-label={`${brand} home`}
          >
            <LogoMark className="size-8" />
            <span className="text-lg font-semibold text-foreground">
              {brand}
            </span>
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(searchLabel)}
              className="hidden items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex"
              aria-label="Search help articles"
            >
              <SearchIcon className="size-4" />
              <span>{searchLabel}</span>
              <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-xs lg:inline-block">
                ⌘K
              </kbd>
            </button>
            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={homeTarget}
              cta={{
                label: searchLabel,
                target: searchLabel,
                variant: 'ghost',
              }}
              buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
