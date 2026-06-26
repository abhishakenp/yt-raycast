import { z } from 'zod/v4'
import type { ReactNode } from 'react'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * SubscriptionBoxFeatures — feature band for a subscription-box brand built on
 * the shared FeatureGrid composite. A padded section wraps a 4-up grid of
 * value-prop cards (what's inside, flexible plans, free shipping, cancel
 * anytime), each with an inline outline icon, a title, and a description. Theme
 * token only and renders complete with no props. Use to sell the membership
 * perks on any curated-box or recurring-delivery page.
 */
const SparkleIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
)
const SlidersIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="1" x2="7" y1="14" y2="14" />
    <line x1="9" x2="15" y1="8" y2="8" />
    <line x1="17" x2="23" y1="16" y2="16" />
  </svg>
)
const ShipIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)
const CancelIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <path d="m9 11 3 3L22 4" />
  </svg>
)

export const SubscriptionBoxFeatures = defineComponent({
  name: 'SubscriptionBoxFeatures',
  description:
    "Feature band for a subscription-box brand built on the shared FeatureGrid composite: a padded section wrapping a 4-up grid of value-prop cards (what's inside, flexible plans, free shipping, cancel anytime), each with an inline outline icon, title, and description. Use to sell the membership perks on any curated-box or recurring-delivery page.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    columns: z.union([z.literal(2), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Why you'll love it"
    const subheading =
      props.subheading ??
      'A membership built to delight — flexible, generous, and packed with surprises.'
    const icons: ReactNode[] = [SparkleIcon, SlidersIcon, ShipIcon, CancelIcon]
    const base = props.features?.length
      ? props.features
      : [
          {
            title: 'Curated surprises',
            description:
              "Every box is hand-packed with treats, gadgets, and finds you won't see coming.",
          },
          {
            title: 'Flexible plans',
            description:
              "Go monthly, quarterly, or pause whenever life gets busy. You're always in control.",
          },
          {
            title: 'Free shipping',
            description:
              'Your box ships free, every single month. No surprise fees at checkout, ever.',
          },
          {
            title: 'Cancel anytime',
            description:
              'No contracts, no hoops. Skip a month or cancel in two clicks whenever you like.',
          },
        ]
    const features = base.map((f, i) => ({
      ...f,
      icon: icons[i % icons.length],
    }))

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <FeatureGrid
            heading={heading}
            subheading={subheading}
            features={features}
            columns={props.columns ?? 4}
          />
        </div>
      </section>
    )
  },
})
