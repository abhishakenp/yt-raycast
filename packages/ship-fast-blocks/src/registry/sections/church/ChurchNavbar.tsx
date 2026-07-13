import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * ChurchNavbar — fixed translucent top navigation bar for a church or faith-community
 * site. A backdrop-blurred, border-bottomed header pinned to the top with a star
 * brand mark + church name on the left, horizontal nav links and a pill-shaped
 * 'Give Today' CTA on the right (desktop), and a hamburger menu button on mobile.
 * CTA route through useNavigate so labels can drive page-switching. Use as the sticky
 * site header for churches, parishes, worship centers, ministries, or religious nonprofits.
 */
export const ChurchNavbar = defineCapsule({
  name: 'ChurchNavbar',
  description:
    "Fixed translucent top navigation bar for a church or faith-community site: backdrop-blurred, border-bottomed header pinned to the top with a star brand mark + church name on the left, horizontal nav links and a pill-shaped 'Give Today' CTA on the right (desktop), and a hamburger menu button on mobile. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for churches, parishes, worship centers, ministries, or religious nonprofits.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Grace Community'
    const nav = props.nav?.length
      ? props.nav
      : ['About', 'Ministries', 'Sermons', 'Events', 'Visit']
    const homeTarget = props.homeTarget ?? 'Home'
    const ctaLabel = props.ctaLabel ?? 'Give Today'
    const ctaTarget = props.ctaTarget ?? 'Give'

    const Star = () => (
      <span className="text-2xl text-muted-foreground" aria-hidden="true">
        ✦
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95 backdrop-blur-sm', props.className)}
        containerClassName="px-6 lg:px-8"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2"
          >
            <BrandLogo
              brand={brand}
              fallback={<Star />}
              labelClassName="text-xl font-medium tracking-tight text-foreground"
            />
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
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
            buttonClassName="p-2 text-muted-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
