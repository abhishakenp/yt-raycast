import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * LandscapingHero — calm, premium two-column hero for a landscaping / outdoor-
 * design company on a warm stone band. Left: a large headline, supporting
 * paragraph, dual pill CTAs (filled primary + outlined secondary), and a
 * star-rated social-proof row with overlapping customer avatars. Right: a tall
 * rounded garden photo with a floating "projects completed" stat card overlapping
 * its lower-left corner. Sage-green accent, amber stars, generous whitespace and
 * soft shadows. CTAs route through useNavigate; all imagery uses the alt-driven
 * Image component. Use as the opening hero for landscapers, lawn-care and garden
 * design services. Renders fully with no props via baked-in "Earth & Edge"
 * defaults.
 */
export const LandscapingHero = defineCapsule({
  name: 'LandscapingHero',
  description:
    'Calm, premium two-column hero for a landscaping / outdoor-design company on a warm stone band: left column with a large headline, supporting paragraph, dual pill CTAs (filled primary like Request Free Consultation + outlined secondary like View Our Work), and a star-rated social-proof row with overlapping customer avatars; right column with a tall rounded garden photo and a floating projects-completed stat card overlapping its lower-left corner. Sage-green accent, amber stars, generous whitespace and soft shadows; CTAs route through useNavigate and imagery uses the alt-driven Image component. Use as the opening hero for landscapers, lawn-care and yard-maintenance services, garden designers or hardscaping contractors.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    rating: z.string().optional(),
    imageAlt: z.string().optional(),
    statValue: z.string().optional(),
    statLabel: z.string().optional(),
    /** Alt strings for the small customer avatars on the social-proof row. */
    avatars: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? 'Transform your outdoor space into a living sanctuary'
    const subheading =
      props.subheading ??
      'Award-winning landscape design and maintenance services for Portland homes and businesses. Over 500 completed projects since 2008. Licensed, insured, and committed to sustainable practices.'
    const primaryCta = props.primaryCta ?? 'Request Free Consultation'
    const secondaryCta = props.secondaryCta ?? 'View Our Work'
    const rating = props.rating ?? '4.9/5 from 127 reviews'
    const imageAlt =
      props.imageAlt ??
      'Modern landscaped garden with curved stone pathway, ornamental grasses, and native plants'
    const statValue = props.statValue ?? '500+'
    const statLabel = props.statLabel ?? 'Projects Completed'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'Headshot of a smiling male customer with short brown hair',
          'Headshot of a smiling female customer with blonde hair',
          'Headshot of a smiling older male customer with glasses',
        ]

    const StarIcon = ({ className }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('size-4 text-chart-4', className)}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('relative bg-muted', props.className)}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center rounded-full border border-border bg-background px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-accent"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {avatars.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rating}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="h-[400px] w-full rounded-xl object-cover shadow-xl lg:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-6 shadow-lg sm:block">
                <p className="text-3xl font-semibold text-primary">
                  {statValue}
                </p>
                <p className="text-sm text-muted-foreground">{statLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
