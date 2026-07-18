import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionLogos — trusted-by client logo wall for a construction /
 * general contractor page. A bordered muted band with a centered eyebrow
 * heading above a responsive grid of text-based logo placeholders. Use as a
 * social-proof logo strip beneath the hero for construction companies,
 * contractors, builders, or any service business showcasing trusted
 * partnerships. Renders fully with no props via baked-in defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const ConstructionLogos = defineCapsule({
  name: 'ConstructionLogos',
  description:
    'Trusted-by client logo wall for a construction / general contractor page: a bordered muted band with a centered eyebrow heading above a responsive grid of text-based logo placeholders. Use as a social-proof logo strip beneath the hero for construction firms, contractors, builders, or any service business showcasing trusted partnerships.',
  props: z.object({
    /** Section heading above the logo grid. */
    heading: z.string().optional(),
    /** Logo names displayed as text placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading organizations'
    const items = props.items?.length
      ? props.items
      : ['Microsoft', 'Amazon', 'Starbucks', 'Boeing', 'Nordstrom', 'Costco']
    return (
      <LogoStrip
        lead={heading}
        logos={items}
        logoStyle="opacity-hover"
        className={cn('border-b border-border bg-card py-10', props.className)}
      />
    )
  },
})
