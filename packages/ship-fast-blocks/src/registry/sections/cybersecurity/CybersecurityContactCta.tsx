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
 * CybersecurityContactCta — dark final demo call-to-action band. A full-bleed
 * brand-surface section, centered: a large heading, a wide supporting
 * paragraph, dual CTAs (solid inverted primary + outlined secondary), and a
 * small reassurance note underneath. Both CTAs route through section-kit route links. Use as
 * the closing conversion band above the footer for cybersecurity vendors,
 * SOC/MDR providers, or any B2B security SaaS. Renders fully with no props via
 * baked-in demo-CTA defaults.
 */
export const CybersecurityContactCta = defineCapsule({
  name: 'CybersecurityContactCta',
  description:
    'Dark final demo call-to-action band backed by shared Lakebed conversion state: a full-bleed brand-surface section with a large heading, supporting paragraph, scoped demo/trial mutation buttons, and a small reassurance note. Use as the closing conversion band above the footer for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
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
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
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
                  Scheduling
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </SaasPlanActionButton>
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={secondaryCta}
              plan={secondaryCta}
              source="cta"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Starting
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/40 bg-transparent px-8 py-4 text-lg font-semibold text-background transition-colors hover:bg-background/10 disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <p className="text-sm text-background/50">{note}</p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
