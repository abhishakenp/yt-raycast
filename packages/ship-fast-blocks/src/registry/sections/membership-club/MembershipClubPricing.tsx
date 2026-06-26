import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MembershipClubPricing — 3-tier membership pricing block for a private membership
 * club / exclusive community page. A centered eyebrow + thin heading + supporting
 * line sit above a responsive 3-column grid of rounded bordered tier cards (name,
 * blurb, large light price + period, annual note, a checkmark feature list and an
 * Apply CTA); the highlighted "Most Popular" tier inverts to the primary surface
 * with a floating badge, and a centered footnote sits below. CTAs route through
 * useNavigate. Use for membership levels / plans for members clubs, professional
 * networks, mastermind groups or paid community subscriptions. Renders fully with
 * no props.
 */
export const MembershipClubPricing = defineComponent({
  name: 'MembershipClubPricing',
  description:
    "3-tier membership pricing block for a private membership club / exclusive community page: a centered eyebrow + thin heading + supporting line above a responsive 3-column grid of rounded bordered tier cards (name, blurb, large light price + period, annual savings note, a checkmark feature list and an Apply CTA); the highlighted 'Most Popular' tier inverts to the primary surface with a floating badge, and a centered footnote sits below. CTAs route through useNavigate. Use for membership levels / plans for members clubs, professional networks, mastermind groups or paid community subscriptions.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string(),
          annual: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Membership Tiers'
    const heading = props.heading ?? 'Choose your level of access'
    const description =
      props.description ??
      'All memberships include our core benefits. Annual billing saves 20%.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Contributor',
            blurb: 'For individuals exploring the community',
            price: '$149',
            period: '/month',
            annual: 'or $1,428/year (save $360)',
            features: [
              'Access to 1 clubhouse city of your choice',
              '2 curated introductions per month',
              '4 events per month',
              'Slack community access',
              'Resource library access',
            ],
            cta: 'Apply Now',
          },
          {
            name: 'Member',
            blurb: 'For committed community builders',
            price: '$299',
            period: '/month',
            annual: 'or $2,868/year (save $720)',
            features: [
              'Access to all 8 global clubhouses',
              'Unlimited curated introductions',
              'Unlimited events',
              'Priority retreat registration',
              'Host your own events (2/year)',
              'Member success concierge',
            ],
            cta: 'Apply Now',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Patron',
            blurb: 'For leaders shaping the community',
            price: '$899',
            period: '/month',
            annual: 'or $8,628/year (save $1,800)',
            features: [
              'Everything in Member, plus:',
              'Private office in any clubhouse',
              'Free retreat access (all 4/year)',
              'Host unlimited events',
              'Advisory board eligibility',
              'Guest passes (4/month)',
            ],
            cta: 'Apply Now',
          },
        ]
    const footnote =
      props.footnote ??
      'All applications reviewed within 48 hours. Full refund within 14 days if not satisfied.'

    const Check = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section
        className={cn('w-full bg-background py-20 lg:py-32', props.className)}
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="pricing-heading"
              className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3 lg:gap-12">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col rounded-xl border p-8 lg:p-10',
                  tier.featured
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card',
                )}
              >
                {tier.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {tier.badge}
                    </span>
                  </div>
                ) : null}
                <div className="mb-6">
                  <h3
                    className={cn(
                      'mb-2 text-lg font-medium',
                      tier.featured
                        ? 'text-primary-foreground'
                        : 'text-card-foreground',
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      'mb-4 text-sm',
                      tier.featured
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.blurb}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        'text-4xl font-light',
                        tier.featured
                          ? 'text-primary-foreground'
                          : 'text-foreground',
                      )}
                    >
                      {tier.price}
                    </span>
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
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      tier.featured
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.annual}
                  </p>
                </div>
                <ul className="mb-8 flex-grow space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={cn(
                          tier.featured
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        <Check />
                      </span>
                      <span
                        className={cn(
                          'text-sm',
                          tier.featured
                            ? 'text-primary-foreground/90'
                            : 'text-muted-foreground',
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(`${tier.name} ${tier.cta}`)}
                  aria-label={`Apply for ${tier.name} membership`}
                  className={cn(
                    'w-full rounded-full px-6 py-3 text-sm font-medium transition-colors',
                    tier.featured
                      ? 'bg-background text-foreground hover:bg-muted'
                      : 'border border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {footnote}
          </p>
        </div>
      </section>
    )
  },
})
