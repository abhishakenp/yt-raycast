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
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import {
  PropertyListingAccountButton,
  PropertyListingInquiryButton,
  PropertyListingMobileMenu,
  PropertyListingMutationSpinner,
  PropertyListingSearchButton,
  PropertyListingStatusBadge,
} from './property-listing-interactions.tsx'

const brandMark = (
  <span
    className="grid size-7 shrink-0 place-items-center rounded-none bg-foreground text-background"
    aria-hidden="true"
  >
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-6h6v6" />
    </svg>
  </span>
)

/**
 * PropertyListingNavbar — editorial-listings header for a property marketplace
 * or search portal. A sticky, hairline-ruled bar with a square ink house tile +
 * extrabold uppercase wordmark, mono uppercase micro-label page nav, command
 * listing search, Shoo account dropdown, a saved/request badge, a square ink
 * "Post Listing" inquiry CTA with press feedback, and a real Sheet mobile
 * drawer. Nav links route through route hrefs; search/auth/inquiry controls use
 * shared Lakebed state.
 */
export const PropertyListingNavbar = defineCapsule({
  name: 'PropertyListingNavbar',
  description:
    "Editorial-listings sticky header for a property marketplace / search portal: a square ink house tile + extrabold uppercase wordmark, mono uppercase For Sale / For Rent / New / Agents micro-label nav, command listing search, Shoo account dropdown, a saved/request badge, a square ink 'Post Listing' inquiry CTA with press feedback, and a real Sheet mobile drawer. Nav links route through route hrefs; search/auth/inquiry controls use shared Lakebed state.",
  props: z.object({
    /** Brand wordmark beside the logo tile. */
    brand: z.string().optional(),
    /** Primary navigation labels. */
    links: z.array(z.string()).optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: propertyListingLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Nestable'
    const nav = props.links?.length
      ? props.links
      : ['For Sale', 'For Rent', 'New', 'Agents']
    const cta = props.cta ?? 'Post Listing'
    const ctaTarget = props.ctaTarget ?? 'Post'
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={'Home'} className="min-w-0">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" fallback={brandMark} />
            <LogoLabel className="truncate text-lg font-extrabold uppercase tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-1 sm:gap-1.5">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <PropertyListingStatusBadge lakebed={lakebed} />
          <PropertyListingSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <PropertyListingAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <PropertyListingInquiryButton
            lakebed={lakebed}
            intent={ctaTarget}
            source="navbar"
            pendingChildren={
              <>
                <PropertyListingMutationSpinner className="size-4" />
                Sending
              </>
            }
            className="ml-1 hidden h-9 items-center justify-center gap-2 rounded-none bg-foreground px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {cta}
          </PropertyListingInquiryButton>
          <PropertyListingMobileMenu
            brand={brand}
            nav={nav}
            homeTarget="Home"
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
