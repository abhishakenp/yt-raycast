import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * InvestingLogos — press / trust-logo strip for an investing / fintech site. A
 * muted, bordered-top-and-bottom band: a small centered caption line above a
 * responsive 2/3/6-column grid of dimmed wordmark text "logos" (press outlets
 * such as Bloomberg, Reuters, CNBC, WSJ) that brighten on hover; each routes
 * through useNavigate. Use directly beneath a hero to establish credibility via
 * press mentions or partner brands. Renders fully with no props.
 */
export const InvestingLogos = defineCapsule({
  name: 'InvestingLogos',
  description:
    "Press / trust-logo strip for an investing / fintech site: a muted bordered band with a small centered caption above a responsive 2/3/6-column grid of dimmed wordmark text 'logos' (press outlets like Bloomberg, Reuters, CNBC, WSJ) that brighten on hover; each routes through useNavigate. Use beneath a hero to establish credibility via press mentions or partner brands.",
  props: z.object({
    /** Small centered caption above the logo grid. */
    label: z.string().optional(),
    /** Wordmark text logos. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Trusted by investors worldwide'
    const items = props.items?.length
      ? props.items
      : ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', "Barron's", 'FT']

    return (
      <section
        className={cn('border-y border-border bg-muted/50', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <ResponsiveGrid
            cols="2-3-6"
            gap="lg"
            className="items-center opacity-70"
          >
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex items-center justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
