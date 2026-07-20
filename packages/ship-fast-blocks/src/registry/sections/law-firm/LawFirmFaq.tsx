import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * LawFirmFaq — an asymmetric 4/8 editorial FAQ ledger for a law firm. A sticky
 * left rail carries a mono eyebrow, giant serif heading and a tabular question
 * count; the right column is a hairline-divided question/answer ledger where
 * each row pairs a giant faint serif "Q. 0x" case numeral with a serif question
 * and a muted answer paragraph. Authoritative, traditional-yet-modern newsprint
 * aesthetic with sharp binary corners. Use to answer common fee, engagement and
 * scope questions on law-firm, attorney, consulting or professional-services
 * pages. Renders fully with no props via baked-in defaults.
 */
export const LawFirmFaq = defineCapsule({
  name: 'LawFirmFaq',
  description:
    'Asymmetric 4/8 editorial FAQ ledger for a law firm: a sticky left rail with a mono eyebrow, giant serif heading and a tabular question count, beside a hairline-divided right-column question/answer ledger where each row pairs a giant faint serif "Q. 0x" case numeral with a serif question and a muted answer paragraph. Authoritative, traditional-yet-modern newsprint aesthetic with sharp binary corners. Use to answer common fee, billing, engagement, jurisdiction and scope questions on law-firm, attorney, consulting, accounting or professional-services pages.',
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
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  align="left"
                  eyebrow={eyebrow}
                  title={heading}
                  className="gap-0"
                  eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  titleClassName="mb-6 font-serif text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
                />
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
                >
                  {String(items.length).padStart(2, '0')} questions
                </span>
              </div>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion variant="divided">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.question}
                    asChild
                    className="rounded-none border-0 bg-transparent py-8"
                  >
                    <div className="grid grid-cols-[auto_1fr] gap-5 sm:gap-8">
                      <span
                        aria-hidden="true"
                        className="font-serif text-3xl font-semibold leading-none tabular-nums text-foreground/20 sm:text-4xl"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <FaqQuestion
                          asChild
                          className="mb-3 font-serif text-xl text-foreground"
                        >
                          <h3>{item.question}</h3>
                        </FaqQuestion>
                        <FaqAnswer className="leading-relaxed">
                          {item.answer}
                        </FaqAnswer>
                      </div>
                    </div>
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
