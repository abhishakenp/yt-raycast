import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * Card — shadcn-style surface card for generic bordered/filled containers
 * (stat cards, rating cards, floating panels, feature tiles). Carries the
 * shared surface tokens via `variant` (default / muted / outline / elevated).
 * Rounded, padding, and shadow compose via `className` + twMerge.
 * Use `asChild` to render as a button, link, or article while keeping the surface classes.
 */
export const surfaceCard = cva(' p-6', {
  variants: {
    variant: {
      default: 'border border-border bg-card text-card-foreground',
      muted: 'border border-border bg-muted text-foreground',
      outline: 'border border-border bg-transparent text-foreground',
      elevated: 'border border-border bg-card text-card-foreground ',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceCard> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="card"
        data-d-role="card"
        className={cn(surfaceCard({ variant }), className)}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

export { Card }
