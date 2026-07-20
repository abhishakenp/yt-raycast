import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
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
 * LendingNavbar — Swiss-fintech sticky site header for a personal-lending / loan
 * marketing site. A backdrop-blurred, hairline-bottomed header pinned to the top
 * that reads as an institutional trust bar: a runtime-swappable coin brand mark
 * beside the lender wordmark on the left, a horizontal row of desktop nav links
 * each prefixed with a mono tabular index numeral, and — on the right — a mono
 * "Sign In" text link plus a single square (binary-radius) primary "Apply Now"
 * CTA with mechanical press feedback. Every nav item and CTA routes through route
 * hrefs so labels can drive page-switching; the sign-in link keeps its auth
 * wiring. Use as the clean, trustworthy header for personal-loan lenders, lending
 * marketplaces, debt-consolidation services, fintech credit products, or
 * financing brands. Renders fully with no props via baked-in "ClearLoan" defaults.
 */
export const LendingNavbar = defineCapsule({
  name: 'LendingNavbar',
  description:
    "Swiss-fintech sticky top navigation bar for a personal-lending / loan marketing site: a backdrop-blurred, hairline-bottomed header pinned to the top that reads as an institutional trust bar, with a runtime-swappable coin brand mark + lender wordmark on the left, horizontal desktop nav links each prefixed with a mono tabular index numeral, and a mono 'Sign In' text link plus a single square (binary-radius) primary 'Apply Now' CTA with mechanical press feedback on the right. Nav items and CTA route through route hrefs for page-switching; the sign-in link keeps its auth wiring. Use as the clean, trustworthy header for personal-loan lenders, lending marketplaces, debt-consolidation services, fintech credit products, or financing brands.",
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
    const CoinMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
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
        <NavbarBrand href={nav[0]} className="flex items-center gap-2">
          <Logo brand={brand}>
            <LogoImage
              className="size-7"
              fallback={<CoinMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </Logo>
        </NavbarBrand>

        <NavbarNav className="gap-7">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none text-[13px] tracking-tight"
            >
              <span
                aria-hidden="true"
                className="mr-1.5 font-mono text-[10px] tabular-nums text-muted-foreground/50"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden rounded-none font-mono text-[11px] uppercase tracking-[0.16em] sm:inline-flex"
          />
          <NavbarCta
            variant="primary"
            href={ctaTarget}
            className="rounded-none px-5 py-2.5 text-[13px] tracking-tight transition-[transform,background-color] duration-150 active:translate-y-px motion-reduce:transform-none"
          >
            {cta}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
