import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LogisticsLogos — a slim client trust strip for a global-logistics / freight-
 * forwarding company. A border-bottomed band with a centered uppercase caption
 * above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced
 * opacity for an understated "trusted by" feel. Clean and corporate on a light
 * surface; each logo routes through useNavigate. Use directly beneath the hero of
 * a logistics, freight-forwarding, shipping, courier or cargo/transport site to
 * establish credibility. Renders fully with no props.
 */
export const LogisticsLogos = defineComponent({
  name: "LogisticsLogos",
  description:
    "Slim client trust strip for a global-logistics / freight-forwarding company: a border-bottomed band with a centered uppercase caption above a faded, responsive grid of wordmark logos (2 → 3 → 6 columns) at reduced opacity for an understated 'trusted by' feel. Clean and corporate on a light surface; each logo routes through useNavigate. Use directly beneath the hero of a logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport site to establish credibility.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Trusted by industry leaders"
    const items = props.items?.length
      ? props.items
      : ["TechFlow", "Globex", "Acme Corp", "Stark Ind", "Wayne Ent", "Oscorp"]

    return (
      <section
        className={cn("border-b border-border py-12", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center"
              >
                <span className="text-xl font-bold text-foreground/80">
                  {logo}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
