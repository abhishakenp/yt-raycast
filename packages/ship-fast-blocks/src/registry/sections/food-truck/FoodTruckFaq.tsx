import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * FoodTruckFaq — a sticker-poster accordion FAQ section. Under a giant ghost "FAQ"
 * watermark, a rotated rubber-stamp caption + mono index eyebrow and an extrabold slab
 * heading sit above a stack of native <details> disclosure slabs on hard-bordered
 * rounded-none panels, each with a mono question-index numeral, a bold question summary
 * and a rotating chevron that reveals a muted answer paragraph. No JS state — uses the
 * browser's open/close. Use as the questions section for food trucks, caterers,
 * restaurants or street-food vendors covering dietary, booking, payment and location
 * questions.
 */
export const FoodTruckFaq = defineCapsule({
  name: 'FoodTruckFaq',
  description:
    'Sticker-poster accordion FAQ section: under a giant ghost "FAQ" watermark, a rotated rubber-stamp caption + mono index eyebrow and an extrabold slab heading above a stack of native details disclosure slabs on hard-bordered rounded-none panels, each with a mono question-index numeral, a bold question summary and a rotating chevron that reveals a muted answer paragraph (no JS state). Use as the questions section for food trucks, caterers, restaurants or street-food vendors covering dietary restrictions, catering booking, payment and where-to-find-us questions.',
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
    return (
      <section
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-20',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-6 text-[8rem] sm:text-[13rem] lg:text-[18rem]">
          FAQ
        </Watermark>
        <Container size="sm" className="relative">
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="inline-flex -rotate-2 items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
              {faqEyebrow}
            </span>
            <MonoTag>Cash &amp; card</MonoTag>
          </div>
          <h2 className="mb-10 text-4xl font-extrabold tracking-tighter md:text-5xl">
            {faqHeading}
          </h2>
          <FaqAccordion>
            {faqItems.map((item, i) => (
              <FaqItem
                key={item.q}
                variant="muted"
                className="rounded-none border-2 border-foreground bg-card open:shadow-[4px_4px_0_0] open:shadow-foreground"
              >
                <FaqQuestion className="gap-4 p-6">
                  <span className="flex items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="font-mono text-sm font-bold tabular-nums text-muted-foreground"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-extrabold tracking-tight">
                      {item.q}
                    </span>
                  </span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>
                    <p className="border-t-2 border-dashed border-foreground/20 pt-4">
                      {item.a}
                    </p>
                  </div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
