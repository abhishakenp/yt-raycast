import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['How it works', 'Boxes', 'Pricing', 'FAQ']
    const brand = props.brand ?? 'BoxJoy'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const initialCartCount = Number.parseInt(props.cartCount ?? '0', 10) || 0

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-3"
          >
            <BrandLogo
              brand={brand}
              fallback={<GiftBoxMark className="size-8 text-primary" />}
              labelClassName="text-xl font-bold tracking-tight text-foreground"
            />
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
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
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="hidden items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              {ctaLabel}
            </button>
            <CommerceMobileMenu
              brand={brand}
              nav={nav}
              homeTarget={homeTarget}
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
