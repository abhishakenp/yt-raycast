import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  NativeSelect as UINativeSelect,
  NativeSelectOption,
} from '#/components/ui/native-select.tsx'

// Compound: flatten the native select + options into one node taking an array
// of { value, label } items plus an optional placeholder.
// size enum copied verbatim from shadcn source ("sm" | "default").
export const NativeSelect = defineComponent({
  name: 'NativeSelect',
  description:
    'Native dropdown select. `items` is an array of { value, label }. Mirrors shadcn NativeSelect.',
  props: z.object({
    items: z.array(z.object({ value: z.string(), label: z.string() })),
    placeholder: z.string().optional(),
    defaultValue: z.string().optional(),
    size: z.enum(['sm', 'default']).optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UINativeSelect
      defaultValue={props.defaultValue ?? (props.placeholder ? '' : undefined)}
      size={props.size}
      disabled={props.disabled}
      className={props.className}
    >
      {props.placeholder && (
        <NativeSelectOption value="" disabled>
          {props.placeholder}
        </NativeSelectOption>
      )}
      {props.items.map((item) => (
        <NativeSelectOption key={item.value} value={item.value}>
          {item.label}
        </NativeSelectOption>
      ))}
    </UINativeSelect>
  ),
})
