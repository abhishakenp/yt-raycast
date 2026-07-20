import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { OverviewSection } from '#/section-kit/OverviewSection.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * TestimonialsOverview — an editorial "quote wall" hero band for a TESTIMONIALS
 * page family. The signature is oversized serif ghost quotation marks used as
 * watermarks. The band opens with an asymmetric 7:5 masthead: a mono metadata
 * rail (primary square · eyebrow —— hairline rule —— brand mono tag) above a
 * huge extrabold tight-tracked heading and lead with square-edged dual CTAs
 * (press feedback), beside a -1deg-tilted alt-driven 4:3 portrait plate in a
 * sharp double frame with a primary-tinted offset block and a mono caption /
 * serif quote-mark footer. Below, on a bg-muted/40 band cut in on a slanted
 * clip-path seam, the quote wall: one inverted bg-foreground/text-background
 * featured pull-quote (first feature) with a giant ghost quotation mark, then
 * the remaining feature quotes as staggered ±translate hairline-framed cards on
 * a two-column grid with alternating rotation, each with its own ghost quote
 * mark and a mono source label + index numeral. It closes with a collapsed-
 * border stats ledger — giant tabular numerals over ghost index numerals with
 * mono labels. Tokens-only; the CTAs route through section-kit route links with
 * hrefs unchanged. Use when composing a testimonials / social-proof page or
 * adding a focused testimonials band to a larger generated site. Renders fully
 * with no props via baked-in defaults.
 */
export const TestimonialsOverview = defineCapsule({
  name: 'TestimonialsOverview',
  description:
    'Editorial "quote wall" hero band for a Testimonials page family, signed by oversized serif ghost quotation-mark watermarks. An asymmetric 7:5 masthead (mono metadata rail with primary square + eyebrow, hairline rule, brand mono tag) sits above a huge extrabold tight-tracked heading, a lead, and square-edged dual CTAs with press feedback, beside a -1deg-tilted alt-driven 4:3 portrait plate in a sharp double frame with a primary-tinted offset block and a mono/quote-mark footer. Below on a slanted-seam bg-muted band, the quote wall pairs one inverted bg-foreground/text-background featured pull-quote (first feature, giant ghost quote mark) with the remaining feature quotes as staggered ±translate hairline-framed cards carrying mono source labels and index numerals, then closes with a collapsed-border stats ledger of giant tabular numerals over ghost index numerals with mono labels. Tokens-only; CTAs route through section-kit route links. Use when composing a testimonials / social-proof page or adding a focused testimonials band to a larger generated site.',
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
    const brand = props.brand ?? 'Testimonials'
    const eyebrow = props.eyebrow ?? 'Testimonials section'
    const heading =
      props.heading ?? 'Testimonials experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Testimonials page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Testimonials website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built testimonials layout',
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

    const wallCards = features.slice(1)

    return (
      <OverviewSection className={cn('relative py-0 sm:py-0', props.className)}>
        {/* ---------- Masthead: editorial rail + portrait plate ---------- */}
        <div className="relative overflow-hidden py-16 pt-20 sm:py-24 sm:pt-28 lg:py-28 lg:pt-32">
          {/* Giant ghost quotation-mark watermark — the signature. */}
          <Watermark className="-top-16 right-[-2rem] font-serif text-[15rem] leading-none text-foreground/[0.05] sm:text-[22rem] lg:text-[30rem]">
            &rdquo;
          </Watermark>

          <Container size="xl" className="relative">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                {/* Mono metadata rail: eyebrow —— hairline rule —— brand. */}
                <div className="flex items-center gap-4">
                  <MonoTag className="flex items-center gap-2.5 tracking-[0.25em]">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    {eyebrow}
                  </MonoTag>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  <MonoTag tone="faint" className="shrink-0">
                    {brand}
                  </MonoTag>
                </div>

                <h2 className="mt-8 max-w-2xl text-balance text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                  {heading}
                </h2>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  {subheading}
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px"
                    href={primaryCta}
                  >
                    {primaryCta}
                  </NavbarRouteLink>
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center rounded-none border border-border bg-background px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-all duration-150 hover:bg-muted active:translate-y-px"
                    href={secondaryCta}
                  >
                    {secondaryCta}
                  </NavbarRouteLink>
                </div>
              </div>

              {/* Tilted portrait plate with primary offset block + mono footer. */}
              <div className="relative -mx-1 -rotate-1 sm:mx-0 lg:col-span-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/25 bg-primary/5"
                />
                <div className="relative overflow-hidden rounded-none border-2 border-foreground/20 bg-card">
                  <Image
                    alt={imageAlt}
                    w={900}
                    h={760}
                    loading="lazy"
                    className="aspect-[4/3] size-full object-cover"
                  />
                  <div className="flex items-center justify-between border-t-2 border-foreground/20 bg-background px-4 py-3">
                    <MonoTag className="tracking-[0.2em]">{brand}</MonoTag>
                    <span
                      aria-hidden="true"
                      className="select-none font-serif text-3xl leading-none text-primary/40"
                    >
                      &rdquo;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* ---------- Quote wall on a slanted-seam muted band ---------- */}
        <div className="relative overflow-hidden bg-muted/40 py-16 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36">
          <Container size="xl" className="relative">
            <MonoTag className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              In their words
            </MonoTag>

            {/* Inverted featured pull-quote (first feature). */}
            <figure className="relative mt-8 overflow-hidden rounded-none bg-foreground p-8 text-background sm:p-12 lg:p-16">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -top-12 select-none font-serif text-[12rem] leading-none text-background/10 sm:text-[16rem]"
              >
                &rdquo;
              </span>
              <blockquote className="relative max-w-3xl text-pretty font-serif text-2xl font-medium italic leading-[1.2] tracking-tight text-background sm:text-3xl lg:text-4xl">
                &ldquo;{features[0]}&rdquo;
              </blockquote>
              <figcaption className="relative mt-8 flex items-center gap-3">
                <span aria-hidden="true" className="size-2 bg-background/60" />
                <MonoTag tone="inverted" className="tracking-[0.2em]">
                  {brand} · 01
                </MonoTag>
              </figcaption>
            </figure>

            {/* Remaining feature quotes as staggered hairline cards. */}
            {wallCards.length ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-12">
                {wallCards.map((feature, i) => (
                  <figure
                    key={feature}
                    className={cn(
                      'relative overflow-hidden rounded-none border border-border bg-background p-7 sm:p-8',
                      i % 2 === 0 ? '-rotate-1 sm:translate-y-6' : 'rotate-1',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[8rem] leading-none text-foreground/[0.06]"
                    >
                      &rdquo;
                    </span>
                    <blockquote className="relative text-pretty font-serif text-lg italic leading-snug text-foreground sm:text-xl">
                      &ldquo;{feature}&rdquo;
                    </blockquote>
                    <figcaption className="relative mt-6 flex items-center justify-between border-t border-border pt-4">
                      <MonoTag>{brand}</MonoTag>
                      <MonoTag tone="faint" className="tabular-nums">
                        {String(i + 2).padStart(2, '0')}
                      </MonoTag>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </Container>
        </div>

        {/* ---------- Stats ledger: collapsed-border index numerals ---------- */}
        <div className="bg-background py-16 sm:py-20 lg:py-24">
          <Container size="xl">
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
              <MonoTag className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                By the numbers
              </MonoTag>
              <MonoTag tone="faint" className="tabular-nums">
                {String(stats.length).padStart(2, '0')} / index
              </MonoTag>
            </div>
            <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3">
              {stats.map((stat, i) => {
                const __iv__ = stat as { value: string; label: string }
                return (
                  <div
                    key={`${__iv__.label}-${i}`}
                    className="relative overflow-hidden border-b border-r border-border p-5 sm:p-8"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-2 select-none font-mono text-4xl font-bold tabular-nums leading-none text-foreground/[0.06] sm:text-6xl"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative text-[clamp(1.75rem,5vw,3.5rem)] font-extrabold leading-none tracking-tighter text-foreground tabular-nums">
                      {__iv__.value}
                    </div>
                    <MonoTag className="relative mt-3 block">
                      {__iv__.label}
                    </MonoTag>
                  </div>
                )
              })}
            </div>
          </Container>
        </div>
      </OverviewSection>
    )
  },
})
