import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * MarketingAgencyCases — a 6-up case-study gallery. A centered eyebrow + heading +
 * description above a responsive grid (1/2/3 columns) of clickable card buttons,
 * each with a cover image (zooming on hover) carrying a rotating colored category
 * tag, a client name, a short summary, and a dual result-metric row split by a
 * divider. Category tags rotate through the chart token palette. Links route
 * through useNavigate. Use to showcase client outcomes for a marketing / growth
 * agency. Renders fully with no props.
 */
export const MarketingAgencyCases = defineCapsule({
  name: 'MarketingAgencyCases',
  description:
    '6-up case-study gallery: a centered eyebrow + heading + description above a responsive grid (1/2/3 columns) of clickable card buttons, each with a cover image (zooming on hover) carrying a rotating colored category tag, a client name, a short summary, and a dual result-metric row split by a divider. Category tags rotate through the chart token palette. Links route through useNavigate. Use to showcase client outcomes and results for a marketing / growth / performance agency across SaaS, e-commerce, fintech, and B2B services.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          tag: z.string(),
          summary: z.string(),
          metricA: z.string(),
          labelA: z.string(),
          metricB: z.string(),
          labelB: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Case Studies'
    const heading = props.heading ?? 'Results That Speak'
    const description =
      props.description ??
      'Real outcomes from real clients across SaaS, e-commerce, and B2B services.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'CloudSync',
            tag: 'SaaS',
            summary:
              'Workflow automation platform for remote teams. Joined at $200K ARR.',
            metricA: '892%',
            labelA: 'Revenue Growth',
            metricB: '$1.8M',
            labelB: 'New ARR in 8 Months',
          },
          {
            name: 'Luxe Threads',
            tag: 'E-commerce',
            summary:
              'Sustainable luxury fashion brand. Shopify store struggling with CAC.',
            metricA: '156%',
            labelA: 'ROAS Increase',
            metricB: '$420K',
            labelB: 'Monthly Revenue',
          },
          {
            name: 'Paywise',
            tag: 'Fintech',
            summary:
              'B2B payment processing platform. Needed enterprise lead generation.',
            metricA: '3,400',
            labelA: 'Qualified Leads',
            metricB: '$2.1M',
            labelB: 'Pipeline Generated',
          },
          {
            name: 'MedConnect',
            tag: 'Healthcare',
            summary:
              'Telehealth platform for mental health providers. HIPAA-compliant marketing.',
            metricA: '247%',
            labelA: 'Patient Signups',
            metricB: '12,500',
            labelB: 'New Providers',
          },
          {
            name: 'BuildRight',
            tag: 'Construction',
            summary:
              'Commercial construction firm. Needed local SEO and lead generation.',
            metricA: '#1',
            labelA: 'Local Rankings',
            metricB: '$5.2M',
            labelB: 'Contracts Won',
          },
          {
            name: 'LearnHub',
            tag: 'EdTech',
            summary:
              "Online coding bootcamp. High competition for 'learn to code' keywords.",
            metricA: '89K',
            labelA: 'Organic Visitors/Mo',
            metricB: '$3.8M',
            labelB: 'Course Sales',
          },
        ]

    const tagTones = [
      'bg-chart-1 text-primary-foreground',
      'bg-chart-2 text-primary-foreground',
      'bg-chart-3 text-primary-foreground',
      'bg-chart-4 text-primary-foreground',
      'bg-chart-5 text-primary-foreground',
      'bg-primary text-primary-foreground',
    ]

    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => go(c.name)}
                className="group block w-full overflow-hidden rounded-xl bg-card text-left shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    alt={`${c.name} ${c.tag} marketing case study`}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={cn(
                      'absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium',
                      tagTones[i % tagTones.length],
                    )}
                  >
                    {c.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                    {c.name}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {c.summary}
                  </p>
                  <div className="flex items-center gap-4 border-t border-border pt-4">
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">
                        {c.metricA}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.labelA}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">
                        {c.metricB}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.labelB}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
