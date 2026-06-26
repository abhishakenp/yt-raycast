import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

export const AeoFaqSection = defineComponent({
  name: 'AeoFaqSection',
  description:
    'An AEO-friendly FAQ section with semantic headings and expandable Q&A items for buyer questions. Use on home, pricing, or dedicated FAQ pages.',
  props: z.object({
    heading: z.string().optional(),
    intro: z.string().optional(),
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const intro =
      props.intro ??
      'Quick answers to the questions people ask before they buy, sign up, or get started.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What does this product do?',
            answer:
              'It helps customers understand the offer, compare options, and take action with clear, trustworthy information.',
          },
          {
            question: 'Who is it for?',
            answer:
              'It is designed for people who need a reliable solution in this category without unnecessary complexity.',
          },
          {
            question: 'Why choose it?',
            answer:
              'It focuses on clarity, useful outcomes, and a straightforward experience from first visit to conversion.',
          },
        ]

    return (
      <section
        className={cn(
          'border-t border-border bg-background py-12 sm:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{intro}</p>
          </div>
          <div className="space-y-4">
            {items.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-xl border border-border bg-muted/40 open:bg-card open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                  <h3 className="pr-4 font-medium text-foreground">
                    {item.question}
                  </h3>
                  <span className="text-muted-foreground" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
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
