import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'

/**
 * SaasCta — inverted diagonal-seam conversion band for the bottom of a SaaS /
 * AI-product landing page. A full-width bg-foreground/text-background band whose
 * top edge cuts in on a clip-path diagonal, with a giant ghost "START"
 * watermark and a mono reassurance eyebrow: an asymmetric left-aligned block
 * carries the large tight-tracked headline and supporting paragraph, and dual
 * square CTAs (solid background-on-dark primary + hairline ghost secondary, both
 * with hard press feedback) record trial / demo intent through shared Lakebed
 * conversion state. Use as the closing call-to-action for SaaS, API, or B2B
 * product pages. Renders fully with no props via baked-in defaults.
 */
export const SaasCta = defineCapsule({
  name: 'SaasCta',
  description:
    'Inverted diagonal-seam conversion band for the bottom of a SaaS / AI-product landing page backed by shared Lakebed conversion state: a bg-foreground/text-background band cut on a clip-path diagonal with a giant ghost START watermark and a mono reassurance eyebrow, an asymmetric left-aligned headline block, and scoped trial/demo mutation buttons with hard press feedback. CTA buttons record trial/demo intent instead of dead route-only navigation. Use as the closing call-to-action for SaaS, API, or B2B product pages.',
  props: z.object({
    /** Centered headline on the band. */
    heading: z.string().optional(),
    /** Supporting line under the headline. */
    subheading: z.string().optional(),
    /** Primary contrast CTA label. */
    primaryCta: z.string().optional(),
    /** Optional outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note shown as the band eyebrow. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to reclaim your day?'
    const subheading =
      props.subheading ??
      'Join 12,000+ professionals who let Chronos AI handle the scheduling. Get started in under two minutes — no setup, no hassle.'
    const primaryCta = props.primaryCta ?? 'Start free trial'
    const secondaryCta = props.secondaryCta ?? 'Book demo'
    const note = props.note ?? 'No credit card required • 14-day free trial'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          // Inversion band with a diagonal top seam — neighbor-independent.
          'relative overflow-hidden bg-foreground pt-8 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-12',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 right-0 text-[7rem] text-background/[0.05] sm:text-[11rem] lg:text-[15rem]">
          START
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <CtaBandEyebrow className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 bg-background"
            />
            {note}
          </CtaBandEyebrow>
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <CtaBandTitle className="max-w-3xl text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
                {heading}
              </CtaBandTitle>
              <CtaBandSubtitle className="mt-5 text-background/70 opacity-100">
                {subheading}
              </CtaBandSubtitle>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4">
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
                className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 text-center font-semibold text-foreground shadow-[5px_5px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
              >
                {primaryCta}
              </SaasPlanActionButton>
              {secondaryCta ? (
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
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-background/40 px-8 py-4 text-center font-semibold text-background transition-[transform,background-color] duration-150 hover:bg-background/10 active:translate-y-px motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              ) : null}
            </div>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
