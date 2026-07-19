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
 * PortfolioCta — a bold, centered collaboration band for a creative-individual
 * portfolio. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an availability eyebrow, a strong headline, a short
 * supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Let's work together" button (variant "primary", auto-inverted
 * to a light pill on the primary band) plus an outlined "View Work" button. Both
 * actions route through section-kit route links so neither is a dead link. Use near the
 * bottom of a designer, motion artist, or director personal site to drive
 * project inquiries. Renders fully with no props via baked-in defaults.
 */
export const PortfolioCta = defineCapsule({
  name: 'PortfolioCta',
  description:
    "Bold, centered collaboration band for a creative-individual portfolio built on the shared CtaBand composite at tone='primary': an availability eyebrow, a strong headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Let's work together' button plus an outlined 'View Work' button). Both CTAs route through section-kit route links. Use near the bottom of a designer, motion artist, or director personal site to drive project inquiries.",
  props: z.object({
    /** Collaboration headline (maps to CtaBand title). */
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
    const headline = props.headline ?? 'Have a project in mind?'
    const subheading =
      props.subheading ??
      "I take on a handful of collaborations each quarter. Tell me about your idea and let's build something worth remembering."
    const primaryCta = props.primaryCta ?? "Let's work together"
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'View Work'
    const secondaryTarget = props.secondaryTarget ?? 'Work'
    const availability = props.availability ?? 'Available for new projects'

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
