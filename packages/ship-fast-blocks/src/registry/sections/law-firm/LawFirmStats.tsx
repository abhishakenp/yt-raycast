import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * LawFirmStats — a dark full-width stats band on the primary surface. A
 * responsive 2-up / 4-up row of credential metrics, each a large serif value
 * above a tracked-uppercase muted label. High-contrast, restrained,
 * authoritative editorial aesthetic. Use between content sections on law-firm,
 * attorney, consulting or professional-services pages to surface firm
 * credentials (attorneys, years in practice, transactions closed, success rate).
 * Renders fully with no props via baked-in defaults.
 */
export const LawFirmStats = defineComponent({
  name: "LawFirmStats",
  description:
    "Dark full-width stats band on the primary surface: a responsive 2-up / 4-up row of credential metrics, each a large serif value above a tracked-uppercase muted label. High-contrast, restrained, authoritative editorial aesthetic. Use between content sections on law-firm, attorney, consulting, accounting or professional-services pages to surface firm credentials such as number of attorneys, years in practice, transactions closed and success rate.",
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: "34", label: "Attorneys" },
          { value: "37", label: "Years in Practice" },
          { value: "$2.4B", label: "Transactions Closed" },
          { value: "94%", label: "Success Rate" },
        ]

    return (
      <section
        className={cn(
          "bg-primary py-20 text-primary-foreground",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label}>
                <p className="mb-2 font-serif text-5xl lg:text-6xl">
                  {s.value}
                </p>
                <p className="text-sm uppercase tracking-widest text-primary-foreground/70">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
