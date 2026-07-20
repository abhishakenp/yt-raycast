import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CrmCta — inverted diagonal-seam conversion band for a CRM / SaaS landing
 * page. A full-width bg-foreground/text-background band whose top edge cuts in
 * on a clip-path diagonal, with a giant ghost "CLOSE" watermark and a mono
 * "[ FINAL STAGE ]" micro-label: an asymmetric left-aligned block carries the
 * large tight-tracked headline, supporting paragraph, dual square CTAs (solid
 * background-on-dark primary + hairline ghost secondary, both with press
 * feedback) and a mono fine-print note. CTAs record trial / demo intent via
 * shared Lakebed state. Use near the bottom of a page to drive sign-ups for
 * CRM, sales-pipeline or B2B SaaS products. Renders fully with no props.
 */
export const CrmCta = defineCapsule({
  name: 'CrmCta',
  description:
    'Inverted diagonal-seam conversion band for a CRM / SaaS landing page backed by shared Lakebed conversion state: a bg-foreground/text-background band cut on a clip-path diagonal with a giant ghost CLOSE watermark and mono final-stage micro-label, an asymmetric left-aligned headline block, scoped trial/demo mutation buttons with hard press feedback, and a mono fine-print reassurance note. CTAs record real intent instead of dead route-only navigation.',
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
      <CtaBand
        tone="primary"
        className={cn(
          // Inversion band with a diagonal top seam — neighbor-independent.
          'relative overflow-hidden bg-foreground pt-8 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-12',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 right-0 text-background/[0.05] text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          CLOSE
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <MonoTag tone="inverted" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 bg-background"
            />
            Final stage
            <span aria-hidden="true" className="text-background/40">
              · [ won ]
            </span>
          </MonoTag>
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <CtaBandTitle className="max-w-3xl text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
                {heading}
              </CtaBandTitle>
              <CtaBandSubtitle className="mt-5 text-background/70 opacity-100">
                {description}
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
            </div>
          </div>
          <p className="font-mono text-xs text-background/50">{note}</p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
