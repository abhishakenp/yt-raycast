import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * CrowdfundingFaq — a native-disclosure accordion FAQ for a crowdfunding /
 * campaign landing page. On a card surface in a narrow column: a centered
 * uppercase eyebrow + heading above a stack of bordered <details> items, each
 * a clickable question summary with a chevron that rotates open and a muted
 * answer body that expands. No JS required (uses the browser <details>
 * element). Use to answer shipping, fulfillment, sourcing, refund and other
 * backer questions on a Kickstarter/Indiegogo-style raise, pre-order, or
 * fundraiser.
 */
export const CrowdfundingFaq = defineComponent({
  name: 'CrowdfundingFaq',
  description:
    'A native-disclosure accordion FAQ for a crowdfunding / campaign landing page on a card surface in a narrow column: a centered uppercase eyebrow + heading above a stack of bordered details items, each a clickable question summary with a chevron that rotates open and a muted answer body that expands. No JS required (uses the browser details element). Use to answer shipping, fulfillment, sourcing, refund and other backer questions on a Kickstarter/Indiegogo-style raise, pre-order, or fundraiser.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqEyebrow = props.eyebrow ?? 'FAQ'
    const faqHeading = props.heading ?? 'Frequently Asked Questions'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: 'When will EcoBrush ship?',
            a: "We expect to begin shipping in June 2026. This timeline accounts for tooling finalization, production ramp-up, and quality control. VIP Founder backers will receive their orders first, followed by Family Pack, Couple Bundle, and Single EcoBrush backers in that order. We'll send monthly updates to all backers throughout the production process.",
          },
          {
            q: 'How do I dispose of EcoBrush when it reaches end of life?',
            a: 'Disposal is simple and designed for circularity. First, separate the brush head from the handle—the aluminum ferrule and plant-based bristles can go in your recycling bin. Next, use the included tool to remove the small motor assembly from the bamboo handle. Send the motor back to us for recycling through our Take-Back Program (we provide a prepaid envelope). Finally, the bamboo handle can be composted in your home compost bin or municipal compost program—it will break down completely in 4-6 months.',
          },
          {
            q: 'Is the bamboo sustainably sourced?',
            a: 'Yes, absolutely. We use Moso bamboo (Phyllostachys edulis) harvested from FSC-certified forests in Zhejiang Province, China. Moso bamboo is not a food source for pandas and grows incredibly fast—up to 1 meter per day—making it highly renewable. Our supplier has been certified by the Forest Stewardship Council since 2018 and undergoes annual third-party audits for environmental and labor practices.',
          },
          {
            q: 'Does EcoBrush work with braces or dental work?',
            a: 'EcoBrush is safe for use with braces, crowns, veneers, and implants. We recommend the "Sensitive" mode for those with orthodontic work—it\'s gentler but still effective. The plant-based bristles are softer than typical nylon but engineered to clean thoroughly around brackets and wires. As always, check with your dentist if you have specific concerns about your dental work.',
          },
          {
            q: 'What is your refund policy?',
            a: 'Crowdfunding pledges can be cancelled and fully refunded for any reason before the campaign ends on March 15, 2026. After the campaign closes and funds are transferred to production, refunds will be available if we encounter delays exceeding 6 months from the estimated ship date, or if the project cannot be completed. Once your EcoBrush ships, our standard 2-year warranty applies, which covers defects in materials and workmanship.',
          },
          {
            q: 'Do you ship internationally?',
            a: 'Yes, we ship to 47 countries. Shipping is free to the US, UK, EU, Canada, Australia, and New Zealand. For other destinations, shipping is calculated at checkout based on your location. Please note that international backers may be responsible for import duties and taxes, which vary by country and are not included in the pledge amount. Due to shipping regulations, we cannot ship to PO boxes.',
          },
        ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {faqEyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {faqHeading}
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group overflow-hidden rounded-xl border border-border"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between bg-card p-6 transition-colors hover:bg-muted">
                  <span className="font-medium">{item.q}</span>
                  <svg
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
