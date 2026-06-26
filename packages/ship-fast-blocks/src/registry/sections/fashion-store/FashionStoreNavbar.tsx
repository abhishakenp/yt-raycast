import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FashionStoreNavbar — fixed, backdrop-blurred top navigation bar for a
 * minimalist fashion / apparel store. A border-bottomed translucent header
 * pinned to the top with a centered serif wordmark logo, a hamburger menu
 * button on mobile, horizontal nav links (desktop), and a trio of icon
 * actions on the right (search, account, shopping bag with an item-count
 * badge). Every nav item and action routes through useNavigate. Use as the
 * sticky site header for clothing brands, boutiques, apparel and accessories
 * shops, or any premium minimalist retail storefront.
 */
export const FashionStoreNavbar = defineComponent({
  name: 'FashionStoreNavbar',
  description:
    'Fixed, backdrop-blurred top navigation bar for a minimalist fashion / apparel store: a border-bottomed translucent header pinned to the top with a centered serif wordmark logo, a hamburger menu button on mobile, horizontal nav links on desktop, and a trio of icon actions on the right (search, account, shopping bag with an item-count badge). Every nav item and action routes through useNavigate and labels match the nav array so PageSwitch can swap pages. Use as the sticky site header for clothing brands, boutiques, apparel and accessories shops, lookbook commerce, or any premium minimalist retail storefront.',
  props: z.object({
    /** Brand / store name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Item count shown on the shopping-bag badge. */
    bagCount: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NOIRE'
    const nav = props.nav?.length
      ? props.nav
      : ['Collections', 'Lookbook', 'New Arrivals', 'Our Story', 'Journal']
    const bagCount = props.bagCount ?? '3'

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="-ml-2 p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            >
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
                  strokeWidth="1.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center"
            >
              <span className="font-serif text-2xl font-medium tracking-tight lg:text-3xl">
                {brand}
              </span>
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 lg:flex">
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

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Search"
                onClick={() => go('Search')}
                className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
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
                    strokeWidth="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Account"
                onClick={() => go('Account')}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
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
                    strokeWidth="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Shopping bag"
                onClick={() => go('Bag')}
                className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
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
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {bagCount}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
