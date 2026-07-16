import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * EventFaq — a frequently-asked-questions accordion for a conference or event
 * page. A muted band with a centered heading + description above a narrow stack
 * of native <details> accordion items; each bordered card has a question summary
 * with a chevron that rotates when open and reveals the answer. Use to answer
 * common ticket, refund, schedule, and policy questions on tech conference,
 * summit, festival, or workshop pages.
 */
export const EventFaq = defineCapsule({
  name: 'EventFaq',
  description:
    'Frequently-asked-questions accordion for a conference or event page: a muted band with a centered heading + description above a narrow stack of native details/summary accordion items; each bordered card shows a question with a chevron that rotates when open and reveals the answer below. Use to answer common ticket, refund, schedule, code-of-conduct, recording, and discount questions on tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Question / answer pairs. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ??
      'Everything you need to know about attending DesignFront 2024.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: "What's included in my ticket?",
            a: 'All tickets include access to both days of sessions, breakfast and lunch on both days, the closing party, conference swag, and coffee breaks. VIP tickets additionally include workshop access, VIP lounge, and speaker meet & greet.',
          },
          {
            q: "Can I get a refund if I can't attend?",
            a: 'Yes, full refunds are available until August 15, 2024. After that date, tickets are transferable to another attendee but non-refundable. Contact us at tickets@designfront.io to request a refund or transfer.',
          },
          {
            q: 'Are workshops included in the Regular ticket?',
            a: 'Workshops are only included with the VIP ticket. Regular ticket holders can attend all main stage and theater sessions. VIP tickets are limited to 50 attendees to ensure an intimate workshop experience.',
          },
          {
            q: 'Is there a code of conduct?',
            a: 'Absolutely. DesignFront is committed to providing a safe, inclusive environment for all attendees. All participants, speakers, and staff must adhere to our code of conduct. Violations can result in removal without refund.',
          },
          {
            q: 'Will sessions be recorded?',
            a: 'Main stage sessions will be recorded and made available to all attendees within two weeks after the conference. Workshops and theater sessions are not recorded to encourage open discussion and participation.',
          },
          {
            q: 'Do you offer student discounts?',
            a: 'Yes! Students with a valid .edu email address can receive 40% off any ticket tier. Email students@designfront.io from your school email with proof of enrollment to receive your discount code.',
          },
        ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.q} className="[&[open]]:border-primary/40">
                <FaqQuestion className="p-5">
                  <span className="font-medium text-card-foreground">
                    {item.q}
                  </span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-5 pb-5">
                  <div>{item.a}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
