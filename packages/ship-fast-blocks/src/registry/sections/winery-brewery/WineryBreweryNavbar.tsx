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
 * WineryBreweryNavbar — sticky site header for a winery, vineyard estate, or
 * craft brewery / taproom. A serif wordmark beside an inline grape-cluster mark
 * sits with centered desktop nav links, product/tasting search, Shoo account
 * dropdown, shared Lakebed cart drawer, a tasting-room phone number, a "Plan a
 * Visit" CTA, and a real mobile drawer on small screens. Use as the header for
 * wineries, cellar doors, vineyards, breweries, taprooms, cideries, or any
 * rustic-premium drinks brand where bookings and visits matter.
 */
function GrapeClusterMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4c1.2 0 2-1 2-2" />
      <path d="M12 7v0" />
      <circle cx="12" cy="9" r="2.1" />
      <circle cx="8.4" cy="12" r="2.1" />
      <circle cx="15.6" cy="12" r="2.1" />
      <circle cx="10.2" cy="15.4" r="2.1" />
      <circle cx="13.8" cy="15.4" r="2.1" />
      <circle cx="12" cy="19" r="2.1" />
    </svg>
  )
}

export const WineryBreweryNavbar = defineCapsule({
  name: 'WineryBreweryNavbar',
  description:
    "Sticky winery / brewery site header (vineyard estate or craft taproom): serif wordmark + inline grape-cluster mark, centered desktop nav links, product/tasting command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a tasting-room phone number, a 'Plan a Visit' CTA, and a real mobile drawer. Use as the header for wineries, cellar doors, vineyards, breweries, taprooms, cideries, or any rustic-premium drinks brand where bookings and visits matter.",
  props: z.object({
    /** Winery / brewery brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Tasting-room phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
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
    const nav = props.nav?.length
      ? props.nav
      : ['Wines', 'Visit', 'Events', 'Gallery', 'Contact']
    const brand = props.brand ?? 'Cellar & Cask'
    const homeTarget = props.homeTarget ?? nav[0]
    const phone = props.phone ?? '(707) 555-0148'
    const ctaLabel = props.ctaLabel ?? 'Plan a Visit'
    const ctaTarget = props.ctaTarget ?? 'Visit'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-3"
          >
            <BrandLogo
              brand={brand}
              fallback={<GrapeClusterMark className="size-8 text-primary" />}
              labelClassName="font-serif text-xl font-medium text-foreground"
            />
          </button>

          <div className="hidden items-center gap-8 md:flex">
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
            {phone.trim() ? (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline"
              >
                {phone}
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="hidden items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
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
        </nav>
      </header>
    )
  },
})
