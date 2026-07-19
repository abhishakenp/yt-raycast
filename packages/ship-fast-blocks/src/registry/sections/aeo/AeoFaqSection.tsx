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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const AeoFaqSection = defineCapsule({
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
        <Container size="sm">
          <SectionHeading
            title={heading}
            subtitle={intro}
            className="mb-10 gap-0"
            titleClassName="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
            subtitleClassName="text-muted-foreground"
          />
          <FaqAccordion>
            {items.map((item, index) => (
              <FaqItem
                key={item.question}
                open={index === 0}
                variant="open-raised"
              >
                <FaqQuestion className="p-5">
                  <span className="pr-4 font-medium text-foreground">
                    {item.question}
                  </span>
                  <FaqQuestionIcon variant="plus" />
                </FaqQuestion>
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  <FaqAnswer>{item.answer}</FaqAnswer>
                </div>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
