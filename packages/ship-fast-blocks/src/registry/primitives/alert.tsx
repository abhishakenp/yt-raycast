import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Alert as UIAlert,
  AlertDescription,
  AlertTitle,
} from "#/components/ui/alert.tsx"

// Flatten Alert/Title/Description into title + description. variant mirrors cva.
export const Alert = defineComponent({
  name: "Alert",
  description:
    "Inline callout box with a title and optional description. variant 'destructive' for errors.",
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    variant: z.enum(["default", "destructive"]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIAlert variant={props.variant} className={props.className}>
      <AlertTitle>{props.title}</AlertTitle>
      {props.description && (
        <AlertDescription>{props.description}</AlertDescription>
      )}
    </UIAlert>
  ),
})
