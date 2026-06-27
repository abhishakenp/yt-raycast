import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * IllustratorFaq — a narrow, centered FAQ list for an illustrator /
 * visual-artist portfolio on a raised card-colored band. A centered uppercase
 * accent eyebrow + serif heading sit above a constrained definition-list of
 * soft background-colored cards, each pairing a serif question with a relaxed
 * answer paragraph. Use to answer common commission, licensing, and shipping
 * questions. Renders fully with no props via baked-in defaults.
 */
export const IllustratorFaq = defineCapsule({
  name: 'IllustratorFaq',
  description:
    'Narrow centered FAQ list for an illustrator / visual-artist portfolio on a raised card-colored band: a centered uppercase accent eyebrow + serif heading above a constrained definition-list of soft background-colored cards, each pairing a serif question with a relaxed answer paragraph. Use to answer common commission, licensing, and shipping questions.',
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
          'bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-chart-3">
              {eyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
          </div>
          <dl className="space-y-4">
            {items.map((item) => (
              <div key={item.question} className="rounded-lg bg-background p-6">
                <dt className="mb-2 font-serif text-lg">{item.question}</dt>
                <dd className="leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    )
  },
})
