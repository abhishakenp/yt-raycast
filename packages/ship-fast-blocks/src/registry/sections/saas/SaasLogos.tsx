import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * SaasLogos — grayscale "trusted by" logo / social-proof strip for a SaaS
 * landing page. A slim bordered-bottom band with a small uppercase eyebrow
 * label centered above a wrapping, dimmed row of bold wordmark-style company
 * names. Tokens-only, no links, no images (names render as styled text). Use
 * directly beneath a hero to establish credibility for AI tools, SaaS apps,
 * developer tools, or B2B startups. Renders fully with no props via baked-in
 * default brand names.
 */
export const SaasLogos = defineComponent({
  name: "SaasLogos",
  description:
    "Grayscale 'trusted by' logo / social-proof strip for a SaaS landing page: a slim bordered-bottom band with a small uppercase eyebrow label centered above a wrapping, dimmed row of bold wordmark-style company names. Tokens-only, no links, no images (names render as styled text). Use directly beneath a hero to establish credibility for AI tools, SaaS apps, developer tools, or B2B startups.",
  props: z.object({
    /** Uppercase eyebrow label above the logo row. */
    label: z.string().optional(),
    /** Company / brand wordmark names shown in the strip. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? "Trusted by teams at"
    const names = props.names?.length
      ? props.names
      : [
          "Linear",
          "Notion",
          "Vercel",
          "Figma",
          "Stripe",
          "Slack",
          "GitHub",
          "Anthropic",
        ]

    return (
      <section
        className={cn("border-b border-border/60 py-12", props.className)}
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 opacity-60">
            {names.map((name) => (
              <span
                key={name}
                className="whitespace-nowrap text-xl font-extrabold tracking-tight text-muted-foreground"
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
