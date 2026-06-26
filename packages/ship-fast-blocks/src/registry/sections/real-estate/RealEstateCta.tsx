import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * RealEstateCta — a confident closing call-to-action band for a brokerage. A
 * rounded primary-toned panel centers an eyebrow, a large serif headline, a
 * supporting line, and dual CTAs (filled "Find Your Home" on the card surface +
 * outlined "Talk to an Agent"). Both CTAs route through useNavigate. Use to
 * convert near the bottom of a real-estate brokerage or agent page. Renders
 * fully with no props via baked-in defaults.
 */
export const RealEstateCta = defineComponent({
  name: 'RealEstateCta',
  description:
    "Confident closing call-to-action band for a brokerage: a rounded primary-toned panel centering an eyebrow, a large serif headline, a supporting line, and dual CTAs (filled 'Find Your Home' on the card surface + outlined 'Talk to an Agent'). Both CTAs route through useNavigate. Use to convert near the bottom of a real-estate brokerage or agent page.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large serif headline. */
    heading: z.string().optional(),
    /** Supporting line beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
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
    return (
      <CtaBand
        tone="primary"
        eyebrow={props.eyebrow ?? "Let's get started"}
        title={props.heading ?? 'Ready to find your home?'}
        subtitle={
          props.subheading ??
          "Tell us what you're looking for and we'll match you with an agent who knows the area — no pressure, no obligation."
        }
        actions={[
          {
            label: props.primaryCta ?? 'Find Your Home',
            target: props.primaryTarget ?? 'Buy',
            variant: 'primary',
          },
          {
            label: props.secondaryCta ?? 'Talk to an Agent',
            target: props.secondaryTarget ?? 'Agents',
            variant: 'outline',
          },
        ]}
        className={props.className}
      />
    )
  },
})
