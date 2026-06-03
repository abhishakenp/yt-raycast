import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * AiProductLogos — a slim "trusted by" social-proof logo strip for a clean,
 * light AI SaaS / product page. A bordered, muted-band section with a small
 * uppercase tracking label centered above a dimmed responsive grid of wordmark
 * buttons (2 → 3 → 6 columns) that brighten on hover. Each wordmark routes
 * through useNavigate. Use directly beneath a hero to establish credibility on
 * AI tools, SaaS apps, startups, or any marketing site that lists customer or
 * partner brands. Renders fully with no props.
 */
export const AiProductLogos = defineComponent({
  name: "AiProductLogos",
  description:
    "Slim 'trusted by' social-proof logo strip for a clean, light AI SaaS / product page: a bordered muted-band section with a small uppercase tracking-wider label centered above a dimmed responsive grid of wordmark buttons (2 → 3 → 6 columns) that brighten on hover. Each wordmark routes through useNavigate. Place directly beneath a hero to establish credibility for AI tools, SaaS apps, startups, or any marketing site listing customer or partner brands.",
  props: z.object({
    /** Small uppercase label above the wordmarks. */
    label: z.string().optional(),
    /** Customer / partner brand wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? "Trusted by teams at"
    const items = props.items?.length
      ? props.items
      : ["Notion", "Figma", "Stripe", "Linear", "Vercel", "Shopify"]

    return (
      <section
        className={cn("border-y border-border bg-muted/50", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
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
