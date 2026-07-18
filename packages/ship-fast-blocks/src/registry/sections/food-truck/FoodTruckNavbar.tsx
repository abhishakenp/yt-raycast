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
} from '#/section-kit/index.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * FoodTruckNavbar — fixed, backdrop-blurred top navigation bar for a gourmet
 * food-truck / street-food site. A border-bottomed header pinned to the top with a
 * circular monogram logo tile (brand initials) + brand wordmark on the left,
 * horizontal muted-to-foreground nav links on the right (desktop), menu command
 * search, Shoo account dropdown, shared Lakebed cart drawer, a filled pill CTA
 * built from the LAST nav item (e.g. "Book Catering"), and a real mobile drawer.
 * Every link and CTA routes through route hrefs so PageSwitch can swap pages.
 * Use as the sticky site header for food trucks, street-food vendors,
 * taco/burger/bowl concepts, pop-up kitchens or catering businesses.
 */
export const FoodTruckNavbar = defineCapsule({
  name: 'FoodTruckNavbar',
  description:
    "Fixed, backdrop-blurred top navigation bar for a gourmet food-truck / street-food site: a border-bottomed header pinned to the top with a circular monogram logo tile (brand initials) and brand wordmark on the left, horizontal muted-to-foreground nav links on the right (desktop), menu command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a filled pill CTA built from the LAST nav item (e.g. 'Book Catering'), and a real mobile drawer. All links and CTAs route through route hrefs. Use as the sticky site header for food trucks, street-food vendors, taco / burger / bowl concepts, pop-up kitchens or catering businesses.",
  props: z.object({
    /** Brand / food-truck name; initials form the monogram. */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled pill CTA. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Navigation target for the CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Curbside Kitchen'
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'Locations', 'Catering', 'FAQ', 'Book Catering']
    const lastNav = nav[nav.length - 1]
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? lastNav
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const initials = brand
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <SiteNav
        position="fixed"
        height="outlier"
        rowClassName="py-4"
        className={cn('bg-background/95', props.className)}
        containerClassName="max-w-6xl px-6"
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={
                <span
                  className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-bold text-background"
                  aria-hidden="true"
                >
                  {initials}
                </span>
              }
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} href={label} className="font-normal">
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta variant="dark-pill" href={ctaTarget} className="px-4 py-2">
            {lastNav}
          </NavbarCta>
        </NavbarNav>

        <NavbarActions>
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <CommerceAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <CommerceCartButton
            lakebed={lakebed}
            fallbackCount={initialCartCount}
            buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
