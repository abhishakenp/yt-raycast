import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'

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

const CtaBand = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentProps<'section'>, 'title'> & {
    asChild?: boolean
    eyebrow?: string
    title: string
    subtitle?: string
    actions?: KitAction[]
    children?: React.ReactNode
    tone?: 'primary' | 'muted' | 'card'
    align?: 'center' | 'left'
    innerClassName?: string
    titleClassName?: string
    eyebrowClassName?: string
    subtitleClassName?: string
  } & VariantProps<typeof ctaBandVariants>
>(
  (
    {
      className,
      asChild = false,
      eyebrow,
      title,
      subtitle,
      actions,
      children,
      tone = 'primary',
      align = 'center',
      innerClassName,
      titleClassName,
      eyebrowClassName,
      subtitleClassName,
      ...props
    },
    ref,
  ) => {
    const go = useNavigate()
    const Comp = asChild ? Slot : 'section'
    const isCenter = align === 'center'

    return (
      <Comp
        ref={ref}
        data-slot="cta-band"
        className={cn(ctaBandVariants({ tone }), className)}
        {...props}
      >
        <div
          data-slot="cta-band-inner"
          className={cn(
            'mx-auto flex max-w-4xl flex-col gap-5 px-6 py-16 lg:px-8',
            isCenter ? 'items-center text-center' : 'items-start text-left',
            innerClassName,
          )}
        >
          {eyebrow ? (
            <span
              data-slot="cta-band-eyebrow"
              className={cn(
                'text-sm font-medium uppercase tracking-wide opacity-80',
                eyebrowClassName,
              )}
            >
              {eyebrow}
            </span>
          ) : null}
          <h2
            data-slot="cta-band-title"
            className={cn('text-3xl font-semibold md:text-4xl', titleClassName)}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              data-slot="cta-band-subtitle"
              className={cn(
                'max-w-2xl text-base opacity-90 md:text-lg',
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {children ? (
            children
          ) : actions && actions.length > 0 ? (
            <div
              data-slot="cta-band-actions"
              className={cn(
                'flex flex-wrap gap-3',
                isCenter ? 'justify-center' : 'justify-start',
              )}
            >
              {actions.filter(Boolean).map((a) => {
                const isInvert =
                  tone === 'primary' && (a.variant ?? 'primary') === 'primary'
                return (
                  <button
                    key={a.label}
                    onClick={() => go(a.target ?? a.label)}
                    className={kitActionClasses(a.variant, isInvert)}
                  >
                    {a.label}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </Comp>
    )
  },
)
CtaBand.displayName = 'CtaBand'

/**
 * CtaAction — standalone action button for use inside CtaBand's children.
 * Supports `asChild` for mutation buttons (e.g. Lakebed add-to-cart).
 */
export const CtaAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'outline' | 'ghost'
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
    const Comp = asChild ? React.Fragment : 'button'
    return (
      <Comp
        ref={ref as never}
        data-slot="cta-action"
        className={cn(kitActionClasses(variant, invert), className)}
        {...props}
      />
    )
  },
)
CtaAction.displayName = 'CtaAction'

export { CtaBand, ctaBandVariants }
