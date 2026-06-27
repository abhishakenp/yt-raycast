import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * EcommerceFeatures — a clean "why shop with us" benefits row for a modern
 * online store. Thin configuration over the shared `FeatureGrid` composite: an
 * optional centered heading + subheading above a responsive 4-column grid of
 * benefit cards, each pairing a distinct inline SVG icon with a bold title and
 * a short blurb. Defaults cover the four classic retail trust signals — free
 * shipping, easy returns, 24/7 support, and secure payment. Use to reassure
 * shoppers and reduce checkout hesitation on any general ecommerce / online
 * store homepage. Renders fully with no props via baked-in defaults.
 */
const TruckIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h8.5A1.75 1.75 0 0 1 15 6.75V16H3V6.75Z" />
    <path d="M15 9h3.382a1.75 1.75 0 0 1 1.565.967l1.32 2.64a1.75 1.75 0 0 1 .183.783V16h-7.45" />
    <circle cx="7" cy="17.5" r="1.75" />
    <circle cx="17.5" cy="17.5" r="1.75" />
  </svg>
)

const ReturnIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 2.64-6.36" />
    <path d="M3 3.5V8h4.5" />
  </svg>
)

const SupportIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <path d="M4 13v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
    <path d="M20 13v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
    <path d="M17 18a4 4 0 0 1-4 3h-1" />
  </svg>
)

const ShieldIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M12 3 5 6v5c0 4.25 2.85 8.15 7 9.5 4.15-1.35 7-5.25 7-9.5V6l-7-3Z" />
    <path d="m9.25 12 1.75 1.75L14.75 10" />
  </svg>
)

const ICONS: ReactNode[] = [TruckIcon, ReturnIcon, SupportIcon, ShieldIcon]

export const EcommerceFeatures = defineCapsule({
  name: 'EcommerceFeatures',
  description:
    "Clean 'why shop with us' benefits row for a modern online store built on the shared FeatureGrid composite: an optional centered heading + subheading above a responsive 4-column grid of benefit cards, each pairing a distinct inline SVG icon with a bold title and a short blurb. Defaults cover the four classic retail trust signals — free shipping, easy returns, 24/7 support, and secure payment. Use to reassure shoppers and reduce checkout hesitation on any general ecommerce or online store homepage.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why Shop With Us'
    const subheading =
      props.subheading ??
      'Everything you need for a worry-free shopping experience, from cart to doorstep.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Free Shipping',
            description: 'On all orders over $50, delivered to your door.',
          },
          {
            title: 'Easy Returns',
            description: '30-day hassle-free returns on everything.',
          },
          {
            title: '24/7 Support',
            description: 'Our team is here to help any time, day or night.',
          },
          {
            title: 'Secure Payment',
            description: 'Checkout safely with encrypted, trusted payments.',
          },
        ]

    return (
      <FeatureGrid
        heading={heading}
        subheading={subheading}
        columns={4}
        features={features.map((f, i) => ({
          title: f.title,
          description: f.description,
          icon: ICONS[i % ICONS.length],
        }))}
        className={props.className}
      />
    )
  },
})
