import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CorporateLogos — client logo trust bar for an enterprise / corporate B2B
 * homepage. A single-row section with a centered muted heading above a
 * responsive grid of text-logo placeholders (2 on mobile, 4 on tablet, 6 on
 * desktop) at reduced opacity. Every logo is a clickable button that routes
 * through useNavigate. Use beneath the hero to establish credibility for SaaS
 * platforms, consultancies, or any B2B offering.
 */
export const CorporateLogos = defineComponent({
  name: "CorporateLogos",
  description:
    "Client logo trust bar for an enterprise / corporate B2B homepage: centered muted heading above a responsive grid of text-logo placeholders at reduced opacity with a thin top border, each clickable via useNavigate. Use beneath the hero to establish credibility for SaaS platforms, consultancies, or any B2B offering.",
  props: z.object({
    /** Heading above the logo grid. */
    heading: z.string().optional(),
    /** Text labels shown as logo placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? "Trusted by leading enterprises worldwide"
    const items = props.items?.length
      ? props.items
      : ["AcmeCorp", "Globex", "Initech", "Hooli", "Massive", "Soylent"]

    return (
      <section
        className={cn("border-b border-border bg-background py-16", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-sm font-medium text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center"
              >
                <span className="text-xl font-bold text-muted-foreground">
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
