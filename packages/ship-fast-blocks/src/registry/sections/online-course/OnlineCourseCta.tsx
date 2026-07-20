import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { GraphPaper, Watermark } from '#/section-kit/Decor.tsx'
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
/**
 * OnlineCourseCta — "Curriculum LMS" inverted enrollment band for an
 * online-course page. Thin configuration over the shared CtaBand composite,
 * flipped to a full bg-foreground / text-background inversion entered through a
 * slanted clip-path seam over a graph-paper texture and a giant ghost "GO"
 * watermark: a bracketed mono reassurance eyebrow ("[ 30-day money-back
 * guarantee ]"), a strong "Enroll now" headline, a short supporting
 * subheading, and a row of two routable CTAs — a sharp-cornered high-contrast
 * "Enroll now" block (bg-background, hard offset shadow, press feedback,
 * target "Pricing") plus a bracketed mono outline "View curriculum" button.
 * Both actions navigate through the kit's route links so neither is a dead
 * link. Use near the bottom of an e-learning, bootcamp, or academy landing
 * page to drive enrollments. Renders fully with no props.
 */
export const OnlineCourseCta = defineCapsule({
  name: 'OnlineCourseCta',
  description:
    "Curriculum-LMS inverted enrollment band for an online-course page built on the shared CtaBand composite: a full bg-foreground/text-background inversion entered through a slanted clip-path seam over a graph-paper texture and a giant ghost 'GO' watermark, holding a bracketed mono reassurance eyebrow ('[ 30-day money-back guarantee ]'), a strong 'Enroll now' headline, a short supporting subheading, and a row of two routable CTAs (a sharp-cornered high-contrast 'Enroll now' block with a hard offset shadow and press feedback targeting Pricing plus a bracketed mono outline 'View curriculum' button). Both CTAs route through section-kit route links. Use near the bottom of an e-learning, bootcamp, or academy landing page to drive enrollments.",
  props: z.object({
    /** Reassurance line shown as the band eyebrow. */
    eyebrow: z.string().optional(),
    /** Enrollment headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '30-day money-back guarantee'
    const headline = props.headline ?? 'Enroll now'
    const subheading =
      props.subheading ??
      "Join thousands of learners building real skills. Start today — if it's not for you, get a full refund within 30 days."
    const primaryCta = props.primaryCta ?? 'Enroll now'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'View curriculum'
    const secondaryTarget = props.secondaryTarget ?? 'Courses'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.06]" />
        <Watermark
          aria-hidden="true"
          className="-right-4 top-6 font-mono text-[9rem] text-background/[0.05] sm:text-[16rem]"
        >
          GO
        </Watermark>
        <CtaBandInner className="relative items-start pt-24 text-left lg:pt-28">
          <CtaBandEyebrow className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-background/70 opacity-100">
            <span aria-hidden="true" className="text-background/50">
              [{' '}
            </span>
            {eyebrow}
            <span aria-hidden="true" className="text-background/50">
              {' '}
              ]
            </span>
          </CtaBandEyebrow>
          <CtaBandTitle className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl lg:text-6xl">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-xl text-background/70 opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-4 justify-start gap-4">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-foreground shadow-[5px_5px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-background/90 active:translate-y-px active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="gap-2 rounded-none border border-background/40 bg-transparent px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-[0.12em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px motion-reduce:transform-none"
            >
              <NavbarRouteLink href={secondaryTarget}>
                <span aria-hidden="true">[</span>
                {secondaryCta}
                <span aria-hidden="true">]</span>
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
