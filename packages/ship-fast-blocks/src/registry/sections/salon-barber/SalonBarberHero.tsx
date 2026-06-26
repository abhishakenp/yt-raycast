import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

export const SalonBarberHero = defineComponent({
  name: 'SalonBarberHero',
  description:
    "Bespoke full-bleed hero for a modern barbershop or salon. Layers a confident grooming photograph behind a darkening overlay and gradient, then centers an eyebrow pill, a bold headline, supporting copy, and dual CTAs over it. A divider-separated hours strip sits beneath the buttons so visitors instantly know when to drop in. Use it as the opening viewport of a barbershop, salon, or men's grooming landing page when you want an editorial, high-contrast first impression.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    hours: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 2012 · Downtown'
    const heading = props.heading ?? 'Sharp cuts. Clean fades. Every time.'
    const subheading =
      props.subheading ??
      'Precision barbering and modern styling from a team that takes pride in the details. Walk in sharp, leave sharper.'
    const primaryCta = props.primaryCta ?? 'Book an Appointment'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'View Services'
    const secondaryTarget = props.secondaryTarget ?? 'Services'
    const imageAlt =
      props.imageAlt ??
      'modern barbershop interior with leather chairs and barber giving a precise fade haircut'
    const hours = props.hours?.length
      ? props.hours
      : ['Mon–Fri · 9am–8pm', 'Saturday · 9am–6pm', 'Sunday · 11am–5pm']

    return (
      <section
        className={cn('relative isolate overflow-hidden', props.className)}
      >
        <Image
          alt={imageAlt}
          w={1920}
          h={1080}
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-foreground/60"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent"
          aria-hidden="true"
        />

        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center sm:py-36 lg:px-8">
          <span className="inline-flex rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-background">
            {eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-background sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-background/80">
            {subheading}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryTarget)}
              className="rounded-full border border-border bg-card/10 px-8 py-3 font-semibold text-background transition hover:bg-card/20"
            >
              {secondaryCta}
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-background/80">
            {hours.flatMap((slot, i) =>
              i === 0
                ? [<span key={slot}>{slot}</span>]
                : [
                    <span
                      key={`d-${i}`}
                      className="h-4 w-px bg-background/30"
                      aria-hidden="true"
                    />,
                    <span key={slot}>{slot}</span>,
                  ],
            )}
          </div>
        </div>
      </section>
    )
  },
})
