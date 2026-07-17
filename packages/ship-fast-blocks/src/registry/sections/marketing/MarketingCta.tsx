import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * MarketingCta — a closing dark rounded CTA banner with email capture for a
 * SaaS / product-marketing landing page. A full-width section holding a centered
 * dark (foreground-on-background-inverted) rounded card: a bold heading, a muted
 * subheading, an inline email input + filled primary submit button, and a small
 * trust footnote. Clean premium indigo accent on a dark panel. The submit writes
 * to the shared Lakebed subscriber list. Use as the final conversion banner before the
 * footer on B2B SaaS, productivity, or developer-platform pages.
 */
export const MarketingCta = defineCapsule({
  name: 'MarketingCta',
  description:
    'Closing dark rounded CTA banner with email capture for a SaaS / product-marketing landing page: a full-width section holding a centered dark inverted-surface rounded card with a bold heading, a muted subheading, an inline email input + filled primary submit button, and a small trust footnote. Clean premium indigo accent on a dark panel; the submit writes to the shared Lakebed subscriber list. Use as the final conversion banner before the footer on B2B SaaS, productivity, or developer-platform pages.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    placeholder: z.string().optional(),
    action: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to get more done?'
    const subheading =
      props.subheading ??
      'Join 10,000+ teams already using Flowstate to ship faster and stress less.'
    const placeholder = props.placeholder ?? 'Enter your work email'
    const action = props.action ?? 'Start free trial'
    const note = props.note ?? 'No credit card required. 14-day free trial.'

    return (
      <CtaBand
        tone="muted"
        title={heading}
        subtitle={subheading}
        titleClassName="text-background font-extrabold tracking-tight"
        subtitleClassName="text-background/70"
        innerClassName="max-w-[calc(72rem-3rem)] rounded-2xl bg-foreground px-6 py-20"
        className={`px-6 pb-20 ${props.className ?? ''}`}
      >
        <NewsletterSubscribeForm
          lakebed={lakebed}
          source={action}
          placeholder={placeholder}
          buttonLabel={action}
          successMessage="You're in. Trial details will arrive by email."
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          inputClassName="min-w-[16rem] rounded-xl border border-background/20 bg-background/10 px-4 py-3.5 text-base text-background outline-none placeholder:text-background/50 focus:border-ring"
          buttonClassName="rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
          emailLabel="Work email"
          statusClassName="text-background/60"
        />
        <p className="mt-4 text-sm text-background/60">{note}</p>
      </CtaBand>
    )
  },
})
