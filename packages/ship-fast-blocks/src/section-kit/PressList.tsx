import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const PressListVariants = cva('flex flex-col', {
  variants: {},
  defaultVariants: {},
})

const PressList = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="press-list"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
PressList.displayName = 'PressList'

const PressItem = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="press-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
PressItem.displayName = 'PressItem'

const PressQuote = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="press-quote"
      className={cn('text-lg leading-relaxed text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PressQuote.displayName = 'PressQuote'

const PressAttribution = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="press-attribution"
      className={cn('text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PressAttribution.displayName = 'PressAttribution'

export {
  PressList,
  PressItem,
  PressQuote,
  PressAttribution,
  PressListVariants as pressListVariants,
}
