import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * LawFirmFaq — a centered-heading, single-column FAQ stack for a law firm. A
 * tracked-uppercase eyebrow and serif heading sit above a vertical stack of
 * bordered question/answer cards on the card surface, each pairing a serif
 * question with a muted answer paragraph. Refined, authoritative editorial
 * aesthetic with sharp squared corners on a constrained reading width. Use to
 * answer common fee, engagement and scope questions on law-firm, attorney,
 * consulting or professional-services pages. Renders fully with no props via
 * baked-in defaults.
 */
export const LawFirmFaq = defineCapsule({
  name: 'LawFirmFaq',
  description:
    'Centered-heading, single-column FAQ stack for a law firm: a tracked-uppercase eyebrow and serif heading above a vertical stack of bordered question/answer cards on the card surface, each pairing a serif question with a muted answer paragraph, on a constrained reading width. Refined, authoritative editorial aesthetic with sharp squared corners. Use to answer common fee, billing, engagement, jurisdiction and scope questions on law-firm, attorney, consulting, accounting or professional-services pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Common Questions'
    const heading = props.heading ?? 'Frequently Asked Questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is your consultation fee?',
            answer:
              'We offer a complimentary 30-minute initial consultation for new business and individual clients. This allows us to understand your situation and explain how we can assist. For complex litigation assessments, we apply a flat $750 fee that is credited against future work if you retain our services.',
          },
          {
            question: 'How are your fees structured?',
            answer:
              'Depending on the matter, we work on hourly rates, fixed fees, or contingency arrangements. Transactional matters such as contracts and M&A are typically billed hourly ($450-$850/hour depending on attorney). Certain litigation cases, particularly plaintiff-side commercial disputes, may be appropriate for contingency representation at 33-40% of recovery.',
          },
          {
            question: 'Do you work with clients outside New York?',
            answer:
              'Absolutely. While our headquarters are in Manhattan, we represent clients across the United States and internationally. We are admitted in New York, Delaware, California, and Texas, and maintain relationships with correspondent firms in all 50 states for matters requiring local counsel.',
          },
          {
            question: 'How quickly can you start on my matter?',
            answer:
              'For urgent matters—litigation deadlines, emergency injunctions, time-sensitive transactions—we can deploy resources within 24 hours. For standard engagements, we typically begin within 5-7 business days of engagement letter execution. We maintain a lean team precisely so we can be responsive when clients need us most.',
          },
          {
            question: 'What industries do you specialize in?',
            answer:
              "Our deepest experience spans financial services, technology and SaaS, healthcare and life sciences, commercial real estate, and manufacturing. That said, our commercial litigation and corporate attorneys handle matters across virtually every industry sector. If your industry requires specialized knowledge we don't possess, we'll tell you upfront and potentially refer you to specialized counsel.",
          },
        ]

    return (
      <section className={cn('bg-background py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
              {heading}
            </h2>
          </div>
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.question}
                className="border border-border bg-card p-8"
              >
                <h3 className="mb-3 font-serif text-xl text-foreground">
                  {item.question}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
