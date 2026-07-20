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

export const TravelAgencyStats = defineCapsule({
  name: 'TravelAgencyStats',
  description:
    'Dark inverted credibility band for the Travel Agency page family. A full ink inversion (foreground surface, background text) that cuts in on a diagonal clip-path seam, with an asymmetric header (heading + lede left, mono tracking meta right) above a collapsed-border grid of stat cells — destinations served, travelers booked, years in business, and average rating — each carrying a giant fluid tabular numeral, a mono uppercase label, and a small primary tick-bar motif. Use to reinforce why travelers choose the agency. All values are prop-driven with premium defaults so it renders with no props.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why travelers choose us'
    const subheading =
      props.subheading ??
      'Nearly two decades of crafting seamless, unforgettable journeys across the globe.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '120+', label: 'Destinations' },
          { value: '85k+', label: 'Happy travelers' },
          { value: '18', label: 'Years of journeys' },
          { value: '4.9★', label: 'Average rating' },
        ]
    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8', 'w-12', 'w-5']

    return (
      <section
        className={
          'bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="By the numbers"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-2"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
              titleClassName="text-background text-3xl font-semibold tracking-tight md:text-4xl"
              subtitleClassName="text-background/60"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ trusted ] worldwide
            </p>
          </div>
          <StatGrid
            columns={4}
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
