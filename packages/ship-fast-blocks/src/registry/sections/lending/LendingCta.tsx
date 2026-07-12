import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LendingCta — a dark, full-width "ready to check your rate?" CTA band for a
 * lending or fintech marketing page. A near-ink (foreground-toned) section with a
 * centered large heading, a supporting paragraph, dual buttons (a solid
 * inverted-background primary with an arrow + a bordered ghost phone button), and
 * a row of check-marked security badges below. All buttons route through
 * useNavigate. Use as the closing conversion push near the page bottom on
 * personal-loan, debt-consolidation, or financing pages. Renders fully with no
 * props via baked-in defaults.
 */
export const LendingCta = defineCapsule({
  name: 'LendingCta',
  description:
    "Dark full-width 'ready to check your rate?' CTA band for a lending or fintech marketing page: near-ink (foreground-toned) section with a centered large heading, supporting paragraph, dual buttons (solid inverted-background primary with arrow + bordered ghost phone button) and a row of check-marked security badges below. Buttons route through useNavigate. Use as the closing conversion push near the page bottom on personal-loan, debt-consolidation, or financing pages.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primary: z.string().optional(),
    phone: z.string().optional(),
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const ctaHeading = props.heading ?? 'Ready to check your rate?'
    const ctaDesc =
      props.description ??
      "It takes 2 minutes, won't affect your credit score, and could save you thousands compared to credit cards."
    const ctaPrimary = props.primary ?? 'Check My Rate'
    const ctaPhone = props.phone ?? 'Call (800) 555-1234'
    const ctaBadges = props.badges?.length
      ? props.badges
      : ['256-bit SSL encryption', 'Bank-level security', 'No spam, ever']

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    return (
      <section className={cn('bg-foreground py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
            {ctaHeading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
            {ctaDesc}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(ctaPrimary)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90 sm:w-auto"
            >
              {ctaPrimary}
              <ArrowRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(ctaPhone)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10 sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {ctaPhone}
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-background/60">
            {ctaBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <Check className="size-5 text-primary" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
