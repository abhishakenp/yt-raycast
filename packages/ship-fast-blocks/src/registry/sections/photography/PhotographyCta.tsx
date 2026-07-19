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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * PhotographyCta — a warm, centered booking band for a fine-art / wedding
 * photographer site. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an availability eyebrow, a serif headline, a short
 * supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Book your session" button (variant "primary", auto-inverted to
 * a light pill on the primary band) plus an outlined "View Pricing" button. Both
 * actions route through section-kit route links so neither is a dead link. Use near the
 * bottom of a photographer, studio, or elopement page to drive bookings.
 * Renders fully with no props via baked-in defaults.
 */
export const PhotographyCta = defineCapsule({
  name: 'PhotographyCta',
  description:
    "Warm, centered booking band for a fine-art / wedding photographer site built on the shared CtaBand composite at tone='primary': an availability eyebrow, a serif headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Book your session' button plus an outlined 'View Pricing' button). Both CTAs route through section-kit route links. Use near the bottom of a photographer, studio, or elopement page to drive session bookings.",
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
        <CtaBandInner>
          <CtaBandEyebrow>{availability}</CtaBandEyebrow>
          <CtaBandTitle>{headline}</CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
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
