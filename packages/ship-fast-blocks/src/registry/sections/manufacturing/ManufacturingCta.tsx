import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * ManufacturingCta — an inverted, slab-industrial closing call-to-action band for
 * a precision-manufacturing site. On a bg-foreground / text-background block cut
 * with a slanted clip-path seam along its top edge and carrying a giant ghost
 * watermark: a mono location/est. note, a giant extrabold uppercase heading, a
 * supporting paragraph, and dual squared CTA slabs with mechanical press feedback
 * (a solid background-on-foreground button plus a hollow outlined button). Both
 * CTAs route through section-kit route links. Tech-brutalist, industrial,
 * conversion-focused. Use as the final conversion prompt before the footer on
 * machine-shop, fabricator or contract-manufacturer pages. Renders fully with no
 * props via baked-in defaults.
 */
export const ManufacturingCta = defineCapsule({
  name: 'ManufacturingCta',
  description:
    'An inverted, slab-industrial closing call-to-action band for a precision-manufacturing site: on a bg-foreground / text-background block cut with a slanted clip-path seam along its top edge and carrying a giant ghost watermark, a mono location/est. note, a giant extrabold uppercase heading, a supporting paragraph, and dual squared CTA slabs with mechanical press feedback (a solid background-on-foreground button plus a hollow outlined button). Both CTAs route through section-kit route links. Tech-brutalist, industrial, conversion-focused. Use as the final conversion prompt before the footer on machine-shop, fabricator or contract-manufacturer pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to Start Your Project?'
    const description =
      props.description ??
      'Get a detailed quote within 24 hours. Our engineers review every submission for manufacturability and will suggest cost-saving alternatives when possible.'
    const primaryCta = props.primaryCta ?? 'Request a Quote'
    const secondaryCta = props.secondaryCta ?? 'Call (206) 555-1234'
    const note =
      props.note ??
      'Located in Kent, Washington • Serving customers nationwide since 1989'

    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden bg-foreground pt-10 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] ${props.className ?? ''}`}
      >
        <Watermark className="-bottom-6 -right-2 text-[9rem] leading-none text-background/[0.05] sm:text-[14rem]">
          QUOTE
        </Watermark>
        <CtaBandInner align="left" className="relative max-w-5xl">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold uppercase tracking-tight md:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/80">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2 gap-4">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none border-2 border-background bg-background px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground shadow-[5px_5px_0_0] shadow-background/40 transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-2 border-background bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-wide text-background transition-[transform,background-color,color] duration-150 hover:bg-background hover:text-foreground active:translate-x-[3px] active:translate-y-[3px] motion-reduce:transform-none"
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
