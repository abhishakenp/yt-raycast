import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * ConstructionLogos — trusted-by client logo wall for a construction /
 * general contractor page. A bordered muted band with a centered eyebrow
 * heading above a responsive grid of text-based logo placeholders. Use as a
 * social-proof logo strip beneath the hero for construction companies,
 * contractors, builders, or any service business showcasing trusted
 * partnerships. Renders fully with no props via baked-in defaults.
 */
export const ConstructionLogos = defineComponent({
  name: "ConstructionLogos",
  description:
    "Trusted-by client logo wall for a construction / general contractor page: a bordered muted band with a centered eyebrow heading above a responsive grid of text-based logo placeholders. Use as a social-proof logo strip beneath the hero for construction firms, contractors, builders, or any service business showcasing trusted partnerships.",
  props: z.object({
    /** Section heading above the logo grid. */
    heading: z.string().optional(),
    /** Logo names displayed as text placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Trusted by leading organizations"
    const items = props.items?.length
      ? props.items
      : ["Microsoft", "Amazon", "Starbucks", "Boeing", "Nordstrom", "Costco"]

    return (
      <section
        className={cn("border-b border-border bg-card py-10", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
            {items.map((logo) => (
              <div key={logo} className="flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
