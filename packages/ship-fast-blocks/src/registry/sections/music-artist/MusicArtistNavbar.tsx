import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * MusicArtistNavbar — fixed, backdrop-blurred top navigation for a music
 * artist / band site. A thin-weight brand wordmark on the left, centered
 * horizontal nav links (desktop), and a hamburger menu button (mobile), all on
 * a translucent border-bottomed header pinned to the top of the viewport. Warm,
 * airy, editorial indie-folk aesthetic on a soft neutral canvas. The brand and
 * every nav link route through useNavigate for page-switching. Use as the
 * sticky site header for musicians, singers, bands, or any artist EPK/press
 * site. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistNavbar = defineCapsule({
  name: 'MusicArtistNavbar',
  description:
    'Fixed, backdrop-blurred top navigation bar for a music artist / band site: a thin-weight brand wordmark on the left, centered horizontal nav links on desktop, and a hamburger menu button on mobile, on a translucent border-bottomed header pinned to the top of the viewport. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas. The brand and every nav link route through useNavigate for page-switching. Use as the sticky site header for musicians, singers, bands, indie/folk/Americana acts, or any artist EPK/press site.',
  props: z.object({
    /** Artist / band name shown as the brand wordmark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand wordmark and the mobile menu button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Velvet Echo'
    const nav = props.nav?.length
      ? props.nav
      : ['Music', 'Tour', 'About', 'Contact']
    const homeTarget = props.homeTarget ?? 'Music'

    return (
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn('bg-background/90', props.className)}
        containerClassName="max-w-6xl px-6 lg:px-8"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="text-xl font-light tracking-tight text-foreground lg:text-2xl"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle" />
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
          <MobileNavDrawer
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
