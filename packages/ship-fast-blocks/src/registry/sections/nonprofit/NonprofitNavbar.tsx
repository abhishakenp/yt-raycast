import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
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
 * NonprofitNavbar — sticky site header for a nonprofit / charity / NGO landing
 * page. Thin configuration over the shared `SiteNav` composite: a layered
 * sprout-glyph logo mark beside the organization name on the left, desktop nav
 * links, and a pill-shaped primary "Donate" CTA on the right, plus a real
 * mobile drawer (Sheet) on small screens. Every link and the CTA route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for nonprofits, charities, NGOs, foundations, humanitarian or community
 * organizations. Renders fully with no props via baked-in "Roots of Hope"
 * defaults.
 */
function SproutMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22V12" />
      <path d="M12 12C12 8 9 5 4 5c0 5 3 8 8 8z" />
      <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 8" />
    </svg>
  )
}

export const NonprofitNavbar = defineCapsule({
  name: 'NonprofitNavbar',
  description:
    "Sticky nonprofit / charity / NGO site header built on the shared SiteNav composite: a layered sprout-glyph logo mark + organization name on the left, desktop nav links, a pill-shaped primary 'Donate' CTA on the right, and a real mobile drawer. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for nonprofits, charities, NGOs, foundations, humanitarian or community organizations.",
  props: z.object({
    /** Organization / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped primary Donate CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Mission', 'Impact', 'Programs', 'Stories']
    const brand = props.brand ?? 'Roots of Hope'
    const ctaLabel = props.ctaLabel ?? 'Donate'
    const ctaTarget = props.ctaTarget ?? 'Donate'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            <SproutMark className="size-8 text-primary" />
            <Logo brand={brand}>
              <LogoImage />
              <LogoLabel className="text-xl font-semibold tracking-tight" />
            </Logo>
          </button>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            onClick={() => go(ctaTarget)}
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
