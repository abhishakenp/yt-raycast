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
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
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
 * HotelResortNavbar — fixed, backdrop-blurred top navigation bar for a
 * luxury-editorial hotel / resort & spa site. A hairline-bottomed translucent
 * header pinned to the top: a squared serif brand-initial mark beside the
 * serif resort wordmark on the left, a horizontal set of nav links in the
 * center (desktop), and a phone number, room search, profile dropdown, booking
 * badge, and a sharp-cornered mono-lettered "Book Now" CTA (with press
 * feedback) on the right, with a Sheet menu on mobile. Nav links preserve page
 * switching; booking and profile actions use shared Lakebed state. Use as the
 * sticky site header for hotels, beach or coastal resorts, spa retreats,
 * boutique inns, villas, or wellness destinations. Renders fully with no props
 * via baked-in "Azure Coast" defaults.
 */
export const HotelResortNavbar = defineCapsule({
  name: 'HotelResortNavbar',
  description:
    'Fixed backdrop-blurred top navigation bar for a luxury-editorial hotel / resort & spa site: a hairline-bottomed translucent header pinned to the top with a squared serif brand-initial mark + serif resort wordmark on the left, horizontal nav links in the center (desktop), and a phone number, room search, profile dropdown, booking badge, and a sharp-cornered mono-lettered Book Now CTA with press feedback on the right, with a real Sheet menu on mobile. Nav links route through route hrefs for page-switching while booking/profile/search actions use shared Lakebed state. Use as the sticky site header for hotels, beach or coastal resorts, spa retreats, boutique inns, villas, or wellness destinations.',
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
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
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
          'grid place-items-center rounded-none font-serif',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-border bg-background/90 backdrop-blur-xl',
          props.className,
        )}
        containerClassName="px-6 lg:px-8"
      >
        <NavbarBrand href={nav[0]}>
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-7"
              fallback={
                <LogoMark className="size-9 bg-foreground text-base text-background" />
              }
            />
            <LogoLabel className="font-serif text-xl font-normal tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label} className="text-sm">
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
            className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground xl:block"
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
            className="hidden items-center justify-center gap-2 rounded-none bg-foreground px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
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
