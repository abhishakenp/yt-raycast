import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * IllustratorLogos — a low-key "trusted by" publications / brands strip on a
 * subtle muted band with hairline top and bottom borders. A small uppercase
 * caption sits above a centered, wrapping row of serif publication names
 * rendered at reduced opacity; each name routes through useNavigate. Use
 * directly beneath an illustrator or creative hero to establish credibility
 * with the magazines, publishers, and brands the artist has worked with.
 * Renders fully with no props via baked-in publication defaults.
 */
export const IllustratorLogos = defineCapsule({
  name: 'IllustratorLogos',
  description:
    "Low-key 'trusted by' publications / brands strip on a subtle muted band with hairline top and bottom borders: a small uppercase caption above a centered, wrapping row of serif publication names at reduced opacity, each routing through useNavigate. Use directly beneath an illustrator or creative hero to establish credibility with the magazines, publishers, and brands the artist has worked with.",
  props: z.object({
    /** Small uppercase caption above the names row. */
    heading: z.string().optional(),
    /** Publication / brand names to display. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by leading publications & brands'
    const names = props.names?.length
      ? props.names
      : [
          'The New Yorker',
          'Penguin Random House',
          'Chronicle Books',
          'Anthropologie',
          'Patagonia',
        ]

    return (
      <LogoStrip
        lead={heading}
        logos={names}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-y border-border/60 bg-muted/50 py-12 sm:py-16',
          props.className,
        )}
      />
    )
  },
})
