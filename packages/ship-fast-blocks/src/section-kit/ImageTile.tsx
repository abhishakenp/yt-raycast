import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * ImageTile — grid item wrapper for a uniform image gallery tile. The
 * `treatment` CVA variant bundles aspect-ratio + rounded + background into
 * complete curated presets. Use `asChild` to render as a <button> for
 * clickable tiles. The tile always carries `group` so hover-zoom on the
 * inner <Image> can use `group-hover:scale-105`.
 *
 * Caption overlays compose as children via `BentoTileCaption` (reused from
 * BentoGrid) — its `reveal` CVA handles always-visible vs hover-fade.
 */
const imageTileVariants = cva('group relative overflow-hidden', {
 variants: {
 treatment: {
 '4-3-xl': 'aspect-[4/3] ',
 '4-3-lg': 'aspect-[4/3] ',
 '4-3-2xl-muted': 'aspect-[4/3] bg-muted',
 '4-3-xl-muted': 'aspect-[4/3] bg-muted',
 '4-5-xl-muted': 'aspect-[4/5] bg-muted',
 '4-5-lg-muted': 'aspect-[4/5] bg-muted',
 'h-72-2xl': 'h-72 ',
 'h-72-xl': 'h-72 ',
 'fixed-lg': '',
 },
 },
 defaultVariants: {
 treatment: '4-3-xl',
 },
})

export interface ImageTileProps
 extends
 React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof imageTileVariants> {
 asChild?: boolean
}

const ImageTile = React.forwardRef<HTMLDivElement, ImageTileProps>(
 ({ className, treatment, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 ref={ref}
 data-slot="image-tile"
 data-d-role="card"className={cn(imageTileVariants({ treatment }), className)}
 {...props}
 />
 )
 },
)
ImageTile.displayName = 'ImageTile'

export { ImageTile, imageTileVariants }
