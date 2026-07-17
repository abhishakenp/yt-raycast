import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * FoodTruckContactCta — a dark, inverted closing contact CTA band. A foreground-filled,
 * centered section with a bold heading, a supporting paragraph, a pair of pill buttons
 * (a filled email CTA + an outlined phone CTA) and a small response-time note beneath.
 * Both buttons route through useNavigate. Use as the final call-to-action / get-in-touch
 * band for food trucks, caterers or street-food vendors prompting bookings and enquiries.
 */
export const FoodTruckContactCta = defineCapsule({
  name: 'FoodTruckContactCta',
  description:
    'Dark, inverted closing contact CTA band: a foreground-filled, centered section with a bold heading, a supporting paragraph, a pair of pill buttons (a filled email CTA and an outlined phone CTA) and a small response-time note beneath. Both buttons route through useNavigate. Use as the final call-to-action / get-in-touch band for food trucks, caterers, street-food vendors or restaurants prompting catering bookings and enquiries.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    emailCta: z.string().optional(),
    phoneCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const ctaHeading = props.heading ?? 'Ready to book the truck?'
    const ctaDesc =
      props.description ??
      'From office lunches to wedding receptions, we bring the flavor. Get in touch for a custom quote.'
    const ctaEmail = props.emailCta ?? 'Email Us'
    const ctaPhone = props.phoneCta ?? '(310) 555-1234'
    const ctaNote = props.note ?? 'Typical response time: under 24 hours'

    return (
      <CtaBand
        tone="primary"
        eyebrow={ctaNote}
        title={ctaHeading}
        subtitle={ctaDesc}
        actions={[
          { label: ctaEmail, target: ctaEmail, variant: 'primary' },
          { label: ctaPhone, target: ctaPhone, variant: 'outline' },
        ]}
        className={`bg-foreground text-background ${props.className ?? ''}`}
      />
    )
  },
})
