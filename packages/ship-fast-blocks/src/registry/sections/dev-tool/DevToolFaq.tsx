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
 * DevToolFaq — an accordion FAQ for a developer tool / API platform. A muted-
 * banded, narrow-width section with a centered heading + intro above a stack of
 * native <details> disclosure cards, each a bordered panel with a question
 * summary, a rotating chevron, and a revealed answer paragraph. No JS state —
 * uses the open/closed semantics of <details>. Use to answer common questions
 * about limits, self-hosting, supported languages, security, and trials for
 * developer tools, API platforms, or technical SaaS.
 */
export const DevToolFaq = defineCapsule({
  name: 'DevToolFaq',
  description:
    'Accordion FAQ for a developer tool / API platform: a muted-banded, narrow-width section with a centered heading + intro above a stack of native <details> disclosure cards, each a bordered panel with a question summary, a rotating chevron, and a revealed answer paragraph. Uses native details open/closed semantics (no JS state). Use to answer common questions about limits, self-hosting, supported languages, security, and trials for developer tools, API platforms, or technical SaaS.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about DevStack.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What happens when I exceed my plan limits?',
            answer:
              "We never throttle or shut down your service. On the Starter plan, requests beyond 10,000/month return a 429 status. On Pro and Enterprise, overages are billed at $0.0001 per request — about $1 per 10,000 requests. We'll always notify you before any charges occur.",
          },
          {
            question: 'Can I self-host DevStack?',
            answer:
              'Yes, Enterprise customers can run DevStack on their own infrastructure — private cloud, AWS, GCP, or Azure. This includes full source code access and dedicated support for setup and maintenance. Contact our sales team for Enterprise pricing.',
          },
          {
            question: 'What frameworks and languages do you support?',
            answer:
              'We offer official SDKs for JavaScript/TypeScript (React, Vue, Svelte, Next.js), Python, Go, Ruby, and PHP. Our REST API works with any language that can make HTTP requests. Serverless functions support Node.js 18+, Python 3.9+, Go 1.20+, and Rust 1.70+.',
          },
          {
            question: 'Is my data secure?',
            answer:
              "Security is our top priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II certified, GDPR compliant, and undergo regular third-party penetration testing. Enterprise plans include additional features like SSO, audit logs, and custom data retention policies.",
          },
          {
            question: 'How does the 14-day free trial work?',
            answer:
              'Start with full Pro plan access — no credit card required. Build and test with up to 500,000 requests. At the end of 14 days, choose to upgrade or automatically downgrade to the free Starter plan. No surprise charges, ever.',
          },
          {
            question: 'Do you offer startup or non-profit discounts?',
            answer:
              'Absolutely. Approved startups receive 50% off Pro plans for 12 months. Non-profits and open-source projects can apply for our free Non-Profit tier with expanded limits. Contact our team with your organization details to apply.',
          },
        ]

    return (
      <section
        className={cn('bg-muted/40 py-20 lg:py-28', props.className)}
        aria-labelledby="faq-heading"
      >
        <Container className="max-w-4xl">
          <SectionHeading
            title={heading}
            subtitle={description}
            titleId="faq-heading"
            className="mb-16  gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem
                key={item.question}
                variant="overflow-bordered"
                className="bg-background"
              >
                <FaqQuestion className="p-6">
                  <h3 className="font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>
                    <p className="leading-relaxed">{item.answer}</p>
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
