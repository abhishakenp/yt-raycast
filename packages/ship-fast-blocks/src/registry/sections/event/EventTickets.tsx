import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * EventTickets — a 3-tier ticket pricing block for a conference or event page. A
 * centered heading + description above a 3-column grid of pricing cards (the
 * featured tier gets a thicker border and a "Most Popular" badge), each with
 * name, availability, big price + unit, a checklist of included features (and an
 * optional crossed-out excluded list), and a CTA button that disables when sold
 * out. A note line with an inline link sits below. Use to sell Early Bird /
 * Regular / VIP passes on tech conference, summit, workshop, or festival pages.
 */
export const EventTickets = defineComponent({
  name: 'EventTickets',
  description:
    "Three-tier ticket pricing block for a conference or event page: a centered heading + description above a 3-column grid of pricing cards (the featured tier gets a thicker border and a 'Most Popular' badge), each with a tier name, availability line, a big price + unit, a checklist of included features and an optional crossed-out excluded list, and a CTA button that becomes a disabled 'Sold Out' state when flagged. A note line with an inline link sits below. Use to sell Early Bird / Regular / VIP passes on tech conference, summit, workshop, meetup, or festival pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Note line below the tiers (contains the noteLink text). */
    note: z.string().optional(),
    /** Inline link text within the note. */
    noteLink: z.string().optional(),
    /** Ticket tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          availability: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()).optional(),
          cta: z.string(),
          featured: z.boolean().optional(),
          soldOut: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Get Your Ticket'
    const description =
      props.description ??
      'Choose the pass that works for you. All tickets include full access to sessions, meals, and the closing party.'
    const note =
      props.note ??
      'Group discounts available for 5+ tickets. Contact us for team packages.'
    const noteLink = props.noteLink ?? 'Contact us'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Early Bird',
            availability: 'Available until July 31',
            price: '$449',
            unit: '/person',
            features: [
              'Both days of sessions',
              'Breakfast & lunch included',
              'Conference swag kit',
              'Closing party access',
            ],
            excluded: ['Workshop access'],
            cta: 'Sold Out',
            soldOut: true,
          },
          {
            name: 'Regular',
            availability: 'August 1 – September 10',
            price: '$649',
            unit: '/person',
            features: [
              'Both days of sessions',
              'Breakfast & lunch included',
              'Conference swag kit',
              'Closing party access',
            ],
            excluded: ['Workshop access'],
            cta: 'Get Ticket',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'VIP + Workshop',
            availability: 'Limited to 50 attendees',
            price: '$899',
            unit: '/person',
            features: [
              'Everything in Regular',
              'Workshop seat (choose one)',
              'VIP lounge access',
              'Speaker meet & greet',
              'Premium swag bundle',
            ],
            cta: 'Get VIP Pass',
          },
        ]

    const CheckIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const CrossIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted-foreground"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-2xl bg-card p-8',
                  tier.featured
                    ? 'border-2 border-foreground'
                    : 'border border-border',
                )}
              >
                {tier.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    {tier.badge}
                  </div>
                ) : null}
                <h3 className="mb-2 font-semibold text-card-foreground">
                  {tier.name}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {tier.availability}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-card-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">{tier.unit}</span>
                </div>
                <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                  {(tier.excluded ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CrossIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.soldOut ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-muted px-4 py-3 font-medium text-muted-foreground"
                  >
                    {tier.cta}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(tier.cta)}
                    className={cn(
                      'block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors',
                      tier.featured
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-foreground text-background hover:bg-foreground/90',
                    )}
                  >
                    {tier.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {note.split(noteLink)[0]}
              <button
                type="button"
                onClick={() => go(noteLink)}
                className="text-foreground underline hover:no-underline"
              >
                {noteLink}
              </button>
              {note.split(noteLink)[1] ?? ''}
            </p>
          </div>
        </div>
      </section>
    )
  },
})
