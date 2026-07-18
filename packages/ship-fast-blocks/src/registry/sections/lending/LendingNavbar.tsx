import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * LendingNavbar — sticky, translucent top navigation bar for a personal-lending
 * / loan marketing site. A backdrop-blurred, border-bottomed header pinned to the
 * top of the viewport: a near-ink rounded logo tile beside the lender name on the
 * left, a horizontal set of nav links in the center (desktop), and a "Sign In"
 * text link plus a solid primary "Apply Now" CTA on the right. Every nav item and
 * CTA routes through route hrefs so labels can drive page-switching. Use as the
 * clean, trustworthy site header for personal-loan lenders, lending marketplaces,
 * debt-consolidation services, fintech credit products, or financing brands.
 * Renders fully with no props via baked-in "ClearLoan" defaults.
 */
export const LendingNavbar = defineCapsule({
  name: 'LendingNavbar',
  description:
    "Sticky translucent top navigation bar for a personal-lending / loan marketing site: backdrop-blurred, border-bottomed header pinned to the top with a near-ink rounded logo tile + lender name on the left, horizontal nav links in the center (desktop), and a 'Sign In' text link plus a solid primary 'Apply Now' CTA on the right. Nav items and CTA route through route hrefs for page-switching. Use as the clean, trustworthy site header for personal-loan lenders, lending marketplaces, debt-consolidation services, fintech credit products, or financing brands.",
  props: z.object({
    /** Brand / lender name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Secondary text link on the right (account sign-in). */
    signIn: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    /** Route target fired by the primary CTA (apply / check-rate flow). */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'ClearLoan'
    const nav = props.nav?.length
      ? props.nav
      : ['How it Works', 'Rate Calculator', 'Rates & Terms', 'FAQ']
    const signIn = props.signIn ?? 'Sign In'
    const cta = props.cta ?? 'Apply Now'
    const ctaTarget = props.ctaTarget ?? 'Check Your Rate'
    const LogoIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
            <LogoIcon className="size-5" />
          </span>
          <span className="text-xl font-semibold text-foreground">{brand}</span>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <NavbarRouteLink
            href={signIn}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {signIn}
          </NavbarRouteLink>
          <NavbarCta variant="primary" href={ctaTarget} className="px-5 py-2.5">
            {cta}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
