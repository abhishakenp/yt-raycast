import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const logoStripVariants = cva('', {
  variants: {
    layout: {
      flex: 'flex flex-wrap items-center justify-center gap-x-10 gap-y-6',
      grid: 'grid grid-cols-3 items-center gap-8 md:grid-cols-6',
    },
  },
  defaultVariants: {
    layout: 'flex',
  },
})

const logoItemVariants = cva('', {
  variants: {
    variant: {
      text: 'text-lg font-semibold tracking-tight text-muted-foreground',
      'text-bold':
        'text-base font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground',
      'opacity-hover':
        'text-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
})

/**
 * LogoStrip — social-proof strip showing an optional lead line / eyebrow
 * above a row of text-based company wordmarks. Compose with `LogoStripLabel`,
 * `LogoStripItems`, and `LogoStripItem` subs. Theme-token only.
 */
const LogoStrip = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof logoStripVariants> & { asChild?: boolean }
>(({ className, asChild = false, layout, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      ref={ref}
      data-slot="logo-strip"
      className={cn(className)}
      {...props}
    />
  )
})
LogoStrip.displayName = 'LogoStrip'

/**
 * LogoStripLabel — the lead / eyebrow line above the logo row. Renders as a
 * centered uppercase `<p>`. Omit when no lead is wanted.
 */
const LogoStripLabel = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="logo-strip-label"
      className={cn(
        'text-center text-sm font-medium uppercase tracking-wide text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
})
LogoStripLabel.displayName = 'LogoStripLabel'

/**
 * LogoStripItems — the inner container holding the logo items. Uses the
 * `layout` variant (`flex` wrap or `grid 3/6-col`). Add `mt-8` via className
 * when paired with a `LogoStripLabel`.
 */
const LogoStripItems = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof logoStripVariants> & { asChild?: boolean }
>(({ className, asChild = false, layout, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="logo-strip-items"
      className={cn(logoStripVariants({ layout }), className)}
      {...props}
    />
  )
})
LogoStripItems.displayName = 'LogoStripItems'

/**
 * LogoStripItem — a single wordmark. Renders as a `<span>` by default; pass
 * `asChild` with a `<button>` child for clickable logos. The `variant` prop
 * controls the text treatment (`text`, `text-bold`, `opacity-hover`).
 */
const LogoStripItem = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof logoItemVariants> & { asChild?: boolean }
>(({ className, asChild = false, variant, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="logo-strip-item"
      className={cn(logoItemVariants({ variant }), className)}
      {...props}
    />
  )
})
LogoStripItem.displayName = 'LogoStripItem'

export {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
  logoStripVariants,
  logoItemVariants,
}
