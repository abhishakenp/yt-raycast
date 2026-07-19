import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const RewardListVariants = cva('flex flex-col', {
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

const RewardList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof RewardListVariants> & { asChild?: boolean }
>(({ className, gap, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="reward-list"
      className={cn(RewardListVariants({ gap }), className)}
      ref={ref}
      {...props}
    />
  )
})
RewardList.displayName = 'RewardList'

const RewardItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="reward-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
RewardItem.displayName = 'RewardItem'

export { RewardList, RewardItem, RewardListVariants }
