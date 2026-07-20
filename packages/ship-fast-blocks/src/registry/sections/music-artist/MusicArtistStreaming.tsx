import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { StreamingLinks } from '#/section-kit/StreamingLinks.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MusicArtistStreaming — hairline-bounded mono "stream on" ticker strip for a
 * music artist / band page. A rotated mono ticket label leads a left-aligned,
 * hairline-divided marquee-style row of uppercase streaming-platform name links
 * (Spotify, Apple Music, Bandcamp, etc.). Bold poster aesthetic driven entirely
 * by theme tokens (flips light/dark). Each platform routes through section-kit
 * route links. Use as a thin availability strip directly under the hero on
 * musician, band, or album-release pages. Renders fully with no props via
 * baked-in defaults.
 */
export const MusicArtistStreaming = defineCapsule({
  name: 'MusicArtistStreaming',
  description:
    "Hairline-bounded mono 'stream on' ticker strip for a music artist / band page: a rotated mono ticket label leading a left-aligned, hairline-divided marquee-style row of uppercase streaming-platform name links (Spotify, Apple Music, Bandcamp, YouTube Music, SoundCloud, Tidal). Bold poster aesthetic driven entirely by theme tokens (flips light/dark). Each platform routes through section-kit route links. Use as a thin availability strip directly under the hero on musician, band, or album-release pages.",
  props: z.object({
    /** Small uppercase label above the platform row. */
    label: z.string().optional(),
    /** Streaming-platform name labels. */
    platforms: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
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
            <LogoStrip className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:gap-10">
              <LogoStripLabel className="inline-flex w-fit -rotate-2 items-center gap-2 rounded-full border border-foreground bg-background px-4 py-1.5 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground md:shrink-0">
                {label}
              </LogoStripLabel>
              <LogoStripItems
                layout="flex"
                className="mt-0 flex-1 justify-start gap-x-8 gap-y-4"
              >
                {platforms.filter(Boolean).map((logo) => (
                  <LogoStripItem
                    key={logo}
                    variant="text-bold"
                    className="font-mono text-xs font-medium uppercase tracking-[0.2em] transition-colors"
                    asChild
                  >
                    <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
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
