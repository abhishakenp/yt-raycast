import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  MusicList,
  MusicItem,
  MusicTrack,
  MusicPlayer,
} from '#/section-kit/MusicList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MusicArtistMusic — latest-release track ledger for a music artist / band
 * page. An asymmetric header (mono rail eyebrow — hairline — "TRACKS" index, a
 * giant extrabold uppercase heading left, lead right) over a collapsed-border
 * ledger of track rows: a mono tabular index, a hard-bordered square cover
 * thumbnail, an uppercase title, a mono tabular duration, and a small "Listen"
 * play link; a trailing mono "view all" link with an arrow closes it. Bold
 * poster aesthetic driven entirely by theme tokens (flips light/dark); binary
 * rounded-none radius. Each track's Listen link and the view-all link route
 * through section-kit route links; cover thumbnails use the alt-driven Image
 * component. Use as the discography / latest-release showcase for musicians,
 * bands, or album-release pages. Renders fully with no props via baked-in
 * defaults.
 */
export const MusicArtistMusic = defineCapsule({
  name: 'MusicArtistMusic',
  description:
    "Latest-release track ledger for a music artist / band page: an asymmetric header (mono rail eyebrow — hairline — index, a giant extrabold uppercase heading left, lead right) over a collapsed-border ledger of track rows — a mono tabular index, a hard-bordered square cover thumbnail, an uppercase title, a mono tabular duration, and a small 'Listen' play link — with a trailing mono 'view all' link with an arrow. Bold poster aesthetic driven entirely by theme tokens (flips light/dark); binary rounded-none radius. Each track's Listen link and the view-all link route through section-kit route links; cover thumbnails use the alt-driven Image component. Use as the discography / latest-release showcase for musicians, singers, bands, or album-release pages.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Thin-weight section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Trailing "view all" link label. */
    viewAll: z.string().optional(),
    /** Track cards (title, duration, cover image alt). */
    tracks: z
      .array(
        z.object({
          title: z.string(),
          duration: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Latest Release'
    const heading = props.heading ?? 'Northbound'
    const description =
      props.description ??
      'Twelve tracks exploring the quiet spaces between memory and movement. Released March 2026.'
    const viewAll = props.viewAll ?? 'View all 12 tracks'
    const tracks = props.tracks?.length
      ? props.tracks
      : [
          {
            title: 'The Long Way Home',
            duration: '4:32',
            imageAlt:
              'Atmospheric photo of vintage recording studio with warm amber lighting',
          },
          {
            title: 'Winter Dust',
            duration: '3:48',
            imageAlt:
              'Close-up photograph of acoustic guitar strings and fretboard in warm natural light',
          },
          {
            title: 'Portland Rain',
            duration: '5:12',
            imageAlt:
              'Vintage vinyl records stacked on wooden shelf with soft natural lighting',
          },
          {
            title: 'Highway 26',
            duration: '4:15',
            imageAlt:
              'Silhouette of musician performing on stage with atmospheric stage lighting',
          },
          {
            title: "Grandmother's Piano",
            duration: '3:56',
            imageAlt:
              'Close-up of piano keys with shallow depth of field in monochrome tones',
          },
          {
            title: 'Miles to Go',
            duration: '4:44',
            imageAlt:
              'Peaceful rural road stretching through misty countryside at golden hour',
          },
        ]

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

    const PlayIcon = () => (
      <svg
        className="size-3.5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {eyebrow}
                </span>
                <span aria-hidden="true" className="h-px w-16 bg-border" />
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                >
                  Tracks
                </span>
              </div>
              <h2 className="mt-5 text-4xl font-extrabold uppercase leading-[0.9] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-sm text-pretty text-muted-foreground md:text-right">
              {description}
            </p>
          </div>

          <MusicList className="mt-12 gap-0 border-t border-border lg:mt-16">
            {tracks.map((track, i) => (
              <MusicItem asChild key={track.title}>
                <div className="group border-b border-border">
                  <MusicTrack className="items-center gap-4 py-5 transition-colors group-hover:bg-muted/40 sm:gap-6 sm:px-2">
                    <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="hidden size-14 shrink-0 overflow-hidden border border-border bg-muted sm:block">
                      <Image
                        alt={track.imageAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="min-w-0 flex-1 truncate text-lg font-extrabold uppercase tracking-tight text-foreground">
                      {track.title}
                    </h3>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                      {track.duration}
                    </span>
                    <MusicPlayer
                      aria-label={`Play ${track.title}`}
                      className="shrink-0 justify-start gap-1.5 rounded-none border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px"
                      asChild
                    >
                      <NavbarRouteLink href={track.title}>
                        <PlayIcon />
                        Listen
                      </NavbarRouteLink>
                    </MusicPlayer>
                  </MusicTrack>
                </div>
              </MusicItem>
            ))}
          </MusicList>

          <div className="mt-10">
            <NavbarRouteLink
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
