import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

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

/**
 * AnalyticsFeatures — four-up capability grid for an analytics product,
 * composing the shared FeatureGrid kit composite inside a padded section. An
 * optional centered SectionHeading sits above four token-styled feature cards
 * with inline stroke icons: real-time event tracking, custom dashboards, smart
 * alerting, and integrations. Sharp, data-forward, marketing-grade. Use to
 * explain the core capabilities of any analytics, BI, or data-product site.
 * Renders fully with no props via baked-in defaults.
 */
export const AnalyticsFeatures = defineComponent({
  name: 'AnalyticsFeatures',
  description:
    'Four-up capability grid for an analytics product, composing the shared FeatureGrid kit composite inside a padded section. An optional centered SectionHeading sits above four token-styled feature cards with inline stroke icons: real-time event tracking, custom dashboards, smart alerting, and integrations. Sharp, data-forward and marketing-grade. Use to explain the core capabilities of any analytics, BI, or data-product site.',
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
      <section className={cn('bg-background py-20 sm:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="mb-14"
          />
          <FeatureGrid features={features} columns={4} />
        </div>
      </section>
    )
  },
})
