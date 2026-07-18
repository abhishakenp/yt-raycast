import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DirectAnswer } from '#/section-kit/DirectAnswer.tsx'

export const AeoDirectAnswer = defineCapsule({
  name: 'AeoDirectAnswer',
  description:
    'A concise direct-answer band for answer-engine optimization: a short overview paragraph near the top of a page that clearly states what the product or site does, plus an optional who-this-is-for line. Use immediately after the hero on home and key landing pages.',
  props: z.object({
    answer: z.string().optional(),
    whoFor: z.string().optional(),
    heading: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const answer =
      props.answer ??
      'This product helps customers understand the offer quickly and take action with confidence.'
    const whoFor =
      props.whoFor ??
      'Teams and individuals looking for a clear, trustworthy solution in this category.'
    const heading = props.heading

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-10 sm:py-12',
          props.className,
        )}
        aria-label="Overview"
      >
        <Container size="sm">
          {heading ? (
            <SectionHeading
              title={heading}
              align="left"
              titleClassName="text-2xl font-semibold sm:text-3xl"
              className="mb-4"
            />
          ) : null}
          <DirectAnswer className="mb-6">
            <p className="text-base leading-relaxed text-foreground sm:text-lg">
              {answer}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Who this is for:</strong>{' '}
              {whoFor}
            </p>
          </DirectAnswer>
        </Container>
      </section>
    )
  },
})
