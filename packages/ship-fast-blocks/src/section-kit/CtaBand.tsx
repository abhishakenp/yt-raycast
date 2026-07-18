import * as React from 'react'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import type { KitAction } from './types.ts'
import { kitActionClasses } from './types.ts'

/**
 * Full-width call-to-action band: an eyebrow, title, optional subtitle, and a
 * row of routable pill actions. `tone` ("primary" | "muted" | "card") sets the
 * band surface, `align` toggles centered vs. left layout, and each action
 * navigates via `useNavigate()`. On a primary band the primary action inverts
 * to a light pill so it reads against the primary background.
 */
export function CtaBand(props: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: KitAction[]
  children?: React.ReactNode
  tone?: 'primary' | 'muted' | 'card'
  align?: 'center' | 'left'
  className?: string
  innerClassName?: string
  titleClassName?: string
  eyebrowClassName?: string
  subtitleClassName?: string
}) {
  const go = useNavigate()
  const tone = props.tone ?? 'primary'
  const align = props.align ?? 'center'

  const toneClasses =
    tone === 'muted'
      ? 'bg-muted text-foreground'
      : tone === 'card'
        ? 'bg-card text-card-foreground border border-border'
        : 'bg-primary text-primary-foreground'

  const isCenter = align === 'center'

  return (
    <section className={cn('w-full', toneClasses, props.className)}>
      <div
        className={cn(
          'mx-auto flex max-w-4xl flex-col gap-5 px-6 py-16 lg:px-8',
          isCenter ? 'items-center text-center' : 'items-start text-left',
          props.innerClassName,
        )}
      >
        {props.eyebrow ? (
          <span
            className={cn(
              'text-sm font-medium uppercase tracking-wide opacity-80',
              props.eyebrowClassName,
            )}
          >
            {props.eyebrow}
          </span>
        ) : null}
        <h2
          className={cn(
            'text-3xl font-semibold md:text-4xl',
            props.titleClassName,
          )}
        >
          {props.title}
        </h2>
        {props.subtitle ? (
          <p
            className={cn(
              'max-w-2xl text-base opacity-90 md:text-lg',
              props.subtitleClassName,
            )}
          >
            {props.subtitle}
          </p>
        ) : null}
        {props.children ? (
          props.children
        ) : props.actions && props.actions.length > 0 ? (
          <div
            className={cn(
              'flex flex-wrap gap-3',
              isCenter ? 'justify-center' : 'justify-start',
            )}
          >
            {props.actions.filter(Boolean).map((a) => {
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
    </section>
  )
}

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
>(({ className, variant = 'primary', invert = false, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'button'
  return (
    <Comp
      ref={ref as never}
      data-slot="cta-action"
      className={cn(kitActionClasses(variant, invert), className)}
      {...props}
    />
  )
})
CtaAction.displayName = 'CtaAction'
