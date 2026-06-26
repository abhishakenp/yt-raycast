import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FilmDirectorPricing — an "Investment" pricing table for a film director or
 * cinematographer. On a muted band: a centered header (thin heading + muted
 * lede) above a 3-column grid of tier cards — standard tiers are bordered card
 * surfaces while the highlighted tier inverts to a dark foreground card with a
 * corner "Most Popular" ribbon. Each card shows an uppercase tier name, a big
 * thin price with optional suffix, a short description, a check-marked feature
 * list, and a full-width CTA button that routes through useNavigate. Use to
 * present project-scope packages (concept-to-delivery production services) for
 * filmmakers, directors, DPs, or video production houses.
 */
export const FilmDirectorPricing = defineComponent({
  name: 'FilmDirectorPricing',
  description:
    'Investment pricing table for a film director or cinematographer: on a muted band, a centered header (thin heading + muted lede) above a 3-column grid of tier cards where standard tiers are bordered card surfaces while the highlighted tier inverts to a dark foreground card with a corner Most-Popular ribbon. Each card shows an uppercase tier name, a big thin price with optional suffix, a short description, a check-marked feature list, and a full-width CTA button routed through useNavigate. Use to present project-scope packages (concept-to-delivery production services) for filmmakers, directors, DPs, or video production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          suffix: z.string().optional(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
          popularLabel: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const pricingHeading = props.heading ?? 'Investment'
    const pricingDesc =
      props.description ??
      'Transparent pricing for different project scopes. Every package includes full production services from concept to delivery.'
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            price: '$15,000',
            suffix: '+',
            description:
              'Perfect for brand stories, testimonials, and social content.',
            features: [
              '1 day of production',
              '1-2 minute final cut',
              'Basic color grading',
              '2 revision rounds',
              'Licensed music',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Professional',
            price: '$35,000',
            suffix: '+',
            description:
              'Comprehensive campaigns, brand films, and commercial spots.',
            features: [
              '2-3 days of production',
              '2-3 minute final cut',
              'Premium color grade',
              'Custom sound design',
              '3 revision rounds',
              'Multiple deliverables',
            ],
            cta: 'Get Started',
            popular: true,
            popularLabel: 'Most Popular',
          },
          {
            name: 'Premium',
            price: 'Custom',
            description:
              'Multi-spot campaigns, documentary series, and high-end productions.',
            features: [
              'Multi-day production',
              'Multiple deliverables',
              'Feature-film quality',
              'Dedicated post team',
              'Unlimted revisions',
              'Global locations',
            ],
            cta: 'Contact for Quote',
          },
        ]

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn('bg-muted py-20 md:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-light md:text-4xl">
              {pricingHeading}
            </h2>
            <p className="text-muted-foreground">{pricingDesc}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-md p-8',
                  tier.popular
                    ? 'bg-foreground text-background'
                    : 'border border-border bg-card text-card-foreground',
                )}
              >
                {tier.popular && (
                  <div className="absolute right-0 top-0 rounded-bl-md bg-background px-3 py-1 text-xs text-foreground">
                    {tier.popularLabel ?? 'Most Popular'}
                  </div>
                )}
                <p
                  className={cn(
                    'mb-2 text-sm uppercase tracking-wider',
                    tier.popular
                      ? 'text-background/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.name}
                </p>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-4xl font-light">{tier.price}</span>
                  {tier.suffix && (
                    <span
                      className={
                        tier.popular
                          ? 'text-background/70'
                          : 'text-muted-foreground'
                      }
                    >
                      {tier.suffix}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    tier.popular
                      ? 'text-background/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.description}
                </p>
                <ul className="mb-8 space-y-3 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.cta)}
                  className={cn(
                    'w-full rounded-md py-3 text-sm transition-colors',
                    tier.popular
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-border hover:border-foreground',
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
