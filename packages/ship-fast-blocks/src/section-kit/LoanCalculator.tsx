import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const LoanCalculatorVariants = cva('rounded-xl border border-border', {
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

const LoanCalculator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof LoanCalculatorVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    data-slot="loan-calculator"
    className={cn(LoanCalculatorVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
LoanCalculator.displayName = 'LoanCalculator'

const LoanDisplay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="loan-calculator-display"
    className={cn('rounded-lg bg-primary/10 p-6 text-center', className)}
    ref={ref}
    {...props}
  />
))
LoanDisplay.displayName = 'LoanDisplay'

export { LoanCalculator, LoanDisplay, LoanCalculatorVariants }
