import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const SalonBarberOverview = defineCapsule({
  name: 'SalonBarberOverview',
  description:
    'Vintage-lite editorial overview / secondary hero for the Salon Barber page family. An asymmetric 7:5 split pairs a left copy column — mono index eyebrow, serif brand line, large serif heading, supporting copy, a hairline feature ledger, two sharp square route CTAs with press feedback, and a collapsed-border KPI ledger with serif numerals over mono labels — with a right hairline-framed photo plate (alt-driven Image) carrying a mono caption and a rotated sticker badge, over a faint serif ghost watermark. Use when composing a salon barber page or adding a focused salon barber band to a larger generated site.',
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
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Watermark className="top-6 left-[-2%] font-serif text-[7rem] italic tracking-tight text-foreground/[0.04] sm:text-[10rem] lg:text-[13rem]">
          {brand.split(' ')[0] ?? ''}
        </Watermark>

        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
            {/* Copy column. */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <MonoTag tone="primary">{eyebrow}</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-foreground/20"
                />
                <span className="font-serif text-sm italic text-muted-foreground">
                  {brand}
                </span>
              </div>
              <h2 className="mt-5 max-w-2xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
              <p className="mt-5 max-w-xl border-l-2 border-primary/40 pl-5 text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>

              <ul className="mt-8 max-w-md divide-y divide-foreground/12 border-y border-foreground/12">
                {features.map((feature: string) => (
                  <li
                    key={feature}
                    className="flex items-baseline gap-3 py-2.5 text-sm text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] text-primary"
                    >
                      +
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <NavbarRouteLink
                  href={primaryCta}
                  className="inline-flex items-center justify-center border border-foreground bg-foreground px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-[transform,background-color,color] duration-150 hover:bg-foreground/85 active:translate-y-px"
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  href={secondaryCta}
                  className="inline-flex items-center justify-center border border-foreground/30 bg-transparent px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-[transform,background-color,color] duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px"
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>

              <dl className="mt-10 grid grid-cols-3 divide-x divide-foreground/15 border-y border-foreground/15">
                {stats.map((stat: { value: string; label: string }) => (
                  <div
                    key={stat.label}
                    className="px-4 py-5 first:pl-0 sm:px-6"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-serif text-3xl font-medium tabular-nums text-foreground sm:text-4xl">
                      {stat.value}
                    </dd>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </dl>
            </div>

            {/* Framed photo plate. */}
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 bg-muted/60"
              />
              <div className="relative border border-foreground/20 bg-card p-2.5">
                <div className="aspect-[4/5] overflow-hidden">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={1000}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2.5 px-1 pt-2.5 pb-0.5">
                  <MonoTag tone="faint" className="text-[10px]">
                    Fig. 01 — {brand}
                  </MonoTag>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-foreground/15"
                  />
                </div>
              </div>
              <span
                aria-hidden="true"
                className="absolute -top-3 -left-3 -rotate-3 border border-foreground/25 bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                Est. Craft
              </span>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
