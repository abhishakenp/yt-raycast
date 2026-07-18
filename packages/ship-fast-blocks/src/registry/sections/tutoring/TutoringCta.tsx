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

export const TutoringCta = defineCapsule({
  name: 'TutoringCta',
  description:
    "Warm closing call-to-action band for tutoring sites, composing the CtaBand kit composite on a primary-toned surface. Renders a reassuring eyebrow about a satisfaction guarantee, an inviting 'Book your first session' title and subtitle, and two routed actions — a primary 'Book your first session' and an outline 'Talk to us'. Accepts public props to override the copy and CTA targets. Use it as the final conversion band of a tutoring page to gently nudge undecided families to take the first step.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow =
      props.eyebrow ?? 'First session 100% satisfaction guaranteed'
    const title = props.title ?? 'Book your first session'
    const subtitle =
      props.subtitle ??
      "Try us risk-free. If your first session isn't a great fit, it's on us — no questions asked. Let's help your learner thrive."
    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner align="center">
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{title}</CtaBandTitle>
          <CtaBandSubtitle>{subtitle}</CtaBandSubtitle>
          <CtaBandActions align="center">
            <CtaAction
              variant="primary"
              onClick={() => go(props.primaryTarget ?? 'Contact')}
            >
              {props.primaryCta ?? 'Book your first session'}
            </CtaAction>
            <CtaAction
              variant="outline"
              onClick={() => go(props.secondaryTarget ?? 'Contact')}
            >
              {props.secondaryCta ?? 'Talk to us'}
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
