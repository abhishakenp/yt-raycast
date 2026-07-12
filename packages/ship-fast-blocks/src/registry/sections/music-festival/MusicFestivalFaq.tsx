import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MusicFestivalFaq — a centered FAQ accordion for a music / arts festival
 * landing page. A card-surface band with a centered eyebrow + heading above a
 * narrow stack of native disclosure rows (question + chevron that rotates open
 * to reveal the answer). Use to answer attendee questions (tickets, camping,
 * food, refunds, getting there) on music festivals, arts festivals, concert
 * series, or any multi-day ticketed event.
 */
export const MusicFestivalFaq = defineCapsule({
  name: 'MusicFestivalFaq',
  description:
    'Centered FAQ accordion for a music / arts festival landing page: a card-surface band with a centered eyebrow + heading above a narrow stack of native disclosure rows (question + chevron that rotates when opened to reveal the answer paragraph). Use to answer attendee questions about tickets, camping, food and drinks, payment plans, refunds and getting there on music festivals, arts festivals, concert series, camping/desert events, or any multi-day ticketed event.',
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** FAQ items (question + answer). */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Questions'
    const heading = props.heading ?? 'FAQ'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: "What's included with my ticket?",
            answer:
              'All tickets include three-day access to all four stages, complimentary car camping, free water refill stations, and access to the mobile app. GA+ adds fast entry, premium restrooms, and a lounge. VIP includes everything plus stage-side viewing, open bars, and exclusive entrances.',
          },
          {
            question: 'Can I bring my own food and drinks?',
            answer:
              'Yes! You can bring food and non-alcoholic beverages into the campground. Each person can bring up to one case of canned beer per day (no glass). The festival grounds have water stations, but outside food and drinks are not permitted inside the venue area — we have 40+ amazing food vendors instead!',
          },
          {
            question: 'What are the camping options?',
            answer:
              'Car camping is included with every ticket (one vehicle per 2+ person group). RV camping spots are available as an add-on with power hookups. For a hassle-free experience, our Glamping package includes a pre-set furnished tent with beds, lighting, and power. All campers get access to showers, restrooms, and the late-night silent disco.',
          },
          {
            question: 'Is there a payment plan available?',
            answer:
              "Absolutely! You can split your ticket into four equal payments. The first payment is due at checkout, with the remaining three charged monthly. There's a small $10 payment plan fee, but no interest. Payment plans must be completed at least 30 days before the festival.",
          },
          {
            question: "What's the refund policy?",
            answer:
              'Tickets are refundable minus a $50 processing fee until June 1, 2025. After that, tickets can be transferred to another person for a $25 fee. If the festival is canceled due to unforeseen circumstances, full refunds will be issued within 30 days. We recommend purchasing ticket insurance at checkout for additional protection.',
          },
          {
            question: 'How do I get to the festival?',
            answer:
              "The festival is located in the Mojave Desert, about 2.5 hours from Los Angeles and 3 hours from Las Vegas. We offer shuttle services from both cities and LAX airport. There's also a dedicated rideshare pickup/dropoff zone. If driving, you'll receive detailed directions and parking instructions two weeks before the event.",
          },
        ]

    return (
      <section
        className={cn(
          'bg-card py-24 text-card-foreground lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg bg-background"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6">
                  <span className="font-semibold">{item.question}</span>
                  <svg
                    className="size-5 transition-transform group-open:rotate-180"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-foreground/70">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
