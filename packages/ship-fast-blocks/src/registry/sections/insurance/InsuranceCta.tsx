import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * InsuranceCta — full-bleed closing call-to-action panel for an insurance page.
 * A rounded brand-colored panel with a subtle dotted overlay, centered heading
 * and lede, dual CTAs (a solid get-a-quote button and an outline phone button),
 * and a small footnote of trust points. Both CTAs route through useNavigate.
 * Use as the final conversion push near the footer for insurance carriers,
 * insurtech, brokers, or financial-protection products. Renders fully with no
 * props via baked-in defaults.
 */
export const InsuranceCta = defineComponent({
  name: "InsuranceCta",
  description:
    "Full-bleed closing call-to-action panel for an insurance page: a rounded brand-colored panel with a subtle dotted overlay, centered heading and lede, dual CTAs (a solid get-a-quote button and an outline call/phone button), and a small footnote of trust points. Both CTAs route through useNavigate. Use as the final conversion push near the footer for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Panel heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Primary (solid) CTA label. */
    primaryCta: z.string().optional(),
    /** Phone (outline) CTA label. */
    phoneCta: z.string().optional(),
    /** Navigation target for the phone CTA. */
    phone: z.string().optional(),
    /** Small trust footnote under the CTAs. */
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to protect what matters?"
    const description =
      props.description ??
      "Get your personalized quote in under 2 minutes. Join 50,000+ families who trust SecureLife for their insurance needs."
    const primaryCta = props.primaryCta ?? "Get Your Free Quote"
    const phoneCta = props.phoneCta ?? "Call 1-800-555-0199"
    const phone = props.phone ?? "1-800-555-0199"
    const footnote =
      props.footnote ??
      "No credit check required • Cancel anytime • Instant coverage"

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

    const Phone = ({ className }: { className?: string }) => (
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <section className={cn("bg-background py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center lg:p-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 text-primary-foreground opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {description}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-primary shadow-lg transition-colors hover:bg-muted"
                >
                  {primaryCta}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(phone)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <Phone className="size-5" />
                  {phoneCta}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/70">
                {footnote}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
