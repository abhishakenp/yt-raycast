import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * DirectoryFaq — accordion FAQ section for a local-business directory. A
 * narrow-width background section with a centered heading + description and a
 * stack of native disclosure cards (details/summary) on card surfaces: each row
 * shows a bold question with a chevron that rotates open, expanding to a muted
 * answer paragraph. Static, no links. Use to answer listing, review-verification,
 * pricing, and coverage questions on local directories, find-a-service platforms,
 * or review-and-discovery sites.
 */
export const DirectoryFaq = defineComponent({
  name: 'DirectoryFaq',
  description:
    'Accordion FAQ section for a local-business DIRECTORY: a narrow-width background section with a centered heading and description and a stack of native disclosure cards (details/summary) on card surfaces — each row shows a bold question with a chevron that rotates when open, expanding to a muted answer paragraph. Static, no links. Use to answer listing, review-verification, pricing, and coverage questions on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** FAQ entries (question + answer). */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ?? 'Everything you need to know about LocalFindr'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How do I list my business on LocalFindr?',
            answer:
              'Simply click "List Your Business" and create a free account. You\'ll be guided through adding your business name, address, contact information, category, and photos. Your listing goes live immediately after verification.',
          },
          {
            question: 'Is it really free to list my business?',
            answer:
              'Yes! Our Basic plan is completely free and includes all essential features: business listing, contact information, and customer reviews. Premium plans offer enhanced visibility and additional features for businesses looking to grow.',
          },
          {
            question: 'How are reviews verified?',
            answer:
              'We use multiple verification methods including email confirmation, phone verification, and activity tracking to ensure reviews come from real customers. Our team also monitors for suspicious activity and removes fake reviews promptly.',
          },
          {
            question: 'Can I respond to customer reviews?',
            answer:
              'Absolutely! Business owners can respond to all reviews publicly to thank customers or address concerns. You can also contact reviewers privately through our messaging system to resolve issues.',
          },
          {
            question: 'What cities do you cover?',
            answer:
              "LocalFindr is currently available in 156 cities across the United States, Canada, and the UK. We're expanding rapidly—if your city isn't listed yet, you can request it and we'll prioritize adding it.",
          },
        ]

    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.question}
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <span className="font-semibold text-card-foreground">
                    {item.question}
                  </span>
                  <svg
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
