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
 * MarketplaceNavbar — sticky site header for a multi-vendor marketplace /
 * e-commerce destination. Renders a solid brand-square logo tile beside the
 * marketplace name, centered category nav links on desktop, product command
 * search, Shoo account dropdown, shared cart drawer with reactive badge, a
 * vibrant "Sell on …" seller CTA, and a real mobile drawer on small screens.
 * Every nav item and the CTA route through useNavigate. Use as the sticky site
 * header for online marketplaces, multi-vendor or maker/artisan platforms,
 * handmade/craft stores, and retail aggregators. Renders fully with no props
 * via baked-in "MarketHub" defaults.
 */
export const MarketplaceNavbar = defineCapsule({
  name: 'MarketplaceNavbar',
  description:
    "Sticky site header for a multi-vendor marketplace / e-commerce destination: a solid brand-square logo tile beside the marketplace name, centered category nav links on desktop, product command search, Shoo account dropdown, shared Lakebed cart drawer with a reactive quantity badge, a vibrant 'Sell on …' seller-onboarding CTA, and a real mobile drawer on small screens. Every nav item and the CTA route through useNavigate. Use as the sticky site header for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
  props: z.object({
    /** Brand / marketplace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Category nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo button. */
    homeTarget: z.string().optional(),
    /** Override the auto-generated "Sell on {brand}" CTA label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the seller-onboarding CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'MarketHub'
    const nav = props.nav?.length
      ? props.nav
      : ['Categories', 'Featured Sellers', 'Trending', 'Reviews']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? `Sell on ${brand}`
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const LogoMark = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const IconButtonClass =
      'p-2 text-muted-foreground transition-colors hover:text-foreground'

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
              className="flex items-center gap-3 text-left"
            >
              <BrandLogo
                brand={brand}
                fallback={<LogoMark className="size-8 text-sm" />}
                labelClassName="text-lg font-bold tracking-tight text-foreground sm:text-xl"
              />
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
              buttonClassName={IconButtonClass}
            />
            <CommerceAccountButton
              lakebed={lakebed}
              buttonClassName={IconButtonClass}
            />
            <CommerceCartButton
              lakebed={lakebed}
              fallbackCount={initialCartCount}
              buttonClassName={cn('relative', IconButtonClass)}
            />
            <button
              type="button"
              onClick={() => go(props.ctaTarget ?? 'Sell')}
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              {ctaLabel}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
