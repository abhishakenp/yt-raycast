import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
 * WebinarNavbar — sticky kinetic-event site header for a live webinar or virtual
 * summit. A blurred, hairline-bottomed bar pinned to the top: a square broadcast
 * mark beside an extrabold wordmark on the left, a mono-uppercase row of nav
 * links, and a square-edged "Register" CTA on the right that carries a hard
 * offset token shadow and presses down on click, plus a real mobile drawer on
 * small screens. Register routes through the kit's section-kit route link so it
 * is never a dead link. Use as the header for webinars, summits, masterclasses,
 * product launches, or any registration-driven event landing page. Renders fully
 * with no props.
 */
function BroadcastMark({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  )
}

export const WebinarNavbar = defineCapsule({
  name: 'WebinarNavbar',
  description:
    "Sticky kinetic-event webinar/virtual-summit site header built on the shared SiteNav composite: a blurred, hairline-bottomed bar with a square broadcast mark + extrabold wordmark on the left, a mono-uppercase row of desktop nav links (Overview, Agenda, Speakers, FAQ), a square-edged 'Register' CTA with a hard offset token shadow and press feedback on the right, and a real mobile drawer. Register routes through a section-kit route link. Use as the header for webinars, summits, masterclasses, product launches, or any registration-driven event landing page.",
  props: z.object({
    /** Brand / event host name shown beside the logo mark. */
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
      : ['Overview', 'Agenda', 'Speakers', 'FAQ']
    const brand = props.brand ?? 'Catalyst Labs'
    const ctaLabel = props.ctaLabel ?? 'Register'
    const ctaTarget = props.ctaTarget ?? 'Register'
    const homeTarget = props.homeTarget ?? nav[0]
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav
        position="fixed"
        height="default"
        className={props.className}
        containerClassName="max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<BroadcastMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="[&>a]:font-mono [&>a]:text-[11px] [&>a]:uppercase [&>a]:tracking-[0.14em]">
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
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none border border-foreground px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[4px_4px_0_0] hover:shadow-foreground active:translate-x-[3px] active:translate-y-[3px] active:shadow-none sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="rounded-none p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
