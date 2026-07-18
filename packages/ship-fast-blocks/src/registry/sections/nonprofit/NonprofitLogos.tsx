import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

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
      <LogoStrip
        lead={label}
        logos={logos}
        logoStyle="opacity-hover"
        className={cn(
          'border-y border-border bg-card pt-28 pb-12',
          props.className,
        )}
      />
    )
  },
})
