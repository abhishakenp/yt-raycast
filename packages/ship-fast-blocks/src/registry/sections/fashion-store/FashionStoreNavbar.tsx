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
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceSearchButton,
} from '../commerce/commerce-interactions.tsx'

/**
 * FashionStoreNavbar — fixed, backdrop-blurred Vogue-editorial top navigation
 * bar for a luxury fashion / apparel store. A hairline-bottomed translucent
 * header pinned to the top, carrying a large serif wordmark logo as the
 * editorial signature, a real shadcn mobile drawer button on mobile, quietly
 * spaced horizontal nav links on desktop, and a trio of minimal-chrome icon
 * actions on the right (search, account, shopping bag with an item-count
 * badge). Search/account/cart use shared Lakebed commerce primitives; nav
 * links route through route hrefs. Use as the sticky site header for clothing
 * brands, boutiques, apparel and accessories shops, or any premium minimalist
 * retail storefront.
 */
export const FashionStoreNavbar = defineCapsule({
  name: 'FashionStoreNavbar',
  description:
    'Fixed, backdrop-blurred Vogue-editorial top navigation bar for a luxury fashion / apparel store: a hairline-bottomed translucent header pinned to the top with a large serif wordmark logo as the editorial signature, a real shadcn mobile drawer button on mobile, quietly spaced horizontal nav links on desktop, and a trio of minimal-chrome fullstack commerce actions on the right (product command search, Shoo account dropdown, shopping bag with reactive item-count badge and shadcn cart drawer). Nav links route through route hrefs and labels match the nav array so PageSwitch can swap pages. Use as the sticky site header for clothing brands, boutiques, apparel and accessories shops, lookbook commerce, or any premium minimalist retail storefront.',
  props: z.object({
    /** Brand / store name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Item count shown on the shopping-bag badge. */
    bagCount: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'NOIRE'
    const nav = props.nav?.length
      ? props.nav
      : ['Collections', 'Lookbook', 'New Arrivals', 'Our Story', 'Journal']
    const initialBagCount = Number.parseInt(props.bagCount ?? '0', 10) || 0
    const signIn = props.signIn ?? 'Sign in'
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
        <NavbarBrand href={nav[0]} className="items-center gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className="font-serif text-2xl font-medium tracking-tight lg:text-3xl" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav breakpoint="lg" className="gap-9">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-transparent"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
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
