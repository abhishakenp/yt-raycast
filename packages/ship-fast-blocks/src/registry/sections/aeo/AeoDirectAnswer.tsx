import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DirectAnswer } from '#/section-kit/DirectAnswer.tsx'

/**
 * AeoDirectAnswer — "Answer Terminal" direct-answer band styled as an AI answer
 * card: a mono "DIRECT ANSWER" header row with a primary square bullet, the
 * answer paragraph set large inside a hairline rounded-none card with a thick
 * primary left rule, and the who-this-is-for line rendered as a cited-source
 * footnote row with a "[1]" citation chip. Use immediately after the hero on
 * home and key landing pages of AEO, generative-search, or brand-citation
 * products.
 */
export const AeoDirectAnswer = defineCapsule({
  name: 'AeoDirectAnswer',
  description:
    'A direct-answer band styled as an AI answer card for answer-engine optimization: a mono "DIRECT ANSWER" header with a primary square bullet, a large answer paragraph inside a hairline rounded-none card with a primary left rule, and an optional who-this-is-for line rendered as a cited-source footnote row with a "[1]" citation chip. Use immediately after the hero on home and key landing pages.',
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
              titleClassName="text-2xl font-semibold tracking-tight sm:text-3xl"
              className="mb-4"
            />
          ) : null}
          <DirectAnswer className="-mx-2 mb-6 rounded-none border border-l-4 border-border border-l-primary bg-card p-0 sm:mx-0">
            <div className="flex items-center gap-2 border-b border-border px-6 py-3">
              <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Direct answer
              </span>
            </div>
            <p className="px-6 pt-5 text-lg leading-relaxed text-foreground sm:text-xl">
              {answer}
            </p>
            <p className="flex items-start gap-2 px-6 pb-6 pt-4 text-sm text-muted-foreground">
              <sup
                aria-hidden="true"
                className="mt-1 inline-flex shrink-0 items-center rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary"
              >
                [1]
              </sup>
              <span>
                <strong className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                  Who this is for:
                </strong>{' '}
                {whoFor}
              </span>
            </p>
          </DirectAnswer>
        </Container>
      </section>
    )
  },
})
