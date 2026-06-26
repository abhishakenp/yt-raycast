import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * JewelryStoreFaq — accordion FAQ for a luxury jewelry maison. A centered gold
 * eyebrow + serif heading sit above a narrow column of native <details>/<summary>
 * accordions on muted surfaces, each with a serif question, a gold chevron that
 * rotates open, and a relaxed muted answer. Use to address custom design,
 * certifications, warranty, shipping, in-person viewing, and financing questions
 * for fine jewelers, diamond houses, or high-jewelry maisons. Renders fully with
 * no props via baked-in defaults.
 */
export const JewelryStoreFaq = defineComponent({
  name: 'JewelryStoreFaq',
  description:
    'Accordion FAQ for a luxury jewelry maison: a centered gold eyebrow + serif heading above a narrow column of native details/summary accordions on muted surfaces, each with a serif question, a gold chevron that rotates open, and a relaxed muted answer. Use to address custom design, certifications, warranty, shipping, in-person viewing, and financing questions for fine jewelers, diamond houses, or high-jewelry maisons.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Common Questions'
    const heading = props.heading ?? 'Frequently Asked'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'Do you offer custom design services?',
            answer:
              'Yes, our bespoke design service allows you to create one-of-a-kind pieces with our master designers. The process begins with a private consultation where we discuss your vision, select materials, and develop sketches. Production typically takes 8-12 weeks depending on complexity. Bespoke commissions start at $15,000.',
          },
          {
            question: 'What certifications do your diamonds carry?',
            answer:
              'All Maison Noir diamonds over 0.30ct come with GIA or IGI certification. We exclusively source conflict-free diamonds certified through the Kimberley Process. For larger stones, we provide origin reports detailing the mine of extraction and cutting facility.',
          },
          {
            question: 'How does your lifetime warranty work?',
            answer:
              'Every Maison Noir piece includes complimentary cleaning, inspection, and maintenance for life. This covers prong tightening, rhodium plating for white gold, pearl restringing, and minor repairs. Simply visit any of our boutiques or mail your piece to us. Accidental damage repairs are offered at cost for our clients.',
          },
          {
            question: 'What are your shipping and return policies?',
            answer:
              'We offer complimentary insured shipping worldwide via Brinks or FedEx International Priority. Items ship within 2-3 business days. Custom pieces and engraved items are final sale. All other purchases may be returned within 30 days in original condition for a full refund or exchange.',
          },
          {
            question: 'Can I see pieces in person before purchasing?',
            answer:
              'We welcome private appointments at our boutiques in Paris, New York, London, and Tokyo. For engagement ring purchases, we strongly recommend scheduling a consultation to experience our stones in person. We can also arrange viewings at partner locations worldwide for qualified clients.',
          },
          {
            question: 'Do you offer financing options?',
            answer:
              'Yes, we offer financing through Affirm for purchases over $2,000. Terms range from 6 to 36 months with APR as low as 0% for qualified buyers. We also accept wire transfers and offer a 2% discount for payments via wire on purchases over $25,000.',
          },
        ]

    const Chevron = () => (
      <svg
        className="h-5 w-5 transition-transform group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-32', props.className)}>
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
              <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                {heading}
              </h2>
            </div>
            <div className="space-y-4">
              {items.map((f) => (
                <details key={f.question} className="group bg-muted">
                  <summary className="flex cursor-pointer items-center justify-between p-6">
                    <span className="font-serif text-lg text-foreground">
                      {f.question}
                    </span>
                    <span className="text-primary">
                      <Chevron />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
