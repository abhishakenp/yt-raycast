import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyServices — kinetic services / capabilities grid on a diagonal-
 * seam muted band. An asymmetric header (mono "[ SERVICES ]" meta left, marker-
 * highlighted heading and description) sits above a 3-up grid of sharp
 * hard-offset-shadow cards, each opening with a mono "01 / SERVICE" index, a bold
 * title, a short description, and a hairline-divided capability checklist with
 * primary ticks; cards gain a foreground hairline on hover. Use to present
 * marketing-agency service lines (performance marketing, SEO, email, CRO, social,
 * analytics). Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const MarketingAgencyServices = defineCapsule({
  name: 'MarketingAgencyServices',
  description:
    'Kinetic services / capabilities grid on a diagonal-seam muted band: an asymmetric header (mono services meta, marker-highlighted heading and description) above a 3-up grid of sharp hard-offset-shadow cards, each with a mono service index, a bold title, a short description, and a hairline-divided capability checklist with primary ticks. Use to present marketing-agency service lines such as performance marketing, SEO & content, email, CRO, social, and analytics.',
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
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          // Diagonal top seam on a contrasting muted band — neighbor-independent.
          'relative overflow-hidden bg-muted/40 pt-20 pb-20 lg:pt-28 lg:pb-28 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Services
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · {String(items.length).padStart(2, '0')}
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ {eyebrow} ]
            </p>
          </div>
          <FeatureGrid columns={3}>
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className="gap-0 rounded-none border-foreground/80 p-6 shadow-[6px_6px_0_0] shadow-foreground/10 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground/15 motion-reduce:transform-none"
                >
                  <MonoTag className="flex items-center gap-2" tone="faint">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    {String(i + 1).padStart(2, '0')} / Service
                  </MonoTag>
                  <FeatureTitle className="mt-4 text-xl font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="mt-2 leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                  {__iv__.points?.length ? (
                    <ul className="mt-5 flex flex-col gap-0 divide-y divide-border border-t border-border">
                      {__iv__.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2.5 py-2.5 text-sm text-foreground/85"
                        >
                          <svg
                            className="size-4 shrink-0 text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
