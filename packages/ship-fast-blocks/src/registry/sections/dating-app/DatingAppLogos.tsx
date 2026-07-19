import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DatingAppLogos — a low-contrast "Featured in" press-logo strip for a dating /
 * matchmaking landing page. A subtle muted band bordered top and bottom: a small
 * uppercase tracked label centered above a responsive grid of dimmed press logos,
 * each rendered as a generic circular glyph beside a bold name and routed through
 * section-kit route links. Use directly below the hero as social-proof / credibility for dating
 * apps, singles platforms, or any consumer product citing press mentions. Renders
 * fully with no props via baked-in press defaults.
 */
export const DatingAppLogos = defineCapsule({
  name: 'DatingAppLogos',
  description:
    "Low-contrast 'Featured in' press-logo strip for a dating / matchmaking landing page: a subtle muted band bordered top and bottom with a small uppercase tracked label centered above a responsive grid of dimmed press logos, each a generic circular glyph beside a bold name, routed through section-kit route links. Use directly below the hero as social-proof / credibility for dating apps, singles platforms, or any consumer product citing press mentions.",
  props: z.object({
    /** Small uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Press / publication names shown in the strip. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Featured in'
    const logoNames = props.names?.length
      ? props.names
      : [
          'TechCrunch',
          'Forbes',
          'Wired',
          'The Verge',
          'Bloomberg',
          'Cosmopolitan',
        ]

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/50 py-12',
          props.className,
        )}
      >
        <LogoStripLabel>{logosLabel}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {logoNames.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
