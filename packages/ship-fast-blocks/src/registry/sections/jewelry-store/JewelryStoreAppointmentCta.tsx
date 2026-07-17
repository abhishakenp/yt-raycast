import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * JewelryStoreAppointmentCta — private-appointment closing CTA for a luxury
 * jewelry maison. A muted band with a dimmed full-cover background image and a
 * bottom-up fade-to-background gradient, fronting a centered column: a gold
 * eyebrow, an oversized serif headline, a relaxed subheading, and dual CTAs
 * (solid gold primary + bordered ghost). A bottom row lists boutique locations
 * (city + address) in up to three columns. Both CTAs route through useNavigate.
 * Use as the conversion-focused booking band for fine jewelers, diamond houses,
 * engagement-ring boutiques, or high-jewelry maisons. Renders fully with no props.
 */
export const JewelryStoreAppointmentCta = defineCapsule({
  name: 'JewelryStoreAppointmentCta',
  description:
    'Private-appointment closing CTA for a luxury jewelry maison: a muted band with a dimmed full-cover background image and a bottom-up fade-to-background gradient, fronting a centered column with a gold eyebrow, an oversized serif headline, a relaxed subheading, and dual CTAs (solid gold primary + bordered ghost). A bottom row lists boutique locations (city + address) in up to three columns. Both CTAs route through useNavigate. Use as the conversion-focused booking band for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    locations: z
      .array(z.object({ city: z.string(), address: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Begin Your Journey'
    const heading = props.heading ?? 'Experience Maison Noir'
    const description =
      props.description ??
      'Schedule a private appointment with our jewelry experts. Discover our collections in an intimate setting, or begin the journey to your bespoke creation.'
    const primaryCta = props.primaryCta ?? 'Book Private Appointment'
    const secondaryCta = props.secondaryCta ?? 'Virtual Consultation'
    const imageAlt =
      props.imageAlt ??
      'elegant jewelry display with pearls and diamonds in luxury boutique setting'
    const locations = props.locations?.length
      ? props.locations
      : [
          { city: 'Paris', address: 'Place Vendôme' },
          { city: 'New York', address: 'Fifth Avenue' },
          { city: 'London', address: 'Bond Street' },
        ]

    return (
      <CtaBand
        tone="muted"
        eyebrow={eyebrow}
        title={heading}
        subtitle={description}
        titleClassName="font-serif"
        className={`relative overflow-hidden ${props.className ?? ''}`}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            loading="lazy"
            className="h-full w-full object-cover opacity-20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background via-muted/90 to-muted/70"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => go(primaryCta)}
            className="inline-flex items-center justify-center bg-primary px-10 py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {primaryCta}
          </button>
          <button
            type="button"
            onClick={() => go(secondaryCta)}
            className="inline-flex items-center justify-center border border-border px-10 py-4 text-sm font-medium uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {secondaryCta}
          </button>
        </div>
        <div className="mx-auto grid max-w-3xl gap-8 text-center sm:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.city}>
              <p className="mb-1 font-medium text-foreground">{loc.city}</p>
              <p className="text-sm text-muted-foreground">{loc.address}</p>
            </div>
          ))}
        </div>
      </CtaBand>
    )
  },
})
