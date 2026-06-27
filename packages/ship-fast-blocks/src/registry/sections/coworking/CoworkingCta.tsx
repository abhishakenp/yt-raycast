import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * CoworkingCta — bold, centered closing band for a coworking or shared-workspace
 * page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an eyebrow, a strong headline, a short supporting line, and
 * a centered row of two routable pill CTAs — a high-contrast "Tour the space"
 * button (variant "primary", auto-inverted on the primary band) plus an outlined
 * "View pricing" button (variant "outline"). Both actions navigate through the
 * kit's useNavigate so neither is a dead link. Use near the bottom of a
 * coworking, shared-office, or flex-office page to drive tour bookings. Renders
 * fully with no props via bright, modern baked-in defaults.
 */
export const CoworkingCta = defineCapsule({
  name: 'CoworkingCta',
  description:
    "Bold, centered closing CTA band for a coworking or shared-workspace page built on the shared CtaBand composite at tone='primary': an eyebrow, a strong headline, a short supporting line, and a centered row of two pill CTAs (a high-contrast 'Tour the space' button plus an outlined 'View pricing' button). Both CTAs route through useNavigate. Use near the bottom of a coworking, shared-office, or flex-office page to drive tour bookings and pricing views.",
  props: z.object({
    /** Small eyebrow label above the headline. */
    eyebrow: z.string().optional(),
    /** CTA headline (maps to CtaBand title). */
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
    return (
      <CtaBand
        tone="primary"
        eyebrow={props.eyebrow ?? 'Your desk is waiting'}
        title={props.headline ?? 'Come see why members never want to leave'}
        subtitle={
          props.subheading ??
          'Book a free walkthrough and grab a coffee on us — no pressure, no contracts, just a look at where your best work happens.'
        }
        actions={[
          {
            label: props.primaryCta ?? 'Tour the space',
            target: props.primaryTarget ?? 'Book a Tour',
            variant: 'primary',
          },
          {
            label: props.secondaryCta ?? 'View pricing',
            target: props.secondaryTarget ?? 'Pricing',
            variant: 'outline',
          },
        ]}
        className={props.className}
      />
    )
  },
})
