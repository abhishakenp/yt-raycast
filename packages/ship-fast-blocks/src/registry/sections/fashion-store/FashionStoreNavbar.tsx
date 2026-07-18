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
 * FashionStoreNavbar — fixed, backdrop-blurred top navigation bar for a
 * minimalist fashion / apparel store. A border-bottomed translucent header
 * pinned to the top with a centered serif wordmark logo, a hamburger menu
 * button on mobile, horizontal nav links (desktop), and a trio of icon
 * actions on the right (search, account, shopping bag with an item-count
 * badge). Search/account/cart use shared Lakebed commerce primitives; nav links route through useNavigate. Use as the
 * sticky site header for clothing brands, boutiques, apparel and accessories
 * shops, or any premium minimalist retail storefront.
 */
export const FashionStoreNavbar = defineCapsule({
  name: 'FashionStoreNavbar',
  description:
    'Fixed, backdrop-blurred top navigation bar for a minimalist fashion / apparel store: a border-bottomed translucent header pinned to the top with a centered serif wordmark logo, a real shadcn mobile drawer button on mobile, horizontal nav links on desktop, and a trio of fullstack commerce actions on the right (product command search, Shoo account dropdown, shopping bag with reactive item-count badge and shadcn cart drawer). Nav links route through useNavigate and labels match the nav array so PageSwitch can swap pages. Use as the sticky site header for clothing brands, boutiques, apparel and accessories shops, lookbook commerce, or any premium minimalist retail storefront.',
  props: z.object({
    /** Brand / store name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Item count shown on the shopping-bag badge. */
    bagCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NOIRE'
    const nav = props.nav?.length
      ? props.nav
      : ['Collections', 'Lookbook', 'New Arrivals', 'Our Story', 'Journal']
    const initialBagCount = Number.parseInt(props.bagCount ?? '0', 10) || 0
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
          strokeWidth="1.5"
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
          strokeWidth="1.5"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    )
    const BagIcon = () => (
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
    )
    return (
      <SiteNav
        position="fixed"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="items-center"
          >
            <BrandLogo brand={brand} className="mr-2 size-8">
              <LogoImage className="mr-2 size-8" />
              <LogoLabel />
            </BrandLogo>
            <span className="font-serif text-2xl font-medium tracking-tight lg:text-3xl">
              {brand}
            </span>
          </button>
        </NavbarBrand>

        <NavbarNav breakpoint="lg">
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            buttonClassName="-ml-2 p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
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
          </CommerceMobileMenu>
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
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
            label="Shopping bag"
            fallbackCount={initialBagCount}
            buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <BagIcon />
          </CommerceCartButton>
        </NavbarActions>
      </SiteNav>
    )
  },
})
