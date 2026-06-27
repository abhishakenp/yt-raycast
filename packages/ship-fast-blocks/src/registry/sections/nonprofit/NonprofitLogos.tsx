import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * NonprofitLogos — trusted-by partner / funder logo strip for a nonprofit /
 * charity page. A horizontally-bordered band on a card surface with a small
 * uppercase label centered above a responsive 2/4/6-column grid of partner /
 * funder / sponsor names rendered as muted wordmarks at reduced opacity. Builds
 * donor trust and social proof. Use directly beneath a hero on nonprofit,
 * charity, NGO, foundation, or humanitarian campaign pages. Renders fully with
 * no props via baked-in partner defaults.
 */
export const NonprofitLogos = defineCapsule({
  name: 'NonprofitLogos',
  description:
    'Trusted-by partner / funder logo strip for a nonprofit / charity page: a horizontally-bordered band on a card surface with a small uppercase label centered above a responsive 2/4/6-column grid of partner / funder / sponsor names rendered as muted wordmarks at reduced opacity. Builds donor trust and social proof. Use directly beneath a hero on nonprofit, charity, NGO, foundation, or humanitarian campaign pages.',
  props: z.object({
    /** Small uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Partner / funder / sponsor names rendered as wordmarks. */
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by leading organizations'
    const logos = props.logos?.length
      ? props.logos
      : [
          'GlobalGiving',
          'UNESCO',
          'Save the Children',
          'World Vision',
          'CARE Intl',
          'Oxfam',
        ]

    return (
      <section
        className={cn('border-y border-border bg-card py-12', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {logos.map((logo) => (
              <div
                key={logo}
                className="flex h-12 items-center justify-center text-lg font-semibold text-muted-foreground"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
