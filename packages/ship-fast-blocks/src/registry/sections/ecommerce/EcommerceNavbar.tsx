import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * EcommerceNavbar — sticky store header for a general online marketplace or
 * retail shop. Renders a bold sans-serif wordmark, category nav, product
 * command search, Shoo account dropdown, shared cart drawer with reactive badge,
 * and a real mobile drawer on small screens. Nav items route through useNavigate
 * so labels can drive page-switching. Use as the site header for online stores, marketplaces,
 * electronics/home-goods shops, or any clean modern retail storefront. Renders
 * fully with no props via baked-in "Marketplace" defaults.
 */
export const EcommerceNavbar = defineCapsule({
  name: 'EcommerceNavbar',
  description:
    "Sticky store header for a general online marketplace or retail shop: a bold sans-serif wordmark, category nav (Shop, Categories, Deals, New, Sale), product command search, Shoo account dropdown, shared Lakebed cart drawer with a reactive quantity badge, a primary 'Shop' CTA pill, and a real mobile drawer. Nav items and the CTA route through useNavigate and labels match the nav array so PageSwitch can swap pages. Use as the site header for online stores, marketplaces, electronics, home goods, multi-category retail, or any clean modern storefront.",
  props: z.object({
    /** Brand / store name shown as the bold wordmark. */
    brand: z.string().optional(),
    /** Top-level category nav labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label for the primary call-to-action button. */
    shopCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    shopTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Shop', 'Categories', 'Deals', 'New', 'Sale']
    const brand = props.brand ?? 'Marketplace'
    const shopCta = props.shopCta ?? 'Shop'
    const homeTarget = props.homeTarget ?? nav[0]
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const SearchIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )

    const AccountIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )

    const CartIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 10a4 4 0 0 1-8 0" />
        <path d="M3.103 6.034h17.794" />
        <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <CommerceMobileMenu
              brand={brand}
              nav={nav}
              homeTarget={homeTarget}
              buttonClassName="-ml-2 p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            />
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="text-xl font-bold tracking-tight text-foreground lg:text-2xl"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-6 md:flex">
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
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CommerceSearchButton
              lakebed={lakebed}
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
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
              buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <CartIcon />
            </CommerceCartButton>
            <button
              type="button"
              onClick={() => go(props.shopTarget ?? shopCta)}
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              {shopCta}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
