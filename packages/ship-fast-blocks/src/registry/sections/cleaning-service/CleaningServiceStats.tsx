import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * CleaningServiceStats — playful-Swiss inverted proof band for a home-cleaning
 * / maid-service landing page. A full ink inversion (foreground background,
 * background text) that cuts in on a slanted clip-path seam: a mono uppercase
 * meta rule with a primary square on the left and a rotated primary "checked"
 * chip on the right, above a collapsed-border 2/4-column grid of stat cells —
 * each sharing hairline rules and carrying a giant fluid tabular numeral, a
 * primary tick bar, and a mono uppercase label. No links, no images — pure
 * social-proof numbers. Use as a credibility / trust strip between content
 * sections for residential cleaning companies, maid services, housekeeping
 * platforms, or any local home-service brand. Renders fully with no props via
 * four baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const CleaningServiceStats = defineCapsule({
  name: 'CleaningServiceStats',
  description:
    'Playful-Swiss inverted proof band for a home-cleaning / maid-service landing page: a full ink-inverted section entering on a slanted clip-path seam, with a mono uppercase meta rule (primary square left, rotated primary checked chip right) above a collapsed-border 2/4-column grid of stat cells sharing hairline rules — each with a giant fluid tabular numeral, a primary tick bar, and a mono uppercase label. No links, no images — pure social-proof numbers. Use as a credibility / trust strip between content sections for residential cleaning, maid services, housekeeping, or local home-service brands.',
  props: z.object({
    /** Metric figures: value + label. */
    items: z
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
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '10,000+',
            label: 'Homes Cleaned',
          },
          {
            value: '4.9',
            label: 'Average Rating',
          },
          {
            value: '150+',
            label: 'Vetted Cleaners',
          },
          {
            value: '98%',
            label: 'Satisfaction Rate',
          },
        ]
    const tickWidths = ['w-10', 'w-6', 'w-12', 'w-8']
    return (
      <section
        className={cn(
          'bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:py-16 sm:pt-24 lg:py-20 lg:pt-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-background/20 pb-4 sm:mb-10">
            <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Track record
            </span>
            <span
              aria-hidden="true"
              className="inline-flex rotate-2 items-center gap-1.5 border border-background/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-background/70"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="square"
                className="text-primary"
              >
                <path d="M3 11l4 4 10-11" />
              </svg>
              verified
            </span>
          </div>
          <StatGrid
            columns={4}
            className="grid-cols-2 gap-0 border-l border-t border-background/20 lg:grid-cols-4"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/20 p-5 sm:p-8"
                >
                  <StatValue className="text-[clamp(2.25rem,4.5vw,4rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <span aria-hidden="true" className="flex items-center gap-1">
                    <span
                      className={cn(
                        'h-1.5 bg-primary',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="size-1.5 bg-background/30" />
                    <span className="size-1.5 bg-background/30" />
                  </span>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
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
