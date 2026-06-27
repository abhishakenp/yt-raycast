import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Switch as UISwitch } from '#/components/ui/switch.tsx'
import { Label as UILabel } from '#/components/ui/label.tsx'

// Compound: toggle switch with optional inline label.
// size enum copied verbatim from shadcn source ("sm" | "default").
export const Switch = defineCapsule({
  name: 'Switch',
  description:
    'On/off toggle switch with optional inline label. Mirrors shadcn Switch.',
  props: z.object({
    label: z.string().optional(),
    size: z.enum(['sm', 'default']).optional(),
    defaultChecked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const toggle = (
      <UISwitch
        size={props.size}
        defaultChecked={props.defaultChecked}
        disabled={props.disabled}
        className={props.className}
      />
    )
    if (!props.label) return toggle
    return (
      <UILabel className="gap-2">
        {toggle}
        {props.label}
      </UILabel>
    )
  },
})
