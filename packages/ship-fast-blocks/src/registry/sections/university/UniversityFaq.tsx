import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityFaq = defineCapsule({
  name: 'UniversityFaq',
  description:
    'Editorial-academic admissions Q&A band for the University page family, laid out as an asymmetric 4/8 split: a left rail carries a mono eyebrow, a serif heading, supporting copy, and a mono question count; the right column renders a hairline-divided list of native <details>/<summary> disclosures covering application deadlines, requirements, financial aid, campus tours, and transfer pathways. Each row is numbered like a catalog entry (mono "Q01") with a plus toggle; border-divided rows keep the list quiet and authoritative; theme tokens throughout. Use to answer common prospective-student questions on a university homepage or admissions page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    faqs: z
      .array(
        z.object({
          question: z.string().optional(),
          answer: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Admissions'
    const heading = props.heading ?? 'Questions, answered'
    const subheading =
      props.subheading ??
      'Everything prospective students and families need to know about applying to Whitmore.'
    const faqs = props.faqs?.length
      ? props.faqs
      : [
          {
            question: 'When are application deadlines?',
            answer:
              'Early Action closes November 1 and Regular Decision closes January 15. Transfer applications are accepted on a rolling basis through April 1 for the fall term.',
          },
          {
            question: 'What are the admission requirements?',
            answer:
              'We require an application, official transcripts, two letters of recommendation, and a personal essay. Standardized test scores are optional and reviewed holistically when submitted.',
          },
          {
            question: 'How much does it cost, and is financial aid available?',
            answer:
              'Whitmore meets 100% of demonstrated financial need. More than 60% of students receive grants or scholarships, and our team works with every admitted family to build an affordable package.',
          },
          {
            question: 'Can I visit campus before applying?',
            answer:
              'Yes. We offer daily guided walking tours, information sessions, and overnight visits during the academic year. Reserve a date online and meet current students, faculty, and admissions counselors.',
          },
          {
            question: 'Do you accept transfer students?',
            answer:
              'We welcome transfer applicants from accredited institutions. Most credits transfer directly, and a dedicated advisor helps you map a clear path to your degree from day one.',
          },
          {
            question: 'When will I hear back about my decision?',
            answer:
              'Early Action applicants are notified by mid-December and Regular Decision applicants by late March. Admitted students then have until May 1 to confirm their enrollment.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container size="lg" className="px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                  {eyebrow}
                </p>
                <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {heading}
                </h2>
                <p className="mt-4 text-pretty leading-7 text-muted-foreground">
                  {subheading}
                </p>
                <p
                  aria-hidden="true"
                  className="mt-8 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground"
                >
                  {String(faqs.length).padStart(2, '0')} questions
                </p>
              </div>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion variant="divided">
                {faqs.map((faq, i) => (
                  <FaqItem
                    key={`${faq.question ?? 'faq'}-${i}`}
                    variant="divided"
                  >
                    <FaqQuestion className="items-start gap-4 text-left">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums text-primary"
                      >
                        Q{String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-serif text-lg font-semibold tracking-tight">
                        {faq.question}
                      </span>
                      <FaqQuestionIcon variant="plus" />
                    </FaqQuestion>
                    <FaqAnswer className="mt-3 pl-10 text-sm leading-7">
                      {faq.answer}
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
