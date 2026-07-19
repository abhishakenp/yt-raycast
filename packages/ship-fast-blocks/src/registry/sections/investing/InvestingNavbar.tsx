import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
  SignInButton,
} from '#/section-kit/index.ts'

/**
 * InvestingNavbar — sticky, blurred top navigation bar for a modern investing /
 * fintech brokerage site. A backdrop-blurred, border-bottomed header pinned to
 * the top of the viewport: a trend-line brand glyph tile beside the platform
 * name on the left, a horizontal set of nav links in the center (desktop), and a
 * subtle "Sign in" link plus a filled "Get started" primary button on the right.
 * Every link and CTA routes through route hrefs so labels can drive page
 * switching. Use as the sticky site header for stock brokerages, trading apps,
 * robo-advisors, crypto exchanges, wealth-management or any fintech product.
 * Renders fully with no props via baked-in "Vestora" defaults.
 */
export const InvestingNavbar = defineCapsule({
  name: 'InvestingNavbar',
  description:
    "Sticky backdrop-blurred top navigation bar for a modern investing / fintech brokerage site: a trend-line brand glyph tile + platform name on the left, horizontal nav links in the center (desktop), and a subtle 'Sign in' link plus a filled 'Get started' primary button on the right. Links and CTAs route through route hrefs for page-switching. Use as the sticky site header for stock brokerages, trading apps, robo-advisors, crypto exchanges or wealth-management products.",
  props: z.object({
    /** Brand / platform name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level nav link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Subtle right-side "Sign in" link label. */
    signIn: z.string().optional(),
    /** Filled primary "Get started" button label. */
    getStarted: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vestora'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Markets', 'Reviews', 'FAQ']
    const signIn = props.signIn ?? 'Sign in'
    const getStarted = props.getStarted ?? 'Get started'
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[62%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </span>
    )
    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8" />} />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden text-sm font-medium sm:block"
          />
          <NavbarCta variant="primary" href={getStarted} className="px-4 py-2">
            {getStarted}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
