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
/**
 * PhotographyCta — a quiet, editorial booking band for a fine-art / wedding
 * photographer site. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: a mono, wide-tracked availability eyebrow, a serif headline,
 * a short supporting subheading, and a centered row of two square-edged
 * (rounded-none) pill CTAs with press feedback — a solid light "Book your
 * session" button (inverted against the primary band) plus a transparent
 * outlined "View Pricing" button. Both actions route through section-kit route
 * links so neither is a dead link. Use near the bottom of a photographer,
 * studio, or elopement page to drive bookings. Renders fully with no props via
 * baked-in defaults.
 */
export const PhotographyCta = defineCapsule({
  name: 'PhotographyCta',
  description:
    "Quiet, editorial booking band for a fine-art / wedding photographer site built on the shared CtaBand composite at tone='primary': a mono wide-tracked availability eyebrow, a serif headline, a short supporting subheading, and a centered row of two square-edged pill CTAs with press feedback (a solid light 'Book your session' button inverted against the primary band plus a transparent outlined 'View Pricing' button). Both CTAs route through section-kit route links. Use near the bottom of a photographer, studio, or elopement page to drive session bookings.",
  props: z.object({
    /** Booking headline (maps to CtaBand title). */
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
    /** Availability line shown as the band eyebrow. */
    availability: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const headline = props.headline ?? "Let's tell your story, beautifully"
    const subheading =
      props.subheading ??
      'Dates book up fast for the season — reach out to check availability and reserve your shoot before the calendar fills.'
    const primaryCta = props.primaryCta ?? 'Book your session'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'View Pricing'
    const secondaryTarget = props.secondaryTarget ?? 'Services'
    const availability = props.availability ?? 'Now booking 2025 & 2026'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner className="gap-6 py-20">
          <CtaBandEyebrow className="font-mono text-[11px] tracking-[0.22em]">
            {availability}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-balance font-serif text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-primary-foreground/40 bg-transparent text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary-foreground/10 active:translate-y-px motion-reduce:transform-none"
            >
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
