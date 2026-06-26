import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * EventPlannerFaq — centered accordion of common questions. A narrow centered
 * intro (uppercase eyebrow, thin light heading, lede) above a vertical stack of
 * native <details> disclosure cards on muted rounded panels, each with a question
 * summary, a chevron that rotates when open, and a relaxed answer paragraph. No JS
 * required. Use to answer common pre-booking questions for event/wedding planners,
 * agencies, or service businesses.
 */
export const EventPlannerFaq = defineComponent({
  name: 'EventPlannerFaq',
  description:
    'Centered accordion of common questions: a narrow centered intro (uppercase eyebrow, thin light heading, lede) above a vertical stack of native <details> disclosure cards on muted rounded panels, each with a question summary, a chevron that rotates when open, and a relaxed answer paragraph. Pure CSS disclosure, no JS. Use to answer common pre-booking questions for event/wedding planners, agencies, or premium service businesses.',
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
    const faqHeading = props.heading ?? 'Common Questions'
    const faqDesc =
      props.description ??
      'Everything you need to know about working with Serene Events.'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            question: 'How far in advance should we book your services?',
            answer:
              'For weddings, we recommend booking 12-18 months in advance, especially for peak season (May-October). For corporate events and private celebrations, 3-6 months is typically sufficient, though more lead time gives us greater flexibility with premium venues and vendors.',
          },
          {
            question: 'Do you work with clients outside of San Francisco?',
            answer:
              "Absolutely! While we're based in San Francisco, we regularly plan events throughout California, including Napa Valley, Sonoma, Carmel, and Lake Tahoe. We also specialize in destination events across the US and internationally, with particular expertise in Italy, Mexico, and the Caribbean.",
          },
          {
            question: 'Can you work within our specific budget?',
            answer:
              "Yes, we pride ourselves on creating exceptional events across various budgets. During our initial consultation, we'll discuss your priorities and help allocate your budget strategically. We have strong relationships with vendors at different price points and know where to splurge and where to save without compromising on quality or experience.",
          },
          {
            question: "What's included in the planning packages?",
            answer:
              'Each package includes different levels of support, detailed in our pricing section above. Generally, our services cover vendor recommendations and negotiations, timeline creation, design concept development, RSVP management, rehearsal coordination, and on-site event management. Premium packages include additional services like custom design sourcing and dedicated assistants.',
          },
          {
            question: 'Do you handle vendor payments and contracts?',
            answer:
              'We facilitate vendor introductions, review contracts for industry-standard terms, and negotiate on your behalf when appropriate. However, all contracts are signed directly between you and the vendor, and payments are made directly to vendors. This ensures transparency and that you maintain direct relationships with the talented professionals making your event special.',
          },
          {
            question: "What happens if there's an emergency on the event day?",
            answer:
              "This is where our experience truly shines. We arrive prepared with backup plans for common scenarios—vendor no-shows, weather changes, equipment failures—and maintain relationships with emergency vendors who can respond quickly. Our team includes contingency planning in every timeline, and we're trained to handle challenges calmly while keeping you blissfully unaware of any hiccups.",
          },
          {
            question: 'How do we get started?',
            answer:
              "Simply fill out our inquiry form below or call us at (415) 555-0147. We'll schedule a complimentary 30-minute consultation to discuss your vision, date, and needs. From there, we'll provide a custom proposal outlining our recommended package and approach for your specific event. No pressure, no obligation—just an opportunity to see if we're the right fit.",
          },
        ]

    const Chevron = () => (
      <svg
        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )

    return (
      <section
        className={cn('px-4 py-20 sm:px-6 lg:px-8 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {faqEyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {faqHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{faqDesc}</p>
          </div>
          <div className="space-y-6">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl bg-muted p-6"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {item.question}
                  </h3>
                  <Chevron />
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
