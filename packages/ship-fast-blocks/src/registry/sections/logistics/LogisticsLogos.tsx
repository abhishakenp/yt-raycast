import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * LogisticsLogos — a slim client trust strip for a global-logistics / freight-
 * forwarding company. A border-bottomed band with a centered uppercase caption
 * above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced
 * opacity for an understated "trusted by" feel. Clean and corporate on a light
 * surface; each logo routes through useNavigate. Use directly beneath the hero of
 * a logistics, freight-forwarding, shipping, courier or cargo/transport site to
 * establish credibility. Renders fully with no props.
 */
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
      <section className={cn('border-b border-border py-12', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <ResponsiveGrid
            cols="2-3-6"
            gap="lg"
            className="items-center opacity-60"
          >
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center"
              >
                <span className="text-xl font-bold text-foreground/80">
                  {logo}
                </span>
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
