import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * IllustratorStats — a compact dark stats band for an illustrator /
 * visual-artist portfolio. A full-width foreground-colored band with inverted
 * type holds a centered responsive grid of big serif metric values over small
 * muted labels (books published, prints sold, happy clients, awards). Use as a
 * high-contrast achievements strip between content sections. Renders fully with
 * no props via baked-in defaults.
 */
export const IllustratorStats = defineComponent({
  name: "IllustratorStats",
  description:
    "Compact dark stats band for an illustrator / visual-artist portfolio: a full-width foreground-colored band with inverted type holding a centered responsive grid of big serif metric values over small muted labels (books published, prints sold, happy clients, awards). Use as a high-contrast achievements strip between content sections.",
  props: z.object({
    /** Metric items shown across the band. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: "47", label: "Books Published" },
          { value: "12k+", label: "Prints Sold" },
          { value: "35", label: "Happy Clients" },
          { value: "3", label: "Industry Awards" },
        ]

    return (
      <section
        className={cn(
          "bg-foreground px-4 py-16 text-background sm:px-6 sm:py-20 lg:px-8",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 text-center sm:gap-12 lg:grid-cols-4">
            {items.map((s) => (
              <div key={s.label}>
                <p className="mb-2 font-serif text-4xl sm:text-5xl">
                  {s.value}
                </p>
                <p className="text-sm text-background/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
