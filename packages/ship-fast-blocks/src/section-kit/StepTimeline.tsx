import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const stepTimelineVariants = cva('', {
  variants: {
    variant: {
      default: '',
      muted: 'bg-muted',
      inverted: 'bg-foreground text-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const StepTimeline = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof stepTimelineVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="step-timeline"
      className={cn(stepTimelineVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
StepTimeline.displayName = 'StepTimeline'

const StepTimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="step-timeline-header"
      className={cn('mx-auto mb-16 max-w-2xl text-center md:mb-24', className)}
      ref={ref}
      {...props}
    />
  )
})
StepTimelineHeader.displayName = 'StepTimelineHeader'

const StepTimelineGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { columns?: 2 | 3 | 4; asChild?: boolean }
>(({ className, columns = 3, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="step-timeline-grid"
      className={cn(
        'grid gap-8',
        columns === 2 && 'md:grid-cols-2',
        columns === 3 && 'md:grid-cols-3',
        columns === 4 && 'md:grid-cols-2 lg:grid-cols-4',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
StepTimelineGrid.displayName = 'StepTimelineGrid'

const stepBadgeVariants = cva('flex items-center justify-center', {
  variants: {
    variant: {
      'filled-square':
        'size-12 rounded-xl bg-primary font-bold text-primary-foreground',
      'filled-circle':
        'size-16 rounded-full bg-primary text-2xl font-light text-primary-foreground',
      'filled-circle-bold':
        'size-16 rounded-full bg-primary text-2xl font-semibold text-primary-foreground',
      'gradient-square':
        'size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-extrabold text-primary-foreground shadow-lg ring-4 ring-background',
      'outlined-circle':
        'size-16 rounded-full border border-background/20 bg-background/10',
      'faded-ordinal': '',
    },
  },
  defaultVariants: {
    variant: 'filled-square',
  },
})

const StepBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof stepBadgeVariants> & {
      index: number
      pad?: boolean
      asChild?: boolean
    }
>(
  (
    { className, variant, index, pad = false, asChild = false, ...props },
    ref,
  ) => {
    const num = pad ? String(index + 1).padStart(2, '0') : String(index + 1)
    if (variant === 'faded-ordinal') {
      const Comp = asChild ? Slot : 'span'
      return (
        <Comp
          data-slot="step-badge"
          className={cn(
            'absolute -left-2 -top-4 text-5xl font-extralight text-muted-foreground/40',
            className,
          )}
          ref={ref as React.Ref<HTMLSpanElement>}
          {...props}
        >
          {num}
        </Comp>
      )
    }
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        data-slot="step-badge"
        className={cn(stepBadgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {num}
      </Comp>
    )
  },
)
StepBadge.displayName = 'StepBadge'

const stepConnectorVariants = cva('absolute hidden md:block', {
  variants: {
    variant: {
      solid: 'h-px bg-border',
      gradient:
        'pointer-events-none left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent',
      dashed:
        'left-full top-8 w-full -translate-x-1/2 border-t-2 border-dashed border-primary/30',
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
})

const StepConnector = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof stepConnectorVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      aria-hidden="true"
      data-slot="step-connector"
      className={cn(stepConnectorVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
StepConnector.displayName = 'StepConnector'

const StepItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="step-item"
      className={cn('relative', className)}
      ref={ref}
      {...props}
    />
  )
})
StepItem.displayName = 'StepItem'

/* ---------- StepContent ---------- */

const StepContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="step-content"
      className={cn('mt-4 flex flex-col gap-3', className)}
      ref={ref}
      {...props}
    />
  )
})
StepContent.displayName = 'StepContent'

export {
  StepTimeline,
  StepTimelineHeader,
  StepTimelineGrid,
  StepBadge,
  StepConnector,
  StepItem,
  StepContent,
  stepTimelineVariants,
  stepBadgeVariants,
  stepConnectorVariants,
}
