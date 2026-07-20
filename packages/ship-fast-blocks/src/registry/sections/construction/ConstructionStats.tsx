import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * ConstructionStats — industrial-brutalist inverted site-record band for a
 * construction / general contractor page. A full foreground-inversion band
 * that cuts in on a slanted clip-path seam, opened by a mono meta rule
 * (primary marker square + "Site record" + tabular metric count) with a giant
 * ghost numeral watermark behind. Stats sit in a collapsed-border ledger
 * (2-up mobile, 4-up desktop): each cell carries a giant extrabold tabular
 * numeral, a mono uppercase label, and a small token-built hazard tick. Use as
 * a credibility "by the numbers" section for construction companies,
 * contractors, builders, or any business showcasing key metrics. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const ConstructionStats = defineCapsule({
  name: 'ConstructionStats',
  description:
    "Industrial-brutalist inverted site-record stats band for a construction / general contractor page: a foreground-inversion band with a slanted clip-path top seam, a mono meta rule (primary marker + tabular metric count), a giant ghost numeral watermark, and a collapsed-border ledger of stat cells (2-up mobile / 4-up desktop), each with a giant extrabold tabular numeral, a mono uppercase label, and a token-built hazard tick. Use as a credibility 'by the numbers' section for construction firms, contractors, builders, or any business showcasing key metrics.",
  props: z.object({
    /** Stat items: value + label pairs. */
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
            value: '500+',
            label: 'Projects Completed',
          },
          {
            value: '38',
            label: 'Years in Business',
          },
          {
            value: '$2.4B',
            label: 'Total Project Value',
          },
          {
            value: '98%',
            label: 'Client Satisfaction',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:py-16 sm:pt-24 lg:py-20 lg:pt-28',
          props.className,
        )}
      >
        <Watermark className="right-0 top-8 font-mono text-[clamp(7rem,22vw,18rem)] tabular-nums text-background/[0.05]">
          {items[0]?.value}
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Site record
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} metrics
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
                  <StatValue
                    weight={'bold'}
                    size={'large'}
                    className="mb-0 text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-none tracking-tight text-background tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_4px,transparent_4px,transparent_8px)] text-primary',
                      ['w-10', 'w-14', 'w-8', 'w-12'][i % 4],
                    )}
                  />
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
