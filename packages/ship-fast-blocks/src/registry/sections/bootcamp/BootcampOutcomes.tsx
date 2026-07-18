import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampOutcomes — proven outcomes / stats band for a coding bootcamp /
 * career-school landing page. A centered eyebrow, heading and description
 * above a 4-up metrics grid of large bold figures, followed by a 3-column row
 * of progress-bar cards showing salary before / after / increase. Use as the
 * outcomes validation section for bootcamps, academies, or vocational programs
 * that want to showcase placement rate and earning potential.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { OutcomesGrid, OutcomesCard } from '#/section-kit/OutcomesGrid.tsx'
export const BootcampOutcomes = defineCapsule({
  name: 'BootcampOutcomes',
  description:
    'Proven outcomes / stats band for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a 4-up metrics grid of large bold figures, followed by a 3-column row of progress-bar cards showing salary before, after, and increase. Use as the outcomes validation section for bootcamps, academies, or vocational programs that want to showcase placement rate and earning potential.',
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <Eyebrow
              variant="text"
              className="mb-4 inline-block tracking-wider text-primary"
            >
              {outcomesEyebrow}
            </Eyebrow>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {outcomesHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{outcomesDesc}</p>
          </div>
          <StatGrid columns={4} gap={'wide'} className={'mb-16'}>
            {outcomeStats
              .map((s) => ({
                value: s.value,
                label: s.label,
              }))
              .map((s) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <StatItem key={__iv__.label}>
                    <StatValue color={'primary'} size={'xl'}>
                      {__iv__.value}
                    </StatValue>
                    <StatLabel>{__iv__.label}</StatLabel>
                  </StatItem>
                )
              })}
          </StatGrid>
          <OutcomesGrid className="grid gap-6 md:grid-cols-3">
            {outcomeBars.map((bar) => (
              <OutcomesCard asChild key={bar.label}>
                <div className="rounded-xl bg-muted/60 p-6">
                  <p className="mb-1 text-3xl font-bold">{bar.value}</p>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {bar.label}
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${bar.pct}%`,
                      }}
                    />
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
