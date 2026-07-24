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
 * BakeryNavbar — sticky, blurred top navigation bar for an artisan-bakery /
 * craft-bread shop site, in a playful-geometric warm language. A
 * backdrop-blurred header pinned to the top with a chunky 2px bottom rule: the
 * bakery name as a serif wordmark on the left, a horizontal set of nav links
 * in the center (desktop), product/menu search, Shoo account dropdown, a
 * shared Lakebed cart drawer, and a chunky rounded-full "Order Online" pill
 * CTA with a 2px border, soft offset shadow, and mechanical press feedback.
 * Every link and the CTA route through route hrefs so labels can drive
 * page-switching. Use as the sticky site header for bakeries, patisseries,
 * cafes, pastry kitchens, or any local food maker.
 */
export const BakeryNavbar = defineCapsule({
  name: 'BakeryNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for an artisan-bakery / craft-bread shop site in a playful-geometric warm language: a header pinned to the top with a chunky 2px bottom rule, the bakery name as a serif wordmark on the left, horizontal nav links in the center (desktop), menu command search, Shoo account dropdown, a shared Lakebed cart drawer with reactive badge, and a chunky rounded-full 'Order Online' pill CTA with 2px border, soft offset shadow and press feedback, plus a real mobile drawer. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for bakeries, patisseries, sourdough/artisan-bread shops, cafes, pastry kitchens, dessert and cake studios, or any local food maker.",
  props: z.object({
    /** Brand / bakery name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the right-hand "Order Online" pill CTA. */
    orderCta: z.string().optional(),
    /** Navigation target for the order CTA and mobile menu. */
    orderTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Flour & Stone'
    const nav = props.nav?.length
      ? props.nav
      : ['Menu', 'Our Story', 'Gallery', 'Order', 'Visit']
    const orderCta = props.orderCta ?? 'Order Online'
    const orderTarget = props.orderTarget ?? 'Order'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    const SearchIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m21 21-4.35-4.35" />
        <circle cx="11" cy="11" r="7" />
      </svg>
    )

    const AccountIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    )

    const CartIcon = () => (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 8h12l-1 13H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-b-2 border-foreground/10 bg-background/90',
          props.className,
        )}
      >
        <NavbarBrand
          href={nav[0]}
          className="gap-2 font-serif text-xl font-medium tracking-tight text-foreground lg:text-2xl"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm font-medium"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2 sm:gap-3">
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
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
            label="Cart"
            buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <CartIcon />
          </CommerceCartButton>
          <NavbarCta
            variant="dark"
            href={orderTarget}
            className="hidden rounded-full border-2 border-foreground bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground/25 transition-all duration-100 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[4px_4px_0_0] hover:shadow-foreground/25 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:inline-flex"
          >
            {orderCta}
          </NavbarCta>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
