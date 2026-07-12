import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * MusicArtistMusic — latest-release track grid for a music artist / band page.
 * A centered eyebrow + thin heading + lead, then a responsive grid of bordered
 * track cards (square cover thumbnail, title, duration, and a small "Listen"
 * play button), with a trailing "view all tracks" link with an arrow. Warm,
 * airy, editorial indie-folk aesthetic on a soft neutral canvas. Each track's
 * Listen button and the view-all link route through useNavigate; cover
 * thumbnails use the alt-driven Image component. Use as the discography /
 * latest-release showcase for musicians, bands, or album-release pages. Renders
 * fully with no props via baked-in defaults.
 */
export const MusicArtistMusic = defineCapsule({
  name: 'MusicArtistMusic',
  description:
    "Latest-release track grid for a music artist / band page: a centered eyebrow, thin heading and lead, then a responsive grid of bordered track cards (square cover thumbnail, title, duration, and a small 'Listen' play button), with a trailing 'view all tracks' link with an arrow. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas. Each track's Listen button and the view-all link route through useNavigate; cover thumbnails use the alt-driven Image component. Use as the discography / latest-release showcase for musicians, singers, bands, or album-release pages.",
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
    const go = useNavigate()
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
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )

    return (
      <section className={cn('px-6 py-20 lg:px-8 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center lg:mb-24">
            <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <div
                key={track.title}
                className="group rounded-sm border border-border bg-card p-6 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-sm bg-muted">
                    <Image
                      alt={track.imageAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-card-foreground">
                      {track.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {track.duration}
                    </p>
                    <button
                      type="button"
                      aria-label={`Play ${track.title}`}
                      onClick={() => go(track.title)}
                      className="mt-3 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <PlayIcon />
                      Listen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAll}
              <ArrowRight className="ml-1 size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
