import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * PhotographyCta — a warm, centered booking band for a fine-art / wedding
 * photographer site. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an availability eyebrow, a serif headline, a short
 * supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Book your session" button (variant "primary", auto-inverted to
 * a light pill on the primary band) plus an outlined "View Pricing" button. Both
 * actions route through useNavigate so neither is a dead link. Use near the
 * bottom of a photographer, studio, or elopement page to drive bookings.
 * Renders fully with no props via baked-in defaults.
 */
export const PhotographyCta = defineComponent({
  name: 'PhotographyCta',
  description:
    "Warm, centered booking band for a fine-art / wedding photographer site built on the shared CtaBand composite at tone='primary': an availability eyebrow, a serif headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Book your session' button plus an outlined 'View Pricing' button). Both CTAs route through useNavigate. Use near the bottom of a photographer, studio, or elopement page to drive session bookings.",
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
      <CtaBand
        tone="primary"
        eyebrow={availability}
        title={headline}
        subtitle={subheading}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: 'primary' },
          { label: secondaryCta, target: secondaryTarget, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
