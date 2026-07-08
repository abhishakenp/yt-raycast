import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * MentalHealthLogos — a subtle insurance / trust logo strip for a therapy
 * practice. A top-and-bottom bordered band on the page surface with a small
 * centered caption ("Trusted by major insurance providers") above a faded,
 * responsive grid of provider wordmarks (2 / 4 / 6 columns). Calm, reassuring
 * wellness aesthetic. Use directly under the hero of a therapist, counselor or
 * mental-health clinic page to signal accepted insurers and build trust.
 */
export const MentalHealthLogos = defineCapsule({
  name: 'MentalHealthLogos',
  description:
    'Subtle insurance / trust logo strip for a therapy practice: a top-and-bottom bordered band on the page surface with a small centered caption above a faded, responsive grid of provider wordmarks (2 / 4 / 6 columns). Calm, reassuring wellness aesthetic. Use directly under the hero of a therapist, counselor or mental-health clinic page to signal accepted insurers and build trust.',
  props: z.object({
    title: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const title = props.title ?? 'Trusted by major insurance providers'
    const items = props.items?.length
      ? props.items
      : ['BlueCross', 'Aetna', 'United', 'Cigna', 'Kaiser', 'Providence']

    return (
      <section
        className={cn(
          'border-y border-border bg-background py-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {title}
          </p>
          <ResponsiveGrid
            cols="2-4-6"
            gap="lg"
            className="items-center opacity-60"
          >
            {items.map((logo) => (
              <div key={logo} className="flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground">
                  {logo}
                </span>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
