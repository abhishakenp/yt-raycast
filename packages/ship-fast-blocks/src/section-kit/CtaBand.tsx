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
  tone?: 'primary' | 'muted' | 'card'
  align?: 'center' | 'left'
  className?: string
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
        )}
      >
        {props.eyebrow ? (
          <span className="text-sm font-medium uppercase tracking-wide opacity-80">
            {props.eyebrow}
          </span>
        ) : null}
        <h2 className="text-3xl font-semibold md:text-4xl">{props.title}</h2>
        {props.subtitle ? (
          <p className="max-w-2xl text-base opacity-90 md:text-lg">
            {props.subtitle}
          </p>
        ) : null}
        {props.actions && props.actions.length > 0 ? (
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
