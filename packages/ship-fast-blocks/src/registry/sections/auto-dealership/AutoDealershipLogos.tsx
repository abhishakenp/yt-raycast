import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * AutoDealershipLogos — trusted-brands wordmark strip for an auto dealership
 * site. A bordered, card-surfaced band with a small uppercase caption above a
 * responsive 3-up / 6-up grid of brand-name wordmarks (BMW, Mercedes, Audi,
 * Lexus, Tesla, Toyota) rendered at reduced opacity with a hover-to-full state.
 * Each wordmark routes through useNavigate. Use as a social-proof / inventory-
 * coverage strip directly under the hero for dealerships, used-car lots, or
 * multi-marque showrooms. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipLogos = defineComponent({
  name: "AutoDealershipLogos",
  description:
    "Trusted-brands wordmark strip for an auto dealership site: a bordered, card-surfaced band with a small uppercase caption above a responsive 3-up / 6-up grid of brand-name wordmarks (BMW, Mercedes, Audi, Lexus, Tesla, Toyota) at reduced opacity with a hover-to-full state. Each wordmark routes through useNavigate. Use as a social-proof / inventory-coverage strip directly under the hero for dealerships, used-car lots, or multi-marque showrooms.",
  props: z.object({
    /** Uppercase caption above the wordmark grid. */
    heading: z.string().optional(),
    /** Brand names rendered as wordmarks. */
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Trusted Brands We Carry"
    const brands = props.brands?.length
      ? props.brands
      : ["BMW", "Mercedes", "Audi", "Lexus", "Tesla", "Toyota"]

    return (
      <section
        className={cn("border-b border-border bg-card", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-3 items-center gap-8 opacity-60 md:grid-cols-6">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => go(b)}
                className="text-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
