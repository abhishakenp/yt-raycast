import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const JobListVariants = cva('flex flex-col', {
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

const JobList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & VariantProps<typeof JobListVariants>
>(({ className, gap, ...props }, ref) => (
  <ul
    data-slot="job-list"
    className={cn(JobListVariants({ gap }), className)}
    ref={ref}
    {...props}
  />
))
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
