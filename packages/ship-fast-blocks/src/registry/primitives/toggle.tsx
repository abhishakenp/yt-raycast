import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Toggle as UIToggle } from '#/components/ui/toggle.tsx'

// Leaf primitive: a two-state on/off button. Mirrors shadcn toggle cva variant/size.
export const Toggle = defineCapsule({
  name: 'Toggle',
  description: 'Two-state on/off button. Mirrors shadcn toggle variant/size.',
  props: z.object({
    label: z.string(),
    pressed: z.boolean().optional(),
    variant: z.enum(['default', 'outline']).optional(),
    size: z.enum(['default', 'sm', 'lg']).optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIToggle
      defaultPressed={props.pressed}
      variant={props.variant}
      size={props.size}
      disabled={props.disabled}
      className={props.className}
    >
      {props.label}
    </UIToggle>
  ),
})
