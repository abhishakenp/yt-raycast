import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Collapsible as UICollapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible.tsx"

// Flatten Collapsible/Trigger/Content into label + children. Open by default
// so the content is visible in a static preview.
export const Collapsible = defineComponent({
  name: "Collapsible",
  description:
    "Single show/hide region with a clickable trigger label. Open by default. children is the collapsible body.",
  props: z.object({
    label: z.string(),
    children: z.array(z.any()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UICollapsible defaultOpen className={props.className}>
      <CollapsibleTrigger className="text-sm font-medium underline-offset-4 hover:underline">
        {props.label}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {renderNode(props.children)}
      </CollapsibleContent>
    </UICollapsible>
  ),
})
