import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const CurriculumListVariants = cva('flex flex-col gap-4', {
  variants: {
  },
  defaultVariants: {
  },
})

const CurriculumList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof CurriculumListVariants> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="curriculum-list"
      className={cn(CurriculumListVariants({}), className)}
      ref={ref}
      {...props}
    />
  )
})
CurriculumList.displayName = 'CurriculumList'

const CurriculumItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="curriculum-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
CurriculumItem.displayName = 'CurriculumItem'

export { CurriculumList, CurriculumItem, CurriculumListVariants }
