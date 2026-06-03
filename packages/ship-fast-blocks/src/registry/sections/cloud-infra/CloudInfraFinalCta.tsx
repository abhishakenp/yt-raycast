import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CloudInfraFinalCta — dark inverted final call-to-action band for a cloud-
 * infrastructure / developer-platform SaaS landing page. A centered heading + description
 * on a primary background with primary-foreground text, followed by dual CTAs
 * (dark filled primary + ghost outlined secondary) and a row of trust checkmarks.
 * CTAs route through useNavigate. Renders fully on zero arguments.
 */
export const CloudInfraFinalCta = defineComponent({
  name: "CloudInfraFinalCta",
  description:
    "Dark inverted final call-to-action band for a cloud-infrastructure / developer-platform SaaS landing page: a centered heading plus description on a primary background with primary-foreground text, dual pill CTAs (dark filled primary with arrow and ghost outlined secondary), and a row of trust checkmarks. CTAs route through useNavigate. Use as the closing conversion band for cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Primary CTA label (also becomes navigation target). */
    primaryCta: z.string().optional(),
    /** Secondary CTA label (also becomes navigation target). */
    secondaryCta: z.string().optional(),
    /** Trust bullets beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to deploy your first app?"
    const description =
      props.description ??
      "Join 12,000+ developers building on CloudShift. Start with $500 in free credits—no credit card required."
    const primaryCta = props.primaryCta ?? "Create free account"
    const secondaryCta = props.secondaryCta ?? "Schedule demo"
    const trust = props.trust?.length
      ? props.trust
      : ["$500 free credits", "No credit card required", "Cancel anytime"]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section className={cn("bg-primary py-20 text-primary-foreground lg:py-32", props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
            {description}
          </p>
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center rounded-lg bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
              <ArrowRight className="ml-2 size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center rounded-lg border border-primary-foreground/40 px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              {secondaryCta}
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
            {trust.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="size-5 text-chart-2" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
