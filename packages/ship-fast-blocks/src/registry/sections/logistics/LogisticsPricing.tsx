import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LogisticsPricing — a three-tier service-pricing table for a global-logistics /
 * freight-forwarding company. A centered heading + lede over a 1 → 3 column grid
 * of pricing cards; the featured tier inverts to a solid primary surface and can
 * carry a floating "Popular" badge. Each card lists name, tagline, a large price
 * with unit, a check-marked feature list and a full-width CTA, with a centered
 * footnote below. Clean and corporate on a light surface with a deep slate
 * primary; every CTA routes through useNavigate. Use to present shipping service
 * tiers (Standard / Priority / Express) for logistics, freight-forwarding,
 * shipping, courier or cargo/transport companies. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const LogisticsPricing = defineCapsule({
  name: 'LogisticsPricing',
  description:
    "Three-tier service-pricing table for a global-logistics / freight-forwarding company: a centered heading + lede over a 1 → 3 column grid of pricing cards, with the featured tier inverted to a solid primary surface and an optional floating 'Popular' badge. Each card lists name, tagline, a large price with unit, a check-marked feature list and a full-width CTA, plus a centered footnote below. Clean and corporate on a light surface with a deep slate primary; every CTA routes through useNavigate. Use to present shipping service tiers (Standard / Priority / Express) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    footnote: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          badge: z.string().optional(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Service tiers'
    const description =
      props.description ??
      'Choose the service level that matches your timeline and budget.'
    const footnote =
      props.footnote ??
      'Ocean freight rates from $85/CBM. Ground transport from $1.45/mile. Volume discounts available.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Standard',
            tagline: 'Economy shipping for non-urgent cargo',
            price: '$2.80',
            unit: '/kg air',
            features: [
              '5-7 day air transit',
              'Standard tracking',
              '$100 insurance included',
              'Email support',
            ],
            cta: 'Get a quote',
          },
          {
            name: 'Priority',
            tagline: 'Best balance of speed and cost',
            price: '$4.50',
            unit: '/kg air',
            features: [
              '2-4 day air transit',
              'Real-time GPS tracking',
              '$500 insurance included',
              '24/7 phone & email support',
              'Customs brokerage',
            ],
            cta: 'Get a quote',
            badge: 'Popular',
            featured: true,
          },
          {
            name: 'Express',
            tagline: 'When every hour counts',
            price: '$8.90',
            unit: '/kg air',
            features: [
              'Next-flight-out (NFO)',
              'Real-time GPS + EDI',
              '$2,500 insurance included',
              'Dedicated account manager',
              'Charter options available',
            ],
            cta: 'Contact sales',
          },
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
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
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => {
              const featured = tier.featured
              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative rounded-2xl p-8',
                    featured
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card',
                  )}
                >
                  {tier.badge ? (
                    <div className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {tier.badge}
                    </div>
                  ) : null}
                  <h3
                    className={cn(
                      'mb-2 text-lg font-semibold',
                      featured
                        ? 'text-primary-foreground'
                        : 'text-card-foreground',
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      'mb-6 text-sm',
                      featured
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.tagline}
                  </p>
                  <div className="mb-6">
                    <span
                      className={cn(
                        'text-4xl font-semibold',
                        featured
                          ? 'text-primary-foreground'
                          : 'text-card-foreground',
                      )}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={cn(
                        featured
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {tier.unit}
                    </span>
                  </div>
                  <ul
                    className={cn(
                      'mb-8 space-y-3 text-sm',
                      featured
                        ? 'text-primary-foreground/90'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check
                          className={
                            featured
                              ? 'text-primary-foreground'
                              : 'text-primary'
                          }
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(tier.cta)}
                    className={cn(
                      'w-full rounded-xl py-3 font-medium transition-colors',
                      featured
                        ? 'bg-background text-foreground hover:bg-muted'
                        : 'border border-primary text-primary hover:bg-muted/50',
                    )}
                  >
                    {tier.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {footnote}
          </p>
        </Container>
      </section>
    )
  },
})
