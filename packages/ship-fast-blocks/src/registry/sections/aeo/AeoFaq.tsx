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

/**
 * AeoFaq — bespoke, accessible FAQ section for an Answer-Engine-Optimization
 * (AEO) SaaS built on native <details> disclosures. A centered heading sits
 * above expandable Q&A items covering what AEO is, which engines are supported,
 * how it differs from SEO, and what optimization involves. The first item is
 * open by default and each summary toggles a card surface. Use on AEO,
 * generative-search visibility, or brand-citation landing and FAQ pages.
 * Distinct from AeoFaqSection. Renders fully with no props.
 */
export const AeoFaq = defineCapsule({
  name: 'AeoFaq',
  description:
    'Bespoke accessible FAQ section for an Answer-Engine-Optimization (AEO) product using native <details> disclosures: a centered heading above expandable Q&A items covering what AEO is, which engines are tracked, how AEO differs from SEO, what optimization involves, and how results are measured. The first item is open by default. Use on AEO, generative-search visibility, or brand-citation landing and FAQ pages.',
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
    const heading = props.heading ?? 'Answer Engine Optimization, explained'
    const intro =
      props.intro ??
      'The common questions teams ask before they start optimizing for AI answers.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is Answer Engine Optimization (AEO)?',
            answer:
              'AEO is the practice of optimizing your brand and content so AI answer engines — like ChatGPT, Perplexity, and Google AI Overviews — cite you in their generated answers. Instead of ranking a blue link, the goal is to be the source the model quotes and attributes.',
          },
          {
            question: 'Which answer engines does Citeable track?',
            answer:
              'We track ChatGPT, Perplexity, Google AI Overviews, Gemini, and Claude out of the box, with new engines added as they gain reach. You can monitor how each one answers your most important prompts and whether your brand is cited.',
          },
          {
            question: 'How is AEO different from SEO?',
            answer:
              'SEO optimizes for ranked links on a results page; AEO optimizes for being extracted and cited inside a single synthesized answer. They overlap on content quality and authority, but AEO adds prompt-level tracking, citation share-of-voice, and content structured for model extraction.',
          },
          {
            question: 'What does optimizing actually involve?',
            answer:
              'Citeable benchmarks how engines currently describe you, finds high-value prompts you should own, and gives concrete content recommendations — clearer answers, stronger sourcing, and structure engines can parse — then tracks whether your citations improve.',
          },
          {
            question: 'How do you measure results?',
            answer:
              'You get a measurable AI share-of-voice: the percentage of tracked answers that cite your brand, trended over time and broken down by engine, topic, and competitor — plus alerts whenever an engine changes how it answers a tracked query.',
          },
        ]

    return (
      <section
        className={cn(
          'border-t border-border bg-background py-12 sm:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{intro}</p>
          </div>
          <FaqAccordion>
            {items.map((item, i) => (
              <FaqItem key={item.question} variant="open-raised" open={i === 0}>
                <FaqQuestion className="p-5">
                  <h3 className="pr-4 font-medium text-foreground">
                    {item.question}
                  </h3>
                  <FaqQuestionIcon variant="plus" />
                </FaqQuestion>
                <FaqAnswer asChild className="px-5 pb-5 text-sm">
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
