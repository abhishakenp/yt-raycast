import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CloudInfraFinalCta — terminal-industrial inverted closing band for a cloud-
 * infrastructure / developer-platform SaaS landing page. A full
 * bg-foreground/text-background inversion band that cuts in on a slanted top
 * seam (opposite direction to the stats band), with a giant ghost `>_`
 * watermark behind. Centered mono `[ deploy ]` meta line, extrabold display
 * heading, supporting paragraph, dual square CTAs with press feedback
 * (background fill + hairline ghost outline), and a mono trust row with
 * primary status squares. CTAs route through section-kit route links. Renders
 * fully on zero arguments.
 */
export const CloudInfraFinalCta = defineCapsule({
  name: 'CloudInfraFinalCta',
  description:
    'Terminal-industrial inverted closing band for a cloud-infrastructure / developer-platform SaaS landing page backed by shared Lakebed conversion state: a bg-foreground inversion band with a slanted top seam and giant ghost watermark, centered mono meta line, extrabold display heading, supporting paragraph, dual scoped fullstack square CTAs with press feedback, and a mono trust row with primary status squares. Use as the closing conversion band for cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
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

    const ArrowRight = ({ className }: { className?: string }) => (
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
        className={
          'relative overflow-hidden bg-foreground pt-10 text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)] sm:pt-14' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-8 -right-2 font-mono text-[8rem] text-background/[0.05] sm:text-[12rem] lg:text-[16rem]">
          &gt;_
        </Watermark>
        <CtaBandInner className="relative gap-6 py-16 sm:py-20">
          <p
            aria-hidden="true"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
          >
            [ deploy ] ship it
          </p>
          <CtaBandTitle className="text-3xl font-extrabold tracking-tight text-background sm:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/60 opacity-100">
            {description}
          </CtaBandSubtitle>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
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
              className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
              <ArrowRight className="size-4" />
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
              className="inline-flex items-center justify-center gap-2 rounded-none border border-background/30 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-background/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {trust.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background/60"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 bg-background/70"
                />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
