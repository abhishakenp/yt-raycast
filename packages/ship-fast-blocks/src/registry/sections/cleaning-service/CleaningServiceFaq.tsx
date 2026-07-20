import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CleaningServiceFaq — playful-Swiss asymmetric FAQ ledger for a home-cleaning
 * / maid-service landing page. A 4/8 split on a muted wash: the left rail
 * holds a mono "06 / FAQ" eyebrow, the heading + lead, and a giant ghost
 * question-mark watermark; the right column stacks native HTML
 * `details/summary` items as a hairline-divided ledger framed by 2px top and
 * bottom rules — each row pairs a mono tabular index numeral with a bold
 * question and a plus icon that rotates to an X when open, revealing the
 * answer indented under the numeral column. No links, no images — pure
 * informational disclosure. Use for FAQ / help / expectations sections for
 * residential cleaning companies, maid services, housekeeping platforms, or
 * any local home-service brand. Renders fully with no props via seven baked-in
 * default questions.
 */
export const CleaningServiceFaq = defineCapsule({
  name: 'CleaningServiceFaq',
  description:
    "Playful-Swiss asymmetric FAQ ledger for a home-cleaning / maid-service landing page: a 4/8 split on a muted wash — left rail with mono '06 / FAQ' eyebrow, heading + lead, and a giant ghost question-mark watermark; right column of native HTML details/summary items as a hairline-divided ledger framed by 2px rules, each row pairing a mono tabular index numeral with a bold question and a plus icon rotating to an X when open, answers indented under the numeral column. No links, no images — pure informational disclosure. Use for FAQ / help / expectations sections for residential cleaning, maid services, housekeeping, or local home-service brands.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ??
      'Everything you need to know about our cleaning services.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: "What's included in a standard cleaning?",
            a: 'Our standard cleaning includes dusting all surfaces, vacuuming and mopping floors, cleaning and sanitizing bathrooms (toilet, shower/tub, sink, mirrors), wiping down kitchen counters and appliance exteriors, taking out trash, and making beds. We bring all supplies and equipment. Deep cleaning and add-ons like inside appliances or windows are available at checkout.',
          },
          {
            q: 'Are your cleaners background checked?',
            a: 'Absolutely. Every cleaner undergoes a comprehensive background check, reference verification, and in-person interview before joining our platform. We also provide ongoing training and require maintain a 4.5+ star rating to remain active. PureSpace is fully bonded and insured for your peace of mind.',
          },
          {
            q: "What if I'm not satisfied with the cleaning?",
            a: "We stand behind our work with a 100% satisfaction guarantee. If anything wasn't cleaned to your standards, contact us within 24 hours and we'll send a cleaner back to make it right at no additional cost. If you're still not happy, we'll provide a full refund. Your happiness is our priority.",
          },
          {
            q: 'Do I need to be home during the cleaning?',
            a: "It's entirely up to you. Many customers provide entry instructions (lockbox code, door code, or hidden key) and return to a sparkling home. If you prefer to be present, that's fine too. Our cleaners are professional and respectful of your space whether you're there or not.",
          },
          {
            q: 'Can I book the same cleaner each time?',
            a: "Yes! When you set up recurring cleanings (weekly, bi-weekly, or monthly), you can request the same cleaner. We prioritize matching you with cleaners you've rated highly. For one-time bookings, we'll match you with the best available cleaner in your area.",
          },
          {
            q: 'What areas do you serve?',
            a: 'We currently serve all Seattle neighborhoods including Capitol Hill, Ballard, Fremont, Queen Anne, Green Lake, Wallingford, Belltown, South Lake Union, West Seattle, and more. We also service select areas of Bellevue, Kirkland, and Redmond. Enter your zip code at checkout to confirm service availability.',
          },
          {
            q: 'How do I reschedule or cancel a booking?',
            a: 'Life happens! You can reschedule or cancel through your online account up to 24 hours before your appointment with no penalty. Cancellations within 24 hours incur a $50 fee to compensate your assigned cleaner. For recurring bookings, you can pause or modify your schedule anytime.',
          },
        ]

    return (
      <section className={cn('bg-muted/30 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="relative lg:col-span-4">
              <SectionHeading
                align="left"
                eyebrow="06 / FAQ"
                title={heading}
                subtitle={description}
                className="gap-3"
                titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
              <Watermark className="-bottom-8 right-0 hidden -rotate-6 font-mono text-[11rem] text-foreground/[0.05] lg:block">
                ?
              </Watermark>
            </div>
            <FaqAccordion
              variant="divided"
              className="border-y-2 border-foreground lg:col-span-8"
            >
              {items.map((item, i) => (
                <FaqItem key={item.q} variant="divided" className="py-0">
                  <FaqQuestion className="items-baseline gap-4 py-5 sm:gap-6">
                    <span
                      aria-hidden="true"
                      className="w-8 shrink-0 self-start pt-0.5 font-mono text-xs font-bold tabular-nums tracking-[0.1em] text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="flex-1 text-base font-bold tracking-tight text-foreground sm:text-lg">
                      {item.q}
                    </h3>
                    <FaqQuestionIcon
                      variant="plus"
                      className="self-start text-foreground"
                    />
                  </FaqQuestion>
                  <FaqAnswer asChild className="pb-6 pr-8 sm:pl-14">
                    <div>{item.a}</div>
                  </FaqAnswer>
                </FaqItem>
              ))}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
