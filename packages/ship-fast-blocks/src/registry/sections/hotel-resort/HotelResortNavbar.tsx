import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import {
  HotelAccountButton,
  HotelBookingActionButton,
  HotelBookingBadge,
  HotelMobileMenu,
  HotelMutationSpinner,
  HotelSearchButton,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortNavbar — fixed, translucent top navigation bar for a luxury
 * hotel / resort & spa site. A backdrop-blurred, border-bottomed header pinned
 * to the top: a circular brand-initial logo mark beside the resort name on the
 * left, a horizontal set of nav links in the center (desktop), and a phone
 * number, search, profile dropdown, and a solid "Book Now" CTA on the right,
 * with a Sheet menu on mobile. Nav links preserve page switching; booking and
 * profile actions use shared Lakebed state. Use as the sticky site header for hotels,
 * beach or coastal resorts, spa retreats, boutique inns, villas, or wellness
 * destinations. Renders fully with no props via baked-in "Azure Coast" defaults.
 */
export const HotelResortNavbar = defineCapsule({
  name: 'HotelResortNavbar',
  description:
    'Fixed translucent top navigation bar for a luxury hotel / resort & spa site: backdrop-blurred, border-bottomed header pinned to the top with a circular brand-initial logo mark + resort name on the left, horizontal nav links in the center (desktop), and a phone number, room search, profile dropdown, booking badge, and a solid Book Now CTA on the right, with a real Sheet menu on mobile. Nav links route through route hrefs for page-switching while booking/profile/search actions use shared Lakebed state. Use as the sticky site header for hotels, beach or coastal resorts, spa retreats, boutique inns, villas, or wellness destinations.',
  props: z.object({
    /** Resort / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Solid right-side CTA label. */
    cta: z.string().optional(),
    /** Navigation target the CTA routes to. */
    bookTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: hotelResortLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Azure Coast'
    const nav = props.nav?.length
      ? props.nav
      : ['Rooms & Suites', 'Amenities', 'Gallery', 'Dining', 'Contact']
    const phone = props.phone ?? '1-800-555-1234'
    const cta = props.cta ?? 'Book Now'
    const bookTarget = props.bookTarget ?? 'Check Availability'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-full font-light',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95', props.className)}
        containerClassName="px-6 lg:px-8"
      >
        <NavbarBrand href={nav[0]} className="gap-3">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={
                <LogoMark className="size-10 bg-foreground text-lg text-background" />
              }
            />
            <LogoLabel className="text-xl font-medium tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <HotelBookingBadge lakebed={lakebed} />
          <HotelSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <HotelAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden text-sm text-muted-foreground lg:block"
          >
            {phone}
          </a>
          <HotelBookingActionButton
            lakebed={lakebed}
            intentLabel={bookTarget}
            intentKey="navbar-booking"
            source="navbar"
            pendingChildren={
              <>
                <HotelMutationSpinner />
                Sending
              </>
            }
            className="hidden items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {cta}
          </HotelBookingActionButton>
          <HotelMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            lakebed={lakebed}
            ctaLabel={cta}
            ctaTarget={bookTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
