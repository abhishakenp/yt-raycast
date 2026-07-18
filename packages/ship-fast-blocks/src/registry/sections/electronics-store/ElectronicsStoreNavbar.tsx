import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
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
 * ElectronicsStoreNavbar — sticky translucent top navigation bar for a premium
 * electronics / gadgets e-commerce storefront. A blurred, border-bottomed header
 * pinned to the top with a bolt logo mark + store name on the left, a horizontal
 * row of category nav links, and utility icons on the right (product search,
 * Shoo account, cart drawer with a quantity badge, mobile hamburger). Nav links
 * route through useNavigate while utilities use shared Lakebed commerce state.
 * Use as the sticky site header for electronics stores, gadget shops,
 * consumer-tech retailers, audio/headphone shops, or camera/drone stores.
 */
export const ElectronicsStoreNavbar = defineCapsule({
  name: 'ElectronicsStoreNavbar',
  description:
    'Sticky translucent top navigation bar for a premium electronics / gadgets e-commerce storefront: a blurred, border-bottomed header pinned to the top with a bolt logo mark plus store name on the left, horizontal category nav links, and utility icons on the right (product command search, Shoo account dropdown, shared Lakebed cart drawer with a reactive quantity badge, mobile drawer). Nav links route through useNavigate while utilities use shared Lakebed commerce state. Use as the sticky site header for electronics stores, gadget shops, consumer-tech retailers, audio/headphone shops, camera/drone stores, or any modern product-catalog storefront.',
  props: z.object({
    /** Brand / store name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Cart badge quantity. */
    cartCount: z.string().optional(),
    /** Navigation target for the brand logo and mobile menu home row. */
    homeTarget: z.string().optional(),
    /** Deprecated: cart opens the shared Lakebed drawer. */
    cartTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'TechNova'
    const nav = props.nav?.length
      ? props.nav
      : ['Products', 'Deals', 'Categories', 'Support']
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0
    const homeTarget = props.homeTarget ?? nav[0]
    const utilityButtonClass =
      'p-2 text-muted-foreground transition-colors hover:text-foreground'

    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2"
          >
            <BrandLogo brand={brand}>
              <LogoImage fallback={<BoltMark className="size-8" />} />
              <LogoLabel className="text-xl font-semibold text-foreground" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav className="gap-6">
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName={utilityButtonClass}
          >
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
          </CommerceSearchButton>
          <CommerceAccountButton
            lakebed={lakebed}
            buttonClassName={utilityButtonClass}
          >
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
          </CommerceAccountButton>
          <CommerceCartButton
            lakebed={lakebed}
            fallbackCount={initialCartCount}
            buttonClassName={cn('relative', utilityButtonClass)}
            badgeClassName="right-1 top-1 bg-foreground text-background"
          >
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
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </CommerceCartButton>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            label="Menu"
            buttonClassName="p-2 text-muted-foreground md:hidden"
          >
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </CommerceMobileMenu>
        </NavbarActions>
      </SiteNav>
    )
  },
})
