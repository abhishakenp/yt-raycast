import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

const iconClass = 'size-5'
const baseIconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: iconClass,
  'aria-hidden': true,
}

const ICONS: ReactNode[] = [
  <svg key="i0" {...baseIconProps}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>,
  <svg key="i1" {...baseIconProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>,
  <svg key="i2" {...baseIconProps}>
    <path d="M20 7 9 18l-5-5" />
  </svg>,
  <svg key="i3" {...baseIconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>,
  <svg key="i4" {...baseIconProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  <svg key="i5" {...baseIconProps}>
    <path d="m12 2 2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6Z" />
  </svg>,
]

export const WebinarFeatures = defineCapsule({
  name: 'WebinarFeatures',
  description:
    "Takeaways band for a webinar or virtual event built on the shared FeatureGrid composite: a heading over a three-column grid of 'what you'll learn' cards, each with a small line icon, a title, and a one-line description. Use to summarize the concrete outcomes attendees will walk away with on a webinar registration page.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "What you'll walk away with"
    const subheading =
      props.subheading ??
      "Practical, ready-to-apply takeaways — not theory. Here's what you'll learn in 60 minutes."
    const baseFeatures = props.features?.length
      ? props.features
      : [
          {
            title: 'A repeatable growth model',
            description:
              'Map your funnel into a system you can forecast against, quarter after quarter.',
          },
          {
            title: 'Pricing & packaging frameworks',
            description:
              'Decide what to charge, how to tier it, and when to revisit — without guesswork.',
          },
          {
            title: 'Activation playbooks',
            description:
              'Onboarding patterns that get users to value fast and keep them coming back.',
          },
          {
            title: 'Retention & NRR levers',
            description:
              'The lifecycle loops that lift net revenue retention above 100%.',
          },
          {
            title: 'Team & RevOps structure',
            description:
              'How to organize growth, product, and ops so they compound instead of collide.',
          },
          {
            title: 'Metrics that actually matter',
            description:
              'Cut through vanity numbers and instrument the signals that predict revenue.',
          },
        ]

    const features = baseFeatures.map((f, i) => ({
      ...f,
      icon: ICONS[i % ICONS.length],
    }))

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <FeatureGrid
            heading={heading}
            subheading={subheading}
            features={features}
            columns={3}
          />
        </div>
      </section>
    )
  },
})
