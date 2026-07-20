import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'

/**
 * FilmDirectorWork — an inverted, cinematic "Selected Work" reel grid for a film
 * director / cinematographer portfolio. On a bg-foreground/text-background band
 * (token-driven, theme-adaptive) over a giant faint "REEL" ghost watermark: a
 * mono slate meta rule with a reel count, an asymmetric header pairing a giant
 * credits-style extrabold heading + muted lede with a row of square mono filter
 * chips (first active), a responsive 1/2/3-column grid of letterboxed 16:9
 * project cards each carrying a mono "SC. 0X" slate index, a darkening scrim, a
 * centered circular play button that brightens on hover, and bottom-anchored mono
 * category / credits-style title / role captions, plus a centered square
 * outlined load-more button with press feedback. Cards, filters, and load-more
 * route through section-kit route links; imagery uses the Image component. Use as
 * a cinematic portfolio / reel showcase for directors, cinematographers, DPs, or
 * production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const FilmDirectorWork = defineCapsule({
  name: 'FilmDirectorWork',
  description:
    "Inverted, cinematic 'Selected Work' reel grid for a film director / cinematographer portfolio: on a bg-foreground/text-background band over a giant faint 'REEL' ghost watermark, a mono slate meta rule with a reel count, an asymmetric header pairing a giant credits-style extrabold heading + muted lede with square mono filter chips (first active), a responsive 1/2/3-column grid of letterboxed 16:9 project cards each with a mono 'SC. 0X' slate index, a darkening scrim, a centered circular play button, and bottom-anchored mono category / credits-style title / role captions, plus a centered square outlined load-more button with press feedback. Cards, filters, and load-more route through section-kit route links; imagery uses the Image component. Use as a cinematic portfolio / reel showcase for directors, cinematographers, DPs, or production houses.",
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
          'relative overflow-hidden bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none font-extrabold leading-none tracking-tighter text-background/[0.05] text-[22vw] lg:text-[16rem]"
        >
          REEL
        </span>
        <Container className="relative">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Selected Work
            </span>
            <span className="tabular-nums">
              {String(workItems.length).padStart(2, '0')} reels
            </span>
          </div>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={workHeading}
              subtitle={workDesc}
              className="gap-0"
              titleClassName="mb-4 text-4xl font-extrabold tracking-tight text-background md:text-5xl"
              subtitleClassName="max-w-xl text-background/70"
            />
            <div className="flex flex-wrap gap-2 text-sm">
              {workFilters.map((f, i) => (
                <NavbarRouteLink
                  key={f}
                  className={cn(
                    'rounded-none px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors',
                    i === 0
                      ? 'bg-background text-foreground'
                      : 'border border-background/25 text-background/70 hover:border-background hover:text-background',
                  )}
                  href={f}
                >
                  {f}
                </NavbarRouteLink>
              ))}
            </div>
          </div>

          <PortfolioGrid cols="1-md-2-3" className="gap-6">
            {workItems.map((proj, i) => (
              <PortfolioItem
                key={proj.title}
                className="group block w-full cursor-pointer text-left"
                asChild
              >
                <NavbarRouteLink href={proj.title}>
                  <PortfolioMedia
                    aspect="16-9"
                    className="rounded-none bg-muted"
                  >
                    <Image
                      alt={proj.imageAlt}
                      w={800}
                      h={450}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/60 transition-colors group-hover:bg-foreground/40" />
                    <span className="absolute left-3 top-3 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-background/80">
                      SC. {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid size-16 place-items-center rounded-full bg-background/20 transition-colors group-hover:bg-background/30">
                        <PlayIcon className="ml-1 size-8 text-background" />
                      </div>
                    </div>
                    <PortfolioCaption className="absolute inset-x-4 bottom-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
                        {proj.tag}
                      </span>
                      <h3 className="mt-1 text-lg font-extrabold tracking-tight text-background">
                        {proj.title}
                      </h3>
                      <p className="mt-1 text-sm text-background/70">
                        {proj.role}
                      </p>
                    </PortfolioCaption>
                  </PortfolioMedia>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>

          <div className="mt-12 text-center">
            <NavbarRouteLink
              className="inline-flex rounded-none border border-background/40 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-[transform,border-color] duration-150 hover:border-background active:translate-y-px motion-reduce:transform-none"
              href={workLoadMore}
            >
              {workLoadMore}
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
