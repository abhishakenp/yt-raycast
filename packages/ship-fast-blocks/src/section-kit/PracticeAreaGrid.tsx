import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const PracticeAreaGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-6 sm:grid-cols-2',
      '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
      '1-3': 'gap-6 md:grid-cols-3',
      '1-4': 'gap-6 lg:grid-cols-4',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const PracticeAreaGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof PracticeAreaGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="practice-area-grid"
      data-d-role="grid"
      className={cn(PracticeAreaGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
PracticeAreaGrid.displayName = 'PracticeAreaGrid'

const PracticeAreaCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="practice-area-grid-item"
      data-d-role="card"
      className={cn(
        'group flex flex-col overflow-hidden border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PracticeAreaCard.displayName = 'PracticeAreaCard'

const PracticeAreaIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="practice-area-icon"
      className={cn(
        'mb-4 grid size-12 place-items-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PracticeAreaIcon.displayName = 'PracticeAreaIcon'

export {
  PracticeAreaGrid,
  PracticeAreaCard,
  PracticeAreaIcon,
  PracticeAreaGridVariants,
}
