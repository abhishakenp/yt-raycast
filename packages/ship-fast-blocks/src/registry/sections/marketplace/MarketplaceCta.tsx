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
 * MarketplaceCta — bold, centered conversion band for a multi-vendor
 * marketplace / e-commerce home page. Thin configuration over the shared
 * `CtaBand` composite at `tone="primary"`: an optional eyebrow, a strong "Start
 * selling today" headline, a short supporting subheading, and a centered row of
 * two routable pill CTAs — a high-contrast "Start Selling" button (variant
 * "primary", auto-inverted to a light pill on the primary band) that routes to
 * seller onboarding, plus an outlined "Browse Marketplace" button (variant
 * "outline") that routes to category browsing. Both actions navigate through the
 * kit's section-kit route links. Use near the bottom of an online marketplace, multi-vendor
 * or maker/artisan platform, or retail aggregator to drive seller signups and
 * shopping. Renders fully with no props via vibrant baked-in defaults.
 */
export const MarketplaceCta = defineCapsule({
  name: 'MarketplaceCta',
  description:
    "Bold, centered conversion band for a multi-vendor marketplace / e-commerce home page built on the shared CtaBand composite at tone='primary': an optional eyebrow, a strong 'Start selling today' headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Start Selling' button routing to seller onboarding plus an outlined 'Browse Marketplace' button routing to category browsing). Both CTAs route through section-kit route links. Use near the bottom of an online marketplace, multi-vendor or maker/artisan platform, or retail aggregator to drive seller signups and shopping.",
  props: z.object({
    /** Optional eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Conversion headline (maps to CtaBand title). */
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
    const headline = props.headline ?? 'Start selling today'
    const subheading =
      props.subheading ??
      'Open your storefront in minutes and reach millions of buyers worldwide. No listing fees to get started — keep more of every sale.'
    const primaryCta = props.primaryCta ?? 'Start Selling'
    const primaryTarget = props.primaryTarget ?? 'Sell'
    const secondaryCta = props.secondaryCta ?? 'Browse Marketplace'
    const secondaryTarget = props.secondaryTarget ?? 'Categories'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{props.eyebrow}</CtaBandEyebrow>
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
