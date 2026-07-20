import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * InteriorDesignFaq — editorial-spatial FAQ ledger on a muted surface for an
 * upscale interior-design / architecture studio. An asymmetric 5:7 split with a
 * sticky mono "07 / FAQ" rail + light-weight heading on the left and a hairline-
 * divided stack of native details/summary rows on the right — each prefixed with
 * a mono "Q0N" index, a question, a chevron that rotates open and a relaxed-
 * leading answer (no JS state). Editorial, calm, binary radius. Use to address
 * common project, pricing and process questions for interior designers, design
 * studios or architecture firms. Renders fully with no props via baked-in
 * defaults.
 */
export const InteriorDesignFaq = defineCapsule({
  name: 'InteriorDesignFaq',
  description:
    'Editorial-spatial FAQ ledger on a muted surface for an upscale interior-design / architecture studio: an asymmetric 5:7 split with a sticky mono "07 / FAQ" rail + light-weight heading on the left and a hairline-divided stack of native details/summary rows on the right — each prefixed with a mono "Q0N" index, a question, a chevron that rotates when open and a relaxed answer (no JS state). Editorial, calm, binary radius. Use to address common project, pricing and process questions for interior designers, design studios or architecture firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Common questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is your typical project timeline?',
            answer:
              'Residential projects typically range from 3-6 months from concept to completion, depending on scope. Full home renovations may take 8-12 months. We provide detailed timelines during our initial consultation and keep you informed throughout every phase.',
          },
          {
            question: 'How do you charge for your services?',
            answer:
              'We offer both flat-fee and hourly arrangements depending on project complexity. Full-service design typically starts at $25,000 for single-room projects. Consultations are $500/hour. We provide detailed proposals after our initial discovery meeting so you know exactly what to expect.',
          },
          {
            question: 'Do you work with contractors and architects?',
            answer:
              'Absolutely. We have established relationships with top contractors, architects, and artisans throughout the Bay Area. We can recommend trusted professionals or work seamlessly with your existing team. Our project management ensures everyone stays aligned.',
          },
          {
            question: 'Do you take on small projects or single rooms?',
            answer:
              "Yes, we love projects of all scales. Whether it's a complete home transformation or a single room refresh, we bring the same level of care and expertise. Our consultation services are also perfect for clients who want professional guidance for DIY projects.",
          },
          {
            question: 'What areas do you serve?',
            answer:
              "We're based in San Francisco and primarily serve the Bay Area including Marin County, the Peninsula, and Napa/Sonoma. For select commercial and hospitality projects, we work nationally and internationally. Virtual consultations are available for out-of-area clients.",
          },
        ]

    return (
      <section
        className={cn(
          'bg-muted/40 px-4 py-20 sm:px-6 md:py-28 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-20">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-28">
                <MonoTag className="mb-5 flex items-center gap-3 tracking-[0.2em]">
                  <span aria-hidden="true" className="size-2 bg-primary" />
                  07 / {eyebrow}
                </MonoTag>
                <h2 className="text-balance text-3xl font-light tracking-tight text-foreground md:text-5xl">
                  {heading}
                </h2>
              </div>
            </div>

            <div className="md:col-span-7">
              <FaqAccordion className="border-t border-border">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.question}
                    className="rounded-none border-x-0 border-b border-t-0 border-border bg-transparent shadow-none transition-colors open:bg-card/50"
                  >
                    <FaqQuestion className="items-start gap-4 px-0 py-6">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground"
                      >
                        Q{String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="flex-1 pr-6 text-lg font-medium tracking-tight text-foreground">
                        {item.question}
                      </h3>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="px-0 pb-6 pl-10 leading-relaxed"
                    >
                      <div>{item.answer}</div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
