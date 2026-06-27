import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * MusicArtistHero — split, two-column hero for a music artist / band landing
 * page. On the left: a small uppercase eyebrow, a huge thin-weight album title,
 * a descriptive blurb, and a pair of pill CTAs (a filled "Listen Now" with an
 * arrow and an outlined "View Tour Dates"). On the right: a large square
 * album-cover image. Stacks the cover above the copy on mobile. Warm, airy,
 * editorial indie-folk aesthetic on a soft neutral canvas with generous
 * whitespace. Both CTAs route through useNavigate; the cover uses the alt-driven
 * Image component. Use as the opening hero for album releases, musicians, bands,
 * or any artist promo page. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistHero = defineCapsule({
  name: 'MusicArtistHero',
  description:
    "Split two-column hero for a music artist / band landing page: on the left a small uppercase eyebrow, a huge thin-weight album title, a descriptive blurb, and a pair of pill CTAs (a filled 'Listen Now' with an arrow and an outlined 'View Tour Dates'); on the right a large square album-cover image (stacked above the copy on mobile). Warm, airy editorial indie-folk aesthetic on a soft neutral canvas with generous whitespace. Both CTAs route through useNavigate; the cover uses the alt-driven Image component. Use as the opening hero for album releases, musicians, singers, bands, or any artist promo page.",
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Large thin-weight album / release title. */
    title: z.string().optional(),
    /** Descriptive blurb under the title. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text for the square album-cover image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'New Album Out Now'
    const title = props.title ?? 'Northbound'
    const description =
      props.description ??
      'Twelve songs about distance, longing, and the road home. Recorded in a converted barn outside Portland during the quiet winter months.'
    const primaryCta = props.primaryCta ?? 'Listen Now'
    const secondaryCta = props.secondaryCta ?? 'View Tour Dates'
    const imageAlt =
      props.imageAlt ??
      'Minimalist album cover showing a misty mountain landscape at dawn with soft neutral tones'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="17" y2="12" />
        <polyline points="11 6 17 12 11 18" />
      </svg>
    )

    return (
      <section
        className={cn(
          'px-6 pb-20 pt-32 lg:px-8 lg:pb-32 lg:pt-48',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-light leading-tight text-foreground lg:text-6xl xl:text-7xl">
                {title}
              </h1>
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
                {description}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                >
                  {secondaryCta}
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={800}
                  className="size-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
