import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'
import type { KitAction } from '#/section-kit/types.ts'

export const PetVeterinaryCta = defineComponent({
  name: 'PetVeterinaryCta',
  description:
    "Warm closing call-to-action band for a veterinary clinic site, composing the CtaBand kit composite on a primary-toned surface. Renders a caring eyebrow, an inviting 'Schedule your pet's visit' title and subtitle, and two routed actions — a primary 'Book Appointment' and an outline 'Call Us'. Accepts public props to override the copy and CTA targets. Use it as the final conversion band of a pet-care page to gently nudge pet parents to take the next step.",
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
    const eyebrow = props.eyebrow ?? "We can't wait to meet your furry friend"
    const headline = props.headline ?? "Schedule your pet's visit"
    const subheading =
      props.subheading ??
      "Compassionate, gentle care is just a click away. Book online or give us a call — we'll treat your pet like family."
    const actions: KitAction[] = [
      {
        label: props.primaryCta ?? 'Book Appointment',
        target: props.primaryTarget ?? 'Contact',
        variant: 'primary',
      },
      {
        label: props.secondaryCta ?? 'Call Us',
        target: props.secondaryTarget ?? 'Contact',
        variant: 'outline',
      },
    ]

    return (
      <CtaBand
        eyebrow={eyebrow}
        title={headline}
        subtitle={subheading}
        actions={actions}
        tone="primary"
        align="center"
        className={props.className}
      />
    )
  },
})
