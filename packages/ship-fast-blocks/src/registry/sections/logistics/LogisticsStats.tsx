import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * LogisticsStats — a compact KPI stat band for a global-logistics / freight-
 * forwarding company. A centered, responsive grid (2 → 4 columns) of large
 * semibold metric values over small muted captions (countries served, shipments
 * delivered, years in operation, team members). Clean and corporate on a light
 * surface with generous vertical padding. Use beneath the hero or logo strip of a
 * logistics, freight-forwarding, shipping, courier, warehousing or cargo/transport
 * site to quantify scale and trust. Renders fully with no props.
 */
export const LogisticsStats = defineComponent({
  name: "LogisticsStats",
  description:
    "Compact KPI stat band for a global-logistics / freight-forwarding company: a centered, responsive grid (2 → 4 columns) of large semibold metric values over small muted captions (e.g. countries served, shipments delivered, years in operation, team members worldwide). Clean and corporate on a light surface with generous vertical padding. Use beneath the hero or logo strip of a logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport site to quantify scale and trust.",
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
          { value: "180+", label: "Countries served" },
          { value: "2.4M", label: "Shipments delivered (2024)" },
          { value: "24", label: "Years in operation" },
          { value: "4,200", label: "Team members worldwide" },
        ]

    return (
      <section className={cn("py-16 lg:py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-semibold lg:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
