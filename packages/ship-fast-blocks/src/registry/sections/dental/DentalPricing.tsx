import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * DentalPricing — transparent pricing / in-house membership block for a dental
 * practice site. A centered eyebrow + heading + lede above a 3-up plan grid;
 * the featured plan is filled in the primary color with an optional corner badge
 * while the others are bordered muted cards. Each plan shows a name, tagline,
 * big price + period, a check-marked feature list, and a full-width CTA button,
 * with a small reassurance note under the grid. CTAs route through useNavigate.
 * Use to present exam fees, membership tiers, or treatment packages for
 * dentists, dental offices, or clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { Card } from '#/section-kit/Card.tsx'
export const DentalPricing = defineCapsule({
  name: 'DentalPricing',
  description:
    'Transparent pricing / in-house membership block for a dental practice site: a centered eyebrow + heading + lede above a 3-up plan grid where the featured plan is filled in the primary color with an optional corner badge and the others are bordered muted cards. Each plan shows a name, tagline, big price + period, a check-marked feature list, and a full-width CTA button, with a small reassurance note under the grid. CTAs route through useNavigate. Use to present exam fees, membership tiers, or treatment packages for dentists, dental offices, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    note: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const pricingEyebrow = props.eyebrow ?? 'Pricing & Membership'
    const pricingHeading =
      props.heading ?? 'Transparent pricing for every budget'
    const pricingDesc =
      props.description ??
      'We accept most insurance plans and offer an in-house membership plan for uninsured patients. No hidden fees, ever.'
    const pricingNote =
      props.note ??
      'All major credit cards, HSA/FSA, and CareCredit financing accepted. Insurance claims filed on your behalf.'
    const pricingPlans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'New Patient Exam',
            tagline: 'Comprehensive first visit',
            price: '$99',
            period: ' one-time',
            features: [
              'Complete oral examination',
              'Digital X-rays (4 bitewings)',
              'Oral cancer screening',
              'Personalized treatment plan',
            ],
            cta: 'Book Now',
          },
          {
            name: 'Annual Membership',
            tagline: 'For uninsured patients',
            price: '$39',
            period: '/month',
            features: [
              '2 professional cleanings/year',
              'Annual exam & X-rays',
              '15% off all procedures',
              'Emergency visit included',
              'No waiting periods',
            ],
            cta: 'Enroll Today',
            featured: true,
            badge: 'Popular',
          },
          {
            name: 'Professional Whitening',
            tagline: 'In-office treatment',
            price: '$499',
            period: ' one-time',
            features: [
              'Up to 8 shades lighter',
              '90-minute single session',
              'Take-home touch-up kit',
              'Results last 1-3 years',
            ],
            cta: 'Book Consultation',
          },
        ]
    useSyncLocalServices(
      lakebed,
      pricingPlans.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.period}`,
          summary: plan.tagline,
        }),
      ),
    )
    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow
              variant="text"
              className="mb-3 inline-block text-sm tracking-wider text-primary"
            >
              {pricingEyebrow}
            </Eyebrow>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {pricingHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{pricingDesc}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.featured ? 'outline' : 'muted'}
                rounded="2xl"
                padding="lg"
                className={cn(
                  'relative overflow-hidden',
                  plan.featured
                    ? 'border-0 bg-primary text-primary-foreground'
                    : '',
                )}
              >
                {plan.badge ? (
                  <div className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-medium">
                    {plan.badge}
                  </div>
                ) : null}
                <h3
                  className={cn(
                    'mb-2 text-xl font-bold',
                    plan.featured ? '' : 'text-foreground',
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    'mb-6',
                    plan.featured
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.tagline}
                </p>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-4xl font-bold',
                      plan.featured ? '' : 'text-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      plan.featured
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        'flex items-start gap-3',
                        plan.featured ? '' : 'text-muted-foreground',
                      )}
                    >
                      <Check
                        className={cn(
                          'mt-0.5 size-5 shrink-0',
                          plan.featured ? '' : 'text-primary',
                        )}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={plan.cta}
                  service={plan.name}
                  source="pricing"
                  pendingChildren={
                    <LocalServiceMutationSpinner
                      className={plan.featured ? 'text-primary' : undefined}
                    />
                  }
                  className={cn(
                    'block w-full rounded-xl py-3 text-center font-semibold transition-colors',
                    plan.featured
                      ? 'bg-background text-primary hover:bg-muted'
                      : 'border-2 border-border bg-background text-foreground hover:border-primary hover:text-primary',
                    'disabled:pointer-events-none disabled:opacity-70',
                  )}
                >
                  {plan.cta}
                </LocalServiceBookingButton>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {pricingNote}
          </p>
        </Container>
      </section>
    )
  },
})
