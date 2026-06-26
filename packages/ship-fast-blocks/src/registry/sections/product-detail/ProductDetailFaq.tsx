import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

export const ProductDetailFaq = defineComponent({
  name: 'ProductDetailFaq',
  description:
    'Accessible frequently-asked-questions section for the Product Detail page family, tuned for a premium single-product purchase flow (Aurora Pro Headphones). Renders a centered heading with an optional subheading above a stack of native HTML <details> / <summary> accordion cards — the first item opens by default and each row reveals a believable answer covering shipping, returns, warranty, Bluetooth compatibility, and battery life. Built on native disclosure elements so it works without client-side state, using token-based styling throughout. Use when a product detail page needs a trustworthy Q&A band to address buyer objections.',
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
        className={cn(
          'border-t border-border bg-background py-12 sm:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
            {heading}
          </h2>
          {subheading ? (
            <p className="mt-3 text-center text-muted-foreground">
              {subheading}
            </p>
          ) : null}
          <div className="mt-10 flex flex-col gap-3">
            {items.map((it, i) => (
              <details
                key={it.question}
                open={i === 0}
                className="group rounded-xl border border-border bg-muted/40 open:bg-card open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                  <h3 className="pr-4 font-medium text-foreground">
                    {it.question}
                  </h3>
                  <span className="text-muted-foreground" aria-hidden>
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  <p>{it.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
