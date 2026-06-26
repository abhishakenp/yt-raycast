import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * InvestingCta — dark closing call-to-action band for an investing / fintech
 * page. A centered, dark (foreground-surface) section with a large headline, a
 * supporting paragraph, dual primary/outline CTA buttons, and a small reassurance
 * note beneath. Both CTAs route through useNavigate. Use as the final conversion
 * push before the footer on a brokerage, trading-app or robo-advisor page.
 * Renders fully with no props.
 */
export const InvestingCta = defineComponent({
  name: 'InvestingCta',
  description:
    'Dark closing call-to-action band for an investing / fintech page: a centered dark (foreground-surface) section with a large headline, a supporting paragraph, dual primary/outline CTA buttons, and a small reassurance note beneath. Both CTAs route through useNavigate. Use as the final conversion push before the footer on a brokerage, trading-app or robo-advisor page.',
  props: z.object({
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outline secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note beneath the buttons. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to start investing smarter?'
    const description =
      props.description ??
      'Join over 2 million investors who have already discovered a better way to grow their wealth. Start with $0 and upgrade anytime.'
    const primaryCta = props.primaryCta ?? 'Create free account'
    const secondaryCta = props.secondaryCta ?? 'Schedule a demo'
    const note = props.note ?? 'No credit card required. Cancel anytime.'

    return (
      <section
        className={cn('bg-foreground py-24 text-background', props.className)}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-background/60 sm:text-xl">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center rounded-xl border border-background/30 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="mt-8 text-sm text-background/50">{note}</p>
        </div>
      </section>
    )
  },
})
