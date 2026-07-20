import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'

export const ProductDetailFaq = defineCapsule({
  name: 'ProductDetailFaq',
  description:
    'Editorial-product frequently-asked-questions band for the Product Detail page family, tuned for a premium single-product purchase flow (Aurora Pro Headphones). An asymmetric split pairs a sticky left rail — mono "[ support ]" meta rule, an extrabold tight-tracked heading, and an optional subheading — with a right-hand stack of native HTML <details> / <summary> accordion cards. Each sharp hairline card carries a muted tabular index numeral beside the question and a plus icon that rotates open; the first item opens by default and each row reveals a believable answer covering shipping, returns, warranty, Bluetooth compatibility, and battery life. Built on native disclosure elements so it works without client-side state, using token-based styling throughout. Use when a product detail page needs a trustworthy Q&A band to address buyer objections.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const subheading = props.subheading
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How long does shipping take?',
            answer:
              'Orders placed before 2pm ship the same business day. Standard delivery arrives in 3–5 business days, and express shipping reaches most addresses within 1–2 business days. Every Aurora Pro order ships free and fully insured.',
          },
          {
            question: 'What is your return policy?',
            answer:
              "You have 30 days to fall in love with your Aurora Pro Headphones. If they're not for you, start a return from your account for a full refund — we cover the return shipping label and there are no restocking fees.",
          },
          {
            question: 'Are they covered by a warranty?',
            answer:
              'Yes. Every pair includes a 2-year limited warranty covering manufacturing defects in materials and workmanship. Register your serial number at checkout to activate coverage and unlock priority support.',
          },
          {
            question: 'Which devices are compatible?',
            answer:
              'Aurora Pro pairs over Bluetooth 5.3 with any phone, tablet, or laptop, and supports multipoint to stay connected to two devices at once. A USB-C cable and 3.5mm analog adapter are included for wired listening on flights and studio gear.',
          },
          {
            question: 'How long does the battery last?',
            answer:
              'Expect up to 40 hours of playback with adaptive noise cancellation on, or 50 hours with it off. A quick 10-minute charge delivers roughly 5 hours of listening, and a full charge takes about 90 minutes over USB-C.',
          },
        ]

    return (
      <section
        aria-label="Frequently asked questions"
        className={cn(
          'border-t border-border bg-background py-16 sm:py-20',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="flex items-center gap-3 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="size-1.5 bg-primary" />
                  Support
                  <span
                    aria-hidden="true"
                    className="ml-auto tabular-nums text-muted-foreground/50"
                  >
                    {String(items.length).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="mt-8 text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl">
                  {heading}
                </h2>
                {subheading ? (
                  <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
                    {subheading}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-8">
              <FaqAccordion variant="compact" className="space-y-4">
                {items.map((it, i) => (
                  <FaqItem
                    key={it.question}
                    variant="open-raised"
                    open={i === 0}
                    className="rounded-none border-border bg-transparent open:bg-muted/40 open:shadow-none"
                  >
                    <FaqQuestion className="items-start gap-4 p-5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60 tabular-nums"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="flex-1 pr-4 text-base font-semibold tracking-tight text-foreground">
                        {it.question}
                      </h3>
                      <FaqQuestionIcon variant="plus" />
                    </FaqQuestion>
                    <FaqAnswer asChild className="px-5 pb-5 pl-14 text-sm">
                      <div>
                        <p>{it.answer}</p>
                      </div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
