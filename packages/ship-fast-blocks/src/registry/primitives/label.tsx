import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { Label as UILabel } from "#/components/ui/label.tsx"

// Leaf primitive: form label text. No cva variants in shadcn source.
export const Label = defineComponent({
  name: "Label",
  description: "Form field label. Mirrors shadcn Label.",
  props: z.object({
    text: z.string(),
    htmlFor: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UILabel htmlFor={props.htmlFor} className={props.className}>
      {props.text}
    </UILabel>
  ),
})
