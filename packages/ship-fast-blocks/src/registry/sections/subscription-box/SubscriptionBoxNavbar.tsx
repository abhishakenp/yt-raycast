import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * SubscriptionBoxNavbar — sticky, playful site header for a subscription-box
 * brand (curated monthly boxes, delightful unboxing). A thin configuration over
 * the shared SiteNav composite: a gift-box wordmark beside an inline ribboned
 * box mark, desktop nav links (How it works, Boxes, Pricing, FAQ), a "Get
 * Started" pill CTA, and a real mobile drawer (Sheet) on small screens. Use as
 * the header for any recurring-delivery, curated-box, or membership-kit brand
 * where the joy of unboxing is the hook. Renders fully with no props.
 */
const GiftBoxMark = ({ className }: { className?: string }) => (
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

export const SubscriptionBoxNavbar = defineComponent({
  name: 'SubscriptionBoxNavbar',
  description:
    "Sticky, playful subscription-box site header built on the shared SiteNav composite: gift-box wordmark + ribboned box mark, desktop nav links (How it works, Boxes, Pricing, FAQ), a 'Get Started' pill CTA, and a real mobile drawer. Use as the header for any curated monthly box, recurring-delivery, or membership-kit brand where the unboxing experience is the hook.",
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['How it works', 'Boxes', 'Pricing', 'FAQ']
    return (
      <SiteNav
        brand={props.brand ?? 'BoxJoy'}
        brandMark={<GiftBoxMark className="size-8 text-primary" />}
        brandClassName="text-xl font-bold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Get Started',
          target: props.ctaTarget ?? 'Pricing',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
