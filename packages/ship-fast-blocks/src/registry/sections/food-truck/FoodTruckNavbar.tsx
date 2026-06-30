import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * Every link and CTA routes through useNavigate so PageSwitch can swap pages.
 * Use as the sticky site header for food trucks, street-food vendors,
 * taco/burger/bowl concepts, pop-up kitchens or catering businesses.
 */
export const FoodTruckNavbar = defineCapsule({
  name: 'FoodTruckNavbar',
  description:
    "Fixed, backdrop-blurred top navigation bar for a gourmet food-truck / street-food site: a border-bottomed header pinned to the top with a circular monogram logo tile (brand initials) and brand wordmark on the left, horizontal muted-to-foreground nav links on the right (desktop), menu command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a filled pill CTA built from the LAST nav item (e.g. 'Book Catering'), and a real mobile drawer. All links and CTAs route through useNavigate. Use as the sticky site header for food trucks, street-food vendors, taco / burger / bowl concepts, pop-up kitchens or catering businesses.",
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
    const go = useNavigate()
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
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2"
          >
            <BrandLogo
              brand={brand}
              fallback={
                <span
                  className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-bold text-background"
                  aria-hidden="true"
                >
                  {initials}
                </span>
              }
              labelClassName="text-lg font-semibold tracking-tight"
            />
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.slice(0, -1).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-foreground/90"
            >
              {lastNav}
            </button>
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </nav>
      </header>
    )
  },
})
