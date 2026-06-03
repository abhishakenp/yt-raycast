import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { Slider as UISlider } from "#/components/ui/slider.tsx"

// Leaf primitive: range slider. No cva variants; expose min/max/step + a
// sensible default value so it renders standalone.
export const Slider = defineComponent({
  name: "Slider",
  description: "Range slider. Single-thumb by default. Mirrors shadcn Slider.",
  props: z.object({
    defaultValue: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const min = props.min ?? 0
    const max = props.max ?? 100
    return (
      <UISlider
        defaultValue={[props.defaultValue ?? Math.round((min + max) / 2)]}
        min={min}
        max={max}
        step={props.step}
        disabled={props.disabled}
        className={props.className}
      />
    )
  },
})
