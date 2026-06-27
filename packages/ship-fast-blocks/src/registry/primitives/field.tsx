import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  Field as UIField,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '#/components/ui/field.tsx'

// Compound primitive: a single labelled form row wrapping one control (children).
// orientation enum mirrors fieldVariants exactly.
export const Field = defineCapsule({
  name: 'Field',
  description:
    'Labelled form row wrapping one control (children) with optional description/error. orientation vertical (default), horizontal, or responsive.',
  props: z.object({
    label: z.string().optional(),
    children: z.array(z.any()).optional(),
    description: z.string().optional(),
    error: z.string().optional(),
    orientation: z.enum(['vertical', 'horizontal', 'responsive']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIField orientation={props.orientation} className={props.className}>
      {props.label && <FieldLabel>{props.label}</FieldLabel>}
      <FieldContent>
        {renderNode(props.children)}
        {props.description && (
          <FieldDescription>{props.description}</FieldDescription>
        )}
        {props.error && <FieldError>{props.error}</FieldError>}
      </FieldContent>
    </UIField>
  ),
})

// Compound primitive: a titled group of stacked fields (children). Optional
// legend variant mirrors FieldLegend variant enum exactly.
export const FieldSetGroup = defineCapsule({
  name: 'FieldSetGroup',
  description:
    "Fieldset grouping several Fields (children) under an optional legend. legend variant 'legend' (default) or 'label'.",
  props: z.object({
    legend: z.string().optional(),
    children: z.array(z.any()).optional(),
    description: z.string().optional(),
    legendVariant: z.enum(['legend', 'label']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <FieldSet className={props.className}>
      {props.legend && (
        <FieldLegend variant={props.legendVariant}>{props.legend}</FieldLegend>
      )}
      {props.description && (
        <FieldDescription>{props.description}</FieldDescription>
      )}
      <FieldGroup>{renderNode(props.children)}</FieldGroup>
    </FieldSet>
  ),
})

export const FieldDivider = defineCapsule({
  name: 'FieldDivider',
  description:
    'Horizontal separator between fields, with optional centered label text.',
  props: z.object({
    label: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <FieldSeparator className={props.className}>{props.label}</FieldSeparator>
  ),
})
