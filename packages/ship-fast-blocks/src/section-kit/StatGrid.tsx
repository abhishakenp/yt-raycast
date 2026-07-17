import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

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

const statLabelVariants = cva('', {
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

/**
 * StatGrid lays out key/value statistics in a responsive grid.
 * Column count (2/3/4) maps to responsive grid classes; each cell stacks a
 * value over a label. Supports font family, weight, color, and alignment
 * variants for different visual styles. Theme-token only.
 */
export const StatGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof statGridVariants> & {
      stats: { value: string; label: string }[]
      align?: 'center' | 'left'
      accentBorder?: boolean
      fontFamily?: 'sans' | 'serif'
      weight?: 'bold' | 'semibold' | 'medium' | 'light'
      size?: 'default' | 'large' | 'xl'
      valueColor?: 'default' | 'primary' | 'inverted' | 'primaryFg'
      labelColor?: 'default' | 'inverted' | 'primaryFg'
      labelUppercase?: boolean
      valueClassName?: string
      labelClassName?: string
    }
>(
  (
    {
      className,
      stats: rawStats,
      columns,
      gap,
      align = 'center',
      accentBorder = false,
      fontFamily,
      weight,
      size,
      valueColor,
      labelColor,
      labelUppercase,
      valueClassName,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const stats = Array.isArray(rawStats) ? rawStats : []
    return (
      <div
        ref={ref}
        data-slot="stat-grid"
        className={cn(statGridVariants({ columns, gap }), className)}
        {...props}
      >
        {stats.filter(Boolean).map((s, i) => (
          <div
            key={i}
            className={cn(statItemVariants({ align, accentBorder }))}
          >
            <span
              className={cn(
                statValueVariants({
                  fontFamily,
                  weight,
                  size,
                  color: valueColor,
                }),
                'mb-1',
                valueClassName,
              )}
            >
              {s.value}
            </span>
            <span
              className={cn(
                'text-sm',
                statLabelVariants({
                  color: labelColor,
                  uppercase: labelUppercase,
                }),
                labelClassName,
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    )
  },
)
StatGrid.displayName = 'StatGrid'
