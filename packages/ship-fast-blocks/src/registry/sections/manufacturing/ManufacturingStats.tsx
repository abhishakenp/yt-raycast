import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * ManufacturingStats — an inverted, slab-industrial company stats band for a
 * precision-manufacturing site. A bg-foreground / text-background band cut with a
 * slanted clip-path seam along its top edge, carrying a giant ghost watermark and
 * a collapsed, hairline-divided grid of stat cells: each cell pairs a mono index
 * kicker with a giant tabular-nums numeral over a mono uppercase label. Loud,
 * heavy, proof-by-numbers. Use between content sections on machine-shop,
 * fabricator or contract-manufacturer pages to surface facility size, machine
 * count, headcount and parts shipped. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const ManufacturingStats = defineCapsule({
  name: 'ManufacturingStats',
  description:
    'An inverted, slab-industrial company stats band for a precision-manufacturing site: a bg-foreground / text-background band cut with a slanted clip-path seam along its top edge, carrying a giant ghost watermark and a collapsed hairline-divided grid of stat cells that each pair a mono index kicker with a giant tabular-nums numeral over a mono uppercase label. Loud, heavy, proof-by-numbers. Use between content sections on machine-shop, fabricator or contract-manufacturer pages to surface facility size, machine count, headcount and parts shipped.',
  props: z.object({
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
            value: '180K',
            label: 'Square Feet Facility',
          },
          {
            value: '50+',
            label: 'CNC Machines',
          },
          {
            value: '350',
            label: 'Skilled Employees',
          },
          {
            value: '1.2M+',
            label: 'Parts Shipped (2024)',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] lg:py-20 lg:pt-28',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 right-0 text-[9rem] leading-none text-background/[0.06] sm:text-[13rem]">
          SPEC
        </Watermark>
        <Container className="relative">
          <h2 className="sr-only">Company Statistics</h2>
          <StatGrid
            columns={4}
            className="grid-cols-2 gap-0 border-2 border-background/25 lg:grid-cols-4"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'center'}
                  className={cn(
                    'items-start p-6 text-left sm:p-8',
                    i % 2 === 1 && 'border-l-2 border-background/25',
                    i >= 2 && 'border-t-2 border-background/25',
                    'lg:border-t-0 lg:border-l-2',
                    i === 0 && 'lg:border-l-0',
                  )}
                >
                  <MonoTag
                    aria-hidden="true"
                    tone="inverted"
                    className="mb-3 block"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <StatValue
                    weight={'semibold'}
                    size={'large'}
                    className="text-4xl font-extrabold tabular-nums tracking-tight text-background sm:text-5xl"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background/60">
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
