import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  ToggleGroup as UIToggleGroup,
  ToggleGroupItem,
} from '#/components/ui/toggle-group.tsx'

// Compound primitive: a set of toggles where one (single) or many (multiple)
// can be pressed. Flattened to items:[{value,label}]. variant/size mirror toggle cva.
export const ToggleGroup = defineComponent({
  name: 'ToggleGroup',
  description:
    "Set of toggle buttons. items:[{value,label}]. type 'single' (one active) or 'multiple'. variant/size mirror Toggle.",
  props: z.object({
    items: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        disabled: z.boolean().optional(),
      }),
    ),
    type: z.enum(['single', 'multiple']).optional(),
    defaultValue: z.string().optional(),
    variant: z.enum(['default', 'outline']).optional(),
    size: z.enum(['default', 'sm', 'lg']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items ?? []
    const children = items.map((item) => (
      <ToggleGroupItem
        key={item.value}
        value={item.value}
        disabled={item.disabled}
      >
        {item.label}
      </ToggleGroupItem>
    ))
    return props.type === 'multiple' ? (
      <UIToggleGroup
        type="multiple"
        defaultValue={props.defaultValue ? [props.defaultValue] : undefined}
        variant={props.variant}
        size={props.size}
        className={props.className}
      >
        {children}
      </UIToggleGroup>
    ) : (
      <UIToggleGroup
        type="single"
        defaultValue={props.defaultValue}
        variant={props.variant}
        size={props.size}
        className={props.className}
      >
        {children}
      </UIToggleGroup>
    )
  },
})
