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
 * BeautyStoreNavbar — sticky translucent top navigation bar for a beauty / skincare /
 * cosmetics e-commerce storefront. A blurred, border-bottomed header pinned to the top
 * with the store name (serif) on the left, a horizontal row of category nav links in the
 * center, and utility icons (search, account, cart with badge, mobile menu) on the
 * right. Every link and icon routes through useNavigate. Use as the sticky site header
 * for beauty stores, skincare shops, cosmetics brands, clean beauty retailers, or premium
 * personal-care DTC storefronts.
 */
export const BeautyStoreNavbar = defineCapsule({
  name: 'BeautyStoreNavbar',
  description:
    'Sticky translucent top navigation bar for a beauty / skincare / cosmetics e-commerce storefront: a blurred, border-bottomed header pinned to the top with the store name in serif on the left, horizontal category nav links in the center, and utility icons (search, account, cart with a quantity badge, mobile hamburger) on the right. Every link and icon routes through useNavigate. Use as the sticky site header for beauty stores, skincare shops, cosmetics brands, clean beauty retailers, or premium personal-care DTC storefronts.',
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
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Lumière'
    const nav = props.nav?.length
      ? props.nav
      : ['Bestsellers', 'New Arrivals', 'Skincare', 'Makeup', 'Brands']
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0
    const homeTarget = props.homeTarget ?? nav[0]

    const SearchIcon = () => (
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

    const AccountIcon = () => (
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

    const CartIcon = () => (
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

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2 font-serif text-2xl font-semibold tracking-tight text-foreground"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
              <LogoImage className="mr-2 size-7 align-middle" />
              <LogoLabel />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
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
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground md:hidden"
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
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </CommerceMobileMenu>
        </NavbarActions>
      </SiteNav>
    )
  },
})
