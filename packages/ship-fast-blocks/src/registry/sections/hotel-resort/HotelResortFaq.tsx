import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * HotelResortFaq — accordion FAQ for a luxury hotel / resort & spa site. A
 * narrow centered column with an eyebrow + thin heading + paragraph, then a
 * stack of native <details> accordions on muted cards: each row shows a
 * question with a chevron that rotates on open to reveal the answer. Quiet and
 * editorial. Use to answer pre-booking questions — cancellation, breakfast,
 * dietary needs, check-in/out, parking, pets — for hotels, resorts, spa
 * retreats, inns, or wellness destinations. Renders fully with no props via
 * baked-in resort defaults.
 */
export const HotelResortFaq = defineCapsule({
  name: 'HotelResortFaq',
  description:
    'Accordion FAQ for a luxury hotel / resort & spa site: a narrow centered column with an uppercase eyebrow + thin heading + paragraph, then a stack of native details accordions on muted cards, each showing a question with a chevron that rotates on open to reveal the answer. Quiet and editorial. Use to answer pre-booking questions — cancellation, breakfast, dietary needs, check-in/out, parking, pets — for hotels, resorts, spa retreats, inns, or wellness destinations.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Question + answer pairs. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Common questions'
    const description =
      props.description ??
      'Everything you need to know before booking your stay at Azure Coast.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'What is your cancellation policy?',
            a: "Reservations may be cancelled free of charge up to 48 hours before arrival for a full refund. Cancellations within 48 hours incur a charge of one night's stay. Special packages and peak season dates may have different terms.",
          },
          {
            q: 'Is breakfast included with my stay?',
            a: 'Yes, all room rates include complimentary daily breakfast at our Ocean Terrace restaurant, featuring a full buffet and made-to-order options from 7:00 AM to 10:30 AM.',
          },
          {
            q: 'Do you accommodate dietary restrictions?',
            a: "Absolutely. All our restaurants offer extensive vegan, vegetarian, gluten-free, and allergen-conscious options. Please inform us of any dietary needs when making your reservation, and our culinary team will ensure you're fully accommodated.",
          },
          {
            q: 'What time is check-in and check-out?',
            a: 'Check-in begins at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out are available upon request, subject to availability. Additional fees may apply for guaranteed early arrival.',
          },
          {
            q: 'Is parking available?',
            a: 'Complimentary valet parking is included with all reservations. Self-parking is also available in our covered garage. Electric vehicle charging stations are provided at no additional cost.',
          },
          {
            q: 'Are pets allowed?',
            a: 'We welcome dogs up to 50 lbs in select Coastal Suites and Coastal Villas. A $150 cleaning fee applies per stay. Our concierge can arrange pet-sitting services, dog walking, and special pet amenities upon request.',
          },
        ]

    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <details key={item.q} className="group rounded-lg bg-muted p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="font-medium">{item.q}</span>
                  <svg
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
