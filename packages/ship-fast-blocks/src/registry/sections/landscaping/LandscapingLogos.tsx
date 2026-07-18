import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * LandscapingLogos — a slim "trusted by" social-proof strip for a landscaping /
 * outdoor-design company. A bordered card band with a small uppercase eyebrow
 * label centered above a responsive, dimmed grid of partner / neighborhood
 * property names (2 cols on mobile, up to 6 on large screens, with the last two
 * hidden on small screens). Calm and understated to lend credibility without
 * stealing focus. Use directly beneath a hero for landscapers, lawn-care
 * services, garden designers or property-maintenance companies. Renders fully
 * with no props via baked-in Portland-neighborhood defaults.
 */
export const LandscapingLogos = defineCapsule({
  name: 'LandscapingLogos',
  description:
    "Slim 'trusted by' social-proof strip for a landscaping / outdoor-design company: a bordered card band with a small uppercase eyebrow label centered above a responsive dimmed grid of partner / neighborhood property names (2 cols on mobile, up to 6 on large screens, with the last two hidden on small screens). Calm and understated to lend credibility without stealing focus. Use directly beneath a hero for landscapers, lawn-care services, garden designers or property-maintenance companies.",
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by leading Portland properties'
    const items = props.items?.length
      ? props.items
      : [
          'Pearl District Condos',
          'Hawthorne Gardens',
          'Alberta Arts Lofts',
          'Sellwood Heights',
          'Laurelhurst Estates',
          'Forest Park HOA',
        ]

    return (
      <LogoStrip
        className={cn('border-b border-border bg-card py-12', props.className)}
      >
        <LogoStripLabel>{label}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover">
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
