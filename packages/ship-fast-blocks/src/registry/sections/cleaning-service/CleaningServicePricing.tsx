import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServicePricing — a 3-tier transparent pricing table for a home-cleaning / maid-service landing page. A muted-band background with a centered heading + lead paragraph above a responsive 3-column grid of pricing cards: the middle "Most Popular" plan is elevated, highlighted with the primary brand color and a badge pill; side plans sit on card surfaces with secondary CTAs. A footnote row with a phone-icon link sits below the grid. Every CTA and the footnote link route through useNavigate. Use for service-pricing / plan-selection blocks for residential cleaning companies, maid services, or any local home-service business. Renders fully with no props via three baked-in default plans.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CleaningServicePricing = defineCapsule({
  name: 'CleaningServicePricing',
  description:
    "A 3-tier transparent pricing table for a home-cleaning / maid-service landing page: muted-band background with centered heading + lead above a responsive 3-column grid of pricing cards. Middle 'Most Popular' plan is brand-colored, elevated, and badged; side plans sit on card surfaces with secondary CTAs. Footnote row with phone-icon link below. CTAs and footnote link route through useNavigate. Use for service-pricing / plan-selection blocks for residential cleaning, maid services, or local home-service businesses.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Footnote question below the pricing grid. */
    footnote: z.string().optional(),
    /** Footnote CTA / phone line shown as a routable link. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Transparent pricing, no surprises'
    const description =
      props.description ??
      'Choose the plan that fits your home and budget. All plans include our satisfaction guarantee.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Studio / 1 Bedroom',
            blurb: 'Perfect for apartments and small spaces',
            price: '$129',
            period: '/visit',
            features: [
              '2-3 hours of cleaning',
              'Up to 800 sq ft',
              '1 bathroom',
              'All cleaning supplies',
            ],
            cta: 'Book This Plan',
          },
          {
            name: '2-3 Bedroom Home',
            blurb: 'Ideal for families and medium homes',
            price: '$189',
            period: '/visit',
            features: [
              '3-4 hours of cleaning',
              'Up to 2,000 sq ft',
              'Up to 2 bathrooms',
              'Inside refrigerator',
              'All cleaning supplies',
            ],
            cta: 'Book This Plan',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: '4+ Bedroom Home',
            blurb: 'For larger homes and estates',
            price: '$279',
            period: '/visit',
            features: [
              '4-6 hours of cleaning',
              'Up to 4,000 sq ft',
              'Up to 4 bathrooms',
              '2-person cleaning team',
            ],
            cta: 'Book This Plan',
          },
        ]
    const footnote =
      props.footnote ??
      'Need a custom quote for a larger space or commercial property?'
    const footnoteCta =
      props.footnoteCta ?? 'Call for custom pricing: (555) 123-4567'
    useSyncLocalServices(
      lakebed,
      plans.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.period}`,
          summary: plan.blurb,
        }),
      ),
    )
    const Check = ({ className }) => (
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
    const PhoneIcon = ({ className }) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid items-start gap-8 md:grid-cols-3 lg:gap-6">
            {plans.map((plan) =>
              plan.featured ? (
                <div
                  key={plan.name}
                  className="relative rounded-2xl border border-primary bg-primary p-8 shadow-xl lg:-mt-4 lg:mb-4"
                >
                  {plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                        {plan.badge}
                      </span>
                    </div>
                  ) : null}
                  <h3 className="mb-2 text-lg font-semibold text-primary-foreground">
                    {plan.name}
                  </h3>
                  <p className="mb-6 text-sm text-primary-foreground/80">
                    {plan.blurb}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary-foreground">
                      {plan.price}
                    </span>
                    <span className="text-primary-foreground/80">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 shrink-0 text-primary-foreground/90" />
                        <span className="text-sm text-primary-foreground/90">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <LocalServiceBookingButton
                    lakebed={lakebed}
                    intentLabel={plan.cta}
                    service={plan.name}
                    source="pricing"
                    pendingChildren={
                      <LocalServiceMutationSpinner className="text-primary" />
                    }
                    className="w-full rounded-full bg-primary-foreground px-6 py-3 font-semibold text-primary shadow-lg transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-70"
                  >
                    {plan.cta}
                  </LocalServiceBookingButton>
                </div>
              ) : (
                <Card key={plan.name} rounded="2xl" padding="lg" shadow="sm">
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                    {plan.name}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {plan.blurb}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-card-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <LocalServiceBookingButton
                    lakebed={lakebed}
                    intentLabel={plan.cta}
                    service={plan.name}
                    source="pricing"
                    pendingChildren={<LocalServiceMutationSpinner />}
                    className="w-full rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:pointer-events-none disabled:opacity-70"
                  >
                    {plan.cta}
                  </LocalServiceBookingButton>
                </Card>
              ),
            )}
          </div>
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">{footnote}</p>
            <button
              type="button"
              onClick={() => go(footnoteCta)}
              className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <PhoneIcon className="size-5" />
              {footnoteCta}
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
