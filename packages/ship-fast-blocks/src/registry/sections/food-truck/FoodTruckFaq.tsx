import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * FoodTruckFaq — a narrow accordion FAQ section. A centered eyebrow + heading sits
 * above a stack of native <details> disclosure rows on muted rounded panels, each with
 * a bold question summary and a rotating chevron that reveals a muted answer paragraph.
 * No JS state — uses the browser's open/close. Use as the questions section for food
 * trucks, caterers, restaurants or street-food vendors covering dietary, booking,
 * payment and location questions.
 */
export const FoodTruckFaq = defineCapsule({
  name: 'FoodTruckFaq',
  description:
    'Narrow accordion FAQ section: a centered eyebrow + heading above a stack of native details disclosure rows on muted rounded panels, each with a bold question summary and a rotating chevron that reveals a muted answer paragraph (no JS state). Use as the questions section for food trucks, caterers, restaurants or street-food vendors covering dietary restrictions, catering booking, payment and where-to-find-us questions.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqEyebrow = props.eyebrow ?? 'Common Questions'
    const faqHeading = props.heading ?? 'FAQ'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: 'Do you accommodate dietary restrictions?',
            a: 'Absolutely. We have extensive vegan, vegetarian, and gluten-free options. Every menu item is clearly labeled, and our staff is trained on allergen protocols. For severe allergies, please let us know when ordering so we can take extra precautions.',
          },
          {
            q: 'How do I book catering for an event?',
            a: "Fill out our catering form or email us at catering@curbsidekitchen.com with your event date, guest count, and preferred menu. We recommend booking at least 3 weeks in advance for weekends and 2 weeks for weekdays. We'll respond within 24 hours with a custom quote.",
          },
          {
            q: 'Do you take reservations or pre-orders?',
            a: "We don't take reservations, but we do offer pre-ordering through our website for pickup windows. This is especially useful for lunch rushes in DTLA. Orders can be placed up to 24 hours in advance with a 15-minute pickup window.",
          },
          {
            q: 'What forms of payment do you accept?',
            a: 'We accept all major credit cards, Apple Pay, Google Pay, and cash. For catering events, we require a 50% deposit to secure the date with the balance due one week before the event.',
          },
          {
            q: 'How do I know where the truck will be?',
            a: 'We post our weekly schedule every Sunday evening on Instagram and our website. For real-time updates (traffic delays, sold out items), follow us on Instagram @curbsidekitchen where we share stories throughout the day.',
          },
        ]

    const Chevron = () => (
      <svg
        className="size-5 transition-transform group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <section className={cn('px-6 pt-28 pb-20', props.className)}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 space-y-4 text-center">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">
              {faqEyebrow}
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">{faqHeading}</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.q} className="group rounded-xl bg-muted">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <span className="font-semibold">{item.q}</span>
                  <Chevron />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
