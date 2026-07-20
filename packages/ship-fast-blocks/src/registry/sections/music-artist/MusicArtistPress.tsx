import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import {
  PressList,
  PressItem,
  PressQuote,
  PressAttribution,
} from '#/section-kit/PressList.tsx'

/**
 * MusicArtistPress — press / review poster grid for a music artist / band page.
 * A soft muted band with an asymmetric mono-rail header (label — hairline —
 * "PRESS" index + giant uppercase heading) over a staggered grid of hard-bordered
 * review cards, each carrying a giant ghost quotation mark, a star row, the
 * quote, and an attribution row (hard-bordered avatar + name + mono outlet
 * byline). Bold poster aesthetic driven entirely by theme tokens (flips
 * light/dark); binary rounded-none radius. Avatars use the alt-driven Image
 * component. Use as the critical-acclaim / press-quote section for musicians,
 * bands, or album-release EPK pages. Renders fully with no props via baked-in
 * defaults.
 */
export const MusicArtistPress = defineCapsule({
  name: 'MusicArtistPress',
  description:
    'Press / review poster grid for a music artist / band page: a soft muted band with an asymmetric mono-rail header (label — hairline — index + giant uppercase heading) over a staggered grid of hard-bordered review cards, each with a giant ghost quotation mark, a star row, the quote, and an attribution row (hard-bordered avatar + name + mono outlet byline). Bold poster aesthetic driven entirely by theme tokens (flips light/dark); binary rounded-none radius. Avatars use the alt-driven Image component. Use as the critical-acclaim / press-quote section for musicians, singers, bands, or album-release EPK pages.',
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

    const Stars = ({ count }: { count: number }) => (
      <span
        role="img"
        aria-label={`${count} out of 5 stars`}
        className="flex gap-1"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn(
              'size-3.5',
              i < count ? 'text-foreground' : 'text-border',
            )}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.5 8.9 9.1 8z" />
          </svg>
        ))}
      </span>
    )

    return (
      <PressList asChild>
        <section
          className={cn(
            'bg-muted px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
            props.className,
          )}
        >
          <Container>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </span>
              <span aria-hidden="true" className="h-px w-16 bg-border" />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
              >
                Acclaim
              </span>
            </div>
            <h2 className="mb-12 mt-5 max-w-3xl text-4xl font-extrabold uppercase leading-[0.9] tracking-tighter text-foreground sm:text-5xl lg:mb-16">
              {heading}
            </h2>
            <ResponsiveGrid cols="1-md-3" className="items-start">
              {reviews.map((r, i) => (
                <PressItem
                  key={r.name}
                  className={cn(
                    'relative overflow-hidden rounded-none border-2 border-foreground bg-card p-8 shadow-[6px_6px_0_0] shadow-foreground/15',
                    i % 2 === 1 && 'md:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[8rem] leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <Stars count={r.stars} />
                  <PressQuote className="relative mb-6 mt-4 text-lg leading-relaxed text-foreground text-pretty">
                    &ldquo;{r.quote}&rdquo;
                  </PressQuote>
                  <div className="flex items-center gap-3 border-t border-border pt-5">
                    <span className="size-11 shrink-0 overflow-hidden border border-border bg-muted">
                      <Image
                        alt={r.avatarAlt}
                        w={88}
                        h={88}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </span>
                    <PressAttribution className="flex flex-col text-sm text-muted-foreground">
                      <span className="font-extrabold uppercase tracking-tight text-foreground">
                        {r.name}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
                        {r.outlet}
                      </span>
                    </PressAttribution>
                  </div>
                </PressItem>
              ))}
            </ResponsiveGrid>
          </Container>
        </section>
      </PressList>
    )
  },
})
