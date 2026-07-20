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
 * AeoFaq — "Answer Terminal" FAQ for an Answer-Engine-Optimization (AEO) SaaS
 * built on native <details> disclosures over a dot-grid background. A
 * left-aligned header with a mono index eyebrow sits above hairline rounded-none
 * Q&A items: each question is prefixed with a mono "Q.01" index, the plus icon
 * lives in a bordered square that rotates 45° on open, and answers carry a
 * primary left hairline rule. The first item is open by default. Use on AEO,
 * generative-search visibility, or brand-citation landing and FAQ pages.
 * Distinct from AeoFaqSection (which is a plain hairline list). Renders fully
 * with no props.
 */
export const AeoFaq = defineCapsule({
  name: 'AeoFaq',
  description:
    'Terminal-styled accessible FAQ for an Answer-Engine-Optimization (AEO) product using native <details> disclosures over a dot-grid background: a left-aligned mono-labeled header above hairline rounded-none Q&A items with mono "Q.01" indices, bordered-square plus icons that rotate 45° on open, and answers with a primary left rule — covering what AEO is, which engines are tracked, how AEO differs from SEO, what optimization involves, and how results are measured. The first item is open by default. Use on AEO, generative-search visibility, or brand-citation landing and FAQ pages.',
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
          'relative overflow-hidden border-t border-border bg-background py-12 sm:py-16',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-border"
        >
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>
        <Container size="sm" className="relative">
          <SectionHeading
            align="left"
            eyebrow="## FAQ"
            title={heading}
            subtitle={intro}
            className="mb-10 gap-0"
            eyebrowClassName="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            titleClassName="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            subtitleClassName="text-muted-foreground"
          />
          <FaqAccordion className="space-y-3">
            {items.map((item, i) => (
              <FaqItem
                key={`${item.question}-${i}`}
                variant="open-raised"
                open={i === 0}
                className="rounded-none bg-card open:border-foreground/25 open:shadow-none"
              >
                <FaqQuestion className="p-4 sm:p-5">
                  <h3 className="flex min-w-0 items-baseline gap-3 pr-4 font-medium text-foreground">
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-primary tabular-nums"
                    >
                      Q.{String(i + 1).padStart(2, '0')}
                    </span>
                    {item.question}
                  </h3>
                  <FaqQuestionIcon
                    variant="plus"
                    className="grid size-8 shrink-0 place-items-center rounded-none border border-border bg-background [&>svg]:size-4"
                  />
                </FaqQuestion>
                <FaqAnswer
                  asChild
                  className="px-4 pb-4 text-sm sm:px-5 sm:pb-5"
                >
                  <div>
                    <p className="border-l-2 border-primary pl-4">
                      {item.answer}
                    </p>
                  </div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
