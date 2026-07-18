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
} from '#/section-kit/index.ts'

/**
 * ResumeCvNavbar — sticky site header for a personal resume / CV / portfolio
 * site. Thin configuration over the shared `SiteNav` composite: a clean sans
 * wordmark of the person's name beside an inline initials monogram in a token
 * circle, centered desktop nav links (About, Experience, Skills, Projects), and
 * a "Contact Me" pill CTA that routes to the contact section, plus a real
 * mobile drawer on small screens. Use as the header for personal portfolios,
 * online résumés, designer/developer profiles, or any individual's professional
 * landing page. Renders fully with no props via baked-in "Jordan Avery"
 * defaults.
 */
export const ResumeCvNavbar = defineCapsule({
  name: 'ResumeCvNavbar',
  description:
    "Sticky personal resume / CV / portfolio site header built on the shared SiteNav composite: a clean sans wordmark of the person's name beside an initials monogram in a token circle, centered desktop nav links (About, Experience, Skills, Projects), a 'Contact Me' pill CTA routing to the contact section, and a real mobile drawer. Use as the header for personal portfolios, online résumés, designer or developer profiles, or any individual's professional landing page.",
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
        className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
      >
        {initials}
      </span>
    )

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          {brandMark}
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
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
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
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
