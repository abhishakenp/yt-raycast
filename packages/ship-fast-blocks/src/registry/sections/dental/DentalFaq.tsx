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
 * DentalFaq — asymmetric 4/8 FAQ ledger for a dental practice site. A
 * left-aligned rail (mono eyebrow + heading + lede, sticky on desktop) beside
 * a hairline-divided stack of native details/summary rows; each row pairs a
 * zero-padded mono index numeral with the question and a chevron that rotates
 * open to reveal the answer, indented under the question. No JavaScript
 * required (uses the native disclosure element). Use to answer common patient
 * questions about insurance, visit frequency, whitening, emergencies,
 * sedation, or implants for dentists, dental offices, or clinics.
 */
export const DentalFaq = defineCapsule({
  name: 'DentalFaq',
  description:
    'Asymmetric 4/8 FAQ ledger for a dental practice site: a left-aligned rail (mono eyebrow + heading + lede, sticky on desktop) beside a hairline-divided stack of native details/summary rows, each pairing a zero-padded mono index numeral with the question and a chevron that rotates open to reveal the indented answer. No JavaScript required. Use to answer common patient questions about insurance, visit frequency, whitening, emergencies, sedation, or implants for dentists, dental offices, or clinics.',
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
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                align="left"
                eyebrow={faqEyebrow}
                title={faqHeading}
                subtitle={faqDesc}
                className="gap-0 lg:sticky lg:top-28"
                eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="text-base text-muted-foreground sm:text-lg"
              />
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 divide-y divide-border border-y border-border">
                {faqItems.map((item, i) => (
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
                        <span className="font-semibold text-foreground">
                          {item.question}
                        </span>
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
