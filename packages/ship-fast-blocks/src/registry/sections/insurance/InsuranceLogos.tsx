import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * InsuranceLogos — press / trust logo strip for an insurance / fintech page. A
 * centered uppercase eyebrow label above a responsive grid of muted wordmark
 * logos (2 up on mobile, 6 up on desktop) at reduced opacity, on a border-
 * bottomed band. Use right under the hero to establish credibility with press
 * mentions or partner brands. Renders fully with no props via baked-in defaults.
 */
export const InsuranceLogos = defineCapsule({
  name: 'InsuranceLogos',
  description:
    'Press / trust logo strip for an insurance / fintech page: a centered uppercase eyebrow label above a responsive grid of muted wordmark logos (2 up on mobile, 6 up on desktop) at reduced opacity, on a border-bottomed band. Use right under the hero to establish credibility with press mentions or partner brands.',
  props: z.object({
    /** Uppercase eyebrow label above the logos. */
    label: z.string().optional(),
    /** Wordmark labels rendered as text logos. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by industry leaders'
    const items = props.items?.length
      ? props.items
      : ['Forbes', 'Bloomberg', 'TechCrunch', 'WSJ', 'Inc. 5000', 'NerdWallet']

    return (
      <section className={cn('border-b border-border py-12', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <ResponsiveGrid
            cols="2-3-6"
            gap="lg"
            className="items-center opacity-70"
          >
            {items.map((logo) => (
              <div key={logo} className="flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground">
                  {logo}
                </span>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
