import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyFaq — asymmetric 4/8 FAQ ledger on a muted wash band. The left
 * rail holds a mono "[ FAQ ]" micro-label, the heading with a tilted primary
 * marker block behind the key word, the supporting paragraph and a giant ghost
 * "?" watermark; the right column stacks native <details> rows in a
 * hairline-divided ledger — each row pairs a mono question-index numeral with the
 * question, a plus icon that rotates open, and a revealed answer paragraph. Uses
 * no JS state. Use to answer common questions for a marketing / growth agency,
 * SaaS, or service business. Renders fully with no props.
 */
export const MarketingAgencyFaq = defineCapsule({
  name: 'MarketingAgencyFaq',
  description:
    'Asymmetric 4/8 FAQ ledger on a muted wash band: a left rail with mono FAQ micro-label, marker-highlighted heading, supporting paragraph and giant ghost ? watermark beside a hairline-divided ledger of native <details> rows, each pairing a mono question-index numeral with the question, a plus icon that rotates open, and a revealed answer paragraph. Uses no JS state. Use to answer common questions about timelines, contracts, ad spend, reporting, and industries for a marketing / growth agency, SaaS, or service business.',
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
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left rail: label, marker heading, ghost ? watermark. */}
            <div className="relative lg:col-span-4">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · {String(items.length).padStart(2, '0')} entries
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                {description}
              </p>
              <Watermark className="left-0 top-full hidden -translate-y-8 text-[11rem] lg:block">
                ?
              </Watermark>
            </div>

            {/* Right column: hairline-divided question ledger. */}
            <FaqAccordion
              variant="divided"
              className="border-border lg:col-span-8"
            >
              {items.map((item, index) => (
                <FaqItem key={item.q} variant="divided" className="py-0">
                  <FaqQuestion className="select-none gap-4 py-5">
                    <span className="flex min-w-0 items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold tracking-tight text-foreground">
                        {item.q}
                      </span>
                    </span>
                    <FaqQuestionIcon variant="plus" />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="pb-6 pl-0 leading-relaxed sm:pl-10"
                  >
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </FaqAnswer>
                </FaqItem>
              ))}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
