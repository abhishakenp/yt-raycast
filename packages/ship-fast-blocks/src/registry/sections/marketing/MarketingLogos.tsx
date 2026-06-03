import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * MarketingLogos — slim grayscale "trusted by" logo strip for a SaaS /
 * product-marketing landing page. A border-y banded row with a small uppercase
 * caption above a centered, wrapping flex of muted wordmark-style company names
 * that brighten on hover. Quiet social-proof band that sits directly under the
 * hero. Use to show customer/partner logos on B2B SaaS, developer-platform, or
 * any modern software product page.
 */
export const MarketingLogos = defineComponent({
  name: "MarketingLogos",
  description:
    "Slim grayscale 'trusted by' logo strip for a SaaS / product-marketing landing page: a border-y banded row with a small uppercase caption above a centered, wrapping flex of muted wordmark-style company names that brighten on hover. Quiet social-proof band that sits directly under the hero. Use to show customer / partner logos on B2B SaaS, developer-platform, or any modern software product page.",
  props: z.object({
    label: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? "Trusted by teams at"
    const names = props.names?.length
      ? props.names
      : ["Acme Corp", "Globex", "Initech", "Massive Dynamic", "Stark Ind"]

    return (
      <section className={cn("border-y border-border py-10", props.className)}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {names.map((name) => (
              <span
                key={name}
                className="text-lg font-bold tracking-tight text-muted-foreground/60 transition-colors hover:text-muted-foreground"
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
