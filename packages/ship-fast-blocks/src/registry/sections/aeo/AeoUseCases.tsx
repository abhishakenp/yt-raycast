import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

export const AeoUseCases = defineCapsule({
  name: 'AeoUseCases',
  description:
    'A use-cases section that explains practical scenarios and outcomes for the product or service. Use on SaaS, services, and product landing pages.',
  props: z.object({
    heading: z.string().optional(),
    intro: z.string().optional(),
    items: z
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
    const heading = props.heading ?? 'Popular use cases'
    const intro =
      props.intro ??
      'See how teams and customers use this product in real workflows.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Launch faster',
            description:
              'Ship a credible first version without rebuilding the same sections from scratch.',
          },
          {
            title: 'Explain the offer',
            description:
              'Help visitors understand what you do, who it is for, and why it matters.',
          },
          {
            title: 'Convert with confidence',
            description:
              'Answer common objections with clear benefits, proof, and next steps.',
          },
        ]

    return (
      <section
        className={cn('bg-muted/30 py-12 sm:py-16', props.className)}
        aria-label="Use cases"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{intro}</p>
          </div>
          <FeatureGrid
            features={items.map((item) => ({
              title: item.title,
              description: item.description,
            }))}
            columns={3}
          />
        </div>
      </section>
    )
  },
})
