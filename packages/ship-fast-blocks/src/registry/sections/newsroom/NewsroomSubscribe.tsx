import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  PublicationActionButton,
  PublicationMutationSpinner,
  PublicationSubscribeForm,
} from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  PricingCard,
  PricingCardBadge,
  PricingCardName,
  PricingCardPrice,
  PricingCardPriceValue,
  PricingCardPriceUnit,
  PricingCardFeatures,
  PricingCardFeature,
  PricingCardCheckIcon,
  PricingCardCta,
} from '#/section-kit/PricingCard.tsx'
import {
  NewsletterCtaDescription,
  NewsletterCtaFineprint,
  NewsletterCtaHeading,
} from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * NewsroomSubscribe — editorial subscription / membership band for a digital
 * newsroom or magazine. A bold centered intro with a serif heading and a
 * muted supporting paragraph, a short benefits checklist, a styled
 * email-capture row with a Subscribe button, and a responsive 3-up grid of tiered
 * membership plan cards (the featured middle plan inverts to a filled primary
 * surface with a "Most Popular" badge), closing with a fine-print trust footnote.
 * email submit writes to the shared Lakebed subscriber list and plan CTAs route
 * through useNavigate. Use to convert readers into paying subscribers /
 * newsletter members for a news, magazine or publication site. Renders fully
 * with no props.
 */
export const NewsroomSubscribe = defineCapsule({
  name: 'NewsroomSubscribe',
  description:
    'Editorial subscription / membership band for a digital newsroom or magazine: a bold centered intro with a serif heading and a muted supporting paragraph, a short benefits checklist, a styled email-capture row with a Subscribe button, and a responsive 3-up grid of tiered membership plan cards where the featured middle plan inverts to a filled primary surface with a Most-Popular badge, closing with a fine-print trust footnote. Combines newsletter sign-up and tiered paid subscription plans; email submit writes to the shared Lakebed subscriber list and plan CTAs route through useNavigate. Use to convert readers into paying subscribers or newsletter members for a news, magazine or publication site. Renders fully with no props.',
  props: z.object({
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Short list of membership benefits, rendered with check marks. */
    benefits: z.array(z.string()).optional(),
    /** Placeholder text for the email-capture input. */
    emailPlaceholder: z.string().optional(),
    /** Label for the email-capture submit button. */
    submitCta: z.string().optional(),
    /** Membership plans; mark one featured for the highlighted column. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    /** Fine-print trust footnote beneath the plans. */
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Join 250,000 informed readers'
    const subheading =
      props.subheading ??
      'Independent journalism that holds power to account. Become a member and get unlimited access to every story, investigation and newsletter we publish.'
    const benefits = props.benefits?.length
      ? props.benefits
      : [
          'Unlimited articles',
          'Ad-free reading',
          'The daily briefing newsletter',
          'Exclusive investigations',
        ]
    const emailPlaceholder = props.emailPlaceholder ?? 'you@example.com'
    const submitCta = props.submitCta ?? 'Subscribe'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Digital',
            price: '$8',
            period: '/month',
            features: [
              'Unlimited articles',
              'Ad-free reading',
              'Mobile app access',
            ],
            cta: 'Choose Digital',
          },
          {
            name: 'Premium',
            price: '$14',
            period: '/month',
            features: [
              'Everything in Digital',
              'Exclusive investigations',
              'The daily briefing newsletter',
              'Subscriber-only events',
            ],
            cta: 'Choose Premium',
            featured: true,
          },
          {
            name: 'Print + Digital',
            price: '$22',
            period: '/month',
            features: [
              'Everything in Premium',
              'Weekly print edition',
              'Gift subscription included',
            ],
            cta: 'Choose Print + Digital',
          },
        ]
    const footnote = props.footnote ?? 'Cancel anytime. No questions asked.'

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
      <SubscribeBand
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <NewsletterCtaHeading className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </NewsletterCtaHeading>
            <NewsletterCtaDescription className="text-lg text-muted-foreground">
              {subheading}
            </NewsletterCtaDescription>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Check className="size-4 shrink-0 text-accent" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <PublicationSubscribeForm
            lakebed={lakebed}
            source={submitCta}
            placeholder={emailPlaceholder}
            buttonLabel={submitCta}
            successMessage="You're subscribed. The briefing will arrive by email."
            className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
            inputClassName="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            buttonClassName="shrink-0 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            statusClassName="mb-16 text-center"
          />

          <ResponsiveGrid cols="1-md-3" gap="lg" className="mx-auto max-w-6xl">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                variant="outlined"
                highlight={plan.featured ? 'filled-primary' : 'none'}
                className={cn(
                  'shadow-sm',
                  plan.featured
                    ? 'border-primary text-primary-foreground shadow-xl'
                    : '',
                )}
              >
                {plan.featured ? (
                  <PricingCardBadge className="bg-background font-bold uppercase tracking-wide text-foreground">
                    Most Popular
                  </PricingCardBadge>
                ) : null}
                <PricingCardName
                  className={cn(
                    'mb-4 font-serif text-xl',
                    plan.featured ? 'text-primary-foreground' : '',
                  )}
                >
                  {plan.name}
                </PricingCardName>
                <PricingCardPrice className="mb-6">
                  <PricingCardPriceValue
                    className={cn(
                      'font-bold',
                      plan.featured ? 'text-primary-foreground' : '',
                    )}
                  >
                    {plan.price}
                  </PricingCardPriceValue>
                  <PricingCardPriceUnit
                    className={cn(
                      plan.featured ? 'text-primary-foreground/60' : '',
                    )}
                  >
                    {plan.period}
                  </PricingCardPriceUnit>
                </PricingCardPrice>
                <PricingCardFeatures className="mb-8 space-y-4">
                  {plan.features.map((feat) => (
                    <PricingCardFeature key={feat} className="gap-3">
                      <PricingCardCheckIcon
                        className={cn(
                          'size-5',
                          plan.featured
                            ? 'text-primary-foreground/80'
                            : 'text-accent',
                        )}
                      />
                      <span
                        className={cn(
                          plan.featured
                            ? 'text-primary-foreground/90'
                            : 'text-foreground/80',
                        )}
                      >
                        {feat}
                      </span>
                    </PricingCardFeature>
                  ))}
                </PricingCardFeatures>
                <PricingCardCta>
                  <PublicationActionButton
                    action={plan.cta}
                    lakebed={lakebed}
                    source={`plan:${plan.name}`}
                    pendingChildren={
                      <>
                        <PublicationMutationSpinner className="size-4" />
                        Saving
                      </>
                    }
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-70',
                      plan.featured
                        ? 'bg-background text-foreground hover:bg-muted'
                        : 'border border-border text-foreground hover:bg-muted',
                    )}
                  >
                    {plan.cta}
                  </PublicationActionButton>
                </PricingCardCta>
              </PricingCard>
            ))}
          </ResponsiveGrid>

          <NewsletterCtaFineprint className="mt-10 text-center text-sm text-muted-foreground">
            {footnote}
          </NewsletterCtaFineprint>
        </Container>
      </SubscribeBand>
    )
  },
})
