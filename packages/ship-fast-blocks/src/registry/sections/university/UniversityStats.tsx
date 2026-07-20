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
import { Watermark } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityStats = defineCapsule({
  name: 'UniversityStats',
  description:
    'Editorial-academic key-figures band for the University page family: the page’s single ink-inverted section (foreground background, background text) cut in on a slanted clip-path seam, with a giant ghost monogram watermark. A left-aligned SectionHeading with a mono meta count above a collapsed-border ledger of stat cells (four columns sharing hairline rules) presents headline metrics — total students, national ranking, distinguished faculty, and the worldwide alumni network — each as a giant tabular numeral over a mono uppercase catalog label. Use to convey scale and reputation between the hero and program sections of a university homepage.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'By the numbers'
    const heading = props.heading ?? 'A community of consequence'
    const subheading =
      props.subheading ??
      'Generations of scholarship, research, and achievement — measured across our campus and a global network of graduates.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '18,000', label: 'Students' },
          { value: 'Top 25', label: 'National Ranking' },
          { value: '1,200', label: 'Distinguished Faculty' },
          { value: '240,000+', label: 'Alumni Worldwide' },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-8 font-serif text-[16rem] leading-none text-background/[0.05] sm:text-[22rem]">
          W
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60"
              titleClassName="font-serif text-4xl font-semibold tracking-tight text-background sm:text-5xl"
              subtitleClassName="text-background/60 md:text-base"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-background/40"
            >
              {String(stats.length).padStart(2, '0')} / measures
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
                  key={__iv__.label}
                  align="left"
                  className="relative gap-3 border-b border-r border-background/15 p-6 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="absolute right-4 top-4 font-mono text-[11px] tabular-nums text-background/25"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <StatValue className="mb-0 font-serif text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-none tracking-tight tabular-nums text-background">
                    {__iv__.value}
                  </StatValue>
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
