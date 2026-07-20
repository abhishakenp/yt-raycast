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
 * MobileAppFaq — a kinetic asymmetric 4/8 FAQ ledger on a calm muted band. The
 * left rail holds a mono "[ FAQ ]" micro-label, the heading with a tilted
 * primary marker block behind the key word, the supporting paragraph and a giant
 * ghost "?" watermark; the right column stacks native <details> rows in a
 * hairline-divided ledger — each row pairs a mono question-index numeral with the
 * question, a plus icon that rotates open, and a revealed answer paragraph.
 * Native disclosure, no JavaScript state, no links. Use as the questions /
 * objection-handling section on a habit tracker, fitness / wellness app,
 * productivity or to-do app, or any consumer app landing page. Renders fully with
 * no props via baked-in defaults.
 */
export const MobileAppFaq = defineCapsule({
  name: 'MobileAppFaq',
  description:
    'Kinetic asymmetric 4/8 FAQ ledger on a calm muted band: a left rail with mono FAQ micro-label, marker-highlighted heading, supporting paragraph and giant ghost ? watermark beside a hairline-divided ledger of native <details> rows, each pairing a mono question-index numeral with the question, a plus icon that rotates open, and a revealed answer paragraph. Use as the questions / objection-handling section on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about DailyFlow.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'Can I switch between plans at any time?',
            answer:
              "Yes, absolutely. You can upgrade, downgrade, or cancel your subscription at any time. If you downgrade from Pro to Free, you'll keep your Pro features until the end of your billing period.",
          },
          {
            question: 'What happens to my data if I cancel?',
            answer:
              'Your data belongs to you. Even on the Free plan, we keep your last 7 days of history. If you decide to come back, everything will be right where you left it. You can also export all your data at any time.',
          },
          {
            question: 'Is there a daily reminder limit?',
            answer:
              "Free users get 1 reminder per habit per day. Pro users get unlimited smart reminders that adapt to your schedule. Our AI learns when you're most likely to complete a habit and optimizes reminder timing accordingly.",
          },
          {
            question: 'How do accountability groups work?',
            answer:
              'You can create or join a group of 3-5 people with similar goals. Everyone shares their daily progress, and you can send encouraging messages. Research shows this increases success rates by 65%.',
          },
          {
            question: 'Is my data private and secure?',
            answer:
              'We take privacy seriously. All data is encrypted at rest and in transit. We never sell your data to third parties. Your habit data is only visible to you (and your accountability group members, if you choose to share).',
          },
          {
            question: 'Do you offer student or nonprofit discounts?',
            answer:
              'Yes! Students with a valid .edu email get 50% off Pro. Registered nonprofits can get up to 75% off Teams plans. Contact our support team with proof of status to apply.',
          },
        ]

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-faq-heading"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left rail: label, marker heading, ghost ? watermark. */}
            <div className="relative lg:col-span-4">
              <MonoTag className="mb-4 block">
                FAQ
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · support
                </span>
              </MonoTag>
              <h2
                id="mobileapp-faq-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                {description}
              </p>
              <Watermark className="left-0 top-full hidden -translate-y-8 text-[11rem] lg:block">
                ?
              </Watermark>
            </div>

            {/* Right column: hairline-divided question ledger. */}
            <FaqAccordion
              variant="divided"
              className="border-border lg:col-span-8"
            >
              {items.map((item, index) => (
                <FaqItem key={item.question} variant="divided" className="py-0">
                  <FaqQuestion className="select-none gap-4 py-5">
                    <span className="flex min-w-0 items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold tracking-tight text-foreground">
                        {item.question}
                      </span>
                    </span>
                    <FaqQuestionIcon variant="plus" />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="pb-6 pl-0 leading-relaxed sm:pl-10"
                  >
                    <div>{item.answer}</div>
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
