import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * LawFirmLogos — a quiet "trusted by industry leaders" client logo strip on the
 * card surface, bordered top and bottom. A centered tracked-uppercase heading
 * sits above a faded responsive grid of serif wordmark "logos" that brighten on
 * hover. Restrained, authoritative editorial aesthetic. Each wordmark routes
 * through section-kit route links. Use directly under the hero on law-firm, attorney,
 * corporate-counsel, consulting or professional-services pages to establish
 * credibility with recognizable client names. Renders fully with no props via
 * baked-in defaults.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const LawFirmLogos = defineCapsule({
  name: 'LawFirmLogos',
  description:
    "Quiet 'trusted by industry leaders' client logo strip on the card surface, bordered top and bottom: a centered tracked-uppercase heading above a faded responsive grid of serif wordmark 'logos' that brighten on hover. Restrained, authoritative editorial aesthetic. Each wordmark routes through section-kit route links. Use directly under the hero on law-firm, attorney, corporate-counsel, consulting, accounting or professional-services pages to establish credibility with recognizable client names.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by Industry Leaders'
    const items = props.items?.length
      ? props.items
      : ['MORGAN', 'CITADEL', 'VENTURE', 'APEX', 'MERIDIAN', 'CONSOL']
    return (
      <LogoStrip
        className={cn('border-y border-border bg-card py-16', props.className)}
      >
        <LogoStripLabel>{heading}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
