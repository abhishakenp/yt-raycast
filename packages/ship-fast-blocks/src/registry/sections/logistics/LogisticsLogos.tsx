import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * LogisticsLogos — a slim client trust strip for a global-logistics / freight-
 * forwarding company. A border-bottomed band with a centered uppercase caption
 * above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced
 * opacity for an understated "trusted by" feel. Clean and corporate on a light
 * surface; each logo routes through section-kit route links. Use directly beneath the hero of
 * a logistics, freight-forwarding, shipping, courier or cargo/transport site to
 * establish credibility. Renders fully with no props.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const LogisticsLogos = defineCapsule({
  name: 'LogisticsLogos',
  description:
    "Slim client trust strip for a global-logistics / freight-forwarding company: a border-bottomed band with a centered uppercase caption above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced opacity for an understated 'trusted by' feel. Clean and corporate on a light surface; each logo routes through section-kit route links. Use directly beneath the hero of a logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport site to establish credibility.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by industry leaders'
    const items = props.items?.length
      ? props.items
      : ['TechFlow', 'Globex', 'Acme Corp', 'Stark Ind', 'Wayne Ent', 'Oscorp']
    return (
      <LogoStrip
        className={cn('border-b border-border py-12', props.className)}
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
