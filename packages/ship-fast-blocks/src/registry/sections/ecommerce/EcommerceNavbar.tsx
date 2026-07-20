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
} from '#/section-kit/index.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * EcommerceNavbar — editorial-commerce store header for a general online
 * marketplace or retail shop. A sticky, hairline-ruled bar with an extrabold
 * uppercase wordmark, mono uppercase micro-label category nav, product command
 * search, Shoo account dropdown, shared cart drawer with a square tabular
 * quantity badge, a square ink "Shop" CTA with press feedback, and a real
 * mobile drawer on small screens. Nav items route through route hrefs so
 * labels can drive page-switching. Use as the site header for online stores,
 * marketplaces, electronics/home-goods shops, or any sharp editorial retail
 * storefront. Renders fully with no props via baked-in "Marketplace" defaults.
 */
export const EcommerceNavbar = defineCapsule({
  name: 'EcommerceNavbar',
  description:
    "Editorial-commerce store header for a general online marketplace or retail shop: a sticky hairline-ruled bar with an extrabold uppercase wordmark, mono uppercase micro-label category nav (Shop, Categories, Deals, New, Sale), product command search, Shoo account dropdown, shared Lakebed cart drawer with a square tabular quantity badge, a square ink 'Shop' CTA with press feedback, and a real mobile drawer. Nav items and the CTA route through route hrefs and labels match the nav array so PageSwitch can swap pages. Use as the site header for online stores, marketplaces, electronics, home goods, multi-category retail, or any sharp editorial storefront.",
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
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95', props.className)}
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
            badgeClassName="rounded-none bg-primary font-mono text-[10px] font-semibold tabular-nums text-primary-foreground"
          >
            <CartIcon />
          </CommerceCartButton>
          <NavbarCta
            variant="dark"
            href={props.shopTarget ?? shopCta}
            className="ml-2 hidden h-9 rounded-none px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px sm:inline-flex"
          >
            {shopCta}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
