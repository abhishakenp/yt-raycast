import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

const ICONS = {
  realtime: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  dashboards: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  alerts: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  integrations: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="9" height="9" rx="1" />
      <rect x="13" y="13" width="9" height="9" rx="1" />
      <path d="M11 6.5h4a2 2 0 0 1 2 2v4.5M6.5 11v2a2 2 0 0 0 2 2H13" />
    </svg>
  ),
}

/** Deterministic per-cell div-built bar-chart motifs. */
const CELL_BARS = [
  ['h-2', 'h-4', 'h-3', 'h-6', 'h-5', 'h-8', 'h-6', 'h-7', 'h-8'],
  ['h-5', 'h-3', 'h-6', 'h-4', 'h-7', 'h-5', 'h-8', 'h-6', 'h-8'],
  ['h-3', 'h-5', 'h-2', 'h-6', 'h-4', 'h-7', 'h-5', 'h-8', 'h-6'],
  ['h-4', 'h-6', 'h-5', 'h-3', 'h-7', 'h-6', 'h-8', 'h-7', 'h-8'],
]

/**
 * AnalyticsFeatures — Swiss data-grid capability ledger for an analytics
 * product. An asymmetric 7:5 header (left-aligned oversized title + lede,
 * right-aligned mono index meta with a tick rule) above a collapsed-border
 * hairline grid where the first capability cell spans double width: each cell
 * carries a mono primary index, a hairline-framed stroke icon, a giant ghost
 * numeral watermark, a title, a description, and a small div-built bar-chart
 * motif along its baseline. Sharp corners, tabular discipline, faint wash on
 * hover — grid lines celebrated instead of uniform icon cards. Use to explain
 * the core capabilities of any analytics, BI, or data-product site. Renders
 * fully with no props via baked-in defaults.
 */
export const AnalyticsFeatures = defineCapsule({
  name: 'AnalyticsFeatures',
  description:
    'Swiss data-grid capability ledger for an analytics product: an asymmetric header (left-aligned oversized title + lede, right-aligned mono index meta) above a collapsed-border hairline grid where the first capability cell spans double width; each cell carries a mono primary index, a hairline-framed stroke icon, a giant ghost numeral watermark, a title, a description, and a small div-built bar-chart motif. Sharp corners and tabular discipline instead of uniform icon cards. Use to explain the core capabilities of any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Everything you need'
    const heading = props.heading ?? 'One platform for the whole funnel'
    const subheading =
      props.subheading ??
      'Capture, model, and act on your data without stitching together five different tools.'
    const defaults = [
      {
        title: 'Real-time tracking',
        description:
          'Stream every event the moment it happens and watch metrics update live — no batch delays, no stale dashboards.',
        icon: ICONS.realtime,
      },
      {
        title: 'Custom dashboards',
        description:
          'Drag, drop, and pivot any metric into shareable boards your whole team can read at a glance.',
        icon: ICONS.dashboards,
      },
      {
        title: 'Smart alerts',
        description:
          'Anomaly detection pings you in Slack or email the instant a metric drifts outside its expected band.',
        icon: ICONS.alerts,
      },
      {
        title: 'Integrations',
        description:
          'Plug into your warehouse, CDP, and ad platforms in minutes with first-class connectors and a clean API.',
        icon: ICONS.integrations,
      },
    ]
    const features = props.features?.length
      ? props.features.map((f, i) => ({
          ...f,
          icon: defaults[i % defaults.length].icon,
        }))
      : defaults

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-16 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="mb-10 grid items-end gap-6 sm:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="gap-4 lg:col-span-7"
              titleClassName="text-4xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg"
            />
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 lg:col-span-5 lg:flex-col lg:items-end lg:justify-end lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <MonoTag className="flex items-center gap-2">
                <span className="size-1.5 bg-primary" />
                Capability index
              </MonoTag>
              <MonoTag tone="faint" className="tabular-nums">
                01 — {String(features.length).padStart(2, '0')}
              </MonoTag>
            </div>
          </div>

          <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              const index = String(i + 1).padStart(2, '0')
              const bars = CELL_BARS[i % CELL_BARS.length]
              return (
                <div
                  key={__iv__.title}
                  className={cn(
                    'group relative flex flex-col border-b border-r border-border bg-background p-6 transition-colors duration-150 hover:bg-muted/30 sm:p-8',
                    i % 3 === 0 && 'sm:col-span-2 lg:col-span-2',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-4 select-none font-mono text-7xl font-bold tabular-nums text-foreground/[0.05]"
                  >
                    {index}
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <MonoTag tone="primary" className="tabular-nums">
                      {index}
                    </MonoTag>
                    {__iv__.icon && (
                      <span className="grid size-10 shrink-0 place-items-center border border-border text-muted-foreground transition-colors duration-150 group-hover:border-foreground/30 group-hover:text-foreground">
                        {__iv__.icon}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                    {__iv__.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {__iv__.description}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-auto flex items-end gap-px pt-6"
                  >
                    {bars.map((h, j) => (
                      <span
                        key={j}
                        className={cn(
                          'w-full max-w-3',
                          h,
                          j === bars.length - 1
                            ? 'bg-primary'
                            : 'bg-foreground/15',
                        )}
                      />
                    ))}
                  </span>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
