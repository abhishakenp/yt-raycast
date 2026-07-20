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
 * HealthcareFaq — asymmetric 4/8 FAQ ledger for a medical-clinic page. A
 * left-aligned rail (mono eyebrow + heading + lede, sticky on desktop) beside a
 * hairline-divided stack of native details/summary rows; each row pairs a
 * zero-padded mono index numeral with the question and a chevron that rotates
 * open to reveal the indented answer. No JavaScript required (uses the native
 * disclosure element). Use for a frequently-asked-questions / patient-info
 * section of a doctors' office, primary-care practice or telehealth clinic.
 * Renders fully with no props via baked-in clinic-FAQ defaults.
 */
export const HealthcareFaq = defineCapsule({
  name: 'HealthcareFaq',
  description:
    "Asymmetric 4/8 FAQ ledger for a medical-clinic page: a left-aligned rail (mono eyebrow + heading + lede, sticky on desktop) beside a hairline-divided stack of native details/summary rows, each pairing a zero-padded mono index numeral with the question and a chevron that rotates open to reveal the indented answer. No JavaScript required. Use for a frequently-asked-questions / patient-info section of a doctors' office, primary-care practice or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Question / answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about our practice.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'Do you accept my insurance?',
            answer:
              'We accept most major insurance plans including Blue Shield, Aetna, Cigna, UnitedHealthcare, Kaiser, and Medicare. We also offer competitive self-pay rates for those without insurance or with out-of-network plans. Contact our billing team at (415) 555-1235 to verify your specific coverage.',
          },
          {
            question: 'How quickly can I get an appointment?',
            answer:
              'For routine visits, we typically have availability within 1-3 days. For urgent concerns, we offer same-day appointments and walk-in hours from 7:00-9:00 AM weekdays. Virtual visits are often available within hours. Book online 24/7 or call us during business hours.',
          },
          {
            question: 'What should I bring to my first appointment?',
            answer:
              'Please bring a valid photo ID, your insurance card, a list of current medications (including dosages), and any relevant medical records or recent test results. If you have specific concerns, writing them down beforehand helps ensure we address everything during your visit.',
          },
          {
            question: 'Do you offer virtual visits?',
            answer:
              "Yes! We offer HIPAA-compliant video visits for many types of appointments including follow-ups, medication management, mental health check-ins, and minor acute concerns. Virtual visits are covered by most insurance plans at the same rate as in-person visits. You'll receive a secure link via email and text before your appointment.",
          },
          {
            question: 'What are your office hours?',
            answer:
              "We're open Monday through Friday 7:00 AM - 7:00 PM, and Saturday 8:00 AM - 2:00 PM. We offer early morning and evening appointments to accommodate busy schedules. Virtual visits are available during all business hours and selected evening hours Monday through Thursday until 8:00 PM.",
          },
          {
            question: 'Can you manage my chronic conditions?',
            answer:
              'Absolutely. Our physicians specialize in managing chronic conditions including diabetes, hypertension, asthma, thyroid disorders, high cholesterol, and depression/anxiety. We coordinate with specialists when needed and use our patient portal for ongoing communication and medication adjustments between visits.',
          },
        ]

    return (
      <section
        id="faq"
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="faq-heading"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                titleId="faq-heading"
                className="gap-0 lg:sticky lg:top-28"
                eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="text-base text-muted-foreground sm:text-lg"
              />
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 divide-y divide-border border-y border-border">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.question}
                    variant="muted"
                    className="rounded-none bg-transparent"
                  >
                    <FaqQuestion className="gap-6 py-5 sm:py-6">
                      <span className="flex min-w-0 items-baseline gap-4 pr-4 sm:gap-6">
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-sm text-muted-foreground/60 tabular-nums"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-semibold text-foreground">
                          {item.question}
                        </h3>
                      </span>
                      <FaqQuestionIcon className="transition" />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="pb-6 pl-9 pr-4 leading-relaxed text-muted-foreground sm:pl-12"
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
