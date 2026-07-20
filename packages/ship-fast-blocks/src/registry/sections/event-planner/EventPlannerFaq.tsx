import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * EventPlannerFaq — kinetic-poster editorial Q&A. An asymmetric 5:7 two-column
 * layout: a left column with a mono metadata rail eyebrow, a giant tight-tracked
 * heading and lede (sticky on desktop), beside a right column stack of native
 * <details> disclosure rows joined by hairline top rules — each row carrying a
 * mono index numeral, a bold question summary, a chevron that rotates when open,
 * and a relaxed answer paragraph. No JS required. Use to answer common pre-booking
 * questions for event/wedding planners, agencies, or service businesses.
 */
export const EventPlannerFaq = defineCapsule({
  name: 'EventPlannerFaq',
  description:
    'Kinetic-poster editorial Q&A: an asymmetric 5:7 two-column layout with a left column (a mono metadata rail eyebrow, a giant tight-tracked heading and lede, sticky on desktop) beside a right column stack of native <details> disclosure rows joined by hairline top rules, each row carrying a mono index numeral, a bold question summary, a chevron that rotates when open, and a relaxed answer paragraph. Pure CSS disclosure, no JS. Use to answer common pre-booking questions for event/wedding planners, agencies, or premium service businesses.',
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
    return (
      <section
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {faqEyebrow}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
                <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
                  {faqHeading}
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion variant="wide" className="gap-0">
                {faqItems.map((item, i) => (
                  <FaqItem
                    key={item.question}
                    variant="muted"
                    className="rounded-none border-0 border-t border-border bg-transparent p-0 py-5"
                  >
                    <FaqQuestion className="items-start gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold tabular-nums tracking-[0.14em] text-primary"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="flex-1 text-lg font-bold tracking-tight text-foreground">
                        {item.question}
                      </h3>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer className="mt-4 pl-9">{item.answer}</FaqAnswer>
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
