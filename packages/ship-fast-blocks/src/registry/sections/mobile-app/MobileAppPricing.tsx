import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * MobileAppPricing — a centered-intro, 3-tier pricing table for a clean,
 * minimalist mobile-app marketing page. A centered heading + description sits
 * above a responsive 3-column row of plan cards; the "featured" plan inverts to
 * the primary background, lifts slightly, and carries a "Most Popular" pill. Each
 * card shows a name, tagline, big price + period, a checklist of features
 * (check / cross icons, dimmed when excluded), and a full-width CTA button that
 * routes through useNavigate. Use as the plans / subscription section on a habit
 * tracker, fitness / wellness app, productivity or to-do app, or any consumer app
 * landing page. Renders fully with no props via baked-in Free / Pro / Teams
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
export const MobileAppPricing = defineCapsule({
  name: 'MobileAppPricing',
  description:
    'Centered-intro 3-tier pricing table backed by shared Lakebed conversion state: plan cards seed command search and each CTA records selected plan or sales intent with scoped loading. Use as the plans / subscription section on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          featured: z.boolean().optional(),
          features: z
            .array(
              z.object({
                label: z.string(),
                included: z.boolean(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      "Start free, upgrade when you're ready. No hidden fees, no surprises."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            tagline: 'Perfect for getting started',
            price: '$0',
            period: '/month',
            cta: 'Get Started Free',
            featured: false,
            features: [
              {
                label: 'Up to 3 habits',
                included: true,
              },
              {
                label: 'Basic reminders',
                included: true,
              },
              {
                label: '7-day streak history',
                included: true,
              },
              {
                label: 'Accountability groups',
                included: false,
              },
              {
                label: 'Advanced insights',
                included: false,
              },
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious habit builders',
            price: '$4.99',
            period: '/month',
            cta: 'Start 14-Day Free Trial',
            featured: true,
            features: [
              {
                label: 'Unlimited habits',
                included: true,
              },
              {
                label: 'Smart AI reminders',
                included: true,
              },
              {
                label: 'Unlimited history',
                included: true,
              },
              {
                label: 'Accountability groups',
                included: true,
              },
              {
                label: 'Advanced insights & export',
                included: true,
              },
            ],
          },
          {
            name: 'Teams',
            tagline: 'For organizations',
            price: '$12',
            period: '/user/month',
            cta: 'Contact Sales',
            featured: false,
            features: [
              {
                label: 'Everything in Pro',
                included: true,
              },
              {
                label: 'Team challenges',
                included: true,
              },
              {
                label: 'Admin dashboard',
                included: true,
              },
              {
                label: 'SSO integration',
                included: true,
              },
              {
                label: 'Priority support',
                included: true,
              },
            ],
          },
        ]
    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline || tier.features?.at(0)?.label || '',
        }),
      ),
    )
    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    const CrossIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    return (
      <section
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
        aria-labelledby="mobileapp-pricing-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
            <h2
              id="mobileapp-pricing-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 lg:gap-6">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                variant="default"
                rounded="2xl"
                padding="lg"
                className={cn(
                  'relative',
                  tier.featured
                    ? 'border-0 bg-primary text-primary-foreground md:-mt-4 md:mb-4'
                    : '',
                )}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="mb-2 text-lg font-semibold">{tier.name}</h3>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    tier.featured
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.tagline}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span
                    className={cn(
                      tier.featured
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.period}
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {tier.features?.map((f) => (
                    <li key={f.label} className="flex items-start gap-3">
                      {f.included ? (
                        <CheckIcon
                          className={cn(
                            'mt-0.5 size-5 shrink-0',
                            tier.featured
                              ? 'text-primary-foreground'
                              : 'text-primary',
                          )}
                        />
                      ) : (
                        <CrossIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={cn(
                          f.included
                            ? tier.featured
                              ? 'text-primary-foreground/90'
                              : 'text-muted-foreground'
                            : 'text-muted-foreground/60',
                        )}
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={tier.cta}
                  plan={tier.name}
                  source="pricing"
                  aria-label={`${tier.cta} for ${tier.name}`}
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Selecting
                    </>
                  }
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                    tier.featured
                      ? 'bg-background text-foreground hover:bg-muted'
                      : 'bg-muted text-foreground hover:bg-accent',
                  )}
                >
                  {tier.cta}
                </SaasPlanActionButton>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
