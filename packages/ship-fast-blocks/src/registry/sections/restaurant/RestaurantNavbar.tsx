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
  RestaurantAccountButton,
  RestaurantMobileMenu,
  RestaurantMutationSpinner,
  RestaurantReservationButton,
  RestaurantReservationCount,
  RestaurantSearchButton,
  RestaurantSelectedMenuBadge,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'

/**
 * RestaurantNavbar — sticky site header for a restaurant (casual neighborhood
 * spot or upscale dining room). Thin configuration over the shared `SiteNav`
 * composite: a serif wordmark beside an inline fork-and-knife mark, centered
 * nav links on desktop, a reservations phone number, a "Book a Table" CTA, and
 * a real mobile drawer (Sheet) on small screens. Use as the header for bistros,
 * trattorias, steak houses, sushi counters, or any dining brand where
 * reservations matter. Renders fully with no props.
 */
function ForkKnifeMark({ className }: { className?: string }) {
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
      <path d="M6 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
      <path d="M8 11v10" />
      <path d="M16 3c-1.66 0-3 2.24-3 5s1.34 5 3 5" />
      <path d="M16 3v18" />
    </svg>
  )
}

export const RestaurantNavbar = defineCapsule({
  name: 'RestaurantNavbar',
  description:
    "Sticky restaurant site header (casual or upscale dining) built on the shared SiteNav composite: serif wordmark + fork-and-knife mark, centered desktop nav links, a reservations phone number, a 'Book a Table' CTA, and a real mobile drawer. Use as the header for bistros, trattorias, steak houses, sushi counters, or any dining brand where reservations matter.",
  props: z.object({
    /** Restaurant / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Reservations phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: restaurantLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'About', 'Gallery', 'Reservations', 'Contact']
    const brand = props.brand ?? 'Saffron & Sage'
    const homeTarget = props.homeTarget ?? nav[0]
    const phone = props.phone ?? '(415) 555-0182'
    const ctaLabel = props.ctaLabel ?? 'Book a Table'
    const ctaTarget = props.ctaTarget ?? 'Reservations'

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={<ForkKnifeMark className="size-8 text-primary" />}
            />
            <LogoLabel className="font-serif text-xl font-medium text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <RestaurantSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <RestaurantSelectedMenuBadge lakebed={lakebed} />
          <RestaurantAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <RestaurantReservationCount
            lakebed={lakebed}
            className="hidden lg:inline-flex"
          />
          {phone.trim() ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground xl:inline"
            >
              {phone}
            </a>
          ) : null}
          <RestaurantReservationButton
            lakebed={lakebed}
            input={{ label: ctaLabel, source: ctaTarget }}
            className="hidden items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 sm:inline-flex"
            pendingChildren={<RestaurantMutationSpinner />}
          >
            {ctaLabel}
          </RestaurantReservationButton>
          <RestaurantMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
