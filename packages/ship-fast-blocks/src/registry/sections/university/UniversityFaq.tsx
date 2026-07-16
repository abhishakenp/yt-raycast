import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityFaq = defineCapsule({
  name: 'UniversityFaq',
  description:
    'Bespoke admissions Q&A band for the University page family with a prestigious, collegiate aesthetic. Opens with a SectionHeading, then renders a vertical list of native <details>/<summary> disclosures covering application deadlines, requirements, financial aid, campus tours, and transfer pathways. Border-divided rows keep the list quiet and authoritative; theme tokens throughout. Use to answer common prospective-student questions on a university homepage or admissions page.',
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
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <FaqAccordion variant="divided" className="mt-12">
            {faqs.map((faq, i) => (
              <FaqItem key={`${faq.question ?? 'faq'}-${i}`} variant="divided">
                <FaqQuestion className="text-left">
                  {faq.question}
                  <FaqQuestionIcon variant="plus" />
                </FaqQuestion>
                <FaqAnswer className="mt-3 text-sm leading-7">
                  {faq.answer}
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
