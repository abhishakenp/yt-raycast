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
 * PlumbingHvacNavbar — sticky top navigation bar for a local plumbing & HVAC
 * trade site. Thin configuration over the shared `SiteNav` composite: a
 * pipe/droplet logo mark beside the company wordmark, horizontal desktop nav
 * links (Services, About, Reviews, Service Area, Contact), a click-to-call
 * phone number, a pill "Schedule Service" CTA, and a real mobile drawer on
 * small screens. Every nav item and the CTA route through route hrefs so the
 * labels can drive page-switching. Use as the sticky site header for plumbers,
 * HVAC contractors, drain/sewer services, water heater installers, and other
 * licensed home-service trades. Renders fully with no props via baked-in
 * "Pipeworks Plumbing & HVAC" defaults.
 */
function PipeMark({ className }: { className?: string }) {
  return (
    <span
      className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
      aria-hidden="true"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12 5 12 2C12 5 9 7 7 9.5S5 13 5 15a7 7 0 0 0 7 7Z" />
      </svg>
    </span>
  )
}

export const PlumbingHvacNavbar = defineCapsule({
  name: 'PlumbingHvacNavbar',
  description:
    "Sticky top navigation bar for a local plumbing & HVAC trade site built on the shared SiteNav composite: a pipe/droplet logo mark and company wordmark, horizontal desktop nav links, a click-to-call phone number, a pill 'Schedule Service' CTA, and a real mobile drawer. Nav items and CTA route through route hrefs for page-switching. Use as the sticky site header for plumbers, HVAC contractors, drain/sewer services, water heater installers, and other licensed home-service trades.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Click-to-call phone number shown beside the CTA. */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label of the pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'About', 'Reviews', 'Service Area', 'Contact']
    const brand = props.brand ?? 'Pipeworks Plumbing & HVAC'
    const phone = props.phone ?? '(555) 010-7878'
    const ctaLabel = props.ctaLabel ?? 'Schedule Service'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <PipeMark className="size-[18px]" />
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="text-xl font-extrabold tracking-tight" />
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
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              {phone}
            </a>
          ) : null}
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
