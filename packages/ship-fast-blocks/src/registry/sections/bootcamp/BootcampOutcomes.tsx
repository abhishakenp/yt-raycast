import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampOutcomes — "Terminal Classroom" inverted outcomes band for a coding
 * bootcamp / career-school landing page. A full-inversion (foreground-on-
 * background flip) band entered through a slanted clip-path seam, with a
 * graph-paper texture and a giant ghost watermark of the lead stat: a
 * left-aligned mono-labeled header sits above a collapsed-border 2/4-column
 * grid of giant mono tabular stat numerals, followed by a 3-up row of
 * hairline salary cards whose div-built progress bars carry mono percentage
 * readouts. Use as the outcomes validation section for bootcamps, academies,
 * or vocational programs that want to showcase placement rate and earning
 * potential.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { GraphPaper, Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import {
  OutcomesGrid,
  OutcomesCard,
  OutcomeStat,
} from '#/section-kit/OutcomesGrid.tsx'
export const BootcampOutcomes = defineCapsule({
  name: 'BootcampOutcomes',
  description:
    'Terminal-styled inverted outcomes band for a coding bootcamp / career-school landing page: a foreground-inverted band entered through a slanted clip-path seam with graph-paper texture and a giant ghost watermark of the lead stat. A left-aligned mono-labeled header sits above a collapsed-border 2/4-column grid of giant mono tabular stat numerals, followed by a 3-up row of hairline salary cards with div-built progress bars and mono percentage readouts (salary before, after, increase). Use as the outcomes validation section for bootcamps, academies, or vocational programs showcasing placement rate and earning potential.',
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Metric figures: value + label. */
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    /** Salary progress bars: value, label, percentage width (0-100). */
    bars: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          pct: z.number(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const outcomesEyebrow = props.eyebrow ?? 'Proven Outcomes'
    const outcomesHeading = props.heading ?? 'Results that speak for themselves'
    const outcomesDesc =
      props.description ??
      'Our graduates consistently achieve life-changing career outcomes within 6 months of completion.'
    const outcomeStats = props.stats?.length
      ? props.stats
      : [
          {
            value: '89%',
            label: 'Job placement rate within 6 months',
          },
          {
            value: '$85k',
            label: 'Average starting salary',
          },
          {
            value: '2,400+',
            label: 'Graduates placed since 2019',
          },
          {
            value: '4.9/5',
            label: 'Student satisfaction rating',
          },
        ]
    const outcomeBars = props.bars?.length
      ? props.bars
      : [
          {
            value: '$52k',
            label: 'Average student income before',
            pct: 55,
          },
          {
            value: '$85k',
            label: 'Average graduate salary after',
            pct: 85,
          },
          {
            value: '$33k+',
            label: 'Average salary increase',
            pct: 63,
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pb-16 pt-28 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] lg:pb-24 lg:pt-36',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.05]" />
        <Watermark className="-right-6 top-16 font-mono text-[8rem] text-background/[0.05] sm:text-[16rem]">
          {outcomeStats[0]?.value ?? '%'}
        </Watermark>
        <Container className="relative">
          <div className="mb-12 grid items-end gap-6 lg:mb-16 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={outcomesEyebrow}
              title={outcomesHeading}
              subtitle={outcomesDesc}
              className="max-w-2xl gap-0 lg:col-span-8"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
              titleClassName="mb-4 text-3xl font-bold tracking-tight text-background sm:text-5xl"
              subtitleClassName="text-base text-background/70 sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="hidden justify-self-end font-mono text-[11px] uppercase tracking-[0.2em] text-background/40 lg:col-span-4 lg:block"
            >
              [ outcomes.report — verified ]
            </p>
          </div>
          <StatGrid
            columns={4}
            className="mb-12 gap-0 border-l border-t border-background/15 lg:mb-16"
          >
            {outcomeStats
              .map((s) => ({
                value: s.value,
                label: s.label,
              }))
              .map((s) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <StatItem
                    key={__iv__.label}
                    align="left"
                    className="border-b border-r border-background/15 p-5 sm:p-7"
                  >
                    <StatValue
                      color="inverted"
                      size="xl"
                      className="font-mono tracking-tighter"
                    >
                      {__iv__.value}
                    </StatValue>
                    <StatLabel
                      color="inverted"
                      className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em]"
                    >
                      {__iv__.label}
                    </StatLabel>
                  </StatItem>
                )
              })}
          </StatGrid>
          <OutcomesGrid className="grid gap-4 md:grid-cols-3 md:gap-6">
            {outcomeBars.map((bar) => (
              <OutcomesCard asChild key={bar.label}>
                <div className="rounded-none border border-background/15 bg-transparent p-6">
                  <OutcomeStat className="gap-0">
                    <p className="mb-1 font-mono text-3xl font-bold tabular-nums tracking-tight text-background">
                      {bar.value}
                    </p>
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-background/60">
                      {bar.label}
                    </p>
                  </OutcomeStat>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-none bg-background/15">
                      <div
                        className="h-full rounded-none bg-background/80"
                        style={{
                          width: `${bar.pct}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-background/70">
                      {bar.pct}%
                    </span>
                  </div>
                </div>
              </OutcomesCard>
            ))}
          </OutcomesGrid>
        </Container>
      </section>
    )
  },
})
