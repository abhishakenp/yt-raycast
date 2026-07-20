import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const PopularListVariants = cva('flex flex-col gap-4', {
  variants: {},
  defaultVariants: {},
})

const PopularList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof PopularListVariants> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="popular-list"
      className={cn(PopularListVariants({}), className)}
      ref={ref}
      {...props}
    />
  )
})
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

const PopularCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="popular-card"
      className={cn(
        'flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PopularCard.displayName = 'PopularCard'

const PopularMeta = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="popular-meta"
      className={cn('text-xs text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PopularMeta.displayName = 'PopularMeta'

export {
  PopularList,
  PopularItem,
  PopularCard,
  PopularMeta,
  PopularListVariants,
}
