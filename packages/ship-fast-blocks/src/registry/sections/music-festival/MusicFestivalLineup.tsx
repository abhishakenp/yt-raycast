import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MusicFestivalLineup — a lineup section for a music / arts festival landing
 * page. A centered eyebrow + heading + intro, then a row of three headliner
 * photo cards (each with a gradient-overlaid day label, name and genre), a
 * featured-artist grid of bordered name/genre cards, and a centered "more
 * artists" pill button. Headliner cards, featured cards and the more button all
 * route through useNavigate; photos use the alt-driven Image component. Use to
 * showcase performers on music festivals, arts festivals, concert series, or
 * any multi-day live-music event.
 */
export const MusicFestivalLineup = defineComponent({
  name: "MusicFestivalLineup",
  description:
    "Lineup section for a music / arts festival landing page: a centered eyebrow + heading + intro paragraph, then a row of three headliner photo cards (each with a dark gradient overlay carrying a day label, artist name and genre), a featured-artist grid of bordered name/genre cards (2/4/6-up responsive), and a centered 'more artists' pill button. Headliner cards, featured cards and the more button all route through useNavigate; photos use the alt-driven Image component. Use to showcase performers on music festivals, arts festivals, concert series, raves, or any multi-day live-music event.",
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
      .array(z.object({ name: z.string(), genre: z.string() }))
      .optional(),
    /** "More artists" button label. */
    more: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "The Artists"
    const heading = props.heading ?? "2025 Lineup"
    const description =
      props.description ??
      "Three days of unforgettable performances across four uniquely designed stages. From indie rock to electronic, hip-hop to folk — discover your next favorite artist."
    const headlinersLabel = props.headlinersLabel ?? "Headliners"
    const headliners = props.headliners?.length
      ? props.headliners
      : [
          {
            day: "Friday Headliner",
            name: "Arctic Monkeys",
            genre: "Indie Rock • UK",
            imageAlt:
              "Arctic Monkeys performing on stage with dramatic purple and blue lighting",
          },
          {
            day: "Saturday Headliner",
            name: "Tame Impala",
            genre: "Psychedelic Pop • Australia",
            imageAlt:
              "Tame Impala psychedelic light show with a silhouetted performer",
          },
          {
            day: "Sunday Headliner",
            name: "LCD Soundsystem",
            genre: "Dance-Punk • USA",
            imageAlt:
              "LCD Soundsystem live performance with a vocalist at the microphone",
          },
        ]
    const featuredLabel = props.featuredLabel ?? "Featured Artists"
    const featured = props.featured?.length
      ? props.featured
      : [
          { name: "Bon Iver", genre: "Folk" },
          { name: "Khruangbin", genre: "Psychedelic" },
          { name: "Rosalia", genre: "Flamenco Pop" },
          { name: "Fred Again..", genre: "Electronic" },
          { name: "Big Thief", genre: "Indie Folk" },
          { name: "Four Tet", genre: "Electronic" },
          { name: "FKA Twigs", genre: "Art Pop" },
          { name: "Parcels", genre: "Disco" },
          { name: "Caroline Polachek", genre: "Art Pop" },
          { name: "Jungle", genre: "Neo-Soul" },
          { name: "Beach House", genre: "Dream Pop" },
          { name: "Bicep", genre: "Electronic" },
        ]
    const more = props.more ?? "+ 64 More Artists"

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground/70">
              {description}
            </p>
          </div>

          <div className="mb-16">
            <h3 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
              {headlinersLabel}
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {headliners.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => go(h.name)}
                  className="group relative block overflow-hidden rounded-xl text-left"
                >
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
                </button>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h3 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
              {featuredLabel}
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {featured.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => go(a.name)}
                  className="rounded-lg border border-border bg-card p-6 text-center text-card-foreground transition-colors hover:border-primary/40"
                >
                  <p className="font-semibold">{a.name}</p>
                  <p className="mt-1 text-sm text-card-foreground/60">
                    {a.genre}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => go(more)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
            >
              {more}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    )
  },
})
