import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select.tsx"

// Compound overlay: flatten Select/Trigger/Content/Item into a single node.
// Rendered with `defaultOpen` so the option list is statically visible.
export const Select = defineComponent({
  name: "Select",
  description:
    "Dropdown select. `items` are the options; `placeholder` is shown when nothing is chosen. Opens by default for preview.",
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    placeholder: z.string().optional(),
    defaultValue: z.string().optional(),
    size: z.enum(["sm", "default"]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items ?? [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "cherry", label: "Cherry" },
    ]
    return (
      <UISelect defaultValue={props.defaultValue} defaultOpen>
        <SelectTrigger size={props.size} className={props.className}>
          <SelectValue placeholder={props.placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </UISelect>
    )
  },
})
