import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FoodTruckContactCta — a dark, inverted closing contact CTA band. A foreground-filled,
 * centered section with a bold heading, a supporting paragraph, a pair of pill buttons
 * (a filled email CTA + an outlined phone CTA) and a small response-time note beneath.
 * Both buttons route through useNavigate. Use as the final call-to-action / get-in-touch
 * band for food trucks, caterers or street-food vendors prompting bookings and enquiries.
 */
export const FoodTruckContactCta = defineComponent({
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
    const go = useNavigate()
    const ctaHeading = props.heading ?? 'Ready to book the truck?'
    const ctaDesc =
      props.description ??
      'From office lunches to wedding receptions, we bring the flavor. Get in touch for a custom quote.'
    const ctaEmail = props.emailCta ?? 'Email Us'
    const ctaPhone = props.phoneCta ?? '(310) 555-1234'
    const ctaNote = props.note ?? 'Typical response time: under 24 hours'

    return (
      <section
        className={cn(
          'bg-foreground px-6 py-20 text-background',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{ctaHeading}</h2>
          <p className="mx-auto max-w-xl text-lg text-background/80">
            {ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => go(ctaEmail)}
              className="rounded-full bg-background px-8 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {ctaEmail}
            </button>
            <button
              type="button"
              onClick={() => go(ctaPhone)}
              className="rounded-full border border-background/40 px-8 py-3 font-medium transition-colors hover:bg-background/10"
            >
              {ctaPhone}
            </button>
          </div>
          <p className="pt-4 text-sm text-background/70">{ctaNote}</p>
        </div>
      </section>
    )
  },
})
