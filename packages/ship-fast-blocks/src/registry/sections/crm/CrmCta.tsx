import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CrmCta — bold full-width conversion CTA band for a CRM / SaaS landing page.
 * A centered section on a filled primary surface: a large headline, a supporting
 * paragraph, dual CTAs (a solid light primary button + an outlined ghost button)
 * and a fine-print reassurance note. High-contrast and conversion-focused; CTAs
 * route through section-kit route links. Use near the bottom of a page to drive sign-ups for
 * CRM, sales-pipeline or B2B SaaS products. Renders fully with no props.
 */
export const CrmCta = defineCapsule({
  name: 'CrmCta',
  description:
    'Bold full-width conversion CTA band for a CRM / SaaS landing page backed by shared Lakebed conversion state: a centered section on a filled primary surface with a large headline, supporting paragraph, scoped trial/demo mutation buttons, and a fine-print reassurance note. High-contrast and conversion-focused; CTAs record real intent instead of dead route-only navigation.',
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
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
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              plan={primaryCta}
              source="cta"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Starting
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </SaasPlanActionButton>
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={secondaryCta}
              source="cta"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Sending
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-foreground/40 px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <p className="text-sm text-primary-foreground/60">{note}</p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
