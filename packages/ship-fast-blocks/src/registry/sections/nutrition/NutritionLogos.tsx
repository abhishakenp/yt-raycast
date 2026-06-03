import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * NutritionLogos — press / featured-in social-proof strip for a wellness or
 * nutrition-coaching site. A bordered card-toned band with a centered muted uppercase
 * heading above a faded responsive grid of publication wordmarks (2-up on mobile, 5-up
 * on desktop; the fifth name hides on small screens). Renders standalone with no props.
 * Use directly below the hero on nutrition, diet, wellness, health-media or
 * meal-subscription pages to signal credibility.
 */
export const NutritionLogos = defineComponent({
  name: "NutritionLogos",
  description:
    "Press / featured-in social-proof strip for a wellness or nutrition-coaching site: a bordered card-toned band with a centered muted uppercase heading above a faded responsive grid of publication wordmarks (2-up on mobile, 5-up on desktop). Use directly below the hero on nutrition, diet, wellness, health-media or meal-subscription pages to signal credibility and authority.",
  props: z.object({
    heading: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? "Featured in leading health publications"
    const names = props.names?.length
      ? props.names
      : ["Healthline", "Shape", "Well+Good", "MindBody", "Prevention"]

    return (
      <section
        className={cn("border-y border-border bg-card py-10", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-5">
            {names.map((name, i) => (
              <span
                key={name}
                className={cn(
                  "text-lg font-semibold text-muted-foreground",
                  i === 4 && "hidden md:block",
                )}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
