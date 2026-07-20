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

/**
 * InsuranceFaq — Swiss-trust FAQ ledger for an insurance page. On a soft muted
 * canvas: an asymmetric header (mono eyebrow + left-aligned heading + lede, mono
 * question count right) sits above a hairline-divided stack of question/answer
 * rows, each an asymmetric split of a giant mono index numeral beside the bold
 * question over a muted answer paragraph. Use to address common coverage, claims,
 * billing, premium and cancellation questions for insurance carriers, insurtech,
 * brokers, or financial-protection products. Renders fully with no props via
 * baked-in defaults.
 */
export const InsuranceFaq = defineCapsule({
  name: 'InsuranceFaq',
  description:
    'Swiss-trust FAQ ledger for an insurance page on a soft muted canvas: an asymmetric header (mono eyebrow + left-aligned heading + lede, mono question count right) above a hairline-divided stack of question/answer rows, each an asymmetric split of a giant mono index numeral beside the bold question over a muted answer paragraph. Use to address common coverage, claims, billing, premium and cancellation questions for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Question / answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Common Questions'
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ??
      "Everything you need to know about SecureLife insurance. Can't find what you're looking for? Contact our support team."
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How quickly can I get coverage?',
            answer:
              "Most policies are active immediately upon purchase. For life insurance, simplified issue policies are active right away, while traditional policies may require a brief underwriting period of 2-5 days. You'll receive your policy documents via email within minutes of purchase.",
          },
          {
            question: "What's included in the 24/7 claims support?",
            answer:
              'Our claims hotline (1-800-555-0199) is available around the clock for emergencies. You can report claims, check status, arrange emergency services like towing or temporary housing, and get immediate assistance from licensed adjusters.',
          },
          {
            question: 'Can I bundle multiple policies for a discount?',
            answer:
              'Absolutely! Bundle any 2 policies and save 10%, bundle 3+ policies and save 15%. Our most popular bundle includes home + auto, with an average savings of $340 per year. Bundling also simplifies billing and gives you a single point of contact.',
          },
          {
            question: 'Do you offer monthly payment options?',
            answer:
              'Yes, all our policies offer flexible payment options: monthly, quarterly, semi-annual, or annual. Choose monthly payments with no additional fees when you set up automatic payments. Pay annually and receive a 5% discount.',
          },
          {
            question: 'What factors affect my insurance premium?',
            answer:
              "For home insurance: location, home age, construction type, credit score, and claim history. For auto: driving record, vehicle type, annual mileage, age, and location. We use advanced analytics to ensure you're getting the fairest rate possible based on your specific risk profile.",
          },
          {
            question: 'Is there a penalty for canceling my policy?',
            answer:
              "None at all. You can cancel anytime with no cancellation fees. If you prepaid annually, you'll receive a prorated refund for unused months. We believe in earning your business every month, not trapping you in contracts.",
          },
          {
            question: 'How do I file a claim?',
            answer:
              "File claims through our mobile app, online portal, or by calling 1-800-555-0199. Most claims can be reported in under 5 minutes. You'll receive a claim number immediately and be contacted by an adjuster within 24 hours (4 hours for emergencies).",
          },
        ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container className="max-w-5xl">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / help
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(items.length).padStart(2, '0')} answers ]
            </MonoTag>
          </div>
          <FaqAccordion variant="divided">
            {items.map((item, i) => (
              <FaqItem
                key={item.question}
                asChild
                variant="divided"
                className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 py-6 sm:gap-x-8"
              >
                <div>
                  <span
                    aria-hidden="true"
                    className="row-span-2 font-mono text-2xl font-extrabold leading-none tabular-nums tracking-tight text-primary sm:text-3xl"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <FaqQuestion
                    asChild
                    className="col-start-2 text-lg font-semibold tracking-tight text-foreground"
                  >
                    <h3>{item.question}</h3>
                  </FaqQuestion>
                  <FaqAnswer className="col-start-2 leading-relaxed">
                    {item.answer}
                  </FaqAnswer>
                </div>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
