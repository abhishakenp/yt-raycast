import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CloudInfraLogos — "trusted by" logo wall for a cloud-infrastructure / developer-
 * platform SaaS landing page. A centered small-caps heading above a responsive
 * grid of text-based logo buttons (2 cols mobile, 3 cols tablet, 6 cols desktop).
 * Each item is a clickable button that routes through useNavigate. Token-only
 * colors with subtle opacity. Renders fully on zero arguments.
 */
export const CloudInfraLogos = defineComponent({
  name: "CloudInfraLogos",
  description:
    "Trusted-by logo wall for a cloud-infrastructure / developer-platform SaaS landing page: a centered small-caps heading above a responsive grid of text-based logo buttons (2 cols mobile, 3 cols tablet, 6 cols desktop). Each item routes through useNavigate. Use for social proof / credibility bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.",
  props: z.object({
    /** Heading text above the logo grid. */
    heading: z.string().optional(),
    /** Logo labels displayed as bold text buttons. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Trusted by engineering teams at"
    const items = props.items?.length
      ? props.items
      : ["Stripe", "Notion", "Figma", "Vercel", "Linear", "Raycast"]

    return (
      <section className={cn("border-b border-border py-16", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex items-center justify-center"
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
