import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
 * DentalNavbar — clinical Swiss-clean sticky navigation for a dental practice /
 * dentist site. A backdrop-blurred, hairline-bordered header pinned to the top:
 * a square primary tooth-glyph logo tile + practice wordmark with the tagline
 * as a mono micro-label behind a hairline divider on the left, quiet nav links
 * on the right (desktop), a square filled-primary CTA built from the last nav
 * item (e.g. "Book Appointment") with press feedback, square hairline
 * search / account chips, and a hamburger menu on mobile. Every link and CTA
 * routes through route hrefs. Use as the sticky site header for dentists,
 * dental offices, orthodontists, or cosmetic / pediatric dental clinics.
 */
export const DentalNavbar = defineCapsule({
  name: 'DentalNavbar',
  description:
    "Clinical Swiss-clean sticky navigation bar for a dental practice / dentist site: a backdrop-blurred, hairline-bordered header with a square primary tooth-glyph logo tile + practice wordmark and a mono micro-label tagline behind a hairline divider on the left, quiet nav links on the right (desktop), a square filled-primary CTA built from the last nav item (e.g. 'Book Appointment') with press feedback, square hairline search / account chips, and a hamburger menu button on mobile. All links and CTAs route through route hrefs. Use as the sticky site header for dentists, dental offices, orthodontists, or cosmetic / pediatric dental clinics.",
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
        width="16"
        height="16"
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
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
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
        className={cn('bg-background/90', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoBadge className="size-7" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight" />
          </BrandLogo>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border lg:block"
          />
          <MonoTag className="hidden lg:inline-block">{tagline}</MonoTag>
        </NavbarBrand>

        <NavbarNav className="gap-7 [&>button]:font-medium">
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
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
            className="rounded-none bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
          >
            {nav[nav.length - 1]}
          </LocalServiceBookingButton>
        </NavbarNav>

        <NavbarActions className="gap-2">
          <LocalServiceIntentBadge lakebed={lakebed} />
          <LocalServiceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:inline-flex"
          />
          <LocalServiceAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:inline-flex"
          />
          <LocalServiceMobileMenu
            brand={brand}
            homeTarget={nav[0]}
            nav={nav}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
