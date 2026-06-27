import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * InvestingStats — key-metrics stat band for an investing / fintech page. A
 * bordered-top-and-bottom band on the page surface containing a responsive
 * 1/2/4-column grid of centered metrics, each a big bold value above a muted
 * label. Tokens only, no links. Use to surface headline trust numbers — assets
 * under management, active investors, countries supported, uptime — between
 * richer sections on a brokerage or trading-app page. Renders fully with no
 * props via four baked-in metrics.
 */
export const InvestingStats = defineCapsule({
  name: 'InvestingStats',
  description:
    'Key-metrics stat band for an investing / fintech page: a bordered band on the page surface with a responsive 1/2/4-column grid of centered metrics, each a big bold value above a muted label. Tokens only, no links. Use to surface headline trust numbers (assets under management, active investors, countries supported, uptime) between richer sections on a brokerage or trading-app page.',
  props: z.object({
    /** Metric items: value + label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '$12B+', label: 'Assets under management' },
          { value: '2.4M', label: 'Active investors' },
          { value: '150+', label: 'Countries supported' },
          { value: '99.99%', label: 'Platform uptime' },
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-background py-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label} className="text-center">
                <p className="mb-2 text-4xl font-semibold sm:text-5xl">
                  {s.value}
                </p>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
