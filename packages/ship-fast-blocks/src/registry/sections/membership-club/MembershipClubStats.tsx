import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * MembershipClubStats — inverted community-scale band for a private membership
 * club / exclusive community page. The single dramatic dark moment on the page: a
 * near-black bg-foreground / text-background band cut with a slanted top seam and
 * carrying a giant ghost serif watermark, above a collapsed-border 2-to-4 column
 * grid of metric cells divided by faint vertical hairlines, each pairing a large
 * light serif tabular-nums value with a small mono uppercase label. Use as the
 * proof band conveying members, clubhouses, events and retention for members
 * clubs, professional networks, founders communities or curated collectives.
 * Renders fully with no props.
 */
export const MembershipClubStats = defineCapsule({
  name: 'MembershipClubStats',
  description:
    'Inverted community-scale band for a private membership club / exclusive community page: the single dramatic dark moment on the page — a near-black bg-foreground / text-background band cut with a slanted top seam and a giant ghost serif watermark, above a collapsed-border 2-to-4 column grid of metric cells divided by faint vertical hairlines, each pairing a large light serif tabular-nums value with a small mono uppercase label. Use as the proof band conveying members, clubhouses, events and retention for members clubs, professional networks, founders communities or curated collectives.',
  props: z.object({
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '487', label: 'Active Members' },
          { value: '8', label: 'Global Clubhouses' },
          { value: '50+', label: 'Events Per Month' },
          { value: '94%', label: 'Annual Retention' },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] pt-36 pb-24 lg:pt-40 lg:pb-28',
          props.className,
        )}
        aria-label="Community statistics"
      >
        <Watermark
          aria-hidden="true"
          className="left-1/2 top-24 -translate-x-1/2 font-serif text-[24vw] font-normal leading-none tracking-tighter text-background/[0.05]"
        >
          Circle
        </Watermark>
        <Container className="relative">
          <StatGrid columns={4} className="gap-0 divide-x divide-background/20">
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="center"
                  className="px-4 py-2"
                >
                  <StatValue
                    fontFamily="serif"
                    size="xl"
                    color="inverted"
                    className="font-normal"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color="inverted"
                    className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em]"
                  >
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
