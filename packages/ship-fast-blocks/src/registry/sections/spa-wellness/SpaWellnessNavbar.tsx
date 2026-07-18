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
 * SpaWellnessNavbar — serene top navigation bar for a day-spa / wellness site.
 * Thin configuration over the shared `SiteNav` composite: a light, airy
 * bordered-bottom bar with a serif wordmark on the left, a centered set of nav
 * links (Treatments / Memberships / Gift Cards / Contact), a filled primary
 * "Book Now" CTA on the right, and a real mobile drawer (Sheet) on small
 * screens. The wordmark and every nav item route through route hrefs. Use as the
 * opening site navigation for spas, wellness retreats, massage studios,
 * bathhouses, and treatment clinics. Renders fully with no props via baked-in
 * defaults.
 */
export const SpaWellnessNavbar = defineCapsule({
  name: 'SpaWellnessNavbar',
  description:
    "Serene top navigation bar for a day-spa / wellness site built on the shared SiteNav composite: a light bordered-bottom bar with a serif wordmark on the left, centered nav links (Treatments / Memberships / Gift Cards / Contact), a filled primary 'Book Now' CTA on the right, and a real mobile drawer. The wordmark and links route through route hrefs. Use as the opening site navigation for spas, wellness retreats, massage studios, bathhouses, and treatment clinics.",
  props: z.object({
    /** Serif wordmark / brand name on the left. */
    brand: z.string().optional(),
    /** Center nav link labels. */
    links: z.array(z.string()).optional(),
    /** Primary booking CTA label. */
    cta: z.string().optional(),
    /** Route label the CTA navigates to. */
    ctaTarget: z.string().optional(),
    /** Route label the wordmark navigates to. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const links = props.links?.length
      ? props.links
      : ['Treatments', 'Memberships', 'Gift Cards', 'Contact']
    const brand = props.brand ?? 'Lumen Spa'
    const brandClassName = 'font-serif text-xl font-semibold tracking-tight'
    const ctaLabel = props.cta ?? 'Book Now'
    const ctaTarget = props.ctaTarget ?? 'Booking'
    const homeTarget = props.homeTarget ?? 'Home'

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className={brandClassName} />
          </Logo>
        </NavbarBrand>
        <NavbarNav>
          {links.map((label) => (
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
            nav={links}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
