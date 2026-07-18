import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcarePricing — transparent pricing table for a medical-clinic page. A
 * centered eyebrow chip, heading and intro above a 3-column grid of plan cards;
 * each card has a name, tagline, big price with a unit, a check-marked feature
 * list, and a full-width CTA routing through useNavigate. A featured plan gets a
 * primary border, shadow and a floating "Most Popular" badge, plus a primary
 * CTA. Below the grid sits a reassurance note with an inline "verify coverage"
 * link. Use for a self-pay / visit-pricing / membership section of a doctors'
 * office or clinic. Renders fully with no props via baked-in visit-tier defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'
export const HealthcarePricing = defineCapsule({
  name: 'HealthcarePricing',
  description:
    "Transparent pricing table for a medical-clinic page: a centered eyebrow chip, heading and intro above a 3-column grid of plan cards, each with a name, tagline, big price with a unit, a check-marked feature list, and a full-width CTA routing through useNavigate. A featured plan gets a primary border, shadow and a floating 'Most Popular' badge plus a primary CTA. Below the grid sits a reassurance note with an inline 'verify coverage' link. Use for a self-pay / visit-pricing / membership section of a doctors' office or clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans: name, tagline, price, unit, features, CTA, featured flag, badge. */
    items: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Reassurance note under the grid. */
    note: z.string().optional(),
    /** Inline link label appended after the note. */
    noteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Transparent Pricing'
    const heading = props.heading ?? 'Simple, upfront pricing'
    const description =
      props.description ??
      'No hidden fees or surprise bills. We accept most major insurance plans and offer transparent self-pay rates.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'New Patient Visit',
            tagline: 'Comprehensive initial consultation',
            price: '$180',
            unit: '/visit',
            features: [
              '60-minute consultation',
              'Complete health history review',
              'Personalized care plan',
              'Patient portal access',
            ],
            cta: 'Book new patient visit',
          },
          {
            name: 'Follow-up Visit',
            tagline: 'For existing patients',
            price: '$120',
            unit: '/visit',
            features: [
              '30-minute consultation',
              'Progress review & adjustments',
              'Medication management',
              'In-person or virtual',
            ],
            cta: 'Book follow-up',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Urgent Care',
            tagline: 'Same-day appointments',
            price: '$150',
            unit: '/visit',
            features: [
              'Same-day appointment',
              'Acute illness treatment',
              'Rapid testing available',
              'Prescription refills',
            ],
            cta: 'Book urgent care',
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.unit}`,
          summary: plan.tagline,
        }),
      ),
    )
    const note =
      props.note ?? 'Insurance typically covers 80-100% of visit costs.'
    const noteCta = props.noteCta ?? 'Verify your coverage'
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    void Check
    void note
    void noteCta
    return (
      <section
        id="pricing"
        className={cn('bg-muted py-20 lg:py-28', props.className)}
        aria-labelledby="pricing-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2
              id="pricing-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <PricingGrid
            tiers={items}
            heading="Simple, upfront pricing"
            subheading="No hidden fees or surprise bills. We accept most major insurance plans and offer transparent self-pay rates."
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
