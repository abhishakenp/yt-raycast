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
 * SubscriptionBoxNavbar — sticky, playful site header for a subscription-box
 * brand (curated monthly boxes, delightful unboxing). A gift-box wordmark sits
 * beside desktop nav links, command search, Shoo account dropdown, shared
 * Lakebed cart drawer, a "Get Started" pill CTA, and a real mobile drawer. Use
 * as the header for any recurring-delivery, curated-box, or membership-kit
 * brand where the joy of unboxing is the hook.
 */
function GiftBoxMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7C12 7 11 3 8.5 3S5 5 5 5s1.5 2 4 2" />
      <path d="M12 7c0 0 1-4 3.5-4S19 5 19 5s-1.5 2-4 2" />
    </svg>
  )
}

export const SubscriptionBoxNavbar = defineCapsule({
  name: 'SubscriptionBoxNavbar',
  description:
    "Sticky, playful subscription-box site header: gift-box wordmark + ribboned box mark, desktop nav links (How it works, Boxes, Pricing, FAQ), command search, Shoo account dropdown, shared Lakebed cart drawer with reactive badge, a 'Get Started' pill CTA, and a real mobile drawer. Use as the header for any curated monthly box, recurring-delivery, or membership-kit brand where the unboxing experience is the hook.",
  props: z.object({
    /** Brand / box name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    /** Initial cart badge fallback before Lakebed state is available. */
    cartCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['How it works', 'Boxes', 'Pricing', 'FAQ']
    const brand = props.brand ?? 'BoxJoy'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={<GiftBoxMark className="size-8 text-primary" />}
            />
            <LogoLabel className="text-xl font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <CommerceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <CommerceAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <CommerceCartButton
            lakebed={lakebed}
            fallbackCount={initialCartCount}
            buttonClassName="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <NavbarCta
            variant="primary-pill"
            href={ctaTarget}
            className="hidden px-4 py-2 sm:inline-flex"
          >
            {ctaLabel}
          </NavbarCta>
          <CommerceMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
