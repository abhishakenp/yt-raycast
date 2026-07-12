import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MusicArtistPress — press / review testimonial grid for a music artist / band
 * page. A centered eyebrow + thin heading over a soft muted band, then a
 * responsive grid of bordered review cards (a row of star icons, the quote, and
 * a reviewer avatar with name + outlet byline). Warm, airy, editorial indie-folk
 * aesthetic. Avatars use the alt-driven Image component. Use as the critical
 * acclaim / press-quote section for musicians, bands, or album-release EPK
 * pages. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistPress = defineCapsule({
  name: 'MusicArtistPress',
  description:
    'Press / review testimonial grid for a music artist / band page: a centered eyebrow and thin heading over a soft muted band, then a responsive grid of bordered review cards (a row of star icons, the quote, and a reviewer avatar with name and outlet byline). Warm, airy editorial indie-folk aesthetic. Avatars use the alt-driven Image component. Use as the critical-acclaim / press-quote section for musicians, singers, bands, or album-release EPK pages.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Thin-weight section heading. */
    heading: z.string().optional(),
    /** Review cards (quote, star count, reviewer name, outlet, avatar alt). */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          stars: z.number(),
          name: z.string(),
          outlet: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Press'
    const heading = props.heading ?? "What They're Saying"
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Northbound is a masterclass in understated beauty. Every track feels like a conversation with an old friend. The harmonies on 'Winter Dust' gave me chills.",
            stars: 5,
            name: 'Sarah Chen',
            outlet: 'Pitchfork',
            avatarAlt:
              'Professional headshot of a music journalist with short brown hair',
          },
          {
            quote:
              'Velvet Echo proves that quiet music can be powerful. Their live show at the Crystal Ballroom was transcendent. A must-see act of 2026.',
            stars: 5,
            name: 'Marcus Thompson',
            outlet: 'Rolling Stone',
            avatarAlt:
              'Professional headshot of a male music critic with glasses and beard',
          },
          {
            quote:
              'A haunting collection of songs that reward repeated listening. The production is immaculate, letting the songs breathe in all the right places.',
            stars: 4,
            name: 'Elena Rodriguez',
            outlet: 'NPR Music',
            avatarAlt:
              'Professional headshot of a female radio host with blonde hair and warm smile',
          },
        ]

    const StarIcon = ({ filled }: { filled: boolean }) => (
      <svg
        className={cn(
          'size-4',
          filled ? 'text-foreground' : 'text-muted-foreground/40',
        )}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    return (
      <section
        className={cn('bg-muted px-6 py-20 lg:px-8 lg:py-28', props.className)}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center lg:mb-24">
            <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
              {heading}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-sm border border-border bg-card p-8"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} filled={s < review.stars} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground/80">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <span className="size-10 overflow-hidden rounded-full bg-muted">
                    <Image
                      alt={review.avatarAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.outlet}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
