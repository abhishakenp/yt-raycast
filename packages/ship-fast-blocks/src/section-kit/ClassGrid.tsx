import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const classGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-6 sm:grid-cols-2',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const ClassGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof classGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="class-grid"
      data-d-role="grid"
      className={cn(classGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
ClassGrid.displayName = 'ClassGrid'

const ClassCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="class-card"
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
ClassCard.displayName = 'ClassCard'

export { ClassGrid, ClassCard, classGridVariants }
