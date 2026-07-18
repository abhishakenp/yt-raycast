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
  LocalServiceAccountButton,
  LocalServiceBookingButton,
  LocalServiceIntentBadge,
  LocalServiceMobileMenu,
  LocalServiceMutationSpinner,
  LocalServiceSearchButton,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * DentalNavbar — sticky translucent top navigation bar for a dental practice /
 * dentist site. A backdrop-blurred, border-bottomed header pinned to the top
 * with a rounded mint-primary tooth-glyph logo tile + practice name and a small
 * "Dental Care" eyebrow on the left, horizontal nav links on the right
 * (desktop), a filled primary pill CTA (the last nav item, e.g. "Book
 * Appointment"), and a hamburger menu button on mobile. Every link and CTA
 * routes through route hrefs. Use as the sticky site header for dentists,
 * dental offices, orthodontists, or cosmetic / pediatric dental clinics.
 */
export const DentalNavbar = defineCapsule({
  name: 'DentalNavbar',
  description:
    "Sticky translucent top navigation bar for a dental practice / dentist site: backdrop-blurred, border-bottomed header with a rounded mint-primary tooth-glyph logo tile + practice name and a 'Dental Care' eyebrow on the left, horizontal nav links on the right (desktop), a filled primary pill CTA built from the last nav item (e.g. 'Book Appointment'), and a hamburger menu button on mobile. All links and CTAs route through route hrefs. Use as the sticky site header for dentists, dental offices, orthodontists, or cosmetic / pediatric dental clinics.",
  props: z.object({
    /** Practice / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Small eyebrow line under the brand name. */
    tagline: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Bright Smile'
    const tagline = props.tagline ?? 'Dental Care'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Our Team', 'Reviews', 'FAQ', 'Book Appointment']

    const ToothMark = () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )

    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-xl bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <ToothMark />
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-3 text-left">
          <BrandLogo brand={brand} className="size-10">
            <LogoImage
              className="size-10"
              fallback={<LogoBadge className="size-10" />}
            />
            <LogoLabel />
          </BrandLogo>
          <span className="leading-tight">
            <span className="block text-xl font-semibold text-foreground">
              {brand}
            </span>
            <span className="-mt-1 block text-sm text-muted-foreground">
              {tagline}
            </span>
          </span>
        </NavbarBrand>

        <NavbarNav className="[&>button]:font-medium">
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={nav[nav.length - 1]}
            service="Dental appointment"
            source="navbar"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {nav[nav.length - 1]}
          </LocalServiceBookingButton>
        </NavbarNav>

        <NavbarActions className="gap-2">
          <LocalServiceIntentBadge lakebed={lakebed} />
          <LocalServiceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          />
          <LocalServiceAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          />
          <LocalServiceMobileMenu
            brand={brand}
            homeTarget={nav[0]}
            nav={nav}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
