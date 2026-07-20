import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  NavbarRouteLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * KnowledgeBaseNavbar — "Terminal-docs" sticky reference-manual header for a
 * help-center / knowledge-base / support site. Built on the shared `SiteNav`
 * composite with backdrop blur preserved: a stroked book-glyph mark in primary
 * beside a mono wordmark on the left, desktop nav links rendered as mono
 * uppercase micro-labels with a `#` anchor glyph and a sliding hairline
 * underline in the center, and a square hairline mono "Search" pill carrying a
 * square `⌘K` kbd chip on the right (desktop), plus a real hamburger drawer on
 * mono/small screens. Calm, hairline-precise documentation aesthetic; the
 * brand, nav links and search pill all route through route hrefs so PageSwitch
 * can swap pages. Use as the sticky site header for help centers, support
 * portals, knowledge bases, docs landings or FAQ hubs. Renders fully with no
 * props via baked-in "Help Center" defaults.
 */
export const KnowledgeBaseNavbar = defineCapsule({
  name: 'KnowledgeBaseNavbar',
  description:
    "Terminal-docs sticky reference-manual header for a help-center / knowledge-base / support site built on the shared SiteNav composite with backdrop blur preserved: a stroked book-glyph mark in primary beside a mono wordmark, desktop nav links as mono uppercase micro-labels with a '#' anchor glyph and a sliding hairline underline, and a square hairline mono 'Search' pill with a square '⌘K' kbd chip (desktop), plus a real hamburger drawer on small screens. Calm, hairline-precise documentation aesthetic; brand, nav links and search pill route through route hrefs for page-switching. Use as the sticky site header for help centers, support portals, knowledge bases, docs landings or FAQ hubs.",
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
    const brand = props.brand ?? 'Help Center'
    const nav = props.nav?.length
      ? props.nav
      : ['Categories', 'Guides', 'FAQ', 'Contact']
    const searchLabel = props.searchLabel ?? 'Search'
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Categories'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={cn('text-primary', className)}
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
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
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
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
        containerClassName="max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand
          href={homeTarget}
          className="min-w-0"
          aria-label={`${brand} home`}
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7" />}
            />
            <LogoLabel className="truncate font-mono text-base font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'relative items-center gap-1.5 whitespace-nowrap rounded-none px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-150 before:mr-0.5 before:font-normal before:text-muted-foreground/50 before:content-["#"] after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 hover:bg-transparent hover:text-foreground hover:after:scale-x-100',
                i > 3 ? 'hidden lg:inline-flex' : 'inline-flex',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2">
          <NavbarRouteLink
            href={searchLabel}
            className="hidden items-center gap-2 rounded-none border border-border bg-muted/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:text-foreground active:translate-y-px sm:inline-flex"
            aria-label="Search help articles"
          >
            <SearchIcon className="size-4" />
            <span>{searchLabel}</span>
            <kbd className="hidden select-none rounded-none border border-border bg-background px-1.5 py-0.5 text-[11px] lg:inline-block">
              ⌘K
            </kbd>
          </NavbarRouteLink>
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
        </NavbarActions>
      </SiteNav>
    )
  },
})
