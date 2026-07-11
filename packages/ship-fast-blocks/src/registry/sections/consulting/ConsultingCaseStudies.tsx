import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * ConsultingCaseStudies — 6-up case-study gallery with industry tags and
 * engagement metrics for a management-consulting firm page. A heading + lead on
 * the left with a "View All" link on the right, above a 3-column grid of
 * clickable project cards; each card has an alt-driven image that zooms on
 * hover, a category tag chip overlaid on the image, a title, description, and
 * duration/period meta. Every card and the view-all link route through
 * useNavigate. Use to showcase consulting case studies, client success stories,
 * or industry-specific engagements. Renders fully with no props via six
 * baked-in default case studies.
 */
export const ConsultingCaseStudies = defineCapsule({
  name: 'ConsultingCaseStudies',
  description:
    "6-up case-study gallery with industry tags and engagement metrics for a management-consulting firm page: a heading and lead paragraph on the left with a 'View All' link on the right, above a 3-column grid of clickable project cards. Each card has an alt-driven image that zooms on hover, a category tag chip overlaid on the image, a title, a description, and duration/period meta. Cards and the view-all link route through useNavigate. Use to showcase consulting case studies, client success stories, or industry-specific engagements.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** "View All" link label. */
    viewAll: z.string().optional(),
    /** Case-study cards: tag, title, description, duration, period, imageAlt. */
    items: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          description: z.string(),
          duration: z.string(),
          period: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Featured Case Studies'
    const description =
      props.description ??
      "Real results from real partnerships. Explore how we've helped clients across industries achieve transformative outcomes."
    const viewAll = props.viewAll ?? 'View All Insights'
    const items = props.items?.length
      ? props.items
      : [
          {
            tag: 'Financial Services',
            title: "Transforming a Regional Bank's Digital Ecosystem",
            description:
              'Helped First Capital Bank redesign their digital platform, resulting in 47% increase in mobile adoption and $23M in operational savings over 18 months.',
            duration: '18-month engagement',
            period: '2023-2024',
            imageAlt:
              'Modern glass skyscraper headquarters building in downtown business district',
          },
          {
            tag: 'Manufacturing',
            title: 'Operational Turnaround for Industrial Manufacturer',
            description:
              'Partnered with Meridian Industrial to implement lean manufacturing principles, reducing production costs by 31% and improving on-time delivery to 97%.',
            duration: '24-month engagement',
            period: '2022-2024',
            imageAlt:
              'Advanced manufacturing facility with robotic arms assembling products on production line',
          },
          {
            tag: 'Healthcare',
            title: 'Post-Merger Integration for Health System Expansion',
            description:
              'Guided Westview Health System through the integration of three acquired hospitals, achieving $85M in synergies while maintaining quality of care standards.',
            duration: '36-month engagement',
            period: '2021-2024',
            imageAlt:
              'Healthcare professionals reviewing patient data on tablets in modern hospital setting',
          },
          {
            tag: 'Retail',
            title: 'Omnichannel Strategy for National Retailer',
            description:
              'Developed and executed an omnichannel transformation for Carter Retail Group, driving 28% growth in e-commerce revenue and improving customer lifetime value by 34%.',
            duration: '30-month engagement',
            period: '2022-2024',
            imageAlt:
              'Retail store interior with customers shopping and modern product displays',
          },
          {
            tag: 'Energy',
            title: 'Sustainability Transformation for Energy Provider',
            description:
              "Supported Pacific Energy's transition to renewable sources, developing a 10-year roadmap that positions the company for carbon neutrality by 2035.",
            duration: '15-month engagement',
            period: '2023-2024',
            imageAlt:
              'Sustainable office building with green rooftop garden and solar panels',
          },
          {
            tag: 'Technology',
            title: 'Product Strategy for SaaS Market Leader',
            description:
              'Helped CloudSync Technologies redefine their product portfolio, entering three new market segments and increasing ARR by $42M in the first year.',
            duration: '12-month engagement',
            period: '2023-2024',
            imageAlt:
              'Software development team collaborating on multiple monitors in modern tech office',
          },
        ]

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
            >
              {viewAll}
              <ArrowRight />
            </button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.title)}
                className="group block w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground">
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-muted-foreground">
                    {item.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.duration}</span>
                    <span className="h-4 w-px bg-border" />
                    <span>{item.period}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
