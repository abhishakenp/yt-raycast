import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CleaningServiceLogos — a "trusted by" logos strip for a home-cleaning / maid-service landing page. A single-row bordered section with a centered uppercase label above a responsive 2/4/6-column grid of clickable company-name pills. Each item routes through useNavigate on click. Use as social-proof / credibility strip immediately below the hero for residential cleaning companies, local services, or small-business landing pages. Renders fully with no props via baked-in defaults.
 */
export const CleaningServiceLogos = defineComponent({
  name: "CleaningServiceLogos",
  description:
    "A 'trusted by' logos strip for a home-cleaning / maid-service landing page: single-row bordered section with a centered uppercase label above a responsive 2/4/6-column grid of clickable company-name pills. Each item routes through useNavigate on click. Use as social-proof credibility strip below the hero for residential cleaning companies, local services, or small-business landing pages.",
  props: z.object({
    /** Uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Company / partner names shown in the grid. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? "Trusted by leading companies"
    const items = props.items?.length
      ? props.items
      : ["Airbnb", "Zillow", "Redfin", "Compass", "Opendoor", "WeWork"]

    return (
      <section
        className={cn("border-b border-border bg-background", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center text-xl font-semibold text-muted-foreground"
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
