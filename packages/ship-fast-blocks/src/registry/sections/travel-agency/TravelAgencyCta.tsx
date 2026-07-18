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

export const TravelAgencyCta = defineCapsule({
  name: 'TravelAgencyCta',
  description:
    "Closing call-to-action band for the Travel Agency page family. Composes the shared CtaBand kit composite in the primary tone to invite visitors to start planning, with a primary 'Plan a Trip' action and an outline 'Talk to an advisor' action. Use as the final conversion band before the footer. All copy and actions are prop-driven with wanderlust-themed defaults so it renders with no props.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryLabel: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryLabel: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>
            {props.eyebrow ?? 'Your next adventure awaits'}
          </CtaBandEyebrow>
          <CtaBandTitle>
            {props.title ?? 'Start planning your trip'}
          </CtaBandTitle>
          <CtaBandSubtitle>
            {props.subtitle ??
              "Tell us where you're dreaming of going and we'll craft a journey tailored just for you — no obligation, no pressure."}
          </CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction
              variant="primary"
              onClick={() => go(props.primaryTarget ?? 'Plan a Trip')}
            >
              {props.primaryLabel ?? 'Plan a Trip'}
            </CtaAction>
            <CtaAction
              variant="outline"
              onClick={() => go(props.secondaryTarget ?? 'Contact')}
            >
              {props.secondaryLabel ?? 'Talk to an advisor'}
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
