import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

// Layout primitives. shadcn ships no generic layout components, so these are
// authored here. `Stack` is the canonical root of every generated document.

const gapMap = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-10",
} as const

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const

export const Stack = defineComponent({
  name: "Stack",
  description:
    "Flex container. The required root of every UI. direction 'col' (default) stacks vertically, 'row' horizontally.",
  props: z.object({
    children: z.array(z.any()).optional(),
    direction: z.enum(["col", "row"]).optional(),
    gap: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional(),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
    justify: z.enum(["start", "center", "end", "between", "around"]).optional(),
    wrap: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <div
      className={cn(
        "flex",
        props.direction === "row" ? "flex-row" : "flex-col",
        gapMap[props.gap ?? "md"],
        props.align && alignMap[props.align],
        props.justify && justifyMap[props.justify],
        props.wrap && "flex-wrap",
        props.className,
      )}
    >
      {renderNode(props.children)}
    </div>
  ),
})

const colsMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-2 lg:grid-cols-6",
} as const

export const Grid = defineComponent({
  name: "Grid",
  description: "Responsive grid container. `cols` is the column count at desktop width (collapses on mobile).",
  props: z.object({
    children: z.array(z.any()).optional(),
    cols: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
    gap: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <div
      className={cn(
        "grid",
        colsMap[Number(props.cols ?? "3") as 1 | 2 | 3 | 4 | 5 | 6],
        gapMap[props.gap ?? "md"],
        props.className,
      )}
    >
      {renderNode(props.children)}
    </div>
  ),
})

export const Box = defineComponent({
  name: "Box",
  description: "Generic container div. Use `className` for arbitrary Tailwind styling.",
  props: z.object({
    children: z.array(z.any()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <div className={props.className}>{renderNode(props.children)}</div>
  ),
})

export const Section = defineComponent({
  name: "Section",
  description: "Page section with vertical padding and a centered max-width container. Use for top-level page bands.",
  props: z.object({
    children: z.array(z.any()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <section className={cn("w-full px-4 py-12 md:py-20", props.className)}>
      <div className="mx-auto max-w-6xl">{renderNode(props.children)}</div>
    </section>
  ),
})

export const Spacer = defineComponent({
  name: "Spacer",
  description: "Vertical spacing. size xs..xl.",
  props: z.object({
    size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
  }),
  component: ({ props }) => {
    const h = { xs: "h-2", sm: "h-4", md: "h-8", lg: "h-16", xl: "h-28" }[props.size ?? "md"]
    return <div className={h} />
  },
})

export const Heading = defineComponent({
  name: "Heading",
  description: "Section heading text. level 1 (largest) .. 4.",
  props: z.object({
    text: z.string(),
    level: z.enum(["1", "2", "3", "4"]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cls = {
      "1": "text-4xl font-bold tracking-tight md:text-5xl",
      "2": "text-3xl font-semibold tracking-tight",
      "3": "text-2xl font-semibold",
      "4": "text-lg font-semibold",
    }[props.level ?? "2"]
    return <h2 className={cn(cls, props.className)}>{props.text}</h2>
  },
})

export const Text = defineComponent({
  name: "Text",
  description: "Paragraph / body text. tone 'muted' for secondary text.",
  props: z.object({
    text: z.string(),
    tone: z.enum(["default", "muted"]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <p className={cn("leading-7", props.tone === "muted" && "text-muted-foreground", props.className)}>
      {props.text}
    </p>
  ),
})
