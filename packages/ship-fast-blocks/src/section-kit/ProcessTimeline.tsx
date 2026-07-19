import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * ProcessTimeline — semantic compound for "how we work" / process steps.
 *
 * Process capsules share the same step-grid structure as the generic
 * `StepTimeline` (numbered badges + titles + descriptions in a responsive
 * grid) but carry different intent: process sections present a provider's
 * workflow (discovery → design → build → launch) whereas step timelines
 * can present any sequential progression. This component gives that intent
 * a dedicated name and `process-*` data-slots so styling and tests can
 * target process sections specifically without overloading the `step-*`
 * slots.
 *
 * Same shape as `StepTimeline`: `variant` controls the section background;
 * compose `ProcessGrid`, `ProcessStep`, `ProcessBadge`, `ProcessContent`
 * inside.
 */

const processTimelineVariants = cva('', {
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

const ProcessTimeline = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof processTimelineVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="process-timeline"
      className={cn(processTimelineVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
ProcessTimeline.displayName = 'ProcessTimeline'

const ProcessTimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="process-timeline-header"
      className={cn('mx-auto mb-16 max-w-2xl text-center md:mb-24', className)}
      ref={ref}
      {...props}
    />
  )
})
ProcessTimelineHeader.displayName = 'ProcessTimelineHeader'

const ProcessGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { columns?: 2 | 3 | 4; asChild?: boolean }
>(({ className, columns = 3, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="process-grid"
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
ProcessGrid.displayName = 'ProcessGrid'

const processBadgeVariants = cva('flex items-center justify-center', {
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

const ProcessBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof processBadgeVariants> & {
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
          data-slot="process-badge"
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
        data-slot="process-badge"
        className={cn(processBadgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {num}
      </Comp>
    )
  },
)
ProcessBadge.displayName = 'ProcessBadge'

const ProcessStep = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="process-step"
      className={cn('relative', className)}
      ref={ref}
      {...props}
    />
  )
})
ProcessStep.displayName = 'ProcessStep'

const ProcessContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="process-content"
      className={cn('mt-4 flex flex-col gap-3', className)}
      ref={ref}
      {...props}
    />
  )
})
ProcessContent.displayName = 'ProcessContent'

const ProcessConnector = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      aria-hidden="true"
      data-slot="process-connector"
      className={cn(
        'absolute left-full top-8 hidden w-full -translate-x-1/2 border-t-2 border-dashed border-primary/30 md:block',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ProcessConnector.displayName = 'ProcessConnector'

export {
  ProcessTimeline,
  ProcessTimelineHeader,
  ProcessGrid,
  ProcessBadge,
  ProcessStep,
  ProcessContent,
  ProcessConnector,
  processTimelineVariants,
  processBadgeVariants,
}
