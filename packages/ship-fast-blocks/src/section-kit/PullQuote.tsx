import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const pullQuoteVariants = cva('', {
  variants: {
    variant: {
      default: '',
      gradient: 'bg-gradient-to-b from-muted/50 to-background',
      muted: 'border-y border-border bg-muted/30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const PullQuote = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof pullQuoteVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="pull-quote"
      className={cn(pullQuoteVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
PullQuote.displayName = 'PullQuote'

const PullQuoteIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { size?: 'sm' | 'lg'; asChild?: boolean }
>(({ className, size = 'sm', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="pull-quote-icon"
      className={cn(
        'mx-auto mb-5 grid place-items-center rounded-full bg-primary/10 text-primary',
        size === 'sm' && 'size-12',
        size === 'lg' && 'mb-8 size-16',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PullQuoteIcon.displayName = 'PullQuoteIcon'

const PullQuoteText = React.forwardRef<
  HTMLQuoteElement,
  React.ComponentProps<'blockquote'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'blockquote'
  return (
    <Comp
      data-slot="pull-quote-text"
      className={cn(
        'text-balance text-xl font-medium leading-snug text-foreground sm:text-2xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PullQuoteText.displayName = 'PullQuoteText'

const PullQuoteAttribution = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pull-quote-attribution"
      className={cn('mt-7 flex items-center justify-center gap-3.5', className)}
      ref={ref}
      {...props}
    />
  )
})
PullQuoteAttribution.displayName = 'PullQuoteAttribution'

const PullQuoteAvatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="pull-quote-avatar"
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PullQuoteAvatar.displayName = 'PullQuoteAvatar'

const PullQuoteName = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pull-quote-name"
      className={cn('text-[0.95rem] font-bold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PullQuoteName.displayName = 'PullQuoteName'

const PullQuoteRole = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pull-quote-role"
      className={cn('text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PullQuoteRole.displayName = 'PullQuoteRole'

export {
  PullQuote,
  PullQuoteIcon,
  PullQuoteText,
  PullQuoteAttribution,
  PullQuoteAvatar,
  PullQuoteName,
  PullQuoteRole,
  pullQuoteVariants,
}
