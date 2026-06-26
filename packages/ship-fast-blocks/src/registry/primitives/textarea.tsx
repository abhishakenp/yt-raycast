import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Textarea as UITextarea } from '#/components/ui/textarea.tsx'

// Leaf primitive: native textarea. No cva variants in shadcn source.
export const Textarea = defineComponent({
  name: 'Textarea',
  description: 'Multi-line text input. Mirrors shadcn Textarea.',
  props: z.object({
    placeholder: z.string().optional(),
    defaultValue: z.string().optional(),
    rows: z.number().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UITextarea
      placeholder={props.placeholder}
      defaultValue={props.defaultValue}
      rows={props.rows}
      disabled={props.disabled}
      className={props.className}
    />
  ),
})
