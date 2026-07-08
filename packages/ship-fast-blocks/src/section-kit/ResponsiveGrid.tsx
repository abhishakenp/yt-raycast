import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const gridCols = cva('grid', {
  variants: {
    cols: {
      '1': 'grid-cols-1',
      '1-2': 'sm:grid-cols-2',
      '1-2-3': 'sm:grid-cols-2 lg:grid-cols-3',
      '1-2-4': 'sm:grid-cols-2 lg:grid-cols-4',
      '2-3': 'md:grid-cols-3',
      '2-3-4': 'md:grid-cols-3 lg:grid-cols-4',
      '1-3': 'sm:grid-cols-3',
      '1-4': 'sm:grid-cols-4',
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
    },
    gap: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
    gap: 'lg',
  },
})

/** Responsive grid with column presets + gap variants. */
export function ResponsiveGrid(props: {
  children: ReactNode
  className?: string
  cols?:
    | '1'
    | '1-2'
    | '1-2-3'
    | '1-2-4'
    | '2-3'
    | '2-3-4'
    | '1-3'
    | '1-4'
    | '2'
    | '3'
    | '4'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <div
      className={cn(
        gridCols({ cols: props.cols, gap: props.gap }),
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
