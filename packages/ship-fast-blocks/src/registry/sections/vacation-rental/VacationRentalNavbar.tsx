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
 * VacationRentalNavbar — airy sticky top navigation for a vacation-rental /
 * getaway listing site. Thin configuration over the shared `SiteNav` composite:
 * a hand-drawn palm-and-sun logo mark beside the property wordmark, horizontal
 * desktop nav links (Stays, Amenities, Gallery, Reviews, Book Now), a phone
 * number, a pill "Book Now" CTA, and a real mobile drawer (Sheet) on small
 * screens. Every nav item and the CTA route through route hrefs so labels can
 * drive page-switching. Use as the inviting site header for vacation rentals,
 * beach houses, cabins, villas, or boutique short-stay properties. Renders fully
 * with no props via baked-in "Azure Cove Retreats" defaults.
 */
function PalmMark({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="17.5" cy="6.5" r="2.5" />
      <path d="M12 22v-9" />
      <path d="M12 13c-2-3-5-4-8-3 2-2 6-2 8 0" />
      <path d="M12 13c2-3 5-4 8-3-2-2-6-2-8 0" />
      <path d="M12 13c-1-3-1-6 1-8-3 1-4 5-1 8" />
    </svg>
  )
}

export const VacationRentalNavbar = defineCapsule({
  name: 'VacationRentalNavbar',
  description:
    'Airy sticky top navigation for a vacation-rental / getaway listing site built on the shared SiteNav composite: a palm-and-sun logo mark and property wordmark, horizontal desktop nav links, a phone number, a pill Book Now CTA, and a real mobile drawer. Nav items and CTA route through route hrefs for page-switching. Use as the inviting site header for vacation rentals, beach houses, cabins, villas, or boutique short-stay properties.',
  props: z.object({
    /** Property / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number shown in the header. */
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
      : ['Stays', 'Amenities', 'Gallery', 'Reviews', 'Book Now']
    const brand = props.brand ?? 'Azure Cove Retreats'
    const brandMark = <PalmMark className="size-8 text-primary" />
    const brandClassName = 'text-xl font-semibold tracking-tight'
    const phone = props.phone ?? '+1 (800) 555-0199'
    const ctaLabel = props.ctaLabel ?? 'Book Now'
    const ctaTarget = props.ctaTarget ?? 'Book Now'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          {brandMark}
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className={brandClassName} />
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
