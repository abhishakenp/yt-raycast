import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * ArchitectureFirmHero — split editorial hero for an architecture-studio /
 * design-practice landing page. A calm, Scandinavian-minimalist layout: a
 * left-aligned content column with a wide letter-spaced eyebrow label, a serene
 * two-line light headline, a relaxed lead paragraph and dual CTAs (solid
 * primary + outline secondary), beside a full-height facade photograph anchored
 * to the right edge on large screens. Generous whitespace, light type weights,
 * quiet monochrome contrast. CTAs route through useNavigate. Use as the opening
 * hero for architecture firms, design studios, interior designers, landscape
 * architects or any premium built-environment portfolio site. Renders fully
 * with no props.
 */
export const ArchitectureFirmHero = defineComponent({
  name: 'ArchitectureFirmHero',
  description:
    'Split editorial hero for an architecture-studio / design-practice landing page: a left-aligned content column with a wide letter-spaced eyebrow label, a serene two-line light headline, a relaxed lead paragraph and dual CTAs (solid primary + outline secondary), beside a full-height facade photograph anchored to the right edge on large screens. Calm Scandinavian-minimalist aesthetic with generous whitespace, light type weights and quiet monochrome contrast. CTAs route through useNavigate. Use as the opening hero for architecture firms, design studios, interior designers, landscape architects, urban planners or premium built-environment portfolio sites.',
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
    const go = useNavigate()
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
      <section
        aria-labelledby="architecture-firm-hero-heading"
        className={cn(
          'relative flex min-h-[70vh] items-center',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h1
              id="architecture-firm-hero-heading"
              className="mb-8 text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {headingLine1}
              <br />
              {headingLine2}
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {subheading}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="inline-flex items-center bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="inline-flex items-center border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
              >
                {secondaryCta}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 hidden h-full w-2/5 lg:block">
          <Image
            alt={imageAlt}
            w={1200}
            h={1600}
            loading="eager"
            className="size-full object-cover"
          />
        </div>
      </section>
    )
  },
})
