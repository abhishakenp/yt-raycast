import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Checkbox as UICheckbox } from '#/components/ui/checkbox.tsx'
import { Label as UILabel } from '#/components/ui/label.tsx'

// Compound: pair the checkbox with an optional label so it renders as a usable
// form row. No cva variants in shadcn source.
export const Checkbox = defineComponent({
  name: 'Checkbox',
  description: 'Checkbox with optional inline label. Mirrors shadcn Checkbox.',
  props: z.object({
    label: z.string().optional(),
    defaultChecked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const box = (
      <UICheckbox
        defaultChecked={props.defaultChecked}
        disabled={props.disabled}
        className={props.className}
      />
    )
    if (!props.label) return box
    return (
      <UILabel className="gap-2">
        {box}
        {props.label}
      </UILabel>
    )
  },
})
