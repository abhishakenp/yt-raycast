import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MusicFestivalStats — a kinetic-poster inverted stats band for a music / arts
 * festival landing page. A full-bleed inverted section (foreground background,
 * light text) cut in on a slanted clip-path seam, carrying a mono meta rule and
 * a giant ghost watermark word behind a collapsed-border grid of cells — each
 * with a poster-scale tabular numeral above a mono uppercase label (artists,
 * stages, attendees, days). Use as a punchy by-the-numbers proof band between
 * content sections on music festivals, arts festivals, concert series, or any
 * multi-day live event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const MusicFestivalStats = defineCapsule({
  name: 'MusicFestivalStats',
  description:
    'Kinetic-poster inverted stats band for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) section cut on a slanted clip-path seam with a mono meta rule and a giant ghost watermark word behind a collapsed-border grid of cells, each carrying a poster-scale tabular numeral above a mono uppercase label (artists performing, unique stages, music lovers, unforgettable days). Use as a punchy by-the-numbers proof band between content sections on music festivals, arts festivals, concert series, raves, or any multi-day live event.',
  props: z.object({
    /** Stat items (value + label). */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '80+',
            label: 'Artists Performing',
          },
          {
            value: '4',
            label: 'Unique Stages',
          },
          {
            value: '25K',
            label: 'Music Lovers',
          },
          {
            value: '3',
            label: 'Unforgettable Days',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pb-16 pt-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-left-2 bottom-0 text-background/[0.06] text-[10rem] leading-[0.75] sm:text-[16rem]">
          LIVE
        </Watermark>
        <Container className="relative">
          <p
            aria-hidden="true"
            className="mb-10 flex items-center gap-3 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50"
          >
            <span className="size-1.5 bg-background/60" />
            By the numbers
          </p>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-8"
                >
                  <StatValue className="mb-0 text-[clamp(2.75rem,6vw,5rem)] font-extrabold leading-none tracking-tight text-background tabular-nums md:text-[clamp(2.75rem,6vw,5rem)]">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
