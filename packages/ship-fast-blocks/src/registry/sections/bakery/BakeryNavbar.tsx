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
 * BakeryNavbar — sticky, blurred top navigation bar for an artisan-bakery /
 * craft-bread shop site. A border-bottomed, backdrop-blurred header pinned to
 * the top of the viewport: the bakery name as a wordmark on the left, a
 * horizontal set of nav links in the center (desktop), product/menu search,
 * Shoo account dropdown, a shared Lakebed cart drawer, and an "Order Online"
 * pill CTA. Warm, editorial, light aesthetic with neutral surfaces. Every link
 * and the CTA route through useNavigate so labels can drive page-switching. Use
 * as the sticky site header for bakeries, patisseries, cafes, pastry kitchens,
 * or any local food maker.
 */
export const BakeryNavbar = defineCapsule({
  name: 'BakeryNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for an artisan-bakery / craft-bread shop site: a border-bottomed header pinned to the top with the bakery name as a wordmark on the left, horizontal nav links in the center (desktop), menu command search, Shoo account dropdown, a shared Lakebed cart drawer with reactive badge, and an 'Order Online' pill CTA plus a real mobile drawer. Warm, editorial, light aesthetic on neutral card surfaces; links and CTA route through useNavigate for page-switching. Use as the sticky site header for bakeries, patisseries, sourdough/artisan-bread shops, cafes, pastry kitchens, dessert and cake studios, or any local food maker.",
  props: z.object({
    /** Brand / bakery name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the right-hand "Order Online" pill CTA. */
    orderCta: z.string().optional(),
    /** Navigation target for the order CTA and mobile menu. */
    orderTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Flour & Stone'
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'Our Story', 'Gallery', 'Order', 'Visit']
    const orderCta = props.orderCta ?? 'Order Online'
    const orderTarget = props.orderTarget ?? 'Order'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const SearchIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m21 21-4.35-4.35" />
        <circle cx="11" cy="11" r="7" />
      </svg>
    )

    const AccountIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    )

    const CartIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 8h12l-1 13H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground lg:text-2xl"
            >
              <BrandLogo brand={brand} className="mr-2 size-7 align-middle" />
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <CommerceSearchButton
                lakebed={lakebed}
                buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                <SearchIcon />
              </CommerceSearchButton>
              <CommerceAccountButton
                lakebed={lakebed}
                buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <AccountIcon />
              </CommerceAccountButton>
              <CommerceCartButton
                lakebed={lakebed}
                fallbackCount={initialCartCount}
                label="Cart"
                buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <CartIcon />
              </CommerceCartButton>
              <button
                type="button"
                onClick={() => go(orderTarget)}
                className="hidden items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
              >
                {orderCta}
              </button>
              <CommerceMobileMenu
                brand={brand}
                nav={nav}
                homeTarget={nav[0]}
                buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </div>
      </header>
    )
  },
})
