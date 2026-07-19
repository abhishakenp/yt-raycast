import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/index.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * DevToolStats — a compact 4-up metrics band for a developer tool / API
 * platform. A top-and-bottom bordered section with a centered 2-up (mobile) /
 * 4-up (desktop) grid of stats, each a large bold value above a muted label.
 * Static (no links). Use as a credibility strip between sections to highlight
 * developer count, uptime, latency, and request volume for developer tools,
 * API platforms, or technical SaaS.
 */
export const DevToolStats = defineCapsule({
  name: 'DevToolStats',
  description:
    'Compact 4-up metrics band for a developer tool / API platform: a top-and-bottom bordered section with a centered 2-up (mobile) / 4-up (desktop) grid of stats, each a large bold value above a muted label. Use as a credibility strip between sections to highlight developer count, uptime, latency, and request volume for developer tools, API platforms, or technical SaaS.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '50K+', label: 'Active Developers' },
          { value: '99.99%', label: 'Uptime SLA' },
          { value: '50ms', label: 'Global Latency' },
          { value: '2B+', label: 'Requests/Day' },
        ]

    return (
      <section
        className={cn('border-y border-border py-16', props.className)}
        aria-label="Platform statistics"
      >
        <Container>
          <StatGrid columns={4} className="gap-12">
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'bold'} size={'default'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
