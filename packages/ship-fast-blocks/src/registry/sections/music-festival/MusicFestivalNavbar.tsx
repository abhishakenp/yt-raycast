import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * MusicFestivalNavbar — fixed, translucent top navigation bar for a music /
 * arts festival landing page. A blurred, border-bottomed header pinned to the
 * top with the festival wordmark on the left, a horizontal row of nav links in
 * the center, a primary pill "Get Tickets" CTA on the right, and a hamburger
 * menu button on mobile. Every nav link and the CTA route through useNavigate,
 * and the nav labels match site routes so page switching works. Use as the
 * sticky site header for music festivals, arts festivals, concert series,
 * camping/desert events, raves, or any multi-day ticketed live event.
 */
export const MusicFestivalNavbar = defineCapsule({
  name: 'MusicFestivalNavbar',
  description:
    "Fixed, translucent top navigation bar for a music / arts festival landing page: a blurred, border-bottomed header pinned to the top with the bold festival wordmark on the left, a horizontal row of nav links in the center, a primary pill 'Get Tickets' CTA on the right, and a hamburger menu button on mobile. Every nav link and the CTA route through useNavigate, and the nav labels match site routes so PageSwitch can swap pages. Use as the sticky site header for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed live event.",
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
    const go = useNavigate()
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
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="text-xl font-bold tracking-tight lg:text-2xl"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
              <LogoImage className="mr-2 size-7 align-middle" />
              <LogoLabel />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <NavbarCta
            variant="primary-pill"
            onClick={() => go(ctaTarget)}
            className="hidden px-5 py-2.5 sm:inline-flex"
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
