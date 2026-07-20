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
 * MarketplaceNavbar — editorial commerce-index site header for a multi-vendor
 * marketplace. A sticky, hairline-ruled bar with an extrabold uppercase
 * wordmark logo lockup, a row of mono uppercase micro-label category nav links
 * (secondary items demote below lg), product command search, Shoo account
 * dropdown, a shared Lakebed cart drawer with a square tabular quantity badge,
 * a square ink "Sell on …" seller-onboarding CTA with press feedback, and a
 * real mobile drawer on small screens. Every nav item and the CTA route through
 * route hrefs so labels can drive page-switching. Use as the sticky site header
 * for online marketplaces, multi-vendor or maker/artisan platforms,
 * handmade/craft stores, and retail aggregators. Renders fully with no props
 * via baked-in "MarketHub" defaults.
 */
export const MarketplaceNavbar = defineCapsule({
  name: 'MarketplaceNavbar',
  description:
    "Editorial commerce-index site header for a multi-vendor marketplace: a sticky, hairline-ruled bar with an extrabold uppercase wordmark logo lockup, a row of mono uppercase micro-label category nav links (secondary items demote below lg), product command search, Shoo account dropdown, a shared Lakebed cart drawer with a square tabular quantity badge, a square ink 'Sell on …' seller-onboarding CTA with press feedback, and a real mobile drawer on small screens. Every nav item and the CTA route through route hrefs so labels can drive page-switching. Use as the sticky site header for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
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
    const brand = props.brand ?? 'MarketHub'
    const nav = props.nav?.length
      ? props.nav
      : ['Categories', 'Featured Sellers', 'Trending', 'Reviews']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? `Sell on ${brand}`
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const IconButtonClass =
      'p-2 text-muted-foreground transition-colors hover:text-foreground'

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95', props.className)}
        containerClassName="max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand
          href={homeTarget}
          className="text-lg font-extrabold uppercase tracking-tight text-foreground"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'rounded-none px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground',
                i > 3 && 'hidden lg:inline-flex',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-1 sm:gap-1.5">
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="-ml-2 p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
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
            badgeClassName="rounded-none bg-primary font-mono text-[10px] font-semibold tabular-nums text-primary-foreground"
          />
          <NavbarCta
            variant="dark"
            href={props.ctaTarget ?? 'Sell'}
            className="ml-2 hidden h-9 rounded-none px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px lg:inline-flex"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
