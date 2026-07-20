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
 * DevToolContactCta — the page's full ink-inversion closing band for a
 * developer tool / API platform. A bg-foreground/text-background band cutting
 * in on a slanted clip-path seam, with a giant ghost ">_" watermark behind a
 * left-aligned mono session rail ("[ session ] ready to deploy"), an oversized
 * extrabold headline, a supporting paragraph, dual square-cornered fullstack
 * CTAs (light inverted primary with hard offset shadow + hairline-on-dark
 * secondary, both with press feedback), and a mono "#"-comment footnote. Use
 * as the final conversion section before the footer for developer tools, API
 * platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolContactCta = defineCapsule({
  name: 'DevToolContactCta',
  description:
    "Full ink-inversion closing band for a developer tool / API platform backed by shared Lakebed conversion state: a bg-foreground band cutting in on a slanted clip-path seam with a giant ghost '>_' watermark, a mono session rail, an oversized extrabold headline, supporting paragraph, dual scoped square fullstack CTAs (light inverted primary with hard offset shadow + hairline-on-dark secondary, both with press feedback), and a mono '#'-comment footnote. Use as the final conversion section before the footer for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to ship faster?'
    const description =
      props.description ??
      'Join 50,000+ developers building with DevStack. Start free, scale as you grow. No credit card required.'
    const primaryCta = props.primaryCta ?? 'Start Building Free'
    const secondaryCta = props.secondaryCta ?? 'Talk to Sales'
    const footnote =
      props.footnote ?? 'Free forever plan includes 10,000 requests/month'

    return (
      <CtaBand
        tone="muted"
        className={
          'relative overflow-hidden bg-foreground py-6 pt-16 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-20 lg:py-10 lg:pt-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-16 -right-4 font-mono text-[11rem] text-background/[0.05] sm:text-[16rem] lg:text-[20rem]">
          &gt;_
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl items-start gap-6 px-4 py-10 text-left sm:px-6 lg:px-8 lg:py-14"
        >
          <p
            aria-hidden="true"
            className="flex w-full items-center gap-3 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50"
          >
            <span className="size-2 bg-background/70" />[ session ] ready to
            deploy
          </p>
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold tracking-tighter text-background sm:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70">
            {description}
          </CtaBandSubtitle>
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-none bg-background px-8 py-3 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-foreground shadow-[4px_4px_0_0] shadow-background/30 transition-[transform,box-shadow,background-color] duration-150 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
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
                  Sending
                </>
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-none border border-background/30 bg-transparent px-8 py-3 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-background transition-[background-color,transform] duration-150 hover:bg-background/10 active:translate-y-px motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <p className="font-mono text-xs text-background/50">
            <span aria-hidden="true"># </span>
            {footnote}
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
