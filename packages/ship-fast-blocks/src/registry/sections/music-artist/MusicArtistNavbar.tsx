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
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * MusicArtistNavbar — fixed, backdrop-blurred poster header for a music
 * artist / band site. A giant extrabold uppercase tight-tracked brand wordmark
 * on the left, right-aligned mono uppercase nav links (desktop), and a
 * hamburger menu button (mobile), all on a translucent border-bottomed header
 * pinned to the top of the viewport. Bold kinetic-poster aesthetic driven
 * entirely by theme tokens (flips light/dark). The brand and every nav link
 * route through route hrefs for page-switching. Use as the sticky site header
 * for musicians, singers, bands, or any artist EPK/press site. Renders fully
 * with no props via baked-in defaults.
 */
export const MusicArtistNavbar = defineCapsule({
  name: 'MusicArtistNavbar',
  description:
    'Fixed, backdrop-blurred poster header for a music artist / band site: a giant extrabold uppercase tight-tracked brand wordmark on the left, right-aligned mono uppercase nav links on desktop, and a hamburger menu button on mobile, on a translucent border-bottomed header pinned to the top of the viewport. Bold kinetic-poster aesthetic driven entirely by theme tokens (flips light/dark). The brand and every nav link route through route hrefs for page-switching. Use as the sticky site header for musicians, singers, bands, indie/folk/Americana acts, or any artist EPK/press site.',
  props: z.object({
    /** Artist / band name shown as the brand wordmark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand wordmark and the mobile menu button. */
    homeTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Velvet Echo'
    const nav = props.nav?.length
      ? props.nav
      : ['Music', 'Tour', 'About', 'Contact']
    const homeTarget = props.homeTarget ?? 'Music'
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn('bg-background/90', props.className)}
        containerClassName="max-w-6xl px-6 lg:px-8"
      >
        <NavbarBrand
          href={homeTarget}
          className="text-lg font-extrabold uppercase tracking-tight text-foreground lg:text-xl"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="lg:gap-6">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-1.5 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-transparent"
            >
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
