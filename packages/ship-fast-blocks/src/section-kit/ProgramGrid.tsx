import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const programGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-8 sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-8 sm:grid-cols-2',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const ProgramGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof programGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="program-grid"
      className={cn(programGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
ProgramGrid.displayName = 'ProgramGrid'

const programCardVariants = cva('', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      elevated: 'border border-border bg-card shadow-sm',
      none: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const ProgramCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & {
    variant?: VariantProps<typeof programCardVariants>['variant']
    asChild?: boolean
  }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="program-card"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl',
        programCardVariants({ variant }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ProgramCard.displayName = 'ProgramCard'

const programIconVariants = cva('size-12', {
  variants: {
    shape: {
      square: 'rounded-lg',
      circle: 'rounded-full',
      none: '',
    },
  },
  defaultVariants: {
    shape: 'square',
  },
})

const ProgramIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof programIconVariants> & { asChild?: boolean }
>(({ className, shape, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="program-icon"
      className={cn(
        'grid shrink-0 place-items-center bg-muted text-foreground',
        programIconVariants({ shape }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ProgramIcon.displayName = 'ProgramIcon'

export {
  ProgramGrid,
  ProgramCard,
  ProgramIcon,
  programGridVariants,
  programCardVariants,
  programIconVariants,
}
