import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ResponsiveGrid cols="2-md-4" gap="lg" className="text-center">
            {items.map((s) => (
              <div key={s.label}>
                <div className="mb-1 text-3xl font-bold text-foreground sm:text-4xl">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
