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
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * NutritionCta — full-width primary call-to-action band for a nutrition-coaching
 * or wellness site, built on the shared CtaBand kit composite. Renders an
 * optional eyebrow, a bold "Start your plan" title, a motivating subtitle, and a
 * row of two routable pill actions (filled primary "Start Now" + outlined "See
 * Plans") against a fresh primary background. All props are optional with baked
 * defaults so it renders standalone. Use as the closing conversion band on
 * nutrition coaches, dietitians, meal-plan subscriptions, diet / wellness
 * programs or healthy-eating apps.
 */
export const NutritionCta = defineCapsule({
  name: 'NutritionCta',
  description:
    "Full-width primary call-to-action band for a nutrition-coaching or wellness site, built on the shared CtaBand kit composite: an optional eyebrow, a bold 'Start your plan' title, a motivating subtitle, and a row of two routable pill actions (filled primary 'Start Now' + outlined 'See Plans') against a fresh primary background. Use as the closing conversion band on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps.",
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Your fresh start'
    const headline = props.headline ?? 'Start your plan'
    const subheading =
      props.subheading ??
      'Join 50,000+ people eating better without dieting. Get your personalized plan in minutes—cancel anytime.'
    const primaryCta = props.primaryCta ?? 'Start Now'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'See Plans'
    const secondaryTarget = props.secondaryTarget ?? 'Plans'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{headline}</CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" onClick={() => go(primaryTarget)}>
              {primaryCta}
            </CtaAction>
            <CtaAction variant="outline" onClick={() => go(secondaryTarget)}>
              {secondaryCta}
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
