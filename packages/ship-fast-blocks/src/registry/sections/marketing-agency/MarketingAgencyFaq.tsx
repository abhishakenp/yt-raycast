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
 * MarketingAgencyFaq — a native expandable FAQ accordion. A centered eyebrow +
 * heading + description above a narrow stack of bordered, muted `<details>` rows;
 * each summary shows a question with a chevron that rotates when open, revealing
 * the answer below and raising the row to a card surface. Uses no JS state. Use
 * to answer common questions for a marketing / growth agency, SaaS, or service
 * business. Renders fully with no props.
 */
export const MarketingAgencyFaq = defineCapsule({
  name: 'MarketingAgencyFaq',
  description:
    'Native expandable FAQ accordion: a centered eyebrow + heading + description above a narrow stack of bordered, muted <details> rows; each summary shows a question with a chevron that rotates when open, revealing the answer and raising the row to a card surface. Uses no JS state. Use to answer common questions about timelines, contracts, ad spend, reporting, and industries for a marketing / growth agency, SaaS, or service business.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ??
      'Everything you need to know about working with Nexus Growth.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How quickly can I expect to see results?',
            a: 'Most clients see meaningful improvements within 60-90 days. Paid campaigns often show results within 2-4 weeks, while SEO typically takes 3-6 months for significant ranking improvements. We set clear milestone expectations during onboarding.',
          },
          {
            q: 'Do I need to sign a long-term contract?',
            a: 'No. All our plans are month-to-month with a 30-day cancellation notice. We believe in earning your business every month through results, not legal obligations. Enterprise clients may opt for annual agreements with pricing benefits.',
          },
          {
            q: "What's included in the ad spend?",
            a: 'Our fees are separate from your actual ad spend (what you pay to Google, Meta, etc.). The ad spend limits in our pricing refer to how much we can effectively manage within that tier. You maintain ownership of all ad accounts and assets.',
          },
          {
            q: 'How do you report on progress?',
            a: "All clients get access to a real-time dashboard showing key metrics. We also provide weekly email updates and monthly video calls to review performance, discuss learnings, and plan next month's priorities. Enterprise clients get custom reporting.",
          },
          {
            q: 'Do you work with agencies or white-label?',
            a: 'Yes, we offer white-label partnerships for marketing agencies, web design firms, and consultants who want to offer performance marketing to their clients. Contact us for partner pricing and case studies from successful partnerships.',
          },
          {
            q: 'What industries do you specialize in?',
            a: "We have deep expertise in B2B SaaS, e-commerce, fintech, healthcare, and professional services. While we can work with any industry, these are where we've generated the most consistent, outsized results for our clients.",
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container className="max-w-4xl">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 normal-case tracking-normal text-muted-foreground"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="md:text-base"
          />
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.q} variant="open-raised" className="bg-muted">
                <FaqQuestion className="p-6">
                  <span className="font-medium text-foreground">{item.q}</span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>
                    <p>{item.a}</p>
                  </div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
