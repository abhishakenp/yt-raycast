import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CloudInfraFinalCta — dark inverted final call-to-action band for a cloud-
 * infrastructure / developer-platform SaaS landing page. A centered heading + description
 * on a primary background with primary-foreground text, followed by dual CTAs
 * (dark filled primary + ghost outlined secondary) and a row of trust checkmarks.
 * CTAs route through useNavigate. Renders fully on zero arguments.
 */
export const CloudInfraFinalCta = defineCapsule({
  name: 'CloudInfraFinalCta',
  description:
    'Dark inverted final call-to-action band for a cloud-infrastructure / developer-platform SaaS landing page backed by shared Lakebed conversion state: a centered heading plus description on a primary background, dual scoped fullstack CTAs, and a row of trust checkmarks. Use as the closing conversion band for cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Primary CTA label (also becomes navigation target). */
    primaryCta: z.string().optional(),
    /** Secondary CTA label (also becomes navigation target). */
    secondaryCta: z.string().optional(),
    /** Trust bullets beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to deploy your first app?'
    const description =
      props.description ??
      'Join 12,000+ developers building on CloudShift. Start with $500 in free credits—no credit card required.'
    const primaryCta = props.primaryCta ?? 'Create free account'
    const secondaryCta = props.secondaryCta ?? 'Schedule demo'
    const trust = props.trust?.length
      ? props.trust
      : ['$500 free credits', 'No credit card required', 'Cancel anytime']

    const Check = ({ className }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ArrowRight = ({ className }) => (
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

    return (
      <CtaBand
        tone="primary"
        title={heading}
        subtitle={description}
        className={props.className}
      >
        <div className="flex flex-wrap justify-center gap-4">
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
            className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {primaryCta}
            <ArrowRight className="ml-2 size-5" />
          </SaasPlanActionButton>
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={secondaryCta}
            plan={secondaryCta}
            source="cta"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Sending
              </>
            }
            className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/40 px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
          >
            {secondaryCta}
          </SaasPlanActionButton>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
          {trust.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <Check className="size-5 text-chart-2" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </CtaBand>
    )
  },
})
