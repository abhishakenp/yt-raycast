import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
/**
 * DocsNavbar — "Terminal-docs" sticky reference-manual header for a developer
 * DOCUMENTATION / API-reference site. Built on the shared `SiteNav` composite:
 * a stacked-blocks mark beside a mono wordmark, desktop nav links rendered as
 * mono uppercase micro-labels with a `#` anchor glyph and a sliding hairline
 * underline (labels past the fourth demote to lg to keep the bar airy), and a
 * square hard-offset-shadow "Get Started" CTA with press feedback. Backdrop
 * blur is preserved and every link routes through SiteNav's route hrefs so
 * PageSwitch can swap pages; a real mobile drawer covers small screens. Use as
 * the sticky header for docs homes, API references, SDK guides, developer
 * portals, or knowledge bases. Renders fully with no props via baked-in
 * "StackForge" defaults.
 */
function StackedBlocksMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}

export const DocsNavbar = defineCapsule({
  name: 'DocsNavbar',
  description:
    "Terminal-docs sticky reference-manual header for a developer DOCUMENTATION / API-reference site built on the shared SiteNav composite: a stacked-blocks mark beside a mono wordmark, desktop nav links as mono uppercase micro-labels with a '#' anchor glyph and sliding hairline underline, and a square hard-offset-shadow 'Get Started' CTA with press feedback, plus a real mobile drawer. Links route through route hrefs for page-switching and nav labels match site routes. Use as the sticky header for docs homes, API references, SDK guides, developer portals, or knowledge bases.",
  props: z.object({
    /** Brand / product name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Getting Started', 'API Reference', 'SDKs', 'Changelog']
    const brand = props.brand ?? 'StackForge'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Getting Started'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="min-w-0">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<StackedBlocksMark className="size-7 text-primary" />}
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
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[3px_3px_0_0] shadow-foreground/20 transition-[background-color,box-shadow,transform] duration-150 active:translate-y-px active:shadow-none sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
