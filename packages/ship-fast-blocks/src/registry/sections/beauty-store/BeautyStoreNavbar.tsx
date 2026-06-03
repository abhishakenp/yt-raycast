import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import type { ReactNode } from "react"

/**
 * BeautyStoreNavbar — sticky translucent top navigation bar for a beauty / skincare /
 * cosmetics e-commerce storefront. A blurred, border-bottomed header pinned to the top
 * with the store name (serif) on the left, a horizontal row of category nav links in the
 * center, and utility icons (search, account, cart with badge, mobile menu) on the
 * right. Every link and icon routes through useNavigate. Use as the sticky site header
 * for beauty stores, skincare shops, cosmetics brands, clean beauty retailers, or premium
 * personal-care DTC storefronts.
 */
export const BeautyStoreNavbar = defineComponent({
  name: "BeautyStoreNavbar",
  description:
    "Sticky translucent top navigation bar for a beauty / skincare / cosmetics e-commerce storefront: a blurred, border-bottomed header pinned to the top with the store name in serif on the left, horizontal category nav links in the center, and utility icons (search, account, cart with a quantity badge, mobile hamburger) on the right. Every link and icon routes through useNavigate. Use as the sticky site header for beauty stores, skincare shops, cosmetics brands, clean beauty retailers, or premium personal-care DTC storefronts.",
  props: z.object({
    /** Brand / store name shown in the navbar (serif). */
    brand: z.string().optional(),
    /** Nav link labels / category routes. */
    nav: z.array(z.string()).optional(),
    /** Cart badge quantity. */
    cartCount: z.string().optional(),
    /** Navigation target for the brand logo and search icon. */
    homeTarget: z.string().optional(),
    /** Navigation target for the account icon. */
    contactTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Lumière"
    const nav = props.nav?.length
      ? props.nav
      : ["Bestsellers", "New Arrivals", "Skincare", "Makeup", "Brands"]
    const cartCount = props.cartCount ?? "3"
    const homeTarget = props.homeTarget ?? nav[0]
    const contactTarget = props.contactTarget ?? nav[nav.length - 1]

    const SearchIcon = (): ReactNode => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    )

    const AccountIcon = (): ReactNode => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    )

    const CartIcon = (): ReactNode => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    )

    const MenuIcon = (): ReactNode => (
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-foreground"
            >
              {brand}
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
              <button
                type="button"
                aria-label="Search"
                onClick={() => go(homeTarget)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <SearchIcon />
              </button>
              <button
                type="button"
                aria-label="Account"
                onClick={() => go(contactTarget)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <AccountIcon />
              </button>
              <button
                type="button"
                aria-label="Cart"
                onClick={() => go(homeTarget)}
                className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <CartIcon />
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(homeTarget)}
                className="p-2 text-muted-foreground md:hidden"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  },
})
