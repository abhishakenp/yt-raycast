import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyServices — a 6-up services / capabilities grid. A centered
 * eyebrow + heading + description above a responsive grid of muted rounded cards
 * (1/2/3 columns), each with a filled primary icon tile, a service title, a short
 * description, and a bulleted list of capabilities with small dot markers; cards
 * lift to an accent surface on hover. Icons rotate through a built-in set
 * (chart, search, mail, pie, users, document). Use to present marketing-agency
 * service lines (performance marketing, SEO, email, CRO, social, analytics).
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'
export const MarketingAgencyServices = defineCapsule({
  name: 'MarketingAgencyServices',
  description:
    '6-up services / capabilities grid: a centered eyebrow + heading + description above a responsive grid of muted rounded cards (1/2/3 columns), each with a filled primary icon tile, a service title, a short description, and a bulleted capability list with dot markers; cards lift to an accent surface on hover. Icons rotate through a built-in set (chart, search, mail, pie, users, document). Use to present marketing-agency service lines such as performance marketing, SEO & content, email, CRO, social, and analytics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading = props.heading ?? 'Growth Strategies That Work'
    const description =
      props.description ??
      'We combine data science with creative excellence to deliver measurable results across every channel.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Performance Marketing',
            description:
              'Google Ads, Meta, LinkedIn, and TikTok campaigns optimized for ROAS. We manage $2M+ in monthly ad spend with an average 4.2x return.',
            points: [
              'Audience segmentation',
              'Creative A/B testing',
              'Conversion tracking',
            ],
          },
          {
            title: 'SEO & Content',
            description:
              "Technical SEO audits, content strategy, and link building. We've helped clients rank #1 for 5,000+ competitive keywords.",
            points: [
              'Technical audits',
              'Content clusters',
              'Authority building',
            ],
          },
          {
            title: 'Email Marketing',
            description:
              'Automated sequences, newsletters, and retention campaigns. Our clients see 35%+ open rates and $45 average revenue per email.',
            points: ['Lifecycle automation', 'Segmentation', 'A/B testing'],
          },
          {
            title: 'Conversion Optimization',
            description:
              'CRO audits, user research, and landing page optimization. Average 23% lift in conversion rates within 60 days.',
            points: ['Heatmap analysis', 'User testing', 'Landing page design'],
          },
          {
            title: 'Social Media',
            description:
              'Organic strategy, content creation, and community management. We grew client followings by 2M+ across platforms last year.',
            points: [
              'Content calendars',
              'Video production',
              'Influencer outreach',
            ],
          },
          {
            title: 'Analytics & Reporting',
            description:
              'Custom dashboards, attribution modeling, and actionable insights. Know exactly which campaigns drive revenue.',
            points: [
              'Custom dashboards',
              'Attribution modeling',
              'Weekly reports',
            ],
          },
        ]
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
