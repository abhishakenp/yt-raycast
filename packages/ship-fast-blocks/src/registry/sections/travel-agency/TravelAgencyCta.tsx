import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

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
    return (
      <CtaBand
        eyebrow={props.eyebrow ?? 'Your next adventure awaits'}
        title={props.title ?? 'Start planning your trip'}
        subtitle={
          props.subtitle ??
          "Tell us where you're dreaming of going and we'll craft a journey tailored just for you — no obligation, no pressure."
        }
        actions={[
          {
            label: props.primaryLabel ?? 'Plan a Trip',
            target: props.primaryTarget ?? 'Plan a Trip',
            variant: 'primary',
          },
          {
            label: props.secondaryLabel ?? 'Talk to an advisor',
            target: props.secondaryTarget ?? 'Contact',
            variant: 'outline',
          },
        ]}
        tone="primary"
        className={props.className}
      />
    )
  },
})
