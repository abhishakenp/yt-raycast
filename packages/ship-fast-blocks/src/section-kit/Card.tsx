import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * Card — shadcn-style surface card for generic bordered/filled containers
 * (stat cards, rating cards, floating panels, feature tiles). Carries the
 * shared surface tokens via `variant` (default / muted / outline / elevated)
 * plus `rounded`, `padding`, and `shadow` axes. Use `asChild` to render as a
 * button, link, or article while keeping the surface classes.
 */
export const surfaceCard = cva('', {
  variants: {
    variant: {
      default: 'border border-border bg-card text-card-foreground',
      muted: 'border border-border bg-muted text-foreground',
      outline: 'border border-border bg-transparent text-foreground',
      elevated: 'border border-border bg-card text-card-foreground shadow-sm',
    },
    rounded: {
      none: '',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
      '2xl': 'p-12',
    },
    shadow: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    rounded: 'xl',
    padding: 'md',
    shadow: 'none',
  },
})

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceCard> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant, rounded, padding, shadow, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="card"
        className={cn(
          surfaceCard({ variant, rounded, padding, shadow }),
          className,
        )}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

export { Card }
export type { CardProps }
