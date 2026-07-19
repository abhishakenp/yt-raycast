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

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MobileAppFaq — a narrow, centered FAQ accordion on a calm muted band. A
 * centered heading + description sits above a stacked list of bordered
 * card-style <details> rows; each summary shows the question with a chevron that
 * rotates open, revealing a relaxed answer paragraph. Native disclosure, no
 * JavaScript state, no links. Use as the questions / objection-handling section
 * on a habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in defaults.
 */
export const MobileAppFaq = defineCapsule({
  name: 'MobileAppFaq',
  description:
    'Narrow centered FAQ accordion on a calm muted band: a centered heading + description over a stacked list of bordered card-style <details> rows, each with a question summary and a chevron that rotates open to reveal a relaxed answer paragraph (native disclosure, no JS state). Use as the questions / objection-handling section on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
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

    return (
      <section
        className={cn(
          'bg-muted/50 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-faq-heading"
      >
        <Container size="sm">
          <SectionHeading
            title={heading}
            subtitle={description}
            titleId="mobileapp-faq-heading"
            className="mb-16  gap-0"
            titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.question} variant="overflow-bordered">
                <FaqQuestion className="p-6">
                  <span className="font-semibold text-card-foreground">
                    {item.question}
                  </span>
                  <FaqQuestionIcon className="ml-4" />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.answer}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
