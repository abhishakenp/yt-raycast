import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * JewelryStoreStats — heritage stats band for a luxury jewelry maison. A clean
 * centered responsive grid (1/2/4 cols) of metric blocks, each pairing a large
 * gold serif value with a wide letter-spaced uppercase muted label. Use to
 * convey legacy and scale — years of heritage, pieces crafted, master artisans,
 * global boutiques — for fine jewelers, diamond houses, or high-jewelry maisons.
 * Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreStats = defineCapsule({
  name: 'JewelryStoreStats',
  description:
    'Heritage stats band for a luxury jewelry maison: a clean centered responsive grid (1/2/4 cols) of metric blocks, each pairing a large gold serif value with a wide letter-spaced uppercase muted label. Use to convey legacy and scale — years of heritage, pieces crafted, master artisans, global boutiques — for fine jewelers, diamond houses, or high-jewelry maisons.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '130+', label: 'Years of Heritage' },
          { value: '12,000+', label: 'Pieces Crafted' },
          { value: '47', label: 'Master Artisans' },
          { value: '4', label: 'Global Boutiques' },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="sm:px-4">
          <StatGrid columns={4} className={'text-center gap-12'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label}>
                  <StatValue fontFamily={'serif'} size={'xl'} color={'primary'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel uppercase>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
