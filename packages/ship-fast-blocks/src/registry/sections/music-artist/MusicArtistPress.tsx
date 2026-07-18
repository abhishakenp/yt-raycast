import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { PressList, PressItem, PressQuote, PressAttribution } from '#/section-kit/PressList.tsx'

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

    return (
      <PressList asChild>
        <section
          className={cn(
            'bg-muted px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
            props.className,
          )}
        >
          <Container>
            <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-16 text-center font-serif text-4xl font-normal sm:text-5xl">
              {heading}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {reviews.map((r) => (
                <PressItem key={r.name} className="rounded-sm bg-card p-8 shadow-sm">
                  <PressQuote className="mb-4 text-lg leading-relaxed text-foreground">
                    &ldquo;{r.quote}&rdquo;
                  </PressQuote>
                  <PressAttribution className="text-sm text-muted-foreground">
                    {r.name} — {r.outlet}
                  </PressAttribution>
                </PressItem>
              ))}
            </div>
          </Container>
        </section>
      </PressList>
    )
  },
})
