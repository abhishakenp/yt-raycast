import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { Skeleton as UISkeleton } from "#/components/ui/skeleton.tsx"

// Leaf primitive: pulsing loading placeholder. Size it with className
// (e.g. "h-4 w-32" or "size-12 rounded-full").
export const Skeleton = defineComponent({
  name: "Skeleton",
  description:
    "Pulsing loading placeholder block. Size/shape it with className, e.g. 'h-4 w-32' or 'size-12 rounded-full'.",
  props: z.object({
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UISkeleton className={props.className ?? "h-4 w-32"} />
  ),
})
