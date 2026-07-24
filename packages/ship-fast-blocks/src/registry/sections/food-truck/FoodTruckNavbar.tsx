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
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * FoodTruckNavbar — fixed, backdrop-blurred sticker-poster header for a gourmet
 * food-truck / street-food site. A hairline-bottomed bar pinned to the top with a
 * square rubber-stamp monogram tile (sharp border-2, brand initials) beside the
 * brand wordmark on the left, mono uppercase index-tracked nav links on the right
 * (desktop), menu command search, Shoo account dropdown, shared Lakebed cart drawer
 * with reactive badge, a hard-bordered rounded-none slab CTA built from the LAST nav
 * item (e.g. "Book Catering") with an offset token shadow + press feedback, and a
 * real mobile drawer. Every link and CTA routes through route hrefs so PageSwitch can
 * swap pages. Use as the sticky site header for food trucks, street-food vendors,
 * taco/burger/bowl concepts, pop-up kitchens or catering businesses.
 */
export const FoodTruckNavbar = defineCapsule({
  name: 'FoodTruckNavbar',
  description:
    "Fixed, backdrop-blurred sticker-poster top navigation bar for a gourmet food-truck / street-food site: a hairline-bottomed header pinned to the top with a square rubber-stamp monogram tile (sharp border-2, brand initials) beside the brand wordmark on the left, mono uppercase index-tracked nav links on the right (desktop), menu command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a hard-bordered rounded-none slab CTA built from the LAST nav item (e.g. 'Book Catering') with an offset token shadow and press feedback, and a real mobile drawer. All links and CTAs route through route hrefs. Use as the sticky site header for food trucks, street-food vendors, taco / burger / bowl concepts, pop-up kitchens or catering businesses.",
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
        className={cn(
          'border-b-2 border-foreground bg-background/90 text-foreground supports-[backdrop-filter]:bg-background/70',
          props.className,
        )}
        containerClassName="max-w-6xl px-6"
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={
                <span
                  className="grid size-7 -rotate-3 place-items-center rounded-none border-2 border-foreground bg-foreground text-[10px] font-extrabold text-background"
                  aria-hidden="true"
                >
                  {initials}
                </span>
              }
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 font-mono text-xs font-medium uppercase tracking-[0.12em] hover:bg-transparent"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="dark-pill"
            href={ctaTarget}
            className="rounded-none border-2 border-foreground px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-[3px_3px_0_0] shadow-primary/50 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] active:translate-y-px active:shadow-none"
          >
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
