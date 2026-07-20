import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryStats — inverted KPI ledger band for a food-delivery /
 * restaurant-marketplace site. A full-width foreground-on-background dark band
 * that cuts in on a slanted clip-path seam, with a mono "[ by the numbers ]"
 * meta rule above a collapsed-border grid of stat cells — each carrying a giant
 * fluid tabular numeral and a mono uppercase label (happy customers, restaurant
 * partners, cities served, avg. delivery time). Use as a punchy social-proof
 * divider between lighter sections for food-delivery apps, restaurant
 * aggregators, or online-ordering platforms. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const FoodDeliveryStats = defineCapsule({
  name: 'FoodDeliveryStats',
  description:
    'Inverted KPI ledger band for a food-delivery / restaurant-marketplace site: a full-width foreground-on-background dark band that cuts in on a slanted clip-path seam, with a mono "[ by the numbers ]" meta rule above a collapsed-border grid of stat cells, each carrying a giant fluid tabular numeral and a mono uppercase label (happy customers, restaurant partners, cities served, avg. delivery time). Use as a punchy social-proof divider between lighter sections for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** KPI items (value + label). */
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
    const statItems = props.items?.length
      ? props.items
      : [
          {
            value: '2M+',
            label: 'Happy customers',
          },
          {
            value: '500+',
            label: 'Restaurant partners',
          },
          {
            value: '45',
            label: 'Cities served',
          },
          {
            value: '15min',
            label: 'Avg. delivery time',
          },
        ]
    return (
      <section
        className={cn(
          // Slanted top seam: the inverted band cuts in on a diagonal,
          // neighbor-independent (clip-path on the band itself).
          'bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:py-20 lg:pt-36',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-primary"
              />
              Nosh, by the numbers
            </span>
            <span aria-hidden="true" className="tabular-nums">
              [ live ]
            </span>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {statItems.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-7"
                >
                  <StatValue
                    weight={'bold'}
                    color={'inverted'}
                    className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-tighter tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color={'inverted'}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60"
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
