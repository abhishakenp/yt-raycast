import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const PopularListVariants = cva('flex flex-col', {
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

const PopularList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & VariantProps<typeof PopularListVariants>
>(({ className, gap, ...props }, ref) => (
  <ul
    data-slot="popular-list"
    className={cn(PopularListVariants({ gap }), className)}
    ref={ref}
    {...props}
  />
))
PopularList.displayName = 'PopularList'

const PopularItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="popular-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
PopularItem.displayName = 'PopularItem'

export { PopularList, PopularItem, PopularListVariants }
