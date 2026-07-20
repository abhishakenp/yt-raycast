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
 * InvestingNavbar — Swiss-fintech sticky, backdrop-blurred top navigation bar
 * for a modern investing / brokerage site. A hairline-ruled institutional trust
 * bar: a square (binary-radius) trend-line brand glyph tile beside the platform
 * wordmark on the left, a horizontal row of mono index-numbered nav links in the
 * center (desktop), and a subtle "Sign in" link plus a single square filled
 * "Get started" primary CTA with mechanical press feedback on the right. Every
 * link and CTA routes through route hrefs so labels can drive page switching.
 * Precise, calm, conviction-forward; use as the sticky site header for stock
 * brokerages, trading apps, robo-advisors, crypto exchanges, wealth-management
 * or any fintech product. Renders fully with no props via baked-in "Vestora"
 * defaults.
 */
export const InvestingNavbar = defineCapsule({
  name: 'InvestingNavbar',
  description:
    "Swiss-fintech sticky backdrop-blurred top navigation bar for a modern investing / brokerage site: a square trend-line brand glyph tile + platform wordmark on the left, mono index-numbered horizontal nav links in the center (desktop), and a subtle 'Sign in' link plus a single square filled 'Get started' primary CTA with press feedback on the right, over a hairline bottom rule that reads as an institutional trust bar. Links and CTAs route through route hrefs for page-switching. Use as the sticky site header for stock brokerages, trading apps, robo-advisors, crypto exchanges or wealth-management products.",
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
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
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
        <NavbarBrand href={nav[0]} className="flex items-center gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage fallback={<LogoMark className="size-7" />} />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </BrandLogo>
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

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden text-[13px] font-medium tracking-tight sm:block"
          />
          <NavbarCta
            variant="primary"
            href={getStarted}
            className="rounded-none px-5 py-2.5 text-[13px] tracking-tight transition-[transform,background-color] duration-150 active:translate-y-px motion-reduce:transform-none"
          >
            {getStarted}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
