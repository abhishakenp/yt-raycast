import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { StreamingLinks } from '#/section-kit/StreamingLinks.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MusicArtistStreaming — slim "stream on" platform strip for a music artist /
 * band page. A small centered uppercase label above a horizontally-wrapping row
 * of streaming-platform name buttons (Spotify, Apple Music, Bandcamp, etc.) on a
 * border-banded band. Warm, airy, editorial indie-folk aesthetic. Each platform
 * routes through useNavigate. Use as a thin trust / availability strip directly
 * under the hero on musician, band, or album-release pages. Renders fully with
 * no props via baked-in defaults.
 */
export const MusicArtistStreaming = defineCapsule({
  name: 'MusicArtistStreaming',
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
    const label = props.label ?? 'Stream on'
    const platforms = props.platforms?.length
      ? props.platforms
      : [
          'Spotify',
          'Apple Music',
          'Bandcamp',
          'YouTube Music',
          'SoundCloud',
          'Tidal',
        ]

    return (
      <div className={cn('border-y border-border', props.className)}>
        <Container asChild size="lg" className="px-6 lg:px-6">
          <StreamingLinks>
            <LogoStrip className="pt-28 pb-12">
              <LogoStripLabel className="text-xs uppercase tracking-widest">
                {label}
              </LogoStripLabel>
              <LogoStripItems layout="flex" className="mt-8">
                {platforms.filter(Boolean).map((logo) => (
                  <LogoStripItem
                    key={logo}
                    variant="text-bold"
                    className="text-sm font-medium"
                    asChild
                  >
                    <button onClick={() => ((platform) => go(platform))(logo)}>
                      {logo}
                    </button>
                  </LogoStripItem>
                ))}
              </LogoStripItems>
            </LogoStrip>
          </StreamingLinks>
        </Container>
      </div>
    )
  },
})
