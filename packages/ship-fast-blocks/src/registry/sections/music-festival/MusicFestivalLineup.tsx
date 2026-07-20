import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MusicFestivalLineup — a kinetic-poster lineup section for a music / arts
 * festival landing page. An asymmetric mono-index header, then a row of three
 * headliner photo cards (square-cornered, each with a hairline day ticket-stub
 * chip, a giant uppercase artist name and a mono genre over a foreground
 * gradient), a marquee-style featured-artist ledger of collapsed-border rows
 * (big uppercase names + mono genres), and a rounded ticket-stub "more artists"
 * button. Headliner cards, featured rows and the more button all route through
 * section-kit route links; photos use the alt-driven Image component. Use to
 * showcase performers on music festivals, arts festivals, concert series, or
 * any multi-day live-music event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  LineupGrid,
  ArtistCard,
  ArtistTier,
} from '#/section-kit/LineupGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const MusicFestivalLineup = defineCapsule({
  name: 'MusicFestivalLineup',
  description:
    "Kinetic-poster lineup section for a music / arts festival landing page: an asymmetric mono-index header, then a row of three square-cornered headliner photo cards (each with a hairline day ticket-stub chip, a giant uppercase artist name and a mono genre over a foreground gradient), a marquee-style featured-artist ledger of collapsed-border rows (big uppercase names plus mono genres, 2/3/6-up responsive), and a rounded ticket-stub 'more artists' button. Headliner cards, featured rows and the more button all route through section-kit route links; photos use the alt-driven Image component. Use to showcase performers on music festivals, arts festivals, concert series, raves, or any multi-day live-music event.",
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
      <section
        className={cn(
          'relative overflow-hidden pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-16 hidden text-[12rem] leading-[0.8] lg:block">
          {heading.split(' ').at(-1)}
        </Watermark>
        <Container className="relative">
          <div className="mb-14 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-4xl font-extrabold uppercase tracking-tight lg:text-6xl"
              subtitleClassName="max-w-xl text-lg text-foreground/70"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/40"
            >
              [ 80+ artists ]
            </span>
          </div>

          <div className="mb-16">
            <h3 className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {headlinersLabel}
            </h3>
            <LineupGrid className="grid gap-4 md:grid-cols-3">
              {headliners.map((h, i) => (
                <ArtistCard
                  asChild
                  key={h.name}
                  className="rounded-none border border-border transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-y-0 active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={h.name}>
                    <Image
                      alt={h.imageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-80 w-full object-cover grayscale-[0.1] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/25 to-transparent" />
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-4 font-mono text-5xl font-extrabold tabular-nums leading-none text-background/25"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <span className="mb-3 inline-block border border-dashed border-background/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-background/80">
                        {h.day}
                      </span>
                      <h4 className="text-3xl font-extrabold uppercase leading-[0.9] tracking-tight text-background">
                        {h.name}
                      </h4>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-background/70">
                        {h.genre}
                      </p>
                    </div>
                  </NavbarRouteLink>
                </ArtistCard>
              ))}
            </LineupGrid>
          </div>

          <div className="mb-16">
            <h3 className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {featuredLabel}
            </h3>
            <ResponsiveGrid
              cols="2-3-6"
              className="gap-0 border-l border-t border-border"
            >
              {featured.map((a) => (
                <ArtistTier
                  asChild
                  key={a.name}
                  className="items-start rounded-none border-0 border-b border-r border-border p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <NavbarRouteLink href={a.name}>
                    <p className="text-base font-extrabold uppercase leading-tight tracking-tight text-foreground">
                      {a.name}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-card-foreground/60">
                      {a.genre}
                    </p>
                  </NavbarRouteLink>
                </ArtistTier>
              ))}
            </ResponsiveGrid>
          </div>

          <div className="text-center">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-foreground/50 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] transition-[transform,background-color] duration-150 hover:bg-foreground hover:text-background active:translate-y-px motion-reduce:transform-none"
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
