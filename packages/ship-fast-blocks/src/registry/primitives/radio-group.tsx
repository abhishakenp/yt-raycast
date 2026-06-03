import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { RadioGroup as UIRadioGroup, RadioGroupItem } from "#/components/ui/radio-group.tsx"
import { Label as UILabel } from "#/components/ui/label.tsx"

// Compound: flatten RadioGroup + RadioGroupItem into a single node taking an
// array of { value, label } items. No cva variants in shadcn source.
export const RadioGroup = defineComponent({
  name: "RadioGroup",
  description:
    "Single-select radio list. `items` is an array of { value, label }. Mirrors shadcn RadioGroup.",
  props: z.object({
    items: z.array(z.object({ value: z.string(), label: z.string() })),
    defaultValue: z.string().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIRadioGroup
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      className={props.className}
    >
      {props.items.map((item) => (
        <UILabel key={item.value} className="gap-2 font-normal">
          <RadioGroupItem value={item.value} />
          {item.label}
        </UILabel>
      ))}
    </UIRadioGroup>
  ),
})
