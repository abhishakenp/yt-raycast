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
 * CafeNavbar — fixed, translucent top navigation bar for a cozy neighborhood
 * cafe / coffee shop. A backdrop-blurred header pinned to the top: an inline
 * owl brand mark + cafe name on the left, horizontal nav links in the center
 * (desktop), menu command search, Shoo account dropdown, shared Lakebed cart
 * drawer, a pill-shaped "Visit Us" CTA, and a real mobile drawer on the right.
 * Every link and the CTA route through useNavigate so labels drive
 * page-switching. Use as the sticky site header for cafes, bakeries, tea
 * houses, brunch spots, or any warm food-and-drink landing page.
 */
export const CafeNavbar = defineCapsule({
  name: 'CafeNavbar',
  description:
    'Fixed translucent top navigation bar for a cozy cafe / coffee shop: backdrop-blurred header with an inline owl brand mark + cafe name on the left, horizontal nav links in the center (desktop), menu command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a pill-shaped primary CTA, and a real mobile drawer on the right. Every link and CTA route through useNavigate for page-switching. Use as the sticky site header for cafes, bakeries, tea houses, brunch spots, or warm food-and-drink landing pages.',
  props: z.object({
    /** Cafe / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / hamburger clicks. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Little Owl Coffee'
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'Our Story', 'Location', 'Reviews']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Visit Us'
    const ctaTarget = props.ctaTarget ?? 'Location'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const OwlMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18ZM6 12C6 10.9 5.1 10 4 10C2.9 10 2 10.9 2 12C2 13.1 2.9 14 4 14C5.1 14 6 13.1 6 12ZM20 10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14C21.1 14 22 13.1 22 12C22 10.9 21.1 10 20 10ZM16.24 17.24L14.83 15.83C14.09 16.57 13.11 17 12 17C9.79 17 8 15.21 8 13C8 11.89 8.43 10.91 9.17 10.17L7.76 8.76C6.67 9.85 6 11.35 6 13C6 16.31 8.69 19 12 19C13.65 19 15.15 18.33 16.24 17.24ZM15.72 7.3C15.89 7.68 16 8.07 16 8.5C16 10.43 14.43 12 12.5 12C12.07 12 11.68 11.89 11.3 11.72L9.88 13.14C10.38 13.64 10.97 14.03 11.62 14.29L12 16.5L12.38 14.29C14.07 13.62 15.25 12 15.25 10.13C15.25 9.25 14.99 8.43 14.54 7.73L15.72 7.3Z" />
      </svg>
    )

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-3"
            >
              <OwlMark className="size-8 text-primary" />
              <span className="font-serif text-xl font-medium text-foreground">
                {brand}
              </span>
            </button>

            <div className="hidden items-center gap-10 md:flex">
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
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="hidden items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
              >
                {ctaLabel}
              </button>
              <CommerceMobileMenu
                brand={brand}
                nav={nav}
                homeTarget={homeTarget}
                buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
