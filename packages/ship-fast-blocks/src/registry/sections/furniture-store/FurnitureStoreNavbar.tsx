import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * FurnitureStoreNavbar — sticky, backdrop-blurred top navigation bar for a warm
 * minimal furniture / home-decor e-commerce site. A bordered-bottom header pinned
 * to the top: a decorative house-glyph logo tile + store name on the left, a
 * horizontal set of category nav links (with a destructive-colored "Sale" link)
 * in the center, and a set of search / account / cart icon buttons (cart shows a
 * count badge) plus a mobile hamburger on the right. Links and icon buttons route
 * through route hrefs for page-switching. Use as the sticky site header for
 * furniture stores, home-decor or interiors brands, homewares retailers, or any
 * warm boutique-retail landing page. Renders fully with no props via baked-in
 * "Haven & Home" defaults.
 */
export const FurnitureStoreNavbar = defineCapsule({
  name: 'FurnitureStoreNavbar',
  description:
    "Sticky backdrop-blurred top navigation bar for a warm minimal furniture / home-decor e-commerce site: bordered-bottom header pinned to the top with a house-glyph logo tile + store name on the left, horizontal category nav links (with a destructive-colored 'Sale' link) in the center, and search / account / cart icon buttons (cart shows a count badge) plus a mobile hamburger on the right. Links and icon buttons route through route hrefs for page-switching. Use as the sticky site header for furniture stores, home-decor or interiors brands, homewares retailers, or any warm boutique-retail landing page.",
  props: z.object({
    /** Brand / store name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Cart item-count badge value. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Haven & Home'
    const nav = props.nav?.length
      ? props.nav
      : ['Room Inspiration', 'Furniture', 'Decor', 'New Arrivals', 'Sale']
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 9v11h8v-7h4v7h8V9L12 2z" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand
          href={brand}
          className="gap-2"
          aria-label={`${brand} - Return to homepage`}
        >
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={<LogoMark className="size-8 text-muted-foreground" />}
            />
            <LogoLabel className="text-xl font-semibold tracking-tight lg:text-2xl" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                label.toLowerCase() === 'sale'
                  ? 'text-destructive hover:text-destructive/80'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="rounded-full p-2 transition-colors hover:bg-muted"
          >
            <svg
              className="size-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            buttonClassName="hidden rounded-full p-2 transition-colors hover:bg-muted sm:flex"
          >
            <svg
              className="size-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </CommerceAccountButton>
          <CommerceCartButton
            lakebed={lakebed}
            fallbackCount={initialCartCount}
            label="Shopping cart"
            buttonClassName="relative rounded-full p-2 transition-colors hover:bg-muted"
          >
            <svg
              className="size-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            homeTarget={nav[0]}
            label="Menu"
            buttonClassName="rounded-full p-2 transition-colors hover:bg-muted md:hidden"
          >
            <svg
              className="size-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
