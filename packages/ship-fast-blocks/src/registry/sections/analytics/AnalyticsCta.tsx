import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AnalyticsCta — full-width closing call-to-action band for an analytics
 * product, built on the shared CtaBand composite with a primary tone. Centers an
 * optional eyebrow, a confident title ("See your data clearly"), a supporting
 * subtitle, and a row of routable pill actions — a primary "Start Free Trial"
 * button (auto-inverted to read against the primary background) plus an outlined
 * "Book a demo" button. Sharp and conversion-focused. Use as the final band near
 * the footer of any analytics, BI, or data-product site. Renders with no props.
 */
export const AnalyticsCta = defineCapsule({
  name: 'AnalyticsCta',
  description:
    "Full-width closing call-to-action band for an analytics product backed by shared Lakebed conversion state. Centers an optional eyebrow, a confident title ('See your data clearly'), a supporting subtitle, and a row of scoped mutation pill actions — a primary 'Start Free Trial' button plus an outlined 'Book a demo' button. Sharp and conversion-focused. Use as the final band near the footer of any analytics, BI, or data-product site.",
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const headline = props.headline ?? 'See your data clearly'
    const subheading =
      props.subheading ??
      'Spin up your first dashboard in minutes. No credit card, no setup calls — just answers.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'Book a demo'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'

    return (
      <CtaBand
        tone="primary"
        eyebrow={eyebrow}
        title={headline}
        subtitle={subheading}
        className={props.className}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={primaryTarget}
            plan={primaryCta}
            source="cta"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Starting
              </>
            }
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {primaryCta}
          </SaasPlanActionButton>
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={secondaryTarget}
            plan={secondaryCta}
            source="cta"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Sending
              </>
            }
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full border border-primary-foreground/35 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
          >
            {secondaryCta}
          </SaasPlanActionButton>
        </div>
      </CtaBand>
    )
  },
})
