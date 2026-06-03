import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MusicArtistStreaming — slim "stream on" platform strip for a music artist /
 * band page. A small centered uppercase label above a horizontally-wrapping row
 * of streaming-platform name buttons (Spotify, Apple Music, Bandcamp, etc.) on a
 * border-banded band. Warm, airy, editorial indie-folk aesthetic. Each platform
 * routes through useNavigate. Use as a thin trust / availability strip directly
 * under the hero on musician, band, or album-release pages. Renders fully with
 * no props via baked-in defaults.
 */
export const MusicArtistStreaming = defineComponent({
  name: "MusicArtistStreaming",
  description:
    "Slim 'stream on' streaming-platform strip for a music artist / band page: a small centered uppercase label above a horizontally-wrapping row of streaming-platform name buttons (Spotify, Apple Music, Bandcamp, YouTube Music, SoundCloud, Tidal) on a border-banded band. Warm, airy editorial indie-folk aesthetic. Each platform routes through useNavigate. Use as a thin trust / availability strip directly under the hero on musician, band, or album-release pages.",
  props: z.object({
    /** Small uppercase label above the platform row. */
    label: z.string().optional(),
    /** Streaming-platform name labels. */
    platforms: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? "Stream on"
    const platforms = props.platforms?.length
      ? props.platforms
      : [
          "Spotify",
          "Apple Music",
          "Bandcamp",
          "YouTube Music",
          "SoundCloud",
          "Tidal",
        ]

    return (
      <section
        className={cn("border-y border-border py-12", props.className)}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="mb-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {platforms.map((platform) => (
              <button
                key={platform}
                type="button"
                aria-label={platform}
                onClick={() => go(platform)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
