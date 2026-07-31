import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * MasonryTile — image wrapper for column-masonry galleries. Each tile sits
 * inside a vertical column (`space-y-4`) and carries its own aspect-ratio +
 * surface treatment via the `treatment` CVA variant. The inner <Image>
 * uses `size-full object-cover` to fill the tile.
 *
 * Treatments bundle aspect + rounded + background into complete curated
 * presets (3-4-xl, square-xl, h-64-xl, h-48-xl, 3-4-card, square-card,
 * 4-5-card).
 */
const masonryTileVariants = cva('overflow-hidden', {
  variants: {
    treatment: {
      '3-4-xl': 'aspect-[3/4] ',
      'square-xl': 'aspect-square ',
      'h-64-xl': 'h-64 ',
      'h-48-xl': 'h-48 ',
      '3-4-card': 'aspect-[3/4] bg-card',
      'square-card': 'aspect-square bg-card',
      '4-5-card': 'aspect-[4/5] bg-card',
    },
  },
  defaultVariants: {
    treatment: '3-4-xl',
  },
})

export interface MasonryTileProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof masonryTileVariants> {
  asChild?: boolean
}

const MasonryTile = React.forwardRef<HTMLDivElement, MasonryTileProps>(
  ({ className, treatment, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="masonry-tile"
        data-d-role="card"
        className={cn(masonryTileVariants({ treatment }), className)}
        {...props}
      />
    )
  },
)
MasonryTile.displayName = 'MasonryTile'

export { MasonryTile, masonryTileVariants }
