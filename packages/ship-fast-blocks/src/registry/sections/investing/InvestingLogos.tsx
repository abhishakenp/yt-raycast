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
 * InvestingLogos — press / trust-logo strip for an investing / fintech site. A
 * muted, bordered-top-and-bottom band: a small centered caption line above a
 * responsive 2/3/6-column grid of dimmed wordmark text "logos" (press outlets
 * such as Bloomberg, Reuters, CNBC, WSJ) that brighten on hover; each routes
 * through section-kit route links. Use directly beneath a hero to establish credibility via
 * press mentions or partner brands. Renders fully with no props.
 */
export const InvestingLogos = defineCapsule({
  name: 'InvestingLogos',
  description:
    "Press / trust-logo strip for an investing / fintech site: a muted bordered band with a small centered caption above a responsive 2/3/6-column grid of dimmed wordmark text 'logos' (press outlets like Bloomberg, Reuters, CNBC, WSJ) that brighten on hover; each routes through section-kit route links. Use beneath a hero to establish credibility via press mentions or partner brands.",
  props: z.object({
    /** Small centered caption above the logo grid. */
    label: z.string().optional(),
    /** Wordmark text logos. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by investors worldwide'
    const items = props.items?.length
      ? props.items
      : ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', "Barron's", 'FT']

    return (
      <LogoStrip
        className={cn('border-y border-border bg-muted/50', props.className)}
      >
        <LogoStripLabel>{label}</LogoStripLabel>
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
