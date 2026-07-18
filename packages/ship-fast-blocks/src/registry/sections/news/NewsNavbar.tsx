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
 * NewsNavbar — sticky masthead header for a news / editorial publication. Thin
 * configuration over the shared `SiteNav` composite: a bold wordmark beside an
 * inline newspaper-glyph mark, a horizontal row of section links on desktop, a
 * "Subscribe" CTA on the right, and a real mobile drawer on small screens. Use
 * as the sticky site header for newspapers, magazines, online publications,
 * media brands or article-heavy blog indexes where a Subscribe action matters.
 * Renders fully with no props via baked-in "The Chronicle" defaults.
 */
function Masthead({ className }: { className?: string }) {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  )
}

export const NewsNavbar = defineCapsule({
  name: 'NewsNavbar',
  description:
    "Sticky news masthead header built on the shared SiteNav composite: a bold wordmark + inline newspaper-glyph mark, a horizontal row of section links on desktop, a 'Subscribe' CTA on the right, and a real mobile drawer. Use as the sticky site header for newspapers, magazines, online publications, media brands or article-heavy blog indexes where a Subscribe action matters.",
  props: z.object({
    /** Publication / masthead name shown beside the logo. */
    brand: z.string().optional(),
    /** Top-level navbar section labels (first item also drives the brand/home target). */
    nav: z.array(z.string()).optional(),
    /** Subscribe CTA label on the right. */
    subscribeCta: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['News', 'Politics', 'Business', 'Tech', 'Culture', 'Science', 'Health']
    const brand = props.brand ?? 'The Chronicle'
    const ctaLabel = props.subscribeCta ?? 'Subscribe'
    const ctaTarget = 'Subscribe'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <Masthead className="size-8 text-primary" />
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="text-xl font-bold tracking-tight" />
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
