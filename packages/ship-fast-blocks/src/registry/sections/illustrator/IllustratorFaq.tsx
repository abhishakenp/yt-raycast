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
 * IllustratorFaq — a narrow FAQ ledger for an illustrator / visual-artist
 * portfolio on a raised card band. A mono index eyebrow + serif heading sit
 * above a constrained definition-list whose rows are separated by dashed
 * hand-drawn rules; each row leads with a big mono index numeral, then a serif
 * question and a relaxed answer paragraph. Use to answer common commission,
 * licensing, and shipping questions. Renders fully with no props via baked-in
 * defaults.
 */
export const IllustratorFaq = defineCapsule({
  name: 'IllustratorFaq',
  description:
    'Narrow FAQ ledger for an illustrator / visual-artist portfolio on a raised card band: a mono index eyebrow + serif heading above a constrained definition-list whose rows are separated by dashed hand-drawn rules, each leading with a big mono index numeral, then a serif question and a relaxed answer paragraph. Use to answer common commission, licensing, and shipping questions.',
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Question / answer items. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Common Questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is your commission process?',
            answer:
              'I typically start with a discovery call to understand your project needs, followed by a detailed proposal including timeline and pricing. After contract and deposit, I create sketches for approval before moving to final artwork. Most projects take 4-8 weeks depending on complexity.',
          },
          {
            question: 'Do you license existing illustrations?',
            answer:
              'Yes, many of my personal pieces are available for licensing. Rates depend on usage, duration, and exclusivity. Contact me with your specific needs for a custom quote.',
          },
          {
            question: 'What are your print shipping options?',
            answer:
              'All prints are shipped flat in protective sleeves within 2 business days. Standard US shipping is $6 (5-7 days), Express is $15 (2-3 days). International shipping available to 40+ countries starting at $18.',
          },
          {
            question: 'Are you currently accepting new projects?',
            answer:
              "I'm booking projects starting September 2024. Picture book manuscripts should reach out 6-12 months ahead of desired completion. Editorial and smaller commercial projects can often accommodate tighter timelines.",
          },
        ]

    return (
      <section
        className={cn(
          'bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="sm">
          <div className="mb-14 text-center">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              className="gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="font-serif text-3xl sm:text-4xl lg:text-5xl"
            />
          </div>
          <FaqAccordion asChild>
            <dl className="border-t-2 border-dashed border-border">
              {items.map((item, i) => (
                <FaqItem
                  key={item.question}
                  asChild
                  variant="minimal"
                  className="rounded-none border-b-2 border-dashed border-border bg-transparent py-6"
                >
                  <div className="grid grid-cols-[auto_1fr] gap-x-4">
                    <span
                      aria-hidden="true"
                      className="row-span-2 font-mono text-sm tabular-nums text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <FaqQuestion asChild className="mb-2 font-serif text-lg">
                      <dt>{item.question}</dt>
                    </FaqQuestion>
                    <FaqAnswer asChild className="leading-relaxed">
                      <dd>{item.answer}</dd>
                    </FaqAnswer>
                  </div>
                </FaqItem>
              ))}
            </dl>
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
