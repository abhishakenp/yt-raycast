import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * CybersecurityContactCta — terminal-stealth inverted closing band. A full ink
 * inversion (bg-foreground / text-background) that cuts in on a slanted
 * clip-path top seam, with a giant "//"-glyph ghost watermark and a
 * left-aligned asymmetric layout: a mono "[ ACCESS GRANTED ]" status rule, a
 * large extrabold heading, the supporting paragraph, a decorative mono
 * redaction line, square-edged dual CTAs (light-inverted primary with
 * hard-offset shadow + hairline secondary, both press feedback), and the mono
 * reassurance note. Both CTAs record scoped Lakebed demo/trial intent. Use as
 * the closing conversion band above the footer for cybersecurity vendors,
 * SOC/MDR providers, or any B2B security SaaS. Renders fully with no props via
 * baked-in demo-CTA defaults.
 */
export const CybersecurityContactCta = defineCapsule({
  name: 'CybersecurityContactCta',
  description:
    "Terminal-stealth inverted closing CTA band backed by shared Lakebed conversion state: a full ink-inversion band with a slanted clip-path top seam, giant ghost watermark, left-aligned mono '[ ACCESS GRANTED ]' status rule, large extrabold heading, supporting paragraph, decorative redaction line, square-edged scoped demo/trial mutation buttons with hard-offset shadow and press feedback, and a mono reassurance note. Use as the closing conversion band above the footer for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.",
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
        className={cn(
          'relative overflow-hidden bg-foreground pt-10 text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-8 bottom-[-3rem] text-[10rem] text-background/[0.05] sm:text-[16rem]">
          {'//'}
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <p className="flex w-full items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-background" />
              Final transmission
            </span>
            <span aria-hidden="true">[ access granted ]</span>
          </p>
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-base text-background/70 sm:text-lg">
            {description}
          </CtaBandSubtitle>
          <p
            aria-hidden="true"
            className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-background/40"
          >
            <span>channel</span>
            <span className="inline-block h-2.5 w-12 bg-background/80" />
            <span>secured</span>
            <span className="inline-block h-2.5 w-7 bg-background/40" />
          </p>
          <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:flex-row sm:gap-4">
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
              className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground shadow-[5px_5px_0_0] shadow-background/25 transition-all duration-150 hover:bg-background/90 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
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
              className="inline-flex items-center justify-center gap-2 rounded-none border border-background/40 bg-transparent px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:border-background hover:bg-background/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50">
            {note}
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
