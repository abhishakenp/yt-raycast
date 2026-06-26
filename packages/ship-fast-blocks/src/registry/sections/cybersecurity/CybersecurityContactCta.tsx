import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CybersecurityContactCta — dark final demo call-to-action band. A full-bleed
 * brand-surface section, centered: a large heading, a wide supporting
 * paragraph, dual CTAs (solid inverted primary + outlined secondary), and a
 * small reassurance note underneath. Both CTAs route through useNavigate. Use as
 * the closing conversion band above the footer for cybersecurity vendors,
 * SOC/MDR providers, or any B2B security SaaS. Renders fully with no props via
 * baked-in demo-CTA defaults.
 */
export const CybersecurityContactCta = defineComponent({
  name: 'CybersecurityContactCta',
  description:
    'Dark final demo call-to-action band: a full-bleed brand-surface section, centered, with a large heading, a wide supporting paragraph, dual CTAs (solid inverted primary + outlined secondary), and a small reassurance note underneath; both CTAs route through useNavigate. Use as the closing conversion band above the footer for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Solid inverted primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note under the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to see SentinelGuard in action?'
    const description =
      props.description ??
      'Join 500+ enterprises protecting their infrastructure with AI-powered security. Schedule a personalized demo with our security experts.'
    const primaryCta = props.primaryCta ?? 'Schedule Live Demo'
    const secondaryCta = props.secondaryCta ?? 'Start 14-Day Free Trial'
    const note =
      props.note ??
      'No credit card required. Full platform access. Cancel anytime.'

    return (
      <section
        className={cn('bg-foreground py-24 text-background', props.className)}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-background/60">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="rounded-xl bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-xl border border-background/40 bg-transparent px-8 py-4 text-lg font-semibold text-background transition-colors hover:bg-background/10"
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
