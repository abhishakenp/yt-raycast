import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceFaq — frequently-asked-questions stack for an insurance page. On a
 * soft muted canvas: a centered eyebrow chip + heading + lede above a narrow
 * column of bordered question/answer cards, each showing the question as a bold
 * heading over a muted answer paragraph. Use to address common coverage,
 * claims, billing and cancellation questions for insurance carriers, insurtech,
 * brokers, or financial-protection products. Renders fully with no props via
 * baked-in defaults.
 */
export const InsuranceFaq = defineComponent({
  name: 'InsuranceFaq',
  description:
    'Frequently-asked-questions stack for an insurance page on a soft muted canvas: a centered eyebrow chip + heading + lede above a narrow column of bordered question/answer cards, each showing the question as a bold heading over a muted answer paragraph. Use to address common coverage, claims, billing, premium and cancellation questions for insurance carriers, insurtech startups, brokers, or financial-protection products.',
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-border bg-background p-6 shadow-sm"
              >
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
