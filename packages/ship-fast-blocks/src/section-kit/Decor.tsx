import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * Decor — shared, token-only decorative primitives for the editorial /
 * terminal / ledger design languages. All render aria-hidden and
 * pointer-events-none; colors flow entirely through theme tokens (currentColor
 * tricks keep CSS gradients tokenized), so every piece adapts to light/dark
 * and generated themes automatically.
 */

/** Dot-grid texture band (currentColor radial-gradient — tokenized). */
export const dotGridVariants = cva(
  'pointer-events-none absolute bg-[radial-gradient(currentColor_1px,transparent_1px)]',
  {
    variants: {
      density: {
        tight: '[background-size:16px_16px]',
        default: '[background-size:24px_24px]',
        loose: '[background-size:32px_32px]',
      },
      tone: {
        faint: 'text-foreground/10',
        subtle: 'text-foreground/15',
        border: 'text-border',
      },
      fade: {
        none: '',
        left: '[mask-image:linear-gradient(to_left,black,transparent)]',
        right: '[mask-image:linear-gradient(to_right,black,transparent)]',
        bottom: '[mask-image:linear-gradient(to_bottom,black,transparent)]',
      },
    },
    defaultVariants: { density: 'default', tone: 'faint', fade: 'none' },
  },
)

export interface DotGridProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotGridVariants> {}

export const DotGrid = React.forwardRef<HTMLDivElement, DotGridProps>(
  ({ className, density, tone, fade, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="decor-dot-grid"
      data-d-role="grid"className={cn(dotGridVariants({ density, tone, fade }), className)}
      {...props}
    />
  ),
)
DotGrid.displayName = 'DotGrid'

/** Giant ghost watermark text (chapter numerals, brand words, citation marks). */
export const Watermark = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    data-slot="decor-watermark"
    data-d-role="decor"className={cn(
      'pointer-events-none absolute select-none whitespace-nowrap font-extrabold leading-none tracking-tighter text-foreground/[0.04]',
      className,
    )}
    {...props}
  />
))
Watermark.displayName = 'Watermark'

/** Mono micro-label — the shared metadata grammar ("01 / SERVICES", "[ EOF ]"). */
export const monoTagVariants = cva(
  'font-mono text-[11px] uppercase tracking-[0.2em]',
  {
    variants: {
      tone: {
        muted: 'text-muted-foreground',
        faint: 'text-muted-foreground/60',
        primary: 'text-primary',
        inverted: 'text-background/70',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
)

export interface MonoTagProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof monoTagVariants> {}

export const MonoTag = React.forwardRef<HTMLSpanElement, MonoTagProps>(
  ({ className, tone, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="decor-mono-tag"
      data-d-role="decor"className={cn(monoTagVariants({ tone }), className)}
      {...props}
    />
  ),
)
MonoTag.displayName = 'MonoTag'

/** Graph-paper texture (hairline grid via layered currentColor gradients). */
export const GraphPaper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-slot="decor-graph-paper"
    data-d-role="decor"className={cn(
      'pointer-events-none absolute bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:48px_48px] text-foreground/[0.045]',
      className,
    )}
    {...props}
  />
))
GraphPaper.displayName = 'GraphPaper'
