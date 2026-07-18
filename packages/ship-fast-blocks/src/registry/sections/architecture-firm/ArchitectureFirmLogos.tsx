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
 * ArchitectureFirmLogos — "Featured in" publication strip for an
 * architecture-studio / design-practice page. A quiet bordered band on a subtle
 * card surface: a centered wide letter-spaced label above a wrapping, dimmed row
 * of publication names rendered as light wordmarks. Calm, editorial,
 * monochrome. Tokens-only, no links. Use as a press / "as seen in" / featured
 * social-proof strip for architecture firms, design studios, interior designers
 * or any portfolio site that wants understated editorial credibility. Renders
 * fully with no props via baked-in publication defaults.
 */
export const ArchitectureFirmLogos = defineCapsule({
  name: 'ArchitectureFirmLogos',
  description:
    "Quiet 'Featured in' publication strip for an architecture-studio / design-practice page: a bordered band on a subtle card surface with a centered wide letter-spaced label above a wrapping, dimmed row of publication names rendered as light wordmarks. Calm, editorial, monochrome. Tokens-only, no links. Use as a press / 'as seen in' / featured social-proof strip for architecture firms, design studios, interior designers or any portfolio site wanting understated editorial credibility.",
  props: z.object({
    /** Wide letter-spaced label above the publication names. */
    label: z.string().optional(),
    /** Publication / outlet wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : [
          'Dezeen',
          'ArchDaily',
          'Dwell',
          'Wallpaper*',
          'Monocle',
          'Architectural Digest',
        ]

    return (
      <LogoStrip
        className={cn('border-y border-border bg-card py-16', props.className)}
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
