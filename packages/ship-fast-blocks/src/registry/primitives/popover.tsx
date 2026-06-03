import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover as UIPopover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"

// Overlay: trigger button + floating content. Rendered `defaultOpen` so the
// popover body is statically visible. `children` render inside the content.
export const Popover = defineComponent({
  name: "Popover",
  description:
    "Floating panel anchored to a trigger button. `triggerLabel` labels the button; title/description/children fill the panel. Open by default for preview.",
  props: z.object({
    triggerLabel: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    children: z.array(z.any()).optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIPopover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">{props.triggerLabel ?? "Open"}</Button>
      </PopoverTrigger>
      <PopoverContent align={props.align} className={props.className}>
        {(props.title || props.description) && (
          <PopoverHeader>
            {props.title && <PopoverTitle>{props.title}</PopoverTitle>}
            {props.description && (
              <PopoverDescription>{props.description}</PopoverDescription>
            )}
          </PopoverHeader>
        )}
        {props.children && renderNode(props.children)}
      </PopoverContent>
    </UIPopover>
  ),
})
