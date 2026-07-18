import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const SubscribeBandVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      inverted: 'bg-foreground text-background',
      muted: 'bg-muted text-foreground',
      'primary-tint': 'bg-primary/10 text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const SubscribeBand = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof SubscribeBandVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="subscribe-band"
      className={cn(SubscribeBandVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
SubscribeBand.displayName = 'SubscribeBand'

const SubscribeHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      data-slot="subscribe-heading"
      className={cn('text-2xl font-semibold tracking-tight', className)}
      ref={ref}
      {...props}
    />
  )
})
SubscribeHeading.displayName = 'SubscribeHeading'

const SubscribeDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="subscribe-description"
      className={cn('text-base text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
SubscribeDescription.displayName = 'SubscribeDescription'

const SubscribeFineprint = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="subscribe-fineprint"
      className={cn('text-xs text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
SubscribeFineprint.displayName = 'SubscribeFineprint'

const SubscribeForm = React.forwardRef<
  HTMLFormElement,
  React.ComponentProps<'form'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'form'
  return (
    <Comp
      data-slot="subscribe-form"
      className={cn(
        'flex w-full flex-col items-stretch gap-3 sm:flex-row',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SubscribeForm.displayName = 'SubscribeForm'

const SubscribeInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <input
    data-slot="subscribe-input"
    className={cn(
      'w-full flex-1 rounded-full border border-input bg-background px-5 py-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30',
      className,
    )}
    ref={ref}
    {...props}
  />
))
SubscribeInput.displayName = 'SubscribeInput'

export {
  SubscribeBand,
  SubscribeHeading,
  SubscribeDescription,
  SubscribeFineprint,
  SubscribeForm,
  SubscribeInput,
  SubscribeBandVariants as subscribeBandVariants,
}
