import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

import { kitActionClasses, type KitAction } from './types.ts'

const ctaBandVariants = cva('w-full', {
  variants: {
    tone: {
      primary: 'bg-primary text-primary-foreground',
      muted: 'bg-muted text-foreground',
      card: 'bg-card text-card-foreground border border-border',
    },
  },
  defaultVariants: { tone: 'primary' },
})

const ctaBandInnerVariants = cva(
  'mx-auto flex max-w-4xl flex-col gap-5 px-6 py-16 lg:px-8',
  {
    variants: {
      align: {
        center: 'items-center text-center',
        left: 'items-start text-left',
      },
    },
    defaultVariants: { align: 'center' },
  },
)

const ctaBandActionsVariants = cva('flex flex-wrap gap-3', {
  variants: {
    align: {
      center: 'justify-center',
      left: 'justify-start',
    },
  },
  defaultVariants: { align: 'center' },
})

/**
 * CtaBand — full-width conversion band with a tone-colored background.
 * Compose with `CtaBandInner`, `CtaBandEyebrow`, `CtaBandTitle`,
 * `CtaBandSubtitle`, `CtaBandActions`, and `CtaAction` subs.
 */
const CtaBand = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof ctaBandVariants> & { asChild?: boolean }
>(({ className, asChild = false, tone, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      ref={ref}
      data-slot="cta-band"
      className={cn(ctaBandVariants({ tone }), className)}
      {...props}
    />
  )
})
CtaBand.displayName = 'CtaBand'

/**
 * CtaBandInner — the inner max-w-4xl flex container. Use `align` to control
 * text alignment and item positioning.
 */
const CtaBandInner = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof ctaBandInnerVariants> & { asChild?: boolean }
>(({ className, asChild = false, align, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="cta-band-inner"
      className={cn(ctaBandInnerVariants({ align }), className)}
      {...props}
    />
  )
})
CtaBandInner.displayName = 'CtaBandInner'

/**
 * CtaBandEyebrow — small uppercase label above the title.
 */
const CtaBandEyebrow = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="cta-band-eyebrow"
      data-d-role="eyebrow"
      className={cn(
        'text-sm font-medium uppercase tracking-wide opacity-80',
        className,
      )}
      {...props}
    />
  )
})
CtaBandEyebrow.displayName = 'CtaBandEyebrow'

/**
 * CtaBandTitle — the main `<h2>` headline.
 */
const CtaBandTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      ref={ref}
      data-slot="cta-band-title"
      className={cn('text-3xl font-semibold md:text-4xl', className)}
      {...props}
    />
  )
})
CtaBandTitle.displayName = 'CtaBandTitle'

/**
 * CtaBandSubtitle — supporting paragraph under the title.
 */
const CtaBandSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="cta-band-subtitle"
      className={cn('max-w-2xl text-base opacity-90 md:text-lg', className)}
      {...props}
    />
  )
})
CtaBandSubtitle.displayName = 'CtaBandSubtitle'

/**
 * CtaBandActions — flex container for action buttons. Use `align` to control
 * justification.
 */
const CtaBandActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof ctaBandActionsVariants> & { asChild?: boolean }
>(({ className, asChild = false, align, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="cta-band-actions"
      className={cn(ctaBandActionsVariants({ align }), className)}
      {...props}
    />
  )
})
CtaBandActions.displayName = 'CtaBandActions'

/**
 * CtaAction — standalone action button for use inside CtaBandActions.
 * Supports `asChild` for mutation buttons (e.g. Lakebed add-to-cart).
 */
const CtaAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: KitAction['variant']
    invert?: boolean
    asChild?: boolean
  }
>(
  (
    {
      className,
      variant = 'primary',
      invert = false,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as never}
        data-slot="cta-action"
        data-d-role="btn"
        className={cn(kitActionClasses(variant, invert), className)}
        {...props}
      />
    )
  },
)
CtaAction.displayName = 'CtaAction'

export {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
  ctaBandVariants,
  ctaBandInnerVariants,
  ctaBandActionsVariants,
}
