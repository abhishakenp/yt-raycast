import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

export const SalonBarberOverview = defineCapsule({
  name: 'SalonBarberOverview',
  description:
    'Reusable overview / hero section for the Salon Barber page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: eyebrow, large heading, supporting copy, dual CTAs, feature pills, KPI strip, and an image panel rendered through the alt-driven Image component. Use when composing a salon barber page or adding a focused salon barber band to a larger generated site.',
  props: z.object({
    brand: z.string().optional(),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    features: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Salon Barber'
    const eyebrow = props.eyebrow ?? 'Salon Barber section'
    const heading =
      props.heading ?? 'Salon Barber experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Salon Barber page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Salon Barber website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built salon barber layout',
          'Token-based styling',
          'Prompt-safe content props',
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '01',
            label: 'Reusable section',
          },
          {
            value: '100%',
            label: 'Token compliant',
          },
          {
            value: '0',
            label: 'Image URLs',
          },
        ]

    return (
      <section
        className={cn(
          'overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
              {brand}
            </p>
            <h2 className="max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {subheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute inset-6 rounded-3xl bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
              <Image
                alt={imageAlt}
                w={900}
                h={700}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="border-t border-border bg-card/95 p-6">
                <p className="text-sm font-semibold text-card-foreground">
                  {brand}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Section-level building block for generated multi-page
                  experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
