import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const statGridVariants = cva('grid', {
  variants: {
    columns: {
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
    },
    gap: {
      default: 'gap-8',
      compact: 'gap-6',
      wide: 'gap-12',
    },
  },
  defaultVariants: {
    columns: 4,
    gap: 'default',
  },
})

const statItemVariants = cva('flex flex-col', {
  variants: {
    align: {
      center: 'text-center',
      left: 'text-left',
    },
    accentBorder: {
      true: 'border-l-2 border-primary/30 pl-6',
      false: '',
    },
  },
  defaultVariants: {
    align: 'center',
    accentBorder: false,
  },
})

const statValueVariants = cva('', {
  variants: {
    fontFamily: {
      sans: '',
      serif: 'font-serif',
    },
    weight: {
      bold: 'font-bold',
      semibold: 'font-semibold',
      medium: 'font-medium',
      light: 'font-light',
    },
    size: {
      default: 'text-3xl md:text-4xl',
      large: 'text-4xl lg:text-5xl',
      xl: 'text-5xl lg:text-6xl',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-primary',
      inverted: 'text-background',
      primaryFg: 'text-primary-foreground',
    },
  },
  defaultVariants: {
    fontFamily: 'sans',
    weight: 'bold',
    size: 'default',
    color: 'default',
  },
})

const statLabelVariants = cva('text-sm', {
  variants: {
    color: {
      default: 'text-muted-foreground',
      inverted: 'text-background/60',
      primaryFg: 'text-primary-foreground/80',
    },
    uppercase: {
      true: 'uppercase tracking-widest',
      false: '',
    },
  },
  defaultVariants: {
    color: 'default',
    uppercase: false,
  },
})

const StatGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof statGridVariants>
>(({ className, columns, gap, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="stat-grid"
    className={cn(statGridVariants({ columns, gap }), className)}
    {...props}
  />
))
StatGrid.displayName = 'StatGrid'

const StatItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof statItemVariants> & { asChild?: boolean }
>(({ className, align, accentBorder, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="stat-item"
      className={cn(statItemVariants({ align, accentBorder }), className)}
      {...props}
    />
  )
})
StatItem.displayName = 'StatItem'

const StatValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof statValueVariants> & { asChild?: boolean }
>(
  (
    { className, fontFamily, weight, size, color, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'span'
    return (
      <Comp
        ref={ref}
        data-slot="stat-value"
        className={cn(
          statValueVariants({ fontFamily, weight, size, color }),
          'mb-1',
          className,
        )}
        {...props}
      />
    )
  },
)
StatValue.displayName = 'StatValue'

const StatLabel = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof statLabelVariants> & { asChild?: boolean }
>(({ className, color, uppercase, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="stat-label"
      className={cn(statLabelVariants({ color, uppercase }), className)}
      {...props}
    />
  )
})
StatLabel.displayName = 'StatLabel'

const statDeltaVariants = cva(
  'inline-flex items-center gap-1 text-xs font-semibold',
  {
    variants: {
      trend: {
        up: 'bg-chart-1/10 text-chart-1',
        down: 'bg-destructive/10 text-destructive',
        neutral: 'bg-muted text-muted-foreground',
      },
      bare: {
        true: '',
        false: 'rounded px-1.5 py-0.5',
      },
    },
    defaultVariants: {
      trend: 'up',
      bare: false,
    },
  },
)

const StatDelta = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof statDeltaVariants> & { asChild?: boolean }
>(({ className, trend, bare, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="stat-delta"
      className={cn(statDeltaVariants({ trend, bare }), className)}
      {...props}
    />
  )
})
StatDelta.displayName = 'StatDelta'

const StatIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="stat-icon"
      className={cn('grid size-10 place-items-center rounded-lg', className)}
      {...props}
    />
  )
})
StatIcon.displayName = 'StatIcon'

export {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
  StatDelta,
  StatIcon,
  statGridVariants,
  statItemVariants,
  statValueVariants,
  statLabelVariants,
  statDeltaVariants,
}
