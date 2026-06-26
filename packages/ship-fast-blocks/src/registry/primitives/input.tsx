import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Input as UIInput } from '#/components/ui/input.tsx'

// Leaf primitive: native input. shadcn ships no cva variants here; expose the
// standard input attributes that matter for a static preview.
export const Input = defineComponent({
  name: 'Input',
  description: 'Single-line text input. Mirrors shadcn Input.',
  props: z.object({
    placeholder: z.string().optional(),
    type: z
      .enum(['text', 'email', 'password', 'number', 'search', 'tel', 'url'])
      .optional(),
    defaultValue: z.string().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIInput
      placeholder={props.placeholder}
      type={props.type}
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      className={props.className}
    />
  ),
})
