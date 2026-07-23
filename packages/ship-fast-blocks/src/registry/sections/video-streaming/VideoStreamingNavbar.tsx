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
 * VideoStreamingNavbar — fixed, backdrop-blurred cinematic site header for a
 * streaming brand (think "Lumen" or "Nova+"). A hairline-bottomed translucent
 * bar over the shared `SiteNav` composite: a bold wordmark beside an inline
 * primary play-triangle mark (kept as the BrandLogo image fallback), a row of
 * mono, tracked slate-label nav links (Browse, Shows, Movies, Pricing), and a
 * high-intent primary-pill "Start Watching" CTA with press feedback, plus a real
 * mobile drawer on small screens. Tokens-only so the dark-cinematic treatment
 * flips cleanly between light and dark generated themes. Use as the header for
 * streaming services, on-demand video apps, or OTT platforms. Renders fully with
 * no props via baked-in defaults.
 */
function PlayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
    </svg>
  )
}

export const VideoStreamingNavbar = defineCapsule({
  name: 'VideoStreamingNavbar',
  description:
    "Fixed, backdrop-blurred cinematic site header for a streaming brand built on the shared SiteNav composite: a hairline-bottomed translucent bar pairing a bold wordmark + inline primary play-triangle mark with a row of mono tracked slate-label nav links (Browse, Shows, Movies, Pricing) and a primary-pill 'Start Watching' CTA with press feedback, plus a real mobile drawer. Tokens-only so it flips between light and dark themes. Use as the header for streaming services, on-demand video apps, or OTT platforms where signup is the primary action.",
  props: z.object({
    /** Streaming brand name shown beside the play mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
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
      : ['Browse', 'Shows', 'Movies', 'Pricing']
    const brand = props.brand ?? 'Lumen'
    const ctaLabel = props.ctaLabel ?? 'Start Watching'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const homeTarget = props.homeTarget ?? nav[0]
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<PlayMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="gap-6 lg:gap-8">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-1 font-mono text-[11px] uppercase tracking-[0.2em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-transform duration-150 active:translate-y-px motion-reduce:transform-none sm:inline-flex"
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
