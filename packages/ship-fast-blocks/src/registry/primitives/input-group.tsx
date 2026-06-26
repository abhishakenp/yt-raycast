import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  InputGroup as UIInputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '#/components/ui/input-group.tsx'

// Compound primitive: an input/textarea wrapped with leading/trailing addons
// (icons, text, or a button). Addon `align` enum + button `size` enum mirrored exactly.
export const InputGroup = defineComponent({
  name: 'InputGroup',
  description:
    'Text input or textarea with optional leading/trailing addon text and an optional addon button. Use for search bars, prefixed inputs, etc.',
  props: z.object({
    placeholder: z.string().optional(),
    multiline: z.boolean().optional(),
    leadingText: z.string().optional(),
    trailingText: z.string().optional(),
    leadingAlign: z
      .enum(['inline-start', 'inline-end', 'block-start', 'block-end'])
      .optional(),
    trailingAlign: z
      .enum(['inline-start', 'inline-end', 'block-start', 'block-end'])
      .optional(),
    buttonLabel: z.string().optional(),
    buttonSize: z.enum(['xs', 'sm', 'icon-xs', 'icon-sm']).optional(),
    defaultValue: z.string().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIInputGroup className={props.className}>
      {props.leadingText && (
        <InputGroupAddon align={props.leadingAlign ?? 'inline-start'}>
          <InputGroupText>{props.leadingText}</InputGroupText>
        </InputGroupAddon>
      )}
      {props.multiline ? (
        <InputGroupTextarea
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
        />
      ) : (
        <InputGroupInput
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
        />
      )}
      {props.trailingText && (
        <InputGroupAddon align={props.trailingAlign ?? 'inline-end'}>
          <InputGroupText>{props.trailingText}</InputGroupText>
        </InputGroupAddon>
      )}
      {props.buttonLabel && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size={props.buttonSize}>
            {props.buttonLabel}
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </UIInputGroup>
  ),
})
