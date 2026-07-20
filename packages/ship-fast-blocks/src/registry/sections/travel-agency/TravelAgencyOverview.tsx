import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const TravelAgencyOverview = defineCapsule({
  name: 'TravelAgencyOverview',
  description:
    'Editorial-wanderlust overview band for the Travel Agency page family. An asymmetric 5/7 split: a left column with a mono index eyebrow, a brand kicker, an oversized heading, supporting copy, rotated hairline stamp chips, and dual sharp-cornered route-link CTAs (solid + outline, press-responsive); a right full-bleed destination plate with a single hard offset shadow and a hairline caption bar rendered through the alt-driven Image component; and a full-width collapsed-border stat ledger below with tabular values and mono labels, over a giant ghost watermark. Use when composing a curated travel-agency page or adding a focused travel-agency band to a larger generated site.',
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
    const brand = props.brand ?? 'Travel Agency'
    const eyebrow = props.eyebrow ?? 'Travel Agency section'
    const heading =
      props.heading ?? 'Travel Agency experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Travel Agency page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Travel Agency website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built travel agency layout',
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
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-6 text-[9rem] sm:text-[13rem]">
          {brand.split(' ')[0]}
        </Watermark>
        <Container size="xl" className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="flex flex-col lg:col-span-5">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="size-2 bg-primary" />
                <MonoTag>{eyebrow}</MonoTag>
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                {brand}
              </p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
                {subheading}
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {features.map((feature: string, i: number) => (
                  <span
                    key={feature}
                    className={cn(
                      'inline-flex items-center border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground',
                      i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                    )}
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center bg-primary px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center border border-foreground px-7 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,color,transform] duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>

            <div className="lg:col-span-7">
              <figure className="border border-border bg-card shadow-[8px_8px_0_0] shadow-foreground">
                <div className="overflow-hidden">
                  <Image
                    alt={imageAlt}
                    w={900}
                    h={700}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                  <span className="text-sm font-semibold text-card-foreground">
                    {brand}
                  </span>
                  <MonoTag tone="faint">Section-level building block</MonoTag>
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 border-l border-t border-border sm:grid-cols-3">
            {stats.map((stat: { value: string; label: string }) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 border-b border-r border-border p-6 sm:p-8"
              >
                <span className="text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                  {stat.value}
                </span>
                <MonoTag>{stat.label}</MonoTag>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
