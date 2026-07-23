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
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * FlightSimulatorNavbar — instrument-terminal sticky header for a consumer
 * flight simulator product (PC / console sim, study-level aircraft, photoreal
 * scenery). Thin configuration over the shared `SiteNav` composite with a HUD
 * grammar: a winged-plane line mark beside a bold wordmark, centered desktop nav
 * links, a mono `SYS · NOMINAL` readout that hides on tight bars, and a
 * square-cornered mono "Get the Sim" CTA with a hard offset shadow and
 * mechanical press feedback that routes to the buy page, plus a real mobile
 * drawer on small screens. Use as the header for flight simulators, combat /
 * airliner sims, aviation training titles, or any immersive aircraft game.
 * Renders fully with no props via baked-in "SkyForge Sim" defaults.
 */
function WingMark({ className }: { className?: string }) {
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
      <path d="M2 12h7l4-7 2 7h7" />
      <path d="M9 12l-3 5" />
      <path d="M22 12l-4 5" />
      <path d="M9 12l4 5" />
    </svg>
  )
}

export const FlightSimulatorNavbar = defineCapsule({
  name: 'FlightSimulatorNavbar',
  description:
    "Instrument-terminal flight-simulator site header built on the shared SiteNav composite: a winged-plane line mark + bold wordmark, centered desktop nav links (Features, Editions, Gallery, Community), a mono 'SYS · NOMINAL' HUD readout that hides on tight bars, and a square-cornered mono 'Get the Sim' CTA with a hard offset shadow and press feedback routing to the buy page, plus a real mobile drawer. Use as the header for flight simulators, combat / airliner sims, aviation training titles, or any immersive aircraft game.",
  props: z.object({
    /** Product / brand name shown beside the logo mark. */
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
      : ['Features', 'Editions', 'Gallery', 'Community']
    const brand = props.brand ?? 'SkyForge Sim'
    const ctaLabel = props.ctaLabel ?? 'Get the Sim'
    const ctaTarget = props.ctaTarget ?? 'Buy'
    const homeTarget = props.homeTarget ?? nav[0]
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <WingMark className="size-8 text-primary" />
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
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <span
            aria-hidden="true"
            className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground xl:inline-flex"
          >
            SYS
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Nominal
          </span>
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] shadow-[3px_3px_0_0] shadow-foreground/25 transition-[transform,box-shadow] duration-150 hover:bg-primary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none sm:inline-flex"
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
