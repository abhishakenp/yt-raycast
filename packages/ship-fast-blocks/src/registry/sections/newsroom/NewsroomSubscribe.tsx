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

    const Check = ({ className }) => (
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
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

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-xl p-8 shadow-sm',
                  plan.featured
                    ? 'border border-primary bg-primary text-primary-foreground shadow-xl'
                    : 'border border-border bg-card',
                )}
              >
                {plan.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
                      Most Popular
                    </span>
                  </div>
                ) : null}
                <h3
                  className={cn(
                    'mb-4 font-serif text-xl font-semibold',
                    plan.featured
                      ? 'text-primary-foreground'
                      : 'text-card-foreground',
                  )}
                >
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-4xl font-bold',
                      plan.featured
                        ? 'text-primary-foreground'
                        : 'text-card-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      plan.featured
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          'mt-0.5 size-5 shrink-0',
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
                    </li>
                  ))}
                </ul>
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
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {footnote}
          </p>
        </Container>
      </section>
    )
  },
})
