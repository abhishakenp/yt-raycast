import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AeoStats — proof-point stat band for an Answer-Engine-Optimization (AEO) SaaS.
 * A centered SectionHeading sits above a responsive StatGrid of headline metrics
 * — prompts tracked, citations earned, brands optimized, and average visibility
 * uplift. Layout-only StatGrid is wrapped in a padded section with a container
 * and heading per kit convention. Use to build credibility on AEO,
 * generative-search visibility, or brand-citation analytics pages.
 */
export const AeoStats = defineComponent({
  name: 'AeoStats',
  description:
    'Proof-point statistics band for an Answer-Engine-Optimization (AEO) product: a centered heading above a responsive grid of headline metrics (prompts tracked, citations earned, brands optimized, average visibility uplift). Use to establish scale and credibility on AEO, generative-search visibility, or brand-citation analytics landing pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '12M+', label: 'Prompts tracked monthly' },
          { value: '480K', label: 'Citations earned for customers' },
          { value: '2,100+', label: 'Brands optimized' },
          { value: '3.4×', label: 'Average AI visibility uplift' },
        ]

    return (
      <section
        className={
          'bg-muted py-20 lg:py-28' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <SectionHeading
              eyebrow={props.eyebrow ?? 'By the numbers'}
              title={
                props.heading ?? 'Measurable results across every answer engine'
              }
              subtitle={
                props.subheading ??
                'Teams use Citeable to turn AI answers into a reliable, trackable acquisition channel.'
              }
            />
          </div>
          <StatGrid stats={stats} columns={props.columns ?? 4} />
        </div>
      </section>
    )
  },
})
