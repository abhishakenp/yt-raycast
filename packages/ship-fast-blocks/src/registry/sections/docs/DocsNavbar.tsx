import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * DocsNavbar — sticky site header for a developer DOCUMENTATION / API-reference
 * site. Thin configuration over the shared `SiteNav` composite: a clean
 * stacked-blocks brand mark beside the product wordmark, desktop section links,
 * a "Get Started" CTA, and a real mobile drawer (Sheet) on small screens. Every
 * link routes through SiteNav's route hrefs so PageSwitch can swap pages, and
 * nav labels match site routes. Use as the sticky header for docs homes, API
 * references, SDK guides, developer portals, or knowledge bases. Renders fully
 * with no props via baked-in "StackForge" defaults.
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
    "Sticky developer DOCUMENTATION / API-reference site header built on the shared SiteNav composite: a clean stacked-blocks brand mark + product wordmark, desktop section links, a 'Get Started' CTA, and a real mobile drawer. Links route through route hrefs for page-switching and nav labels match site routes. Use as the sticky header for docs homes, API references, SDK guides, developer portals, or knowledge bases.",
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
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <StackedBlocksMark className="size-8 text-primary" />
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="text-xl font-medium text-foreground" />
          </Logo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
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
