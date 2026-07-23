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
 * ResumeCvNavbar — sticky document-editorial header for a personal resume / CV /
 * portfolio site. Thin configuration over the shared `SiteNav` composite: a
 * square, hard-edged initials monogram stamp (ink-inverted `bg-foreground` with
 * a mono glyph) beside the person's name in an extrabold tight wordmark, mono
 * uppercase desktop nav links (About, Experience, Skills, Projects), and a
 * square "Contact Me" primary CTA with mechanical press feedback that routes to
 * the contact section, plus a real mobile drawer on small screens. Backdrop-blur
 * bar over a hairline rule. Use as the header for personal portfolios, online
 * résumés, designer/developer profiles, or any individual's professional landing
 * page. Renders fully with no props via baked-in "Jordan Avery" defaults.
 */
export const ResumeCvNavbar = defineCapsule({
  name: 'ResumeCvNavbar',
  description:
    "Sticky document-editorial resume / CV / portfolio site header built on the shared SiteNav composite: a square hard-edged initials monogram stamp (ink-inverted bg-foreground with a mono glyph) beside the person's name in an extrabold tight wordmark, mono uppercase desktop nav links (About, Experience, Skills, Projects), a square 'Contact Me' primary CTA with press feedback routing to the contact section, and a real mobile drawer. Use as the header for personal portfolios, online résumés, designer or developer profiles, or any individual's professional landing page.",
  props: z.object({
    /** Person / brand name shown beside the monogram. */
    brand: z.string().optional(),
    /** Initials shown inside the monogram circle. */
    initials: z.string().optional(),
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
      : ['About', 'Experience', 'Skills', 'Projects']
    const initials = props.initials ?? 'JA'
    const brand = props.brand ?? 'Jordan Avery'
    const ctaLabel = props.ctaLabel ?? 'Contact Me'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? nav[0]

    const brandMark = (
      <span
        aria-hidden="true"
        className="inline-flex size-9 items-center justify-center rounded-none border border-foreground bg-foreground font-mono text-xs font-bold tracking-tight text-background"
      >
        {initials}
      </span>
    )
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          {brandMark}
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="text-lg font-extrabold tracking-tight" />
          </Logo>
        </NavbarBrand>
        <NavbarNav className="gap-7">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs uppercase tracking-[0.14em]"
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
            className="hidden rounded-none px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] transition-transform duration-150 active:translate-y-px sm:inline-flex"
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
