import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '#/lib/utils.ts'

const FinancingCalculatorVariants = cva('rounded-xl border border-border', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground',
      muted: 'bg-muted/40 text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const FinancingCalculator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof FinancingCalculatorVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="financing-calculator"
      className={cn(FinancingCalculatorVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
FinancingCalculator.displayName = 'FinancingCalculator'

const FinancingDisplay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="financing-calculator-display"
      className={cn('rounded-lg bg-primary/10 p-6 text-center', className)}
      ref={ref}
      {...props}
    />
  )
})
FinancingDisplay.displayName = 'FinancingDisplay'

export { FinancingCalculator, FinancingDisplay, FinancingCalculatorVariants }
