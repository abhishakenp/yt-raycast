import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * SaasFaq — a centered accordion-style FAQ band for a SaaS / AI-product landing
 * page. A heading + optional intro above a stacked list of bordered, rounded-xl
 * native HTML <details>/<summary> items: each summary is a font-semibold
 * question with an inline +/chevron SVG that rotates when the item is open, and
 * the answer reveals in a muted paragraph below. Pure static render (no React
 * state). Use to answer pre-purchase objections (pricing, trial, cancellation,
 * security, integrations, support) on SaaS, API, or B2B product pages. Renders
 * fully with no props via baked-in "Chronos AI" defaults.
 */
export const SaasFaq = defineCapsule({
  name: 'SaasFaq',
  description:
    'Centered accordion-style FAQ band for a SaaS / AI-product landing page: a heading + optional intro above a stacked list of bordered, rounded-xl native HTML details/summary items. Each summary is a font-semibold question with an inline +/chevron SVG that rotates when the item is open, and the answer reveals in a muted paragraph below. Pure static render with no React state. Use to answer pre-purchase objections (pricing, trial, cancellation, security, integrations, support) on SaaS, API, or B2B product pages.',
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Optional supporting line under the heading. */
    subheading: z.string().optional(),
    /** Question/answer pairs rendered as accordion rows. */
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const subheading =
      props.subheading ??
      "Everything you need to know about Chronos AI. Can't find an answer? Reach out to our team any time."
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How does pricing work?',
            answer:
              'Plans are billed monthly or annually per seat. Start on the free tier with no card required, then upgrade to Pro or Enterprise as your team grows. Annual billing saves you two months.',
          },
          {
            question: 'Is there a free trial?',
            answer:
              'Yes — every paid plan includes a 14-day free trial with full access to all features. No credit card is required to start, and you can invite your whole team during the trial.',
          },
          {
            question: 'Can I cancel anytime?',
            answer:
              "Absolutely. There are no long-term contracts. Cancel from your billing settings in one click and you'll keep access until the end of your current billing period.",
          },
          {
            question: 'How is my data secured?',
            answer:
              "All data is encrypted in transit and at rest. We're SOC 2 Type II compliant, run regular third-party penetration tests, and never train models on your private content.",
          },
          {
            question: 'What integrations do you support?',
            answer:
              'Chronos AI connects natively with Google Calendar, Outlook, Slack, Zoom, and 50+ other tools. Need something custom? Our REST API and webhooks let you build any workflow.',
          },
          {
            question: 'What kind of support do you offer?',
            answer:
              'Free plans get community support and docs. Pro plans add priority email support, and Enterprise customers receive 24/7 phone and Slack support with a dedicated success manager.',
          },
        ]

    return (
      <section
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="faq-heading"
      >
        <Container size="sm" className="px-6 sm:px-8">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            titleId="faq-heading"
            className="mb-12 gap-0"
            titleClassName="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground"
          />
          <FaqAccordion>
            {items.map((item, i) => (
              <FaqItem
                key={i}
                className="px-6 py-1 transition-colors hover:border-input"
              >
                <FaqQuestion className="py-4">
                  {item.question}
                  <FaqQuestionIcon variant="plus" />
                </FaqQuestion>
                <FaqAnswer className="pb-5">{item.answer}</FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
