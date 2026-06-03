import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MarketplaceNavbar — sticky, backdrop-blurred commerce navbar for a
 * multi-vendor marketplace / e-commerce site. A border-bottomed header pinned to
 * the top pairs a solid brand-square logo tile + name on the left with a
 * full-width product/brand/seller search bar in the center, and a wishlist text
 * link, a cart icon carrying an item-count badge, and an account avatar button
 * on the right; a secondary category navigation bar sits beneath on large
 * screens. Clean, neutral, shopping-first aesthetic on a light canvas. Every
 * nav item, the search submit, and each action routes through useNavigate. Use
 * as the sticky site header for online marketplaces, multi-vendor or
 * maker/artisan platforms, handmade/craft stores, and retail aggregators.
 */
export const MarketplaceNavbar = defineComponent({
  name: "MarketplaceNavbar",
  description:
    "Sticky, backdrop-blurred commerce navbar for a multi-vendor marketplace / e-commerce site: a border-bottomed header with a solid brand-square logo tile + name on the left, a full-width product/brand/seller search bar in the center, and a wishlist text link, a cart icon with an item-count badge, and an account avatar button on the right, plus a secondary category navigation bar beneath on large screens. Clean, neutral, shopping-first aesthetic on a light canvas. Every nav item, the search submit, and each action routes through useNavigate. Use as the sticky site header for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
  props: z.object({
    /** Brand / marketplace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Secondary category-bar link labels. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo button. */
    homeTarget: z.string().optional(),
    /** Navigation target for the search submit / mobile search button. */
    searchTarget: z.string().optional(),
    searchPlaceholder: z.string().optional(),
    wishlistLabel: z.string().optional(),
    cartLabel: z.string().optional(),
    cartCount: z.string().optional(),
    accountLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "MarketHub"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Categories",
          "Featured Sellers",
          "Trending",
          "Reviews",
          "Sell on MarketHub",
        ]
    const homeTarget = props.homeTarget ?? "Categories"
    const searchTarget = props.searchTarget ?? "Trending"
    const searchPlaceholder =
      props.searchPlaceholder ?? "Search for products, brands, sellers..."
    const wishlistLabel = props.wishlistLabel ?? "Wishlist"
    const cartLabel = props.cartLabel ?? "Cart"
    const cartCount = props.cartCount ?? "3"
    const accountLabel = props.accountLabel ?? "Account"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              aria-label={`${brand} Home`}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8 text-sm" />
              <span className="text-xl font-semibold text-foreground">{brand}</span>
            </button>

            <form
              className="mx-8 hidden max-w-xl flex-1 md:flex"
              onSubmit={(e) => {
                e.preventDefault()
                go(searchTarget)
              }}
            >
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search marketplace"
                  className="w-full rounded-lg border border-transparent bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <SearchIcon className="absolute left-3 top-2.5 size-5 text-muted-foreground" />
              </div>
            </form>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Search"
                onClick={() => go(searchTarget)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <SearchIcon className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(wishlistLabel)}
                className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{wishlistLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => go(cartLabel)}
                aria-label={`${cartLabel} with ${cartCount} items`}
                className="relative flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden sm:inline">{cartLabel}</span>
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => go(accountLabel)}
                className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="size-6 overflow-hidden rounded-full bg-muted">
                  <Image
                    alt="portrait headshot of marketplace account user"
                    w={100}
                    h={100}
                    className="size-full object-cover"
                  />
                </span>
                <span className="hidden lg:inline">{accountLabel}</span>
              </button>
            </div>
          </div>

          <div className="hidden items-center gap-8 border-t border-border py-3 text-sm lg:flex">
            {nav.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className={cn(
                  "transition-colors hover:text-foreground",
                  i === 0
                    ? "font-medium text-muted-foreground"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>
    )
  },
})
