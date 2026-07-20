import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * TelehealthStats — the prominent inverted care-stat band for a telehealth site,
 * cut in on a gentle slanted clip-path seam. On a calm bg-foreground /
 * text-background surface carrying a giant faint ghost "+" cross watermark: an
 * asymmetric inverted header (mono "[ care outcomes ]" meta + heading + lede)
 * above a collapsed-border 2-to-4 column ledger of stat cells, each pairing a
 * giant fluid-clamp extrabold tabular numeral (patients seen, average wait,
 * satisfaction, providers) with a short background tick dash and a mono
 * uppercase micro-label. Tokens-only, no links. Precise yet warm, telemedicine
 * outcomes aesthetic. Use to back up marketing claims with concrete numbers and
 * reinforce confidence before a visitor books.
 */
export const TelehealthStats = defineCapsule({
  name: 'TelehealthStats',
  description:
    "Prominent inverted care-stat band for a telehealth site, cut in on a gentle slanted clip-path seam: a calm bg-foreground / text-background surface with a giant faint ghost '+' cross watermark, an asymmetric inverted header (mono care-outcomes meta + heading + lede) above a collapsed-border 2-to-4 column ledger of stat cells, each pairing a giant fluid extrabold tabular numeral (patients seen, average wait, satisfaction, providers) with a short background tick dash and a mono uppercase micro-label. Tokens-only, no links. Precise yet warm, telemedicine outcomes aesthetic. Use to back up marketing claims with concrete numbers and reinforce confidence before a visitor books.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by patients nationwide'
    const subheading =
      props.subheading ??
      'Real outcomes from the people who count on us for everyday care.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '2M+', label: 'Patients treated' },
          { value: '< 10 min', label: 'Average wait time' },
          { value: '4.9/5', label: 'Patient satisfaction' },
          { value: '1,200+', label: 'Board-certified providers' },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pt-24 pb-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:pt-28 sm:pb-24',
          props.className,
        )}
        aria-label="Telehealth statistics"
      >
        <Watermark className="-right-8 -top-16 text-[13rem] text-background/[0.05] sm:text-[20rem]">
          +
        </Watermark>
        <Container size="xl" className="relative px-6">
          {heading ? (
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={subheading}
                className="max-w-2xl gap-0"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-background sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
                subtitleClassName="text-base text-background/70 sm:text-lg"
              />
              <MonoTag
                aria-hidden="true"
                tone="inverted"
                className="shrink-0 text-background/50 md:pb-1"
              >
                [ care outcomes ]
              </MonoTag>
            </div>
          ) : null}
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/20"
          >
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/20 p-6 sm:p-8"
                >
                  <StatValue
                    weight={'bold'}
                    size={'large'}
                    color={'inverted'}
                    className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-none tracking-tight tabular-nums text-background"
                  >
                    {__iv__.value}
                  </StatValue>
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-background/40"
                  />
                  <StatLabel
                    color={'inverted'}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50"
                  >
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
