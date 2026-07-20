import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * NonprofitStats — the single inverted impact band for a nonprofit / charity /
 * NGO page, cut in on a slanted clip-path seam. A full ink inversion
 * (bg-foreground / text-background) behind a giant faint ghost watermark: an
 * asymmetric header (left-aligned serif heading + lede, mono "[ measured impact ]"
 * meta right) sits above a collapsed-border ledger of four headline metrics —
 * people helped, funds raised, volunteers, years of service — each cell carrying
 * a giant extrabold tabular numeral over a hairline tick and a mono uppercase
 * micro-label. This is the page's impact moment: warm, confident, no accent
 * colour on the ink surface. Use to prove credibility and momentum on nonprofit,
 * foundation, or humanitarian pages. Renders fully with no props via baked-in
 * "Roots of Hope" defaults.
 */
export const NonprofitStats = defineCapsule({
  name: 'NonprofitStats',
  description:
    "Single inverted impact band for a nonprofit / charity / NGO page, cut in on a slanted clip-path seam: a full ink inversion (bg-foreground / text-background) behind a giant faint ghost watermark, with an asymmetric header (left-aligned serif heading + lede, mono meta right) above a collapsed-border ledger of four headline metrics — people helped, funds raised, volunteers, years of service — each cell carrying a giant extrabold tabular numeral over a hairline tick and a mono uppercase micro-label. The page's impact moment: warm, confident, no accent colour on the ink surface. Use to prove credibility and momentum on nonprofit, foundation, or humanitarian pages.",
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Section title. */
    heading: z.string().optional(),
    /** Supporting line under the title. */
    subheading: z.string().optional(),
    /** Headline metrics: value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our impact'
    const heading = props.heading ?? 'Hope, measured in lives changed'
    const subheading =
      props.subheading ??
      "Together with our donors and volunteers, we've turned generosity into real, lasting change for communities around the world."
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '2.4M', label: 'People helped' },
          { value: '$48M', label: 'Funds raised' },
          { value: '12K', label: 'Volunteers' },
          { value: '18', label: 'Years of service' },
        ]

    return (
      <section
        className={
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-16 -left-6 select-none font-serif text-[9rem] italic text-background/[0.05] sm:text-[14rem] lg:text-[18rem]">
          impact
        </Watermark>
        <Container size="xl" className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
              titleClassName="font-serif text-3xl font-medium tracking-tight text-background sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-background/60 sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40 md:pb-1"
            >
              [ measured impact ]
            </p>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-3 border-b border-r border-background/15 p-6 sm:p-8"
                >
                  <StatValue className="mb-0 text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-background/40"
                  />
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
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
