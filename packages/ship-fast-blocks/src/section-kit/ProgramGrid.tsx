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
  React.ComponentProps<'div'> & VariantProps<typeof programGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="program-grid"
    className={cn(programGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
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
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    asChild?: boolean
  }
>(({ className, variant, rounded = 'xl', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  const roundedCls = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  }[rounded]
  return (
    <Comp
      data-slot="program-card"
      className={cn(
        'group flex flex-col overflow-hidden',
        programCardVariants({ variant }),
        roundedCls,
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ProgramCard.displayName = 'ProgramCard'

const programIconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-10',
      md: 'size-12',
      lg: 'size-14',
    },
    shape: {
      square: 'rounded-lg',
      circle: 'rounded-full',
      none: '',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'square',
  },
})

const ProgramIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof programIconVariants>
>(({ className, size, shape, ...props }, ref) => (
  <div
    data-slot="program-icon"
    className={cn(
      'grid shrink-0 place-items-center bg-muted text-foreground',
      programIconVariants({ size, shape }),
      className,
    )}
    ref={ref}
    {...props}
  />
))
ProgramIcon.displayName = 'ProgramIcon'

export {
  ProgramGrid,
  ProgramCard,
  ProgramIcon,
  programGridVariants,
  programCardVariants,
  programIconVariants,
}
