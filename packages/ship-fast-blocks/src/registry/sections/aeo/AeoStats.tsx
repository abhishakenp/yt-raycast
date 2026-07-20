import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AeoStats — "Answer Terminal" dark proof band for an Answer-Engine-
 * Optimization (AEO) SaaS. A full inversion band (bg-foreground/text-background)
 * with an asymmetric header — title left, mono "[ TRACKING ] LIVE INDEX" meta
 * right — above a collapsed-border grid of stat cells. Each cell carries a
 * giant fluid tabular numeral, a mono uppercase label, and a tiny div-built
 * tick-bar motif. Use to establish scale and credibility on AEO,
 * generative-search visibility, or brand-citation analytics pages.
 */
export const AeoStats = defineCapsule({
  name: 'AeoStats',
  description:
    'Dark inverted statistics band for an Answer-Engine-Optimization (AEO) product: an asymmetric header (title left, mono tracking meta right) above a collapsed-border grid of stat cells, each with a giant fluid tabular numeral, a mono uppercase label, and a small div-built tick-bar motif (prompts tracked, citations earned, brands optimized, average visibility uplift). Use to establish scale and credibility on AEO, generative-search visibility, or brand-citation analytics landing pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '12M+', label: 'Prompts tracked monthly' },
          { value: '480K', label: 'Citations earned for customers' },
          { value: '2,100+', label: 'Brands optimized' },
          { value: '3.4×', label: 'Average AI visibility uplift' },
        ]
    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8', 'w-12', 'w-5']

    return (
      <section
        className={
          // Slanted top edge (opposite direction to the CTA band) — the
          // inversion band cuts in on a diagonal, neighbor-independent.
          'bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={props.eyebrow ?? 'By the numbers'}
              title={
                props.heading ?? 'Measurable results across every answer engine'
              }
              subtitle={
                props.subheading ??
                'Teams use Citeable to turn AI answers into a reliable, trackable acquisition channel.'
              }
              className="max-w-2xl gap-2"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
              titleClassName="text-background text-3xl font-semibold tracking-tight md:text-4xl"
              subtitleClassName="text-background/60"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ tracking ] live index
            </p>
          </div>
          <StatGrid
            columns={props.columns ?? 4}
            className="gap-0 border-l border-t border-background/15"
          >
            {stats.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={`${__iv__.label}-${i}`}
                  align="left"
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-8"
                >
                  <StatValue className="mb-0 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-none tracking-tight text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span
                      className={
                        'h-1 bg-primary ' + tickWidths[i % tickWidths.length]
                      }
                    />
                    <span className="h-1 w-1 bg-background/30" />
                    <span className="h-1 w-1 bg-background/30" />
                    <span className="h-1 w-1 bg-background/30" />
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
