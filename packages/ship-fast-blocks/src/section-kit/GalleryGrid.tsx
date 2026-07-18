import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

const GalleryGrid = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      ref={ref}
      data-slot="gallery-grid"
      className={cn('flex flex-col gap-10', className)}
      {...props}
    />
  )
})
GalleryGrid.displayName = 'GalleryGrid'

const GalleryGridItems = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    asChild?: boolean
    columns?: 2 | 3 | 4
  }
>(({ className, asChild = false, columns = 3, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <Comp
      ref={ref}
      data-slot="gallery-grid-items"
      className={cn('grid gap-4', 'grid-cols-1', colClass, className)}
      {...props}
    />
  )
})
GalleryGridItems.displayName = 'GalleryGridItems'

const GalleryTile = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'figure'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'figure'
  return (
    <Comp
      ref={ref}
      data-slot="gallery-tile"
      className={cn(
        'group relative aspect-[4/3] overflow-hidden rounded-xl border border-border',
        className,
      )}
      {...props}
    />
  )
})
GalleryTile.displayName = 'GalleryTile'

const GalleryTileImage = React.forwardRef<
  HTMLImageElement,
  Omit<React.ComponentProps<typeof Image>, 'w' | 'h'> & {
    asChild?: boolean
    w?: number
    h?: number
  }
>(({ className, asChild = false, w = 600, h = 450, ...props }, ref) => {
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(
          'size-full object-cover transition-transform duration-300 group-hover:scale-105',
          className,
        )}
        {...props}
      />
    )
  }
  return (
    <Image
      w={w}
      h={h}
      className={cn(
        'size-full object-cover transition-transform duration-300 group-hover:scale-105',
        className,
      )}
      {...props}
    />
  )
})
GalleryTileImage.displayName = 'GalleryTileImage'

const GalleryTileCaption = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'figcaption'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'figcaption'
  return (
    <Comp
      ref={ref}
      data-slot="gallery-tile-caption"
      className={cn(
        'absolute inset-x-0 bottom-0 bg-background/80 px-3 py-2 text-sm text-foreground backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
})
GalleryTileCaption.displayName = 'GalleryTileCaption'

const galleryMasonryVariants = cva('grid gap-4', {
  variants: {
    columns: {
      '2': 'grid-cols-2',
      '2-3': 'grid-cols-2 md:grid-cols-3',
      '2-4': 'grid-cols-2 md:grid-cols-4',
      '1-3': 'md:grid-cols-3',
    },
  },
  defaultVariants: {
    columns: '2-3',
  },
})

const GalleryMasonry = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof galleryMasonryVariants> & { asChild?: boolean }
>(({ className, columns, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="gallery-masonry"
      className={cn(galleryMasonryVariants({ columns }), className)}
      {...props}
    />
  )
})
GalleryMasonry.displayName = 'GalleryMasonry'

const GalleryMasonryColumn = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="gallery-masonry-column"
      className={cn('space-y-4', className)}
      {...props}
    />
  )
})
GalleryMasonryColumn.displayName = 'GalleryMasonryColumn'

export {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
  GalleryMasonry,
  GalleryMasonryColumn,
  galleryMasonryVariants,
}
