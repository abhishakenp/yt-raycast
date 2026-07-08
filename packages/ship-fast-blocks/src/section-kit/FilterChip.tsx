import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const chipVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        muted:
          'border border-border bg-muted text-foreground hover:bg-muted/80',
        outline:
          'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        solid: 'bg-foreground text-background hover:bg-foreground/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
      size: {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-sm font-semibold',
        xl: 'px-8 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'muted',
      size: 'md',
    },
  },
)

export interface FilterChipProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof chipVariants> {
  asChild?: boolean
  active?: boolean
  onClick?: () => void
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      className,
      variant,
      size,
      active = false,
      asChild = false,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const resolvedVariant = active ? 'default' : variant
    return (
      <Comp
        ref={ref}
        data-slot="filter-chip"
        data-active={active}
        type={asChild ? undefined : 'button'}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          chipVariants({ variant: resolvedVariant, size }),
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
FilterChip.displayName = 'FilterChip'

export { FilterChip, chipVariants }
export type { FilterChipProps }
