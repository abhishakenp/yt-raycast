import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const MusicListVariants = cva('flex flex-col gap-4', {
  variants: {},
  defaultVariants: {},
})

const MusicList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof MusicListVariants> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="music-list"
      data-d-role="list"
      className={cn(MusicListVariants({}), className)}
      ref={ref}
      {...props}
    />
  )
})
MusicList.displayName = 'MusicList'

const MusicItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="music-list-item"
      data-d-role="list"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
MusicItem.displayName = 'MusicItem'

const MusicTrack = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="music-track"
      className={cn('flex items-center gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
MusicTrack.displayName = 'MusicTrack'

const MusicPlayer = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="music-player"
      className={cn(
        'inline-flex items-center justify-center rounded-full text-foreground transition-colors hover:text-primary',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
MusicPlayer.displayName = 'MusicPlayer'

export { MusicList, MusicItem, MusicTrack, MusicPlayer, MusicListVariants }
