import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { Badge as UIBadge } from "#/components/ui/badge.tsx"

// Leaf primitive: small status/label pill. Mirrors shadcn badge cva variants.
export const Badge = defineComponent({
  name: "Badge",
  description: "Small status/label pill. Mirrors shadcn variant.",
  props: z.object({
    label: z.string(),
    variant: z
      .enum(["default", "secondary", "destructive", "outline", "ghost", "link"])
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIBadge variant={props.variant} className={props.className}>
      {props.label}
    </UIBadge>
  ),
})
