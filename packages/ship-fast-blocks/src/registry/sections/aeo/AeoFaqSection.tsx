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

/**
 * AeoFaqSection — "Answer Terminal" plain hairline FAQ list. A left-aligned
 * header sits above a divided, borderless accordion: each native <details> row
 * is separated by hairline rules only, the question carries a mono "Q.01"
 * index, the plus icon sits in a bordered square that rotates 45° on open, and
 * answers keep a primary left rule. The first item is open by default. Use on
 * home, pricing, or dedicated FAQ pages. Distinct from AeoFaq (which sits on a
 * dot-grid background with carded items).
 */
export const AeoFaqSection = defineCapsule({
  name: 'AeoFaqSection',
  description:
    'An AEO-friendly FAQ styled as a plain hairline terminal list: semantic headings above a divided accordion of native <details> rows separated by hairline rules, each question with a mono "Q.01" index and a bordered-square plus icon that rotates 45° on open, answers carrying a primary left rule. The first item is open by default. Use on home, pricing, or dedicated FAQ pages.',
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
            align="left"
            title={heading}
            subtitle={intro}
            className="mb-10 gap-0"
            titleClassName="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            subtitleClassName="text-muted-foreground"
          />
          <FaqAccordion variant="divided">
            {items.map((item, index) => (
              <FaqItem
                key={`${item.question}-${index}`}
                open={index === 0}
                variant="divided"
              >
                <FaqQuestion className="gap-4 py-1">
                  <span className="flex min-w-0 items-baseline gap-3 pr-4 font-medium text-foreground">
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-primary tabular-nums"
                    >
                      Q.{String(index + 1).padStart(2, '0')}
                    </span>
                    {item.question}
                  </span>
                  <FaqQuestionIcon
                    variant="plus"
                    className="grid size-8 shrink-0 place-items-center rounded-none border border-border bg-background [&>svg]:size-4"
                  />
                </FaqQuestion>
                <div className="pb-1 pt-4 text-sm leading-relaxed text-muted-foreground">
                  <FaqAnswer className="block border-l-2 border-primary pl-4 text-sm">
                    {item.answer}
                  </FaqAnswer>
                </div>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
