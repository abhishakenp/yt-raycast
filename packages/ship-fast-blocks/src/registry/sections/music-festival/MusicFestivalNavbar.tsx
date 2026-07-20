import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * MusicFestivalNavbar — fixed, blurred top navigation bar for a kinetic-poster
 * music / arts festival landing page. A backdrop-blurred, hairline-bottomed
 * header pinned to the top: on the left the festival wordmark set in bold
 * condensed uppercase, in the center a mono-tracked row of nav links, and on
 * the right a sharp, square "Get Tickets" ticket-stub CTA with mechanical press
 * feedback plus a hamburger menu button on mobile. Every nav link and the CTA
 * route through route hrefs, and the nav labels match site routes so page
 * switching works. Use as the sticky site header for music festivals, arts
 * festivals, concert series, camping/desert events, raves, or any multi-day
 * ticketed live event.
 */
export const MusicFestivalNavbar = defineCapsule({
  name: 'MusicFestivalNavbar',
  description:
    "Fixed, blurred top navigation bar for a kinetic-poster music / arts festival landing page: a backdrop-blurred, hairline-bottomed header pinned to the top with the festival wordmark in bold condensed uppercase on the left, a mono-tracked horizontal row of nav links in the center, a sharp square 'Get Tickets' ticket-stub CTA with press feedback on the right, and a hamburger menu button on mobile. Every nav link and the CTA route through route hrefs, and the nav labels match site routes so PageSwitch can swap pages. Use as the sticky site header for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed live event.",
  props: z.object({
    /** Festival / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary CTA button label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'HORIZON'
    const nav = props.nav?.length
      ? props.nav
      : ['Lineup', 'Experience', 'Schedule', 'Tickets', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Get Tickets'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? 'Buy Tickets'

    return (
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn('bg-background/95', props.className)}
        containerClassName="max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand
          href={homeTarget}
          className="text-xl font-extrabold uppercase tracking-tight lg:text-2xl"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-xs font-semibold uppercase tracking-[0.12em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <NavbarCta
            variant="primary"
            href={ctaTarget}
            className="hidden rounded-none px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:shadow-[4px_4px_0_0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none sm:inline-flex"
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
