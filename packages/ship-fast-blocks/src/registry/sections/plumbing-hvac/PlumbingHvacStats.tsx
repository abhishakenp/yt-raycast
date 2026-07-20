import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * PlumbingHvacStats — a trade-industrial spec-sheet proof band for a plumbing &
 * HVAC site. A left-aligned mono index header (eyebrow + title + subtitle) above
 * the shared `StatGrid` composite rendered as a collapsed-border ledger: a
 * responsive two-to-four column grid of left-aligned giant extrabold tabular
 * numerals over mono uppercase labels, sharing hairline border-2 rules like a
 * data table. Defaults highlight credibility metrics that homeowners care about
 * — years in business, jobs completed, certified techs, and average rating. Use
 * as a trust band between content sections on plumber, HVAC, or other
 * home-service sites. Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacStats = defineCapsule({
  name: 'PlumbingHvacStats',
  description:
    'A trade-industrial spec-sheet proof band for a plumbing & HVAC site: a left-aligned mono index header (eyebrow + title + subtitle) above the shared StatGrid composite rendered as a collapsed-border ledger — a responsive two-to-four column grid of left-aligned giant extrabold tabular numerals over mono uppercase labels sharing hairline border-2 rules like a data table. Defaults highlight credibility metrics homeowners care about — years in business, jobs completed, certified techs, and average rating. Use as a trust band between content sections on plumber, HVAC, or other home-service sites.',
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Section title. */
    heading: z.string().optional(),
    /** Supporting subtitle under the title. */
    subheading: z.string().optional(),
    /** Stat items (value + label). */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Grid column count (2/3/4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Why homeowners trust us'
    const heading = props.heading ?? 'Two decades of dependable service'
    const subheading =
      props.subheading ??
      'Locally owned, licensed, and insured — the numbers our neighbors have come to count on.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '20+', label: 'Years in Business' },
          { value: '18,000+', label: 'Jobs Completed' },
          { value: '25', label: 'Certified Technicians' },
          { value: '4.9★', label: 'Average Rating' },
        ]

    return (
      <section className="bg-background pt-28 pb-20 lg:pt-32 lg:pb-28">
        <Container size="xl">
          <div className="mb-12 max-w-3xl">
            <span className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="tabular-nums">[ 03 ]</span>
              <span className="text-muted-foreground">{eyebrow}</span>
            </span>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>
          <StatGrid
            columns={props.columns ?? 4}
            className={cn(
              'gap-0 border-l-2 border-t-2 border-foreground',
              props.className,
            )}
          >
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-2 border-b-2 border-r-2 border-foreground p-5 sm:p-6"
                >
                  <StatValue className="text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
