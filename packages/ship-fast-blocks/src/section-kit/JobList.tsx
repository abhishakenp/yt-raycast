import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const JobListVariants = cva('flex flex-col gap-4', {
  variants: {
  },
  defaultVariants: {
  },
})

const JobList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof JobListVariants> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="job-list"
      className={cn(JobListVariants({}), className)}
      ref={ref}
      {...props}
    />
  )
})
JobList.displayName = 'JobList'

const JobItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="job-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
JobItem.displayName = 'JobItem'

export { JobList, JobItem, JobListVariants }
