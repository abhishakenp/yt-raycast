import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * ElectronicsStoreStats — a tech-brutalist spec-sheet stats band for an
 * electronics storefront. A mono index eyebrow above a 2-to-4 column
 * collapsed-border ledger of left-aligned metrics, each a giant tabular numeral
 * over a mono uppercase label, sharing hairline border-2 rules like a data table.
 * Use as a social-proof / scale strip between sections on electronics stores,
 * gadget shops, consumer-tech retailers, or any product catalog.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const ElectronicsStoreStats = defineCapsule({
  name: 'ElectronicsStoreStats',
  description:
    'Tech-brutalist spec-sheet stats band for an electronics storefront: a mono index eyebrow above a 2-to-4 column collapsed-border ledger of left-aligned metrics, each a giant tabular numeral over a mono uppercase label, sharing hairline border-2 rules like a data table (e.g. 50K+ Happy Customers, 1,200+ Products, 4.9 Average Rating, 24/7 Support). Use as a social-proof / scale strip between sections on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.',
  props: z.object({
    /** Stat cells. */
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
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '50K+',
            label: 'Happy Customers',
          },
          {
            value: '1,200+',
            label: 'Products Available',
          },
          {
            value: '4.9',
            label: 'Average Rating',
          },
          {
            value: '24/7',
            label: 'Customer Support',
          },
        ]
    return (
      <section
        className={cn(
          'border-y-2 border-foreground py-16 lg:py-20',
          props.className,
        )}
      >
        <Container>
          <span className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="tabular-nums">[ 06 ]</span>
            <span className="text-muted-foreground">By the numbers</span>
          </span>
          <StatGrid
            columns={4}
            className="gap-0 border-l-2 border-t-2 border-foreground"
          >
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-2 border-b-2 border-r-2 border-foreground p-5 sm:p-6"
                >
                  <StatValue
                    weight={'semibold'}
                    size={'default'}
                    className="text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
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
