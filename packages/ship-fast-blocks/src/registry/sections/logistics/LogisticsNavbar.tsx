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
 * LogisticsNavbar — industrial-manifest sticky, backdrop-blurred top navigation
 * bar for a global-logistics / freight-forwarding company. A hairline
 * border-bottomed header pinned to the top: a square bolt-mark brand tile +
 * wordmark on the left, mono uppercase nav links in the center (desktop), and a
 * square inverted `bg-foreground text-background` CTA with press feedback on the
 * right, plus a hamburger menu on mobile. Precise, operational and freight-
 * flavored, tokens-only so it adapts to light/dark. Every link and the CTA route
 * through route hrefs so labels can drive page-switching. Use as the sticky site
 * header for logistics providers, freight forwarders, shipping carriers, courier,
 * warehousing, customs-brokerage or cargo/transport companies. Renders fully with
 * no props via baked-in "SwiftFreight" defaults.
 */
export const LogisticsNavbar = defineCapsule({
  name: 'LogisticsNavbar',
  description:
    'Industrial-manifest sticky, backdrop-blurred top navigation bar for a global-logistics / freight-forwarding company: a hairline border-bottomed header pinned to the top with a square bolt-mark brand tile + mono wordmark on the left, mono uppercase nav links in the center (desktop), and a square inverted CTA with press feedback on the right, plus a hamburger menu on mobile. Precise, operational and freight-flavored, tokens-only. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for logistics providers, freight forwarders, shipping carriers, courier, warehousing, customs-brokerage, supply-chain, fulfillment or cargo/transport companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Rounded primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'SwiftFreight'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Track', 'About', 'Pricing', 'Contact']
    const cta = props.cta ?? 'Get a Quote'
    const ctaTarget = props.ctaTarget ?? cta
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'
    const signIn = props.signIn ?? 'Sign in'
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-none bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )
    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7" />}
            />
            <LogoLabel className="font-mono text-base font-bold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav breakpoint="lg">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[12px] uppercase tracking-[0.14em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary"
            href={ctaTarget}
            className="hidden rounded-none bg-foreground px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-foreground/90 active:translate-y-px sm:inline-flex"
          >
            {cta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{
              label: cta,
              target: ctaTarget,
            }}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
