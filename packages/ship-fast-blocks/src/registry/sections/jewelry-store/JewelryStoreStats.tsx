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
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * JewelryStoreStats — inverted heritage stats band for a luxury jewelry maison.
 * The single dramatic dark moment in the page: a near-black bg-foreground /
 * text-background band cut with a slanted top seam and carrying a giant ghost
 * serif watermark, above a collapsed-border 2-to-4 column grid of metric cells
 * divided by faint vertical hairlines, each pairing a large light serif
 * tabular-nums value with a small mono uppercase label. Use to convey legacy and
 * scale — years of heritage, pieces crafted, master artisans, global boutiques —
 * for fine jewelers, diamond houses, or high-jewelry maisons. Renders fully with
 * no props via baked-in defaults.
 */
export const JewelryStoreStats = defineCapsule({
  name: 'JewelryStoreStats',
  description:
    'Inverted heritage stats band for a luxury jewelry maison: the single dramatic dark moment in the page — a near-black bg-foreground / text-background band cut with a slanted top seam and a giant ghost serif watermark, above a collapsed-border 2-to-4 column grid of metric cells divided by faint vertical hairlines, each pairing a large light serif tabular-nums value with a small mono uppercase label. Use to convey legacy and scale — years of heritage, pieces crafted, master artisans, global boutiques — for fine jewelers, diamond houses, or high-jewelry maisons.',
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
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] pt-36 pb-24 lg:pt-40 lg:pb-28',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="left-1/2 top-24 -translate-x-1/2 font-serif text-[24vw] font-normal leading-none tracking-tighter text-background/[0.05]"
        >
          Heritage
        </Watermark>
        <Container size="xl" className="relative sm:px-4">
          <StatGrid columns={4} className="gap-0 divide-x divide-background/20">
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="center"
                  className="px-4 py-2"
                >
                  <StatValue
                    fontFamily="serif"
                    size="xl"
                    color="inverted"
                    className="font-normal"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color="inverted"
                    className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em]"
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
