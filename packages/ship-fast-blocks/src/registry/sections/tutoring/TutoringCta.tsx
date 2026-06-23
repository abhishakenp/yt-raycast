import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"
import type { KitAction } from "#/section-kit/types.ts"

export const TutoringCta = defineComponent({
  name: "TutoringCta",
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
    const eyebrow = props.eyebrow ?? "First session 100% satisfaction guaranteed"
    const title = props.title ?? "Book your first session"
    const subtitle =
      props.subtitle ??
      "Try us risk-free. If your first session isn't a great fit, it's on us — no questions asked. Let's help your learner thrive."
    const actions: KitAction[] = [
      {
        label: props.primaryCta ?? "Book your first session",
        target: props.primaryTarget ?? "Contact",
        variant: "primary",
      },
      {
        label: props.secondaryCta ?? "Talk to us",
        target: props.secondaryTarget ?? "Contact",
        variant: "outline",
      },
    ]

    return (
      <CtaBand
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={actions}
        tone="primary"
        align="center"
        className={props.className}
      />
    )
  },
})
