import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * InteriorDesignLogos — understated "trusted by" brand logo strip for an upscale
 * interior-design / architecture studio site. A muted, border-top-and-bottom
 * band with a centered uppercase tracked caption above a responsive 2/4/6-column
 * grid of light-weight wordmark logos at reduced opacity (extra items hide below
 * large screens). Editorial and minimal — pure social proof, no links. Use
 * beneath the hero to signal partner brands, press, retailers or showroom
 * affiliations for design studios, architecture firms or furniture businesses.
 * Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignLogos = defineCapsule({
  name: 'InteriorDesignLogos',
  description:
    "Understated 'trusted by' brand logo strip for an upscale interior-design / architecture studio site: a muted, border-top-and-bottom band with a centered uppercase tracked caption above a responsive 2/4/6-column grid of light-weight wordmark logos at reduced opacity (extra items hide below large screens). Editorial and minimal — pure social proof. Use beneath the hero to signal partner brands, press, retailers or showroom affiliations for design studios, architecture firms or furniture businesses.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading brands'
    const items = props.items?.length
      ? props.items
      : [
          'West Elm',
          'Restoration',
          'Crate&Barrel',
          'Design Within',
          'Herman Miller',
          'Knoll',
        ]

    return (
      <LogoStrip
        lead={heading}
        logos={items}
        logoStyle="opacity-hover"
        className={cn(
          'border-y border-border bg-muted pt-28 pb-16',
          props.className,
        )}
      />
    )
  },
})
