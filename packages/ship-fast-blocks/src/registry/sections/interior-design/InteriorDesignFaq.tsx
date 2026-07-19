import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * InteriorDesignFaq — centered FAQ accordion on a muted surface for an upscale
 * interior-design / architecture studio. A narrow column with a centered
 * uppercase eyebrow + light-weight heading above a stack of native
 * details/summary cards on a card surface, each with a question, a chevron that
 * rotates open and a relaxed-leading answer (no JS state). Editorial and calm.
 * Use to address common project, pricing and process questions for interior
 * designers, design studios or architecture firms. Renders fully with no props
 * via baked-in defaults.
 */
export const InteriorDesignFaq = defineCapsule({
  name: 'InteriorDesignFaq',
  description:
    'Centered FAQ accordion on a muted surface for an upscale interior-design / architecture studio: a narrow column with a centered uppercase eyebrow + light-weight heading above a stack of native details/summary cards on a card surface, each with a question, a chevron that rotates when open and a relaxed answer (no JS state). Editorial and calm. Use to address common project, pricing and process questions for interior designers, design studios or architecture firms.',
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
          'bg-muted px-4 py-20 sm:px-6 md:py-28 lg:px-8',
          props.className,
        )}
      >
        <Container size="sm">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            className="mb-16 gap-0"
            eyebrowClassName="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"
            titleClassName="text-3xl font-light text-foreground md:text-4xl"
          />

          <FaqAccordion>
            {items.map((item) => (
              <FaqItem
                key={item.question}
                className="rounded-sm transition-shadow open:shadow-sm"
              >
                <FaqQuestion className="p-6">
                  <h3 className="pr-8 text-lg font-medium text-card-foreground">
                    {item.question}
                  </h3>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.answer}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
