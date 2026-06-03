import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NoCodeCta — bold closing call-to-action band rendered on the inverse
 * foreground surface. A centered, narrow column with a large heading, a muted
 * supporting paragraph, dual CTAs (a filled background-surface primary with
 * arrow + an outlined secondary with play icon), and a small reassurance note
 * beneath. CTAs route through useNavigate. Use as the final conversion band
 * before the footer on a no-code builder, SaaS, or product landing page.
 * Renders fully with no props.
 */
export const NoCodeCta = defineComponent({
  name: "NoCodeCta",
  description:
    "Bold closing call-to-action band rendered on the inverse foreground surface: a centered narrow column with a large heading, a muted supporting paragraph, dual CTAs (a filled background-surface primary with arrow + an outlined secondary with play icon), and a small reassurance note beneath. CTAs route through useNavigate. Use as the final conversion band before the footer on a no-code / app-builder SaaS or product landing page.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to build something amazing?"
    const description =
      props.description ??
      "Join 50,000+ creators who are already building with Buildr. Start for free, no credit card required."
    const primaryCta = props.primaryCta ?? "Start building free"
    const secondaryCta = props.secondaryCta ?? "Watch 2-min demo"
    const note =
      props.note ??
      "Free forever plan available • 14-day Pro trial • Cancel anytime"

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
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
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 9 15 12 10 15 10 9" />
      </svg>
    )

    return (
      <section
        className={cn(
          "bg-foreground py-24 text-background",
          props.className,
        )}
        aria-labelledby="nc-cta"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="nc-cta"
            className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-8 py-4 text-lg font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
              <ArrowRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-background/30 px-8 py-4 text-lg font-medium text-background transition-colors hover:bg-background/10"
            >
              <PlayIcon />
              {secondaryCta}
            </button>
          </div>
          <p className="mt-6 text-sm text-background/50">{note}</p>
        </div>
      </section>
    )
  },
})
