import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LogisticsLogos — a slim client trust strip for a global-logistics / freight-
 * forwarding company. A border-bottomed band with a centered uppercase caption
 * above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced
 * opacity for an understated "trusted by" feel. Clean and corporate on a light
 * surface; each logo routes through useNavigate. Use directly beneath the hero of
 * a logistics, freight-forwarding, shipping, courier or cargo/transport site to
 * establish credibility. Renders fully with no props.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const LogisticsLogos = defineCapsule({
  name: 'LogisticsLogos',
  description:
    "Slim client trust strip for a global-logistics / freight-forwarding company: a border-bottomed band with a centered uppercase caption above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced opacity for an understated 'trusted by' feel. Clean and corporate on a light surface; each logo routes through useNavigate. Use directly beneath the hero of a logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport site to establish credibility.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by industry leaders'
    const items = props.items?.length
      ? props.items
      : ['TechFlow', 'Globex', 'Acme Corp', 'Stark Ind', 'Wayne Ent', 'Oscorp']
    return (
      <LogoStrip
        lead={heading}
        logos={items}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn('border-b border-border py-12', props.className)}
      />
    )
  },
})
