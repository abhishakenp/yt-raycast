import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LogisticsCta — a high-contrast closing call-to-action band for a global-
 * logistics / freight-forwarding company. A full-width solid primary section with
 * a centered heading, a supporting paragraph, a pair of buttons (a solid
 * background-surface primary with a trailing arrow, plus an outlined secondary)
 * and a small reassurance note. Clean and corporate, inverting the page palette
 * for emphasis. Every button routes through useNavigate. Use as the final
 * conversion prompt for logistics, freight-forwarding, shipping, courier or
 * cargo/transport companies. Renders fully with no props.
 */
export const LogisticsCta = defineComponent({
  name: "LogisticsCta",
  description:
    "High-contrast closing call-to-action band for a global-logistics / freight-forwarding company: a full-width solid primary section with a centered heading, a supporting paragraph, a pair of buttons (a solid background-surface primary with a trailing arrow plus an outlined secondary) and a small reassurance note. Clean and corporate, inverting the page palette for emphasis; every button routes through useNavigate. Use as the final conversion prompt for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primary: z.string().optional(),
    secondary: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to ship smarter?"
    const description =
      props.description ??
      "Join 3,400+ companies that trust SwiftFreight to move their cargo. Get your first quote in under 3 minutes."
    const primary = props.primary ?? "Get instant quote"
    const secondary = props.secondary ?? "Talk to sales"
    const note =
      props.note ??
      "No account required for quotes. Volume discounts available for 50+ shipments/month."

    return (
      <section
        className={cn(
          "bg-primary py-16 text-primary-foreground lg:py-24",
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
            {description}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primary)}
              className="inline-flex items-center rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {primary}
              <svg className="ml-2 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(secondary)}
              className="inline-flex items-center rounded-xl border border-primary-foreground/40 px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              {secondary}
            </button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">{note}</p>
        </div>
      </section>
    )
  },
})
