import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { directoryLakebed } from './directory-lakebed.ts'
import {
  DirectoryLeadButton,
  DirectoryMutationSpinner,
} from './directory-interactions.tsx'

/**
 * DirectoryPricing — 3-tier business-listing pricing table for a local-business
 * directory. A card-surface section with a centered heading + description and a
 * responsive 3-column grid of plan cards: each has an uppercase plan name, a big
 * price with optional period, a tagline, an included-features list with primary
 * check icons plus an excluded-features list with muted cross icons, and a
 * full-width CTA button. A highlighted "Most Popular" plan inverts to a dark
 * foreground surface with a floating badge. CTAs record real Lakebed lead
 * actions. Use as the listing/subscription pricing section on local directories,
 * marketplaces, or find-a-service platforms.
 */
import { Container } from '#/section-kit/Container.tsx'
export const DirectoryPricing = defineCapsule({
  name: 'DirectoryPricing',
  description:
    '3-tier business-listing pricing table for a local-business DIRECTORY: a card-surface section with a centered heading and description and a responsive 3-column grid of plan cards — each has an uppercase plan name, a big price with optional period, a tagline, an included-features list with primary check icons plus an excluded-features list with muted cross icons, and a full-width CTA button. A highlighted Most Popular plan inverts to a dark foreground surface with a floating badge. CTAs record real Lakebed lead actions. Use as the listing or subscription pricing section on local directories, business-listing marketplaces, or find-a-service platforms.',
  lakebed: directoryLakebed,
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string(),
          tagline: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean(),
          badge: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'List Your Business'
    const description =
      props.description ??
      'Choose the plan that works for your business. Start free and upgrade as you grow.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Basic',
            price: 'Free',
            period: '',
            tagline: 'Perfect for getting started',
            features: [
              'Basic business listing',
              'Contact information',
              'Customer reviews',
            ],
            excluded: ['Photos & media', 'Priority placement'],
            cta: 'Get Started Free',
            featured: false,
            badge: '',
          },
          {
            name: 'Premium',
            price: '$29',
            period: '/month',
            tagline: 'Best for growing businesses',
            features: [
              'Everything in Basic',
              'Up to 20 photos',
              'Business description',
              'Priority search results',
              'Analytics dashboard',
            ],
            excluded: [],
            cta: 'Start 14-Day Trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            price: '$79',
            period: '/month',
            tagline: 'For multi-location businesses',
            features: [
              'Everything in Premium',
              'Multiple locations (5+)',
              'Unlimited photos',
              'Featured placement',
              'Dedicated support',
            ],
            excluded: [],
            cta: 'Contact Sales',
            featured: false,
            badge: '',
          },
        ]
    const Check = ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    const Cross = ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    return (
      <section className={cn('bg-card py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-xl border p-6 lg:p-8',
                  plan.featured
                    ? 'border-border bg-foreground text-background'
                    : 'border-border bg-background',
                )}
              >
                {plan.featured && plan.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}
                <div
                  className={cn(
                    'mb-2 text-sm font-medium uppercase tracking-wide',
                    plan.featured
                      ? 'text-background/60'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.name}
                </div>
                <div className="mb-4 flex items-baseline gap-1">
                  <span
                    className={cn(
                      'text-4xl font-bold',
                      plan.featured ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span
                      className={
                        plan.featured
                          ? 'text-background/60'
                          : 'text-muted-foreground'
                      }
                    >
                      {plan.period}
                    </span>
                  ) : null}
                </div>
                <p
                  className={cn(
                    'mb-6',
                    plan.featured
                      ? 'text-background/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.tagline}
                </p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className={cn(
                        'flex items-center gap-3',
                        plan.featured
                          ? 'text-background/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      <Check className="size-5 shrink-0 text-primary" />
                      {feat}
                    </li>
                  ))}
                  {plan.excluded.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-3 text-muted-foreground/60"
                    >
                      <Cross className="size-5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <DirectoryLeadButton
                  lakebed={lakebed}
                  action={plan.cta}
                  source={`pricing:${plan.name}`}
                  pendingChildren={
                    <>
                      <DirectoryMutationSpinner />
                      Recording
                    </>
                  }
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                    plan.featured
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-input text-foreground hover:border-muted-foreground/50 hover:bg-muted',
                  )}
                >
                  {plan.cta}
                </DirectoryLeadButton>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
