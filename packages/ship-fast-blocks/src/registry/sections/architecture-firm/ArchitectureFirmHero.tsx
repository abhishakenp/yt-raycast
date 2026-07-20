import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { GraphPaper, Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ArchitectureFirmHero — brutalist-minimal blueprint hero for an
 * architecture-studio / design-practice landing page. A drafting-sheet
 * composition over a faint graph-paper grid with hairline registration ticks
 * in the corners and a giant ghost "01" figure numeral: on the left a mono
 * "FIG. 01" annotation rail with a hairline rule and the eyebrow label, a huge
 * ultra-thin clamp-scaled two-line headline (second line indented), a
 * hairline-ruled lead paragraph and dual CTAs (square solid primary with press
 * feedback + hairline outline that inverts on hover); on the right an
 * asymmetric 7:5 photo plate — grayscale facade photograph that regains color
 * on hover, framed by a hairline border over an offset hairline outline, with
 * a measurement dimension line (end ticks + mono scale caption) drawn beneath
 * it. CTAs route through section-kit route links. Use as the opening hero for
 * architecture firms, design studios, interior designers, landscape
 * architects or any premium built-environment portfolio site. Renders fully
 * with no props.
 */
export const ArchitectureFirmHero = defineCapsule({
  name: 'ArchitectureFirmHero',
  description:
    'Brutalist-minimal blueprint hero for an architecture-studio / design-practice landing page: a drafting-sheet layout over faint graph paper with corner registration ticks and a giant ghost "01" figure numeral — a mono "FIG. 01" annotation rail with hairline rule and eyebrow label, a huge ultra-thin clamp-scaled two-line headline (second line indented), a hairline-ruled lead paragraph and dual CTAs (square solid primary with press feedback + hairline outline that inverts on hover) beside an asymmetric 7:5 photo plate whose grayscale facade photograph regains color on hover inside a hairline frame over an offset outline, finished with a measurement dimension line and mono scale caption. CTAs route through section-kit route links. Use as the opening hero for architecture firms, design studios, interior designers, landscape architects, urban planners or premium built-environment portfolio sites.',
  props: z.object({
    /** Wide letter-spaced eyebrow label above the headline. */
    eyebrow: z.string().optional(),
    /** First headline line (rendered stacked). */
    headingLine1: z.string().optional(),
    /** Second headline line (rendered stacked). */
    headingLine2: z.string().optional(),
    /** Lead paragraph under the headline. */
    subheading: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outline secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the full-height facade photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Architecture Studio — Copenhagen'
    const headingLine1 = props.headingLine1 ?? 'Spaces that breathe,'
    const headingLine2 = props.headingLine2 ?? 'structures that endure'
    const subheading =
      props.subheading ??
      'Atelier Móði creates architecture rooted in place, informed by climate, and designed for the way people actually live. From intimate residential renovations to cultural institutions, we build with intention.'
    const primaryCta = props.primaryCta ?? 'View Projects'
    const secondaryCta = props.secondaryCta ?? 'Our Philosophy'
    const imageAlt =
      props.imageAlt ??
      'Minimalist modern building facade with clean geometric lines and natural stone cladding'

    return (
      <HeroSection
        aria-labelledby="architecture-firm-hero-heading"
        variant="default"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <GraphPaper className="inset-0" />
        {/* Drafting-sheet registration ticks. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 hidden sm:block"
        >
          <span className="absolute left-0 top-0 size-3 border-l border-t border-foreground/40" />
          <span className="absolute right-0 top-0 size-3 border-r border-t border-foreground/40" />
          <span className="absolute bottom-0 left-0 size-3 border-b border-l border-foreground/40" />
          <span className="absolute bottom-0 right-0 size-3 border-b border-r border-foreground/40" />
        </span>
        <Watermark className="-bottom-8 -left-2 text-[9rem] font-extralight sm:text-[15rem] lg:-bottom-16 lg:text-[22rem]">
          01
        </Watermark>

        <Container className="relative py-16 sm:py-20 lg:py-28">
          <HeroContent className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              {/* Mono annotation rail: figure index — rule — eyebrow. */}
              <div className="mb-8 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">Fig. 01</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-border sm:flex-1 sm:max-w-24"
                />
                <MonoTag className="min-w-0">{eyebrow}</MonoTag>
              </div>
              <h1
                id="architecture-firm-hero-heading"
                className="mb-8 text-[clamp(2.75rem,6.5vw,6rem)] font-extralight leading-[0.98] tracking-tight text-foreground"
              >
                {headingLine1}
                <br />
                <span className="inline-block pl-[0.75em]">{headingLine2}</span>
              </h1>
              <p className="mb-10 max-w-xl border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-foreground px-7 py-3.5 text-sm font-medium tracking-wide text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                {/* Offset hairline outline behind the plate — drafting double-line. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
                />
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={1600}
                  loading="eager"
                  className="relative aspect-[4/5] w-full border border-foreground/30 object-cover grayscale transition-[filter] duration-500 hover:grayscale-0"
                />
              </div>
              {/* Measurement dimension line beneath the plate. */}
              <span
                aria-hidden="true"
                className="mt-7 flex items-center gap-2 text-border"
              >
                <span className="h-2.5 w-px bg-current" />
                <span className="h-px flex-1 bg-current" />
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Elev. North — 1:200
                </span>
                <span className="h-px flex-1 bg-current" />
                <span className="h-2.5 w-px bg-current" />
              </span>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
