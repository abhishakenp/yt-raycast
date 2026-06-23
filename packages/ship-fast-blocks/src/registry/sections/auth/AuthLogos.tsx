import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * AuthLogos — bespoke trusted-by strip for Authly, a developer authentication
 * product. A centered uppercase eyebrow ("Trusted by engineering teams at")
 * sits above a responsive row of company wordmarks rendered as token-styled
 * text spans (logos-as-text, not images) in muted foreground so they read as a
 * quiet social-proof band. Use beneath the hero of an auth platform, identity
 * API, or developer SaaS to establish credibility. Renders fully with no props.
 */
export const AuthLogos = defineComponent({
  name: "AuthLogos",
  description:
    "Bespoke trusted-by logo strip for a developer-auth product: a centered uppercase eyebrow ('Trusted by engineering teams at') above a responsive wrapping row of company wordmarks rendered as token-styled text spans (logos-as-text, not images) in muted foreground. Use as a quiet social-proof band beneath the hero of an auth platform, identity API, or developer SaaS landing page.",
  props: z.object({
    /** Centered eyebrow label above the wordmarks. */
    eyebrow: z.string().optional(),
    /** Company wordmarks rendered as styled text spans. */
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Trusted by engineering teams at"
    const logos = props.logos?.length
      ? props.logos
      : ["Northwind", "Vertex Labs", "Cobalt", "Hyperline", "Quanta", "Stackforge"]

    return (
      <section className={cn("bg-background", props.className)}>
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-center text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
            {logos.filter(Boolean).map((logo) => (
              <span
                key={logo}
                className="text-lg font-semibold tracking-tight text-muted-foreground"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
