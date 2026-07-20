import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CommunityForumStats — inverted playful-geometric KPI band for a
 * community-platform / discussion-forum landing page. A full
 * bg-foreground/text-background inversion band that cuts in on a slanted
 * clip-path seam, headed by an asymmetric mono rail ("04 / scale" left, an
 * overlapping avatar-cluster of rounded-full rings + "[ live ]" tag right).
 * Stats sit in a collapsed-border grid (shared hairlines, no gaps): each cell
 * carries a giant tabular numeral, a mono uppercase micro-label, and a short
 * primary tick bar. A giant ghost numeral watermarks the band. No links. Use
 * as the social-proof / credibility band for community platforms, SaaS
 * products, or enterprise landing pages.
 */
export const CommunityForumStats = defineCapsule({
  name: 'CommunityForumStats',
  description:
    'Inverted playful-geometric KPI band for a community-platform / discussion-forum landing page: a bg-foreground/text-background band cutting in on a slanted clip-path seam, with an asymmetric mono rail (metadata left, overlapping rounded-full avatar-cluster rings + live tag right) above a collapsed-border grid of stat cells, each with a giant tabular numeral, a mono uppercase micro-label, and a primary tick bar, over a giant ghost watermark numeral. No links. Use as the social-proof / credibility band for community platforms, SaaS products, or enterprise landing pages.',
  props: z.object({
    /** Stat figures: value + label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '12,000+', label: 'Active Communities' },
          { value: '2.4M', label: 'Monthly Discussions' },
          { value: '98.7%', label: 'Uptime SLA' },
          { value: '156', label: 'Countries Reached' },
        ]
    const tickWidths = ['w-8', 'w-12', 'w-5', 'w-10']
    const clusterTints = [
      'bg-chart-1',
      'bg-chart-2',
      'bg-chart-3',
      'bg-primary',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-16 sm:pt-24 lg:py-20 lg:pt-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -right-4 select-none font-extrabold leading-none tracking-tighter text-background/[0.05] text-[8rem] sm:text-[12rem] lg:text-[16rem]"
        >
          {items[0]?.value}
        </span>
        <Container size="lg" className="relative">
          <div className="mb-10 flex flex-wrap items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              04 / Scale
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
            <span aria-hidden="true" className="flex items-center gap-3">
              <span className="flex -space-x-2">
                {clusterTints.map((tint, i) => (
                  <span
                    key={i}
                    className={cn(
                      'size-6 rounded-full border-2 border-foreground',
                      tint,
                    )}
                  />
                ))}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                [ live ]
              </span>
            </span>
          </div>
          <StatGrid
            columns={4}
            className="grid-cols-2 gap-0 border-l border-t border-background/15 lg:grid-cols-4"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-8"
                >
                  <StatValue className="mb-0 text-[clamp(2.25rem,4.5vw,4rem)] font-extrabold leading-none tracking-tighter text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span
                      className={cn(
                        'h-1.5 rounded-full bg-primary',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="size-1.5 rounded-full bg-background/30" />
                    <span className="size-1.5 rounded-full bg-background/30" />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
