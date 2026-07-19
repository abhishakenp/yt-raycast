import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MusicFestivalLineup — a lineup section for a music / arts festival landing
 * page. A centered eyebrow + heading + intro, then a row of three headliner
 * photo cards (each with a gradient-overlaid day label, name and genre), a
 * featured-artist grid of bordered name/genre cards, and a centered "more
 * artists" pill button. Headliner cards, featured cards and the more button all
 * route through section-kit route links; photos use the alt-driven Image component. Use to
 * showcase performers on music festivals, arts festivals, concert series, or
 * any multi-day live-music event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  LineupGrid,
  ArtistCard,
  ArtistTier,
} from '#/section-kit/LineupGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const MusicFestivalLineup = defineCapsule({
  name: 'MusicFestivalLineup',
  description:
    "Lineup section for a music / arts festival landing page: a centered eyebrow + heading + intro paragraph, then a row of three headliner photo cards (each with a dark gradient overlay carrying a day label, artist name and genre), a featured-artist grid of bordered name/genre cards (2/4/6-up responsive), and a centered 'more artists' pill button. Headliner cards, featured cards and the more button all route through section-kit route links; photos use the alt-driven Image component. Use to showcase performers on music festivals, arts festivals, concert series, raves, or any multi-day live-music event.",
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Intro paragraph beneath the heading. */
    description: z.string().optional(),
    /** Label above the headliner cards. */
    headlinersLabel: z.string().optional(),
    /** Headliner photo cards. */
    headliners: z
      .array(
        z.object({
          day: z.string(),
          name: z.string(),
          genre: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    /** Label above the featured-artist grid. */
    featuredLabel: z.string().optional(),
    /** Featured artists (name + genre). */
    featured: z
      .array(
        z.object({
          name: z.string(),
          genre: z.string(),
        }),
      )
      .optional(),
    /** "More artists" button label. */
    more: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'The Artists'
    const heading = props.heading ?? '2025 Lineup'
    const description =
      props.description ??
      'Three days of unforgettable performances across four uniquely designed stages. From indie rock to electronic, hip-hop to folk — discover your next favorite artist.'
    const headlinersLabel = props.headlinersLabel ?? 'Headliners'
    const headliners = props.headliners?.length
      ? props.headliners
      : [
          {
            day: 'Friday Headliner',
            name: 'Arctic Monkeys',
            genre: 'Indie Rock • UK',
            imageAlt:
              'Arctic Monkeys performing on stage with dramatic purple and blue lighting',
          },
          {
            day: 'Saturday Headliner',
            name: 'Tame Impala',
            genre: 'Psychedelic Pop • Australia',
            imageAlt:
              'Tame Impala psychedelic light show with a silhouetted performer',
          },
          {
            day: 'Sunday Headliner',
            name: 'LCD Soundsystem',
            genre: 'Dance-Punk • USA',
            imageAlt:
              'LCD Soundsystem live performance with a vocalist at the microphone',
          },
        ]
    const featuredLabel = props.featuredLabel ?? 'Featured Artists'
    const featured = props.featured?.length
      ? props.featured
      : [
          {
            name: 'Bon Iver',
            genre: 'Folk',
          },
          {
            name: 'Khruangbin',
            genre: 'Psychedelic',
          },
          {
            name: 'Rosalia',
            genre: 'Flamenco Pop',
          },
          {
            name: 'Fred Again..',
            genre: 'Electronic',
          },
          {
            name: 'Big Thief',
            genre: 'Indie Folk',
          },
          {
            name: 'Four Tet',
            genre: 'Electronic',
          },
          {
            name: 'FKA Twigs',
            genre: 'Art Pop',
          },
          {
            name: 'Parcels',
            genre: 'Disco',
          },
          {
            name: 'Caroline Polachek',
            genre: 'Art Pop',
          },
          {
            name: 'Jungle',
            genre: 'Neo-Soul',
          },
          {
            name: 'Beach House',
            genre: 'Dream Pop',
          },
          {
            name: 'Bicep',
            genre: 'Electronic',
          },
        ]
    const more = props.more ?? '+ 64 More Artists'
    return (
      <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 gap-0"
            eyebrowClassName="mb-4 text-sm font-medium uppercase tracking-widest text-primary"
            titleClassName="mb-4 text-4xl font-bold tracking-tight lg:text-5xl"
            subtitleClassName="mx-auto max-w-2xl text-lg text-foreground/70"
          />

          <div className="mb-16">
            <h3 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
              {headlinersLabel}
            </h3>
            <LineupGrid className="grid gap-6 md:grid-cols-3">
              {headliners.map((h) => (
                <ArtistCard asChild key={h.name}>
                  <NavbarRouteLink href={h.name}>
                    <Image
                      alt={h.imageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="mb-1 text-sm text-background/70">{h.day}</p>
                      <h4 className="mb-1 text-2xl font-bold text-background">
                        {h.name}
                      </h4>
                      <p className="text-sm text-background/70">{h.genre}</p>
                    </div>
                  </NavbarRouteLink>
                </ArtistCard>
              ))}
            </LineupGrid>
          </div>

          <div className="mb-16">
            <h3 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
              {featuredLabel}
            </h3>
            <ResponsiveGrid cols="2-3-6" className="gap-4">
              {featured.map((a) => (
                <ArtistTier asChild key={a.name}>
                  <NavbarRouteLink href={a.name}>
                    <p className="font-semibold">{a.name}</p>
                    <p className="mt-1 text-sm text-card-foreground/60">
                      {a.genre}
                    </p>
                  </NavbarRouteLink>
                </ArtistTier>
              ))}
            </ResponsiveGrid>
          </div>

          <div className="text-center">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
              href={more}
            >
              {more}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
