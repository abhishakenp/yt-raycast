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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * ManufacturingFaq — a heavy-industrial FAQ spec ledger for a precision-
 * manufacturing site. On a muted band, an asymmetric header (mono index eyebrow +
 * giant heading left, mono count right) sits above a collapsed, thick-hairline
 * definition list: each row is an asymmetric 5/7 split pairing a giant mono Q
 * index + bold uppercase question on the left with the muted answer copy on the
 * right. Tech-brutalist, binary-radius, readable. Use to answer common
 * procurement questions (file formats, lead times, certs, tolerances, ITAR,
 * finishes, assembly, tracking) on machine-shop or fabricator pages. Renders
 * fully with no props via baked-in defaults.
 */
export const ManufacturingFaq = defineCapsule({
  name: 'ManufacturingFaq',
  description:
    'A heavy-industrial FAQ spec ledger for a precision-manufacturing site: on a muted band, an asymmetric header (mono index eyebrow + giant heading left, mono count right) above a collapsed thick-hairline definition list where each row is an asymmetric 5/7 split pairing a giant mono Q index + bold uppercase question on the left with muted answer copy on the right. Tech-brutalist, binary-radius, readable. Use to answer common procurement questions (file formats, lead times, certs, tolerances, ITAR, finishes, assembly, tracking) on machine-shop or fabricator pages.',
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
    const heading = props.heading ?? 'Common Questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What file formats do you accept for quotes?',
            answer:
              'We accept STEP, IGES, SolidWorks (.sldprt/.sldasm), CATIA, Parasolid, and AutoCAD files. For 2D laser cutting and sheet metal, PDF drawings with bend notes are sufficient. All files are handled securely and covered under our NDA.',
          },
          {
            question: 'What is your typical lead time for prototypes?',
            answer:
              'Standard prototype lead time is 2-3 business days for machined parts and 3-5 days for sheet metal. Expedited 24-hour service is available for urgent projects. Production volumes typically ship in 2-4 weeks depending on complexity.',
          },
          {
            question: 'Do you provide material certifications?',
            answer:
              'Yes, we provide full material certifications (mill certs), test reports, and inspection documentation with every order. FAIR (First Article Inspection Report) and PPAP (Production Part Approval Process) documentation is available upon request at no additional charge.',
          },
          {
            question: 'What tolerances can you hold?',
            answer:
              'Our standard machining tolerance is ±0.005". Precision tolerances of ±0.001" are routine. For critical aerospace and medical applications, we can achieve ±0.0005" on suitable geometries using our 5-axis mills and precision grinders.',
          },
          {
            question: 'Do you work with ITAR-controlled projects?',
            answer:
              'Yes, Vertex is ITAR registered and maintains a secure facility for defense work. We have SCIF capabilities and cleared personnel for classified projects. All employees undergo background checks and regular compliance training.',
          },
          {
            question: 'What surface finishes do you offer?',
            answer:
              'We offer bead blasting, anodizing (Type II and III hardcoat), chem film (Alodine), powder coating, passivation, electroless nickel, and custom painting. Specialty finishes like Titanium anodizing and Teflon coating are also available.',
          },
          {
            question: 'Do you offer assembly services?',
            answer:
              'Yes, we provide light assembly, hardware installation, and kitting services. Our Class 1000 cleanroom is available for medical device and semiconductor component assembly. We can also manage subcontractor relationships for specialized processes.',
          },
          {
            question: 'How do I track my order?',
            answer:
              'All customers receive access to our online portal where you can track job status, view production photos, download inspection reports, and communicate with our team. Email and phone support is also available during business hours (7 AM - 5 PM PST, Mon-Fri).',
          },
        ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container className="max-w-5xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="max-w-3xl gap-0"
              eyebrowClassName="font-mono uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 font-extrabold uppercase tracking-tight sm:text-4xl"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 md:mb-2 md:text-right"
            >
              {String(items.length).padStart(2, '0')} / Answers
            </MonoTag>
          </div>
          <FaqAccordion asChild>
            <dl className="border-t-2 border-foreground">
              {items.map((item, i) => (
                <FaqItem
                  key={item.question}
                  asChild
                  variant="bordered-lg"
                  className="rounded-none border-0 border-b-2 border-foreground bg-transparent p-0"
                >
                  <div className="grid grid-cols-1 gap-3 py-6 md:grid-cols-12 md:gap-8">
                    <div className="md:col-span-5">
                      <div className="flex items-start gap-4">
                        <span
                          aria-hidden="true"
                          className="font-mono text-2xl font-extrabold tabular-nums leading-none text-foreground/20"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <FaqQuestion
                          asChild
                          className="font-bold uppercase tracking-tight text-foreground"
                        >
                          <dt>{item.question}</dt>
                        </FaqQuestion>
                      </div>
                    </div>
                    <FaqAnswer
                      asChild
                      className="text-muted-foreground md:col-span-7"
                    >
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
