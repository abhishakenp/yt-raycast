import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FurnitureStoreHero — split, two-column hero for a warm minimal furniture /
 * home-decor store. A soft muted band with a tall left column (uppercase
 * collection eyebrow, large serif-style headline, supporting paragraph, primary +
 * secondary CTA buttons, and a bordered KPI strip) beside a full-bleed lifestyle
 * room photo with a floating featured-product price card pinned to its corner.
 * Stacks the photo above the copy on mobile. CTAs route through useNavigate. Use
 * as the top hero for furniture stores, home-decor or interiors brands, or any
 * warm boutique-retail landing page needing a product-forward lifestyle shot.
 * Renders fully with no props via baked-in "Haven & Home" defaults.
 */
export const FurnitureStoreHero = defineComponent({
  name: 'FurnitureStoreHero',
  description:
    'Split two-column hero for a warm minimal furniture / home-decor store: a soft muted band with a tall left column (uppercase collection eyebrow, large headline, supporting paragraph, primary + secondary CTA buttons, bordered KPI strip) beside a full-bleed lifestyle room photo with a floating featured-product price card pinned to its corner; photo stacks above copy on mobile. CTAs route through useNavigate. Use as the top hero for furniture stores, home-decor or interiors brands, or any warm boutique-retail landing page needing a product-forward lifestyle shot.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Floating featured-product callout over the hero image. */
    featuredLabel: z.string().optional(),
    featuredPrice: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Spring Collection 2026'
    const heading = props.heading ?? 'Create a home that feels like you'
    const subheading =
      props.subheading ??
      'Thoughtfully designed furniture and decor for modern living. Minimal, warm, and made to last for generations.'
    const primaryCta = props.primaryCta ?? 'Explore Rooms'
    const secondaryCta = props.secondaryCta ?? 'New Arrivals'
    const imageAlt =
      props.imageAlt ??
      'Bright modern living room with cream linen sofa, warm wood coffee table, and potted plants in natural light'
    const featuredLabel = props.featuredLabel ?? 'Featured: The Cloud Sofa'
    const featuredPrice = props.featuredPrice ?? 'Starting at $2,849'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '15K+', label: 'Happy Homes' },
          { value: '4.9', label: 'Average Rating' },
          { value: '48h', label: 'Delivery to Metro' },
        ]

    const ArrowLong = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn('relative bg-muted', props.className)}
        aria-labelledby="furniture-hero-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid min-h-[70vh] lg:min-h-[80vh] lg:grid-cols-2">
            <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-6 lg:order-1 lg:px-12 lg:py-0">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h1
                id="furniture-hero-heading"
                className="mb-6 text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl"
              >
                {heading}
              </h1>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowLong className="ml-2 size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-12 flex gap-8 border-t border-border pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 h-[50vh] lg:order-2 lg:h-auto">
              <Image
                alt={imageAlt}
                w={1200}
                h={800}
                loading="eager"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute bottom-6 right-6 hidden rounded-lg bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:block">
                <p className="text-sm font-medium text-card-foreground">
                  {featuredLabel}
                </p>
                <p className="text-sm text-muted-foreground">{featuredPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
