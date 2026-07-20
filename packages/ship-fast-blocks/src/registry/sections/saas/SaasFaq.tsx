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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * SaasFaq — asymmetric 4/8 FAQ ledger for a SaaS / AI-product landing page. The
 * left rail holds a mono "[ FAQ ]" micro-label, the heading with a tilted
 * primary marker block behind the key word, the supporting paragraph and a giant
 * ghost "?" watermark; the right column stacks native HTML <details> rows in a
 * hairline-divided ledger — each row pairs a mono question-index numeral with a
 * font-semibold question, a plus icon that rotates open, and a revealed answer
 * paragraph. Sharp, scannable, pure static render (no React state). Use to answer
 * pre-purchase objections (pricing, trial, cancellation, security, integrations,
 * support) on SaaS, API, or B2B product pages. Renders fully with no props via
 * baked-in "Chronos AI" defaults.
 */
export const SaasFaq = defineCapsule({
  name: 'SaasFaq',
  description:
    'Asymmetric 4/8 FAQ ledger for a SaaS / AI-product landing page: a left rail with a mono FAQ micro-label, a marker-highlighted heading, a supporting paragraph and a giant ghost ? watermark beside a hairline-divided ledger of native <details> rows, each pairing a mono question-index numeral with the question, a plus icon that rotates open, and a revealed answer paragraph. Sharp and scannable, pure static render with no React state. Use to answer pre-purchase objections (pricing, trial, cancellation, security, integrations, support) on SaaS, API, or B2B product pages.',
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

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="faq-heading"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left rail: label, marker heading, ghost ? watermark. */}
            <div className="relative lg:col-span-4">
              <MonoTag className="mb-4 block">
                FAQ
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 06 entries
                </span>
              </MonoTag>
              <h2
                id="faq-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              >
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
                {subheading}
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
                <FaqItem key={index} variant="divided" className="py-0">
                  <FaqQuestion className="select-none gap-4 py-5">
                    <span className="flex min-w-0 items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold tracking-tight text-foreground">
                        {item.question}
                      </span>
                    </span>
                    <FaqQuestionIcon variant="plus" />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="pb-6 pl-0 leading-relaxed sm:pl-10"
                  >
                    <div>{item.answer}</div>
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
