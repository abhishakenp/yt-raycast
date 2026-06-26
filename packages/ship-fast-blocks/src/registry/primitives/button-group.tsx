import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  ButtonGroup as UIButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '#/components/ui/button-group.tsx'

// Compound primitive: groups adjacent buttons/inputs into one segmented control.
// children hold the Buttons; optional leading/trailing text labels are flattened.
export const ButtonGroup = defineComponent({
  name: 'ButtonGroup',
  description:
    'Segmented control that visually joins adjacent Buttons. children are the buttons; orientation horizontal (default) or vertical.',
  props: z.object({
    children: z.array(z.any()).optional(),
    leadingText: z.string().optional(),
    trailingText: z.string().optional(),
    orientation: z.enum(['horizontal', 'vertical']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIButtonGroup orientation={props.orientation} className={props.className}>
      {props.leadingText && (
        <ButtonGroupText>{props.leadingText}</ButtonGroupText>
      )}
      {renderNode(props.children)}
      {props.trailingText && (
        <ButtonGroupText>{props.trailingText}</ButtonGroupText>
      )}
    </UIButtonGroup>
  ),
})

export const ButtonGroupDivider = defineComponent({
  name: 'ButtonGroupDivider',
  description: 'Separator placed between items inside a ButtonGroup.',
  props: z.object({
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <ButtonGroupSeparator className={props.className} />
  ),
})
