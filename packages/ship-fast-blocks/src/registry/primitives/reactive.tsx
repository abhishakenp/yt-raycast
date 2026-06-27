import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useStateField } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Button as UIButton } from '#/components/ui/button.tsx'

// Generic, app-agnostic interactivity primitives. They expose the runtime's
// shared `useStateField` store (the same mechanism PageSwitch uses for `$page`)
// as composable building blocks, so the model can author ANY stateful UI —
// counters, steppers, toggles, totals, simple forms — by composition, with NO
// purpose-built component per app. A "state field" is just a named value shared
// across every primitive that references the same `field` string.

const PrimitiveValue = z.union([z.number(), z.string(), z.boolean()])

/**
 * Live text bound to a named shared state field. Renders the field's current
 * value (optionally wrapped in prefix/suffix) and re-renders whenever any
 * StateButton/StateInput mutates that field. `initial` seeds the field.
 */
export const StateText = defineCapsule({
  name: 'StateText',
  description:
    'Live text bound to a named shared state field — displays the CURRENT value of that field and updates instantly when it changes. Use the `field` string as the state key and `initial` to seed it. Pair with StateButton/StateInput to build any stateful UI (counter readouts, running totals, toggle labels). NOT a static label.',
  props: z.object({
    field: z.string(),
    initial: PrimitiveValue.optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const state = useStateField<number | string | boolean>(
      props.field,
      props.initial ?? 0,
    )
    const value = state.value ?? props.initial ?? ''
    return (
      <span className={cn('tabular-nums', props.className)}>
        {props.prefix ?? ''}
        {String(value)}
        {props.suffix ?? ''}
      </span>
    )
  },
})

/**
 * A button that MUTATES a named shared state field on click.
 * op: increment | decrement | set | toggle | reset. Generic — composes into
 * counters, steppers, toggles, "add to total", reset, etc.
 */
export const StateButton = defineCapsule({
  name: 'StateButton',
  description:
    'A button that MUTATES a named shared state field on click — op is increment | decrement | set | toggle | reset. This is REAL interactivity (not a navigation link): use it with StateText to build counters, steppers, toggles and any click-driven state. `field` is the state key; `amount` is the step for increment/decrement (default 1); `value` is the target for set; `initial` seeds/resets the field.',
  props: z.object({
    label: z.string(),
    field: z.string(),
    op: z.enum(['increment', 'decrement', 'set', 'toggle', 'reset']).optional(),
    amount: z.number().optional(),
    value: PrimitiveValue.optional(),
    initial: PrimitiveValue.optional(),
    variant: z
      .enum(['default', 'outline', 'secondary', 'ghost', 'destructive'])
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const initial = props.initial ?? 0
    const state = useStateField<number | string | boolean>(props.field, initial)
    const op = props.op ?? 'increment'
    const step = props.amount ?? 1
    const asNumber = (v: number | string | boolean): number =>
      typeof v === 'number' ? v : Number(v) || 0
    const onClick = () => {
      const cur = state.value ?? initial
      if (op === 'increment') state.setValue(asNumber(cur) + step)
      else if (op === 'decrement') state.setValue(asNumber(cur) - step)
      else if (op === 'set') state.setValue(props.value ?? cur)
      else if (op === 'toggle') state.setValue(!cur)
      else if (op === 'reset') state.setValue(initial)
    }
    return (
      <UIButton
        type="button"
        variant={props.variant ?? 'default'}
        onClick={onClick}
        className={props.className}
      >
        {props.label}
      </UIButton>
    )
  },
})

/**
 * A text input two-way bound to a named shared state field. Typing updates the
 * field live; other primitives reading the same field react. Composes into
 * forms, search boxes, todo entry, etc.
 */
export const StateInput = defineCapsule({
  name: 'StateInput',
  description:
    'A text input two-way bound to a named shared state field — typing updates the field live and any StateText reading the same field reflects it. Use `field` as the state key. Composes into forms, search boxes, todo entry, any input-driven state.',
  props: z.object({
    field: z.string(),
    placeholder: z.string().optional(),
    initial: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const state = useStateField<string>(props.field, props.initial ?? '')
    return (
      <input
        type="text"
        value={String(state.value ?? '')}
        placeholder={props.placeholder}
        onChange={(event) => state.setValue(event.target.value)}
        className={cn(
          'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring',
          props.className,
        )}
      />
    )
  },
})
