import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * DentalFaq — FAQ accordion for a dental practice site. A narrow centered column
 * with an eyebrow + heading + lede above a stack of native details/summary
 * accordion rows on soft muted cards; each row shows a question with a chevron
 * that rotates open to reveal the answer. No JavaScript required (uses the
 * native disclosure element). Use to answer common patient questions about
 * insurance, visit frequency, whitening, emergencies, sedation, or implants for
 * dentists, dental offices, or clinics.
 */
export const DentalFaq = defineCapsule({
  name: 'DentalFaq',
  description:
    'FAQ accordion for a dental practice site: a narrow centered column with an eyebrow + heading + lede above a stack of native details/summary accordion rows on soft muted cards; each row shows a question with a chevron that rotates open to reveal the answer. No JavaScript required. Use to answer common patient questions about insurance, visit frequency, whitening, emergencies, sedation, or implants for dentists, dental offices, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqEyebrow = props.eyebrow ?? 'FAQ'
    const faqHeading = props.heading ?? 'Common questions answered'
    const faqDesc =
      props.description ??
      'Everything you need to know about your visit to Bright Smile Dental.'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            question: 'Do you accept dental insurance?',
            answer:
              'Yes! We accept all major dental insurance plans including Delta Dental, Cigna, Aetna, MetLife, Guardian, and Humana. We also file claims on your behalf and work to maximize your benefits. For uninsured patients, we offer an affordable in-house membership plan.',
          },
          {
            question: 'How often should I visit the dentist?',
            answer:
              "We recommend visiting every 6 months for routine cleanings and checkups. However, some patients with specific conditions like gum disease may benefit from more frequent visits (every 3-4 months). We'll create a personalized schedule based on your individual needs.",
          },
          {
            question: 'Is teeth whitening safe?',
            answer:
              "Absolutely! Professional teeth whitening performed by our dental team is safe and effective. We use clinically proven whitening agents and protective measures to minimize sensitivity. During your consultation, we'll assess your oral health to ensure whitening is right for you.",
          },
          {
            question: 'What should I do in a dental emergency?',
            answer:
              'Call us immediately at (503) 555-0142. We reserve same-day appointments for emergencies including severe toothaches, knocked-out teeth, broken crowns, or dental trauma. If you have a life-threatening emergency, please call 911 or visit the nearest emergency room.',
          },
          {
            question: 'Do you offer sedation dentistry?',
            answer:
              "Yes! We offer multiple sedation options to ensure your comfort: nitrous oxide (laughing gas) for mild anxiety, oral conscious sedation for moderate anxiety, and can arrange IV sedation for complex procedures. We'll discuss your options during your consultation.",
          },
          {
            question: 'How long do dental implants last?',
            answer:
              'With proper care, dental implants can last a lifetime. The implant itself (the titanium post) is permanent, while the crown may need replacement after 10-15 years due to normal wear. Regular checkups, good oral hygiene, and avoiding smoking help ensure the longevity of your implants.',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Eyebrow
              variant="text"
              className="mb-3 inline-block text-sm tracking-wider text-primary"
            >
              {faqEyebrow}
            </Eyebrow>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {faqHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{faqDesc}</p>
          </div>
          <FaqAccordion>
            {faqItems.map((item) => (
              <FaqItem key={item.question} variant="muted" className="bg-muted">
                <FaqQuestion className="p-6">
                  <span className="pr-8 font-semibold text-foreground">
                    {item.question}
                  </span>
                  <FaqQuestionIcon className="transition" />
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
