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
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * NonprofitNavbar — warm mission-editorial sticky header for a nonprofit /
 * charity / NGO landing page. A backdrop-blurred, hairline-bordered bar pins to
 * the top with a hand-drawn sprout glyph beside a serif organization wordmark on
 * the left, quiet muted nav links on the right (desktop), and a single square
 * filled-primary "Donate" CTA with press feedback — the one accent moment — plus
 * a real mobile drawer (Sheet) on small screens. Every link and the CTA route
 * through route hrefs so labels can drive page-switching. Warm, human,
 * trustworthy — not corporate. Use as the sticky site header for nonprofits,
 * charities, NGOs, foundations, humanitarian or community organizations.
 * Renders fully with no props via baked-in "Roots of Hope" defaults.
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
    "Warm mission-editorial sticky nonprofit / charity / NGO site header on the shared SiteNav composite: a backdrop-blurred, hairline-bordered bar with a hand-drawn sprout glyph + serif organization wordmark on the left, quiet muted nav links on the right (desktop), a single square filled-primary 'Donate' CTA with press feedback as the one accent moment, and a real mobile drawer. Links and CTA route through route hrefs for page-switching. Warm, human, trustworthy — not corporate. Use as the sticky site header for nonprofits, charities, NGOs, foundations, humanitarian or community organizations.",
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
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Mission', 'Impact', 'Programs', 'Stories']
    const brand = props.brand ?? 'Roots of Hope'
    const ctaLabel = props.ctaLabel ?? 'Donate'
    const ctaTarget = props.ctaTarget ?? 'Donate'
    const homeTarget = props.homeTarget ?? nav[0]
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<SproutMark className="size-7 text-primary" />}
            />
            <LogoLabel className="font-serif text-xl font-medium tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="gap-8">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions className="gap-2">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 font-semibold transition-colors hover:bg-primary/90 active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
