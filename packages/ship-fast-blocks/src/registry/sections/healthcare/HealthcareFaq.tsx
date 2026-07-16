import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * HealthcareFaq — accordion FAQ for a medical-clinic page. A narrow centered
 * column with an eyebrow chip, heading and intro above a stack of native
 * <details> accordions; each muted-surface row has a question summary with a
 * chevron that rotates when open and a revealed answer paragraph. Tokens-only,
 * no links, no JS state. Use for a frequently-asked-questions / patient-info
 * section of a doctors' office, primary-care practice or telehealth clinic.
 * Renders fully with no props via baked-in clinic-FAQ defaults.
 */
export const HealthcareFaq = defineCapsule({
  name: 'HealthcareFaq',
  description:
    "Accordion FAQ for a medical-clinic page: a narrow centered column with an eyebrow chip, heading and intro above a stack of native <details> accordions, each muted-surface row with a question summary, a chevron that rotates when open, and a revealed answer paragraph. Tokens-only, no links, no JS state. Use for a frequently-asked-questions / patient-info section of a doctors' office, primary-care practice or telehealth clinic.",
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
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2
              id="faq-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.question} variant="muted" className="bg-muted">
                <FaqQuestion className="p-6">
                  <h3 className="pr-8 text-lg font-semibold text-foreground">
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
        </div>
      </section>
    )
  },
})
