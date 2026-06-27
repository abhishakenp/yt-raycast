import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CorporateContactCta — dark conversion CTA band for an enterprise / corporate
 * B2B site. A full-width inverted section with a large centered headline, a lead
 * paragraph, dual pill CTAs (filled primary + bordered secondary), and a response-time
 * note beneath. Every CTA routes through useNavigate. Use as a pre-footer conversion
 * block on enterprise SaaS, consultancy, and managed services landing pages.
 */
export const CorporateContactCta = defineCapsule({
  name: 'CorporateContactCta',
  description:
    'Dark conversion CTA band for an enterprise / corporate B2B site: full-width inverted background with a large centered headline, a lead paragraph, dual pill CTAs (filled primary + bordered secondary), and a response-time note beneath. CTAs route through useNavigate. Use as a pre-footer conversion block on enterprise SaaS, consultancy, and managed services landing pages.',
  props: z.object({
    /** Headline text. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Primary filled CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary bordered CTA label. */
    secondaryCta: z.string().optional(),
    /** Fine-print note under the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to transform your enterprise?'
    const description =
      props.description ??
      'Join 500+ organizations that trust Nexus for mission-critical infrastructure. Schedule a personalized demo with our solutions team.'
    const primaryCta = props.primaryCta ?? 'Schedule a Demo'
    const secondaryCta = props.secondaryCta ?? 'Contact Sales'
    const note =
      props.note ?? 'Average response time: Under 2 hours during business hours'

    return (
      <section className={cn('bg-foreground py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center rounded-lg border border-background/40 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
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
