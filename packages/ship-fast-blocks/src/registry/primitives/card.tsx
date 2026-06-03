import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Card as UICard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card.tsx"

// Compound-primitive exemplar: flatten shadcn's Card/CardHeader/CardTitle/... sub-
// components into a single ergonomic node. `children` holds the body content
// (other generated components); title/description/footer are optional slots.
export const Card = defineComponent({
  name: "Card",
  description:
    "Bordered content container with optional title, description, body (children) and footer.",
  props: z.object({
    children: z.array(z.any()).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    footer: z.array(z.any()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UICard className={props.className}>
      {(props.title || props.description) && (
        <CardHeader>
          {props.title && <CardTitle>{props.title}</CardTitle>}
          {props.description && <CardDescription>{props.description}</CardDescription>}
        </CardHeader>
      )}
      {props.children && <CardContent>{renderNode(props.children)}</CardContent>}
      {props.footer && <CardFooter>{renderNode(props.footer)}</CardFooter>}
    </UICard>
  ),
})
