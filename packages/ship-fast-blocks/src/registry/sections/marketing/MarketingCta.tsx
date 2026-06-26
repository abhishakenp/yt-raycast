import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MarketingCta — a closing dark rounded CTA banner with email capture for a
 * SaaS / product-marketing landing page. A full-width section holding a centered
 * dark (foreground-on-background-inverted) rounded card: a bold heading, a muted
 * subheading, an inline email input + filled primary submit button, and a small
 * trust footnote. Clean premium indigo accent on a dark panel. The submit
 * routes through useNavigate. Use as the final conversion banner before the
 * footer on B2B SaaS, productivity, or developer-platform pages.
 */
export const MarketingCta = defineComponent({
  name: 'MarketingCta',
  description:
    'Closing dark rounded CTA banner with email capture for a SaaS / product-marketing landing page: a full-width section holding a centered dark inverted-surface rounded card with a bold heading, a muted subheading, an inline email input + filled primary submit button, and a small trust footnote. Clean premium indigo accent on a dark panel; the submit routes through useNavigate. Use as the final conversion banner before the footer on B2B SaaS, productivity, or developer-platform pages.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    placeholder: z.string().optional(),
    action: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to get more done?'
    const subheading =
      props.subheading ??
      'Join 10,000+ teams already using Flowstate to ship faster and stress less.'
    const placeholder = props.placeholder ?? 'Enter your work email'
    const action = props.action ?? 'Start free trial'
    const note = props.note ?? 'No credit card required. 14-day free trial.'

    return (
      <section className={cn('px-6 pb-20', props.className)}>
        <div className="mx-auto max-w-[calc(72rem-3rem)] rounded-2xl bg-foreground px-6 py-20 text-center text-background">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-lg text-background/70">{subheading}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <input
              type="email"
              aria-label="Work email"
              placeholder={placeholder}
              className="min-w-[16rem] rounded-xl border border-background/20 bg-background/10 px-4 py-3.5 text-base text-background outline-none placeholder:text-background/50 focus:border-ring"
            />
            <button
              type="button"
              onClick={() => go(action)}
              className="rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {action}
            </button>
          </div>
          <p className="mt-4 text-sm text-background/60">{note}</p>
        </div>
      </section>
    )
  },
})
