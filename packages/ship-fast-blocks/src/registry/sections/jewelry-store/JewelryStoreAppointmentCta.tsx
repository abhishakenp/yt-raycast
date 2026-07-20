import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { AppointmentBand } from '#/section-kit/AppointmentBand.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { CtaAction } from '#/section-kit/CtaBand.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Image } from '#/lib/img.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * JewelryStoreAppointmentCta — private-appointment closing CTA for a luxury
 * jewelry maison. A muted band with a dimmed full-cover background image and a
 * bottom-up fade-to-background gradient, fronting a generous centered column: a
 * mono micro-label kicker, an oversized serif headline, a relaxed subheading, and
 * dual square CTAs (a solid dark primary + a hairline-outline ghost, both with
 * press feedback). A bottom row lists boutique locations as museum labels (serif
 * city + mono address) in up to three columns. Both CTAs route through
 * section-kit route links. Use as the conversion-focused booking band for fine
 * jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.
 * Renders fully with no props.
 */
export const JewelryStoreAppointmentCta = defineCapsule({
  name: 'JewelryStoreAppointmentCta',
  description:
    'Private-appointment closing CTA for a luxury jewelry maison: a muted band with a dimmed full-cover background image and a bottom-up fade-to-background gradient, fronting a generous centered column with a mono micro-label kicker, an oversized serif headline, a relaxed subheading, and dual square CTAs (a solid dark primary + a hairline-outline ghost, both with press feedback). A bottom row lists boutique locations as museum labels (serif city + mono address) in up to three columns. Both CTAs route through section-kit route links. Use as the conversion-focused booking band for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
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
      <AppointmentBand
        variant="muted"
        className={`relative overflow-hidden py-24 lg:py-32 ${props.className ?? ''}`}
      >
        <SectionHeading
          eyebrow={eyebrow}
          title={heading}
          subtitle={description}
          className="mb-10 gap-0"
          eyebrowClassName="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
          titleClassName="mb-6 max-w-2xl font-serif text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          subtitleClassName="max-w-2xl text-lg leading-relaxed text-muted-foreground"
        />
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
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <CtaAction
            variant="primary"
            className="rounded-none bg-foreground px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
            asChild
          >
            <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
          </CtaAction>
          <CtaAction
            variant="outline"
            className="rounded-none border border-border bg-transparent px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-[border-color,color,transform] duration-150 hover:border-foreground hover:text-foreground active:translate-y-px"
            asChild
          >
            <NavbarRouteLink href={secondaryCta}>
              {secondaryCta}
            </NavbarRouteLink>
          </CtaAction>
        </div>
        <ResponsiveGrid
          cols="1-3"
          className="mx-auto mt-6 max-w-3xl gap-8 border-t border-border pt-10 text-center"
        >
          {locations.map((loc) => (
            <div key={loc.city}>
              <p className="font-serif text-xl font-normal text-foreground">
                {loc.city}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {loc.address}
              </p>
            </div>
          ))}
        </ResponsiveGrid>
      </AppointmentBand>
    )
  },
})
