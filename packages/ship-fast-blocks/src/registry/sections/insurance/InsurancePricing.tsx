import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsurancePricing — 3-tier transparent pricing table for an insurance page. On
 * a soft muted canvas: a centered eyebrow chip + heading + lede above a 3-column
 * grid of plan cards (name, tagline, big monthly price + period, an included/
 * excluded feature checklist with check or cross icons, and a CTA button). The
 * "Most Popular" plan is highlighted with a brand border, lift and a top badge.
 * CTAs route through useNavigate. Use as the pricing section for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'
export const InsurancePricing = defineCapsule({
  name: 'InsurancePricing',
  description:
    "3-tier transparent pricing table for an insurance page on a soft muted canvas: a centered eyebrow chip + heading + lede above a 3-column grid of plan cards (name, tagline, big monthly price + period, an included/excluded feature checklist with check or cross icons, and a CTA button). The 'Most Popular' plan is highlighted with a brand border, upward lift and a top badge. CTAs route through useNavigate. Use as the pricing section for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Badge label shown on the popular plan. */
    popularLabel: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          popular: z.boolean().optional(),
          features: z.array(
            z.object({
              label: z.string(),
              included: z.boolean(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Transparent Pricing'
    const heading = props.heading ?? 'Simple, upfront pricing'
    const description =
      props.description ??
      "No hidden fees, no surprises. Choose the coverage level that's right for you."
    const popularLabel = props.popularLabel ?? 'Most Popular'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Essential',
            tagline: 'Basic coverage for budget-conscious families',
            price: '$89',
            period: '/month',
            cta: 'Get Started',
            popular: false,
            features: [
              {
                label: '$100K liability coverage',
                included: true,
              },
              {
                label: '$500 deductible',
                included: true,
              },
              {
                label: '24/7 claims support',
                included: true,
              },
              {
                label: 'Identity theft protection',
                included: false,
              },
            ],
          },
          {
            name: 'Complete',
            tagline: 'Comprehensive protection for peace of mind',
            price: '$149',
            period: '/month',
            cta: 'Get Started',
            popular: true,
            features: [
              {
                label: '$500K liability coverage',
                included: true,
              },
              {
                label: '$250 deductible',
                included: true,
              },
              {
                label: '24/7 claims support',
                included: true,
              },
              {
                label: 'Identity theft protection',
                included: true,
              },
              {
                label: 'Personal umbrella policy',
                included: true,
              },
            ],
          },
          {
            name: 'Premium',
            tagline: 'Maximum protection for high-value assets',
            price: '$229',
            period: '/month',
            cta: 'Contact Sales',
            popular: false,
            features: [
              {
                label: '$1M liability coverage',
                included: true,
              },
              {
                label: '$100 deductible',
                included: true,
              },
              {
                label: 'Priority claims processing',
                included: true,
              },
              {
                label: 'Full identity restoration',
                included: true,
              },
              {
                label: 'Dedicated agent',
                included: true,
              },
            ],
          },
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
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
    )
    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    void Check
    void Cross
    void popularLabel
    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid
            tiers={plans.map((t) => ({
              ...t,
              features: Array.isArray(t.features)
                ? t.features.map((f) => (typeof f === 'string' ? f : f.label))
                : t.features,
            }))}
            heading="Simple, upfront pricing"
            subheading="No hidden fees, no surprises. Choose the coverage level that"
            className={cn(
              'mx-auto grid max-w-6xl gap-8 md:grid-cols-3',
              props.className,
            )}
          />
        </Container>
      </section>
    )
  },
})
