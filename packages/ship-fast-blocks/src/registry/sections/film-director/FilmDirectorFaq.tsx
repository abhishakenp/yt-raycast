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
 * FilmDirectorFaq — a narrow, cinematic FAQ accordion for a film director or
 * cinematographer. Behind a giant faint "FAQ" watermark, a mono slate meta rule
 * sits above a giant credits-style extrabold header, over a constrained-width
 * stack of native <details> disclosure cards — each a square hairline summary row
 * carrying a mono "Q.0X" index, the question, and a chevron that rotates open to
 * reveal a muted answer paragraph. Tokens-only. Use to answer common questions
 * (timelines, international work, equipment, music licensing, agency collaboration,
 * deliverables) for filmmakers, directors, DPs, or production houses.
 */
export const FilmDirectorFaq = defineCapsule({
  name: 'FilmDirectorFaq',
  description:
    'Narrow, cinematic FAQ accordion for a film director or cinematographer: behind a giant faint "FAQ" watermark, a mono slate meta rule above a giant credits-style extrabold header, over a constrained-width stack of native details disclosure cards each a square hairline summary row with a mono "Q.0X" index, the question, and a chevron that rotates open to reveal a muted answer paragraph. Tokens-only. Use to answer common questions (timelines, international work, equipment, music licensing, agency collaboration, deliverables) for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqHeading = props.heading ?? 'Common Questions'
    const faqDesc =
      props.description ?? 'Everything you need to know about working together.'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            question: 'What is your typical project timeline?',
            answer:
              'Most projects take 4-8 weeks from kickoff to final delivery. This includes 1-2 weeks for pre-production (casting, locations, shot lists), 1-3 days of filming, and 2-4 weeks for post-production. Rush timelines are possible with advance notice and may incur additional fees.',
          },
          {
            question: 'Do you work with international clients?',
            answer:
              "Absolutely. I've filmed projects across North America, Europe, and Asia. I'm based in Los Angeles but travel frequently for productions. Remote pre-production via video calls works seamlessly, and I've built relationships with local crews in major cities worldwide.",
          },
          {
            question: 'What equipment do you shoot on?',
            answer:
              "I typically shoot on ARRI Alexa Mini LF or Sony Venice 2 for high-end projects, and RED Komodo for more nimble productions. I work with talented DP colleagues for projects requiring specific expertise. All equipment packages are customized to the project's creative and budgetary needs.",
          },
          {
            question: 'How do you handle music licensing?',
            answer:
              'Music is integral to my process. For Essential packages, I use high-quality licensed tracks from premium libraries. For Professional and Premium projects, I work with composers for custom scores or license commercial tracks through my network of music supervisors. All licensing is handled professionally and included in your quote.',
          },
          {
            question: 'Can you work with our existing agency team?',
            answer:
              "Of course. I regularly collaborate with creative directors, art directors, and account teams from agencies large and small. I'm experienced in taking creative direction while also bringing my own visual perspective to elevate the work. Clear communication and shared references ensure we're aligned throughout.",
          },
          {
            question: 'What deliverables do you provide?',
            answer:
              'Every project includes the master cut in 4K or HD, along with format-specific versions for social platforms (9:16 vertical, 1:1 square, 16:9). I also provide still frames for press use, and can deliver raw footage on request. Color-graded versions for broadcast specs are available upon request.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-4 top-16 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[14rem] lg:text-[22rem]"
        >
          FAQ
        </span>
        <Container size="sm" className="relative">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Common Questions
            </span>
            <span className="tabular-nums">
              {String(faqItems.length).padStart(2, '0')} entries
            </span>
          </div>
          <SectionHeading
            align="left"
            title={faqHeading}
            subtitle={faqDesc}
            className="mb-12 gap-0 sm:mb-16"
            titleClassName="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl"
            subtitleClassName="text-muted-foreground"
          />
          <FaqAccordion>
            {faqItems.map((item, i) => (
              <FaqItem
                key={item.question}
                className="rounded-none open:border-foreground/40"
              >
                <FaqQuestion className="gap-4 p-6">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Q.{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 font-extrabold tracking-tight">
                    {item.question}
                  </span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6 text-sm">
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
