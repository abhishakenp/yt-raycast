import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import type { ReactNode } from 'react'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

const ICONS: ReactNode[] = [
  // battery (40-hour)
  <>
    <rect x="2" y="8" width="16" height="8" rx="2" />
    <path d="M22 11v2" />
    <path d="M6 11v2" />
    <path d="M9 11v2" />
    <path d="M12 11v2" />
  </>,
  // sound-wave / adaptive ANC
  <>
    <path d="M3 12h2l2-7 4 16 3-11 2 4h5" />
  </>,
  // headphone / studio sound
  <>
    <path d="M4 14a8 8 0 0 1 16 0" />
    <rect x="3" y="14" width="4" height="6" rx="1.4" />
    <rect x="17" y="14" width="4" height="6" rx="1.4" />
  </>,
  // cushion / memory-foam comfort
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
  </>,
  // bluetooth / multipoint
  <>
    <path d="M7 8l10 8-5 4V4l5 4-10 8" />
  </>,
  // lightning-bolt / USB-C fast charge
  <>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </>,
]

function FeatureIcon({ glyph }: { glyph: ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )
}

export const ProductDetailFeatures = defineCapsule({
  name: 'ProductDetailFeatures',
  description:
    'Premium feature highlight band for the Aurora Pro Headphones product detail page. Wraps the shared FeatureGrid composite to present six headline specs as icon-led cards — battery life, adaptive ANC, studio-grade sound, memory-foam comfort, multipoint Bluetooth, and USB-C fast charge. Fully prop-driven: heading, subheading, columns, and the features array can each be overridden, with rich Aurora defaults baked in. Use directly beneath the product overview to sell the engineering story before reviews. Theme tokens only.',
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
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Engineered to the last detail'
    const subheading =
      props.subheading ??
      'Every component of the Aurora Pro is tuned for all-day listening that disappears into the music.'
    const columns = props.columns ?? 3
    const features = props.features?.length
      ? props.features
      : [
          {
            title: '40-Hour Battery',
            description:
              'A full work-week of wireless playback on a single charge, with smart standby that sips power between sessions.',
          },
          {
            title: 'Adaptive ANC',
            description:
              'Hybrid active noise cancellation reads your environment 50,000 times a second and dials silence in automatically.',
          },
          {
            title: 'Studio-Grade Sound',
            description:
              'Custom 40mm beryllium-coated drivers deliver reference-flat mids, sculpted bass, and airy, detailed highs.',
          },
          {
            title: 'Plush Memory-Foam Comfort',
            description:
              'Protein-leather ear cushions with slow-rebound memory foam seal out the world without clamping your head.',
          },
          {
            title: 'Multipoint Bluetooth 5.4',
            description:
              'Stay paired to your laptop and phone at once and switch the instant a call comes in — no menus, no fuss.',
          },
          {
            title: 'USB-C Fast Charge',
            description:
              'A five-minute top-up returns four hours of listening, so you are never caught silent on the way out the door.',
          },
        ]

    const withIcons = features.map((f, i) => ({
      ...f,
      icon: <FeatureIcon glyph={ICONS[i % ICONS.length]} />,
    }))

    return (
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FeatureGrid
            heading={heading}
            subheading={subheading}
            features={withIcons}
            columns={columns}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
