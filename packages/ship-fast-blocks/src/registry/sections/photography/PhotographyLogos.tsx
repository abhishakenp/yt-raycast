import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * PhotographyLogos — a "Featured In" publication logo strip for a fine-art /
 * wedding photographer portfolio. A muted card band with a centered uppercase
 * tracked label above a faded responsive grid of serif publication wordmarks
 * (2 up on mobile, up to 6 on desktop), each routing through useNavigate. Use
 * as social-proof / press credibility band beneath a hero for photographers,
 * studios, and editorial creatives. Renders fully with no props via baked-in
 * wedding-press defaults.
 */
export const PhotographyLogos = defineCapsule({
  name: 'PhotographyLogos',
  description:
    "A 'Featured In' publication logo strip for a fine-art / wedding photographer portfolio: a muted card band with a centered uppercase tracked label above a faded responsive grid of serif publication wordmarks (2 up on mobile, up to 6 on desktop), each routing through useNavigate. Use as a social-proof / press credibility band beneath a hero for photographers, studios, and editorial creatives.",
  props: z.object({
    /** Uppercase tracked label above the logos. */
    label: z.string().optional(),
    /** Publication wordmarks shown in the strip. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Featured In'
    const items = props.items?.length
      ? props.items
      : [
          'Vogue',
          "Harper's Bazaar",
          'The Knot',
          'Martha Stewart Weddings',
          'Style Me Pretty',
          'Green Wedding Shoes',
        ]

    return (
      <LogoStrip
        lead={label}
        logos={items}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-b border-border bg-card py-16 lg:py-20',
          props.className,
        )}
      />
    )
  },
})
