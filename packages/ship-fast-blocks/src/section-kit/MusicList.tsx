import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const MusicListVariants = cva('flex flex-col', {
  variants: {
    gap: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
})

const MusicList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & VariantProps<typeof MusicListVariants>
>(({ className, gap, ...props }, ref) => (
  <ul
    data-slot="music-list"
    className={cn(MusicListVariants({ gap }), className)}
    ref={ref}
    {...props}
  />
))
MusicList.displayName = 'MusicList'

const MusicItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="music-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
MusicItem.displayName = 'MusicItem'

export { MusicList, MusicItem, MusicListVariants }
