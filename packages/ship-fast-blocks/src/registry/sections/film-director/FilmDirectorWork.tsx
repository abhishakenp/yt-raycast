import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * FilmDirectorWork — an inverted, near-black "Selected Work" reel grid for a
 * film director / cinematographer portfolio. On a dark foreground band: a
 * header row pairing a thin heading + muted lede with a set of filter pill
 * buttons (first one outlined/active), a responsive 1/2/3-column grid of 16:9
 * project cards each with an overlaid darkening scrim, a centered circular play
 * button that brightens on hover, and bottom-anchored category tag / title /
 * role captions, plus a centered outlined load-more button. Cards, filters, and
 * the load-more route through useNavigate; imagery uses the Image component. Use
 * as a cinematic portfolio / reel showcase for directors, cinematographers, DPs,
 * or production houses.
 */
export const FilmDirectorWork = defineCapsule({
  name: 'FilmDirectorWork',
  description:
    "Inverted, near-black 'Selected Work' reel grid for a film director / cinematographer portfolio: on a dark foreground band, a header row pairing a thin heading + muted lede with a set of filter pill buttons (first outlined/active), a responsive 1/2/3-column grid of 16:9 project cards each with an overlaid darkening scrim, a centered circular play button that brightens on hover, and bottom-anchored category tag / title / role captions, plus a centered outlined load-more button. Cards, filters, and load-more route through useNavigate; imagery uses the Image component. Use as a cinematic portfolio / reel showcase for directors, cinematographers, DPs, or production houses.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    filters: z.array(z.string()).optional(),
    loadMore: z.string().optional(),
    items: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          role: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const workHeading = props.heading ?? 'Selected Work'
    const workDesc =
      props.description ??
      'A curated selection of recent projects across commercial, narrative, and documentary filmmaking.'
    const workFilters = props.filters?.length
      ? props.filters
      : ['All', 'Commercial', 'Narrative', 'Documentary']
    const workLoadMore = props.loadMore ?? 'Load More Projects'
    const workItems = props.items?.length
      ? props.items
      : [
          {
            tag: 'Commercial',
            title: 'Velocity Automotive',
            role: 'Director / DP',
            imageAlt:
              'dramatic cinematic still from a luxury car commercial showing a sleek vehicle on a winding coastal road at golden hour',
          },
          {
            tag: 'Narrative',
            title: 'Echoes of Rain',
            role: 'Short Film — 2024',
            imageAlt:
              'atmospheric still from an independent film scene showing two actors in intimate conversation at a rain-soaked diner booth',
          },
          {
            tag: 'Documentary',
            title: 'The North Face: Boundless',
            role: 'Director',
            imageAlt:
              'stunning mountain landscape cinematography shot for outdoor brand campaign showing hiker silhouetted against dramatic alpine peaks',
          },
          {
            tag: 'Music Video',
            title: 'Midnight Bloom — Aurora',
            role: 'Director / Cinematographer',
            imageAlt:
              'dynamic concert photography still from a music video shoot showing a performer on stage with dramatic purple and blue stage lighting',
          },
          {
            tag: 'Fashion Film',
            title: 'Maison Lumière SS24',
            role: 'Director',
            imageAlt:
              'elegant product cinematography still from a fashion brand film showing model in flowing silk dress against minimalist white background with soft lighting',
          },
          {
            tag: 'Corporate',
            title: 'Notion — Work Reimagined',
            role: 'Director / DP',
            imageAlt:
              'candid documentary-style photograph from a tech startup culture film showing diverse team collaborating in modern glass-walled office space',
          },
          {
            tag: 'Documentary',
            title: "Chef's Table: Origins",
            role: 'Cinematographer — Ep. 3, 5, 7',
            imageAlt:
              'artistic food cinematography still from a culinary documentary showing chef hands plating an exquisite dish in professional kitchen with steam rising',
          },
          {
            tag: 'Live Event',
            title: 'Electric Forest 2024',
            role: 'Director of Photography',
            imageAlt:
              'vibrant electronic music festival scene with crowd silhouettes against massive LED stage displays and laser light show',
          },
          {
            tag: 'Narrative',
            title: "The Watchmaker's Son",
            role: 'Short Film — Festival Circuit',
            imageAlt:
              "intimate close-up still from a narrative film showing an elderly actor's weathered hands holding a vintage pocket watch in soft window light",
          },
        ]

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-foreground py-20 text-background md:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-light md:text-4xl">
                {workHeading}
              </h2>
              <p className="max-w-xl text-background/70">{workDesc}</p>
            </div>
            <div className="mt-6 flex gap-4 text-sm md:mt-0">
              {workFilters.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => go(f)}
                  className={cn(
                    'rounded-md px-4 py-2 transition-colors',
                    i === 0
                      ? 'border border-background hover:bg-background hover:text-foreground'
                      : 'text-background/70 hover:text-background',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveGrid cols="1-md-2-3" gap="md">
            {workItems.map((proj) => (
              <button
                key={proj.title}
                type="button"
                onClick={() => go(proj.title)}
                className="group block w-full cursor-pointer text-left"
              >
                <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                  <Image
                    alt={proj.imageAlt}
                    w={800}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/60 transition-colors group-hover:bg-foreground/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid size-16 place-items-center rounded-full bg-background/20 transition-colors group-hover:bg-background/30">
                      <PlayIcon className="ml-1 size-8 text-background" />
                    </div>
                  </div>
                  <div className="absolute inset-x-4 bottom-4">
                    <span className="text-xs uppercase tracking-wider text-background/70">
                      {proj.tag}
                    </span>
                    <h3 className="mt-1 text-lg font-medium text-background">
                      {proj.title}
                    </h3>
                    <p className="mt-1 text-sm text-background/70">
                      {proj.role}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </ResponsiveGrid>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(workLoadMore)}
              className="rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-background"
            >
              {workLoadMore}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
