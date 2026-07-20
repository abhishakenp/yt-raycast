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
 * PortfolioDevStats — the page's dark inverted track-record band for a modern
 * developer portfolio. A full ink inversion (bg-foreground / text-background)
 * that cuts in on a slanted clip-path seam, with an asymmetric header (mono
 * meta rule + tabular stat count left of a live-index mono tag) above a
 * collapsed-border ledger of headline numbers — years of experience, projects
 * shipped, GitHub stars, and happy clients. Each cell shares hairline rules and
 * pairs a giant tabular numeral with a mono uppercase label and a small
 * div-built tick motif. Theme-token only. Use mid-page on a freelance engineer
 * or studio portfolio to establish credibility at a glance. Renders fully with
 * no props via baked-in defaults.
 */
export const PortfolioDevStats = defineCapsule({
  name: 'PortfolioDevStats',
  description:
    'Dark inverted track-record band for a modern developer portfolio: a full ink-inverted section (bg-foreground / text-background) that cuts in on a slanted clip-path seam, with an asymmetric header (mono meta rule + tabular stat count, live-index mono tag) above a collapsed-border ledger of headline numbers — years of experience, projects shipped, GitHub stars, and happy clients. Each cell shares hairline rules and pairs a giant tabular numeral with a mono uppercase label and a small div-built tick motif. Theme-token only. Use mid-page on a freelance engineer or studio portfolio to establish credibility at a glance.',
  props: z.object({
    /** Mono-style eyebrow comment above the title. */
    eyebrow: z.string().optional(),
    /** Section title. */
    title: z.string().optional(),
    /** Short supporting line under the title. */
    subtitle: z.string().optional(),
    /** Stat cells: value + label. */
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '// by the numbers'
    const title = props.title ?? 'Track record'
    const subtitle = props.subtitle ?? 'A few numbers from the last few years.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '8+', label: 'Years experience' },
          { value: '120+', label: 'Projects shipped' },
          { value: '4.2k', label: 'GitHub stars' },
          { value: '60+', label: 'Happy clients' },
        ]
    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8', 'w-12', 'w-5']

    return (
      <section
        className={
          // Slanted top edge — the inversion band cuts in on a diagonal seam
          // (clip-path is neighbor-independent).
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-4 select-none font-mono text-[9rem] font-extrabold leading-none tracking-tighter text-background/[0.06] sm:text-[14rem] lg:text-[18rem]"
        >
          {'{ }'}
        </span>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              className="max-w-2xl gap-2"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
              titleClassName="text-background text-3xl font-semibold tracking-tight md:text-4xl"
              subtitleClassName="text-background/60"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ uptime ] shipping
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
