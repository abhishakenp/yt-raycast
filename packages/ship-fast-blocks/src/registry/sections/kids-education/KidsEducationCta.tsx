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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * KidsEducationCta — inverted playful-primary closing call-to-action band for a
 * kids / family learning platform. A full-width bg-foreground / text-background
 * section under a giant ghost watermark: a mono reassurance eyebrow, an extrabold
 * headline whose last word sits on a tilted bg-primary marker block, a
 * supporting paragraph, and dual sharp-cornered block CTAs (a light primary
 * block + a bordered outline block, both with hard offset token shadows and
 * mechanical press feedback). Every CTA routes through section-kit route links.
 * Use as the final conversion band before the footer for kids-education
 * startups, children's e-learning platforms, tutoring services, and family
 * learning apps. Renders fully with no props via baked-in defaults.
 */
export const KidsEducationCta = defineCapsule({
  name: 'KidsEducationCta',
  description:
    "Inverted playful-primary closing call-to-action band for a kids / family learning platform: a full-width bg-foreground / text-background section under a giant ghost watermark with a mono reassurance eyebrow, an extrabold headline whose last word sits on a tilted bg-primary marker block, a supporting paragraph, and dual sharp-cornered block CTAs (a light primary block + a bordered outline block, both with hard offset token shadows and press feedback). CTAs route through section-kit route links. Use as the final conversion band before the footer for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Section headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to Start the Adventure?'
    const description =
      props.description ??
      'Join 50,000+ families who have made learning a joyful daily ritual. Start your free 14-day trial today—no credit card required.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const secondaryCta = props.secondaryCta ?? 'Watch Demo'
    const note =
      props.note ?? 'Used by families in 35+ countries. Cancel anytime.'

    // Split the headline so the last word can carry the tilted marker highlight
    // without changing the copy.
    const headingWords = heading.trim().split(' ')
    const headingLast = headingWords.length > 1 ? headingWords.pop() : null
    const headingLead = headingWords.join(' ')

    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden bg-foreground text-background ${props.className ?? ''}`}
      >
        <Watermark className="-right-4 -top-6 text-[7rem] text-background/[0.06] sm:text-[11rem] lg:text-[14rem]">
          GO
        </Watermark>
        <CtaBandInner className="relative">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60 opacity-100">
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl lg:text-5xl">
            {headingLast ? (
              <>
                {headingLead}{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 inset-y-0.5 -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingLast}
                  </span>
                </span>
              </>
            ) : (
              heading
            )}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/70">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2 gap-4">
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink
                href={primaryCta}
                className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-background bg-background px-7 py-3.5 text-base font-bold text-foreground shadow-[5px_5px_0_0] shadow-primary/50 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-primary/50 active:translate-y-px active:shadow-none motion-reduce:transform-none"
              >
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink
                href={secondaryCta}
                className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-background bg-transparent px-7 py-3.5 text-base font-bold text-background transition-all duration-150 hover:-translate-y-0.5 hover:bg-background/10 active:translate-y-px motion-reduce:transform-none"
              >
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
