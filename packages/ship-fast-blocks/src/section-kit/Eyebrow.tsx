import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * Eyebrow — shadcn-style compound component for the small uppercase label
 * above a heading. Supports pill (bordered chip), text (no surface), and
 * solid (primary fill) variants, plus an optional icon slot.
 */
export const eyebrowVariants = cva(
  'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default:
          'rounded-full border border-border bg-background px-3 py-1 font-medium text-muted-foreground',
        solid:
          'rounded-full border border-transparent bg-primary px-3 py-1 text-primary-foreground',
        muted:
          'rounded-full border border-transparent bg-muted px-3 py-1 text-muted-foreground',
        text: 'text-primary',
        primary:
          'rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 tracking-[0.08em] text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface EyebrowProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof eyebrowVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, variant, icon, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span'
    return (
      <Comp
        ref={ref}
        data-slot="eyebrow"
        className={cn(eyebrowVariants({ variant }), className)}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </Comp>
    )
  },
)
Eyebrow.displayName = 'Eyebrow'

export { Eyebrow }
export type { EyebrowProps }
