import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const scheduleListVariants = cva('', {
  variants: {
    layout: {
      list: 'divide-y divide-border',
      grid: 'grid gap-8',
      timeline: 'space-y-4',
    },
  },
  defaultVariants: {
    layout: 'list',
  },
})

const ScheduleList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof scheduleListVariants> & { asChild?: boolean }
>(({ className, layout, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="schedule-list"
      data-d-role="list"
      className={cn(scheduleListVariants({ layout }), className)}
      ref={ref}
      {...props}
    />
  )
})
ScheduleList.displayName = 'ScheduleList'

const ScheduleItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="schedule-item"
      data-d-role="card"
      className={cn('flex flex-col gap-2 sm:flex-row sm:gap-8', className)}
      ref={ref}
      {...props}
    />
  )
})
ScheduleItem.displayName = 'ScheduleItem'

const ScheduleTime = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="schedule-time"
      className={cn(
        'shrink-0 text-sm font-semibold tabular-nums text-primary sm:w-24',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ScheduleTime.displayName = 'ScheduleTime'

const ScheduleContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="schedule-content"
      data-d-role="container"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
ScheduleContent.displayName = 'ScheduleContent'

const ScheduleTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      data-slot="schedule-title"
      data-d-role="heading"
      className={cn('text-base font-semibold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
ScheduleTitle.displayName = 'ScheduleTitle'

const ScheduleDetail = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="schedule-detail"
      className={cn(
        'mt-1 text-sm leading-relaxed text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ScheduleDetail.displayName = 'ScheduleDetail'

export {
  ScheduleList,
  ScheduleItem,
  ScheduleTime,
  ScheduleContent,
  ScheduleTitle,
  ScheduleDetail,
  scheduleListVariants,
}
