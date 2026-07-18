import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * ConsultingPricing — 3-tier engagement-models pricing block for a
 * management-consulting firm page. A centered heading and lead paragraph above
 * a responsive 3-column grid of tier cards; the middle tier can be featured
 * (dark primary card with a badge). Each tier includes name, price, unit,
 * description, a feature list with check icons, and a CTA button. All CTAs
 * route through useNavigate. Use for pricing, service tiers, or engagement
 * models on consulting, advisory, or professional-services sites. Renders fully
 * with no props via three baked-in default tiers.
 */
export const ConsultingPricing = defineCapsule({
  name: 'ConsultingPricing',
  description:
    '3-tier engagement-models pricing block for a management-consulting firm page: a centered heading and lead paragraph above a responsive 3-column grid of tier cards, with an optional featured middle tier (dark primary card with a badge). Each tier shows name, price, unit, description, a feature list with check icons, and a CTA button. All CTAs route through useNavigate. Use for pricing, service tiers, or engagement models on consulting, advisory, or professional-services sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          unit: z.string().optional(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Engagement Models'
    const description =
      props.description ??
      'Flexible approaches tailored to your unique challenges, timeline, and organizational needs.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Strategic Advisory',
            price: '$45K',
            unit: '/month',
            description:
              'Ideal for executive-level guidance on strategic direction, market entry, or transformation planning. Includes weekly advisory sessions and strategic roadmapping.',
            features: [
              'Monthly strategy sessions',
              'Executive coaching',
              'Market intelligence reports',
            ],
            cta: 'Learn More',
          },
          {
            name: 'Transformation Partnership',
            price: 'Custom',
            description:
              'Comprehensive support for major transformation initiatives. Dedicated team embedded with your organization for strategy through implementation.',
            features: [
              'Dedicated project team',
              'Full implementation support',
              'Change management',
              'Capability building',
            ],
            cta: 'Schedule Consultation',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Capability Building',
            price: '$85K',
            unit: '/program',
            description:
              'Intensive training and development programs to build internal consulting capabilities and leadership skills within your organization.',
            features: [
              'Workshop-based training',
              'Real project application',
              '12-week program duration',
            ],
            cta: 'Learn More',
          },
        ]

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    void CheckIcon
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid
            tiers={tiers}
            heading="Engagement Models"
            subheading="Flexible approaches tailored to your unique challenges, timeline, and organizational needs."
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          />
        </Container>
      </section>
    )
  },
})
