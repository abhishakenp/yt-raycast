import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CrmCta — bold full-width conversion CTA band for a CRM / SaaS landing page.
 * A centered section on a filled primary surface: a large headline, a supporting
 * paragraph, dual CTAs (a solid light primary button + an outlined ghost button)
 * and a fine-print reassurance note. High-contrast and conversion-focused; CTAs
 * route through useNavigate. Use near the bottom of a page to drive sign-ups for
 * CRM, sales-pipeline or B2B SaaS products. Renders fully with no props.
 */
export const CrmCta = defineComponent({
  name: 'CrmCta',
  description:
    'Bold full-width conversion CTA band for a CRM / SaaS landing page: a centered section on a filled primary surface with a large headline, a supporting paragraph, dual CTAs (a solid light primary button + an outlined ghost button) and a fine-print reassurance note. High-contrast and conversion-focused; CTAs route through useNavigate. Use near the bottom of a page to drive sign-ups for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    description: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Fine-print reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to transform your sales process?'
    const description =
      props.description ??
      "Join 15,000+ sales teams who've switched to Pipeline Pro. Start your free trial today—no credit card required."
    const primaryCta = props.primaryCta ?? 'Start 14-day free trial'
    const secondaryCta = props.secondaryCta ?? 'Schedule a demo'
    const note =
      props.note ??
      'Free setup call included. Average onboarding time: 23 minutes.'

    return (
      <section className={cn('bg-primary py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/70">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="rounded-lg bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-lg border border-primary-foreground/40 px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">{note}</p>
        </div>
      </section>
    )
  },
})
