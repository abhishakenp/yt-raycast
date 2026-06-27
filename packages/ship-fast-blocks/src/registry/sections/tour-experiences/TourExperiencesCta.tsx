import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * TourExperiencesCta — closing call-to-action band for an adventure /
 * guided-tour brand. Composes the shared CtaBand composite on a primary-tone
 * surface with an eyebrow, a bold "Book your adventure" title, a supporting line,
 * and two routable actions (primary "Book a Tour" + outline "Talk to a guide").
 * Use as the conversion band before the footer on tour-operator, expedition, and
 * travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesCta = defineCapsule({
  name: 'TourExperiencesCta',
  description:
    "Closing call-to-action band for an adventure / guided-tour brand. Composes the shared CtaBand composite on a primary-tone surface with an eyebrow, a bold 'Book your adventure' title, a supporting line, and two routable actions (primary 'Book a Tour' + outline 'Talk to a guide'). Use as the conversion band before the footer on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Eyebrow / kicker above the title. */
    eyebrow: z.string().optional(),
    /** Band title. */
    title: z.string().optional(),
    /** Supporting subtitle line. */
    subtitle: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand
        tone="primary"
        eyebrow={props.eyebrow ?? 'Limited seats each departure'}
        title={props.title ?? 'Book your adventure'}
        subtitle={
          props.subtitle ??
          'Lock in your spot on a small-group tour led by local experts. Free cancellation up to 48 hours before you go.'
        }
        actions={[
          {
            label: props.primaryCta ?? 'Book a Tour',
            target: props.primaryTarget ?? 'Book a Tour',
            variant: 'primary',
          },
          {
            label: props.secondaryCta ?? 'Talk to a guide',
            target: props.secondaryTarget ?? 'Contact',
            variant: 'outline',
          },
        ]}
        className={props.className}
      />
    )
  },
})
