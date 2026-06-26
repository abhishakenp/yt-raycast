import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

export const AeoDirectAnswer = defineComponent({
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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {heading ? (
            <h2 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">
              {heading}
            </h2>
          ) : null}
          <p className="text-base leading-relaxed text-foreground sm:text-lg">
            {answer}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Who this is for:</strong>{' '}
            {whoFor}
          </p>
        </div>
      </section>
    )
  },
})
