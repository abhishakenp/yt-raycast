import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationStats — inverted playful-primary proof band for a kids / family
 * learning platform. A full-width bg-foreground / text-background band that cuts
 * in on a slanted clip-path seam, carrying a giant ghost watermark and an
 * asymmetric mono header (label left, live-index meta right) above a
 * collapsed-border grid of stat cells; each cell shows a giant tabular numeral,
 * a mono uppercase label, and a small primary tick-bar motif built from divs.
 * Use as a social-proof / impact strip between content sections for
 * kids-education startups, children's e-learning platforms, and family learning
 * apps. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const KidsEducationStats = defineCapsule({
  name: 'KidsEducationStats',
  description:
    "Inverted playful-primary proof band for a kids / family learning platform: a full-width bg-foreground / text-background band that cuts in on a slanted clip-path seam, carrying a giant ghost watermark and an asymmetric mono header (label left, live-index meta right) above a collapsed-border grid of stat cells, each with a giant tabular numeral, a mono uppercase label, and a small primary tick-bar motif built from divs. Use as a social-proof / impact strip between content sections for kids-education startups, children's e-learning platforms, and family learning apps.",
  props: z.object({
    /** Stat figures. */
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
            value: '50K+',
            label: 'Happy Learners',
          },
          {
            value: '1,200+',
            label: 'Activities & Games',
          },
          {
            value: '98%',
            label: 'Parent Satisfaction',
          },
          {
            value: '35+',
            label: 'Countries Reached',
          },
        ]
    const tickWidths = ['w-8', 'w-12', 'w-6', 'w-10', 'w-5', 'w-9']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 -left-2 text-[7rem] text-background/[0.06] sm:text-[11rem] lg:text-[15rem]">
          PROOF
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <MonoTag tone="inverted">
              <span aria-hidden="true" className="text-primary">
                [01]{' '}
              </span>
              By the numbers
            </MonoTag>
            <p
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ impact ] live index
            </p>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l-2 border-t-2 border-background/15"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b-2 border-r-2 border-background/15 p-5 sm:p-7"
                >
                  <StatValue
                    weight={'bold'}
                    size={'large'}
                    color={'inverted'}
                    className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-none tracking-tight tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color={'inverted'}
                    className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/60"
                  >
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span
                      className={cn(
                        'h-1 bg-primary',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
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
