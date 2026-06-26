import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

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
export const SaasFaq = defineComponent({
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
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="mb-12 text-center">
            <h2
              id="faq-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>
          <div className="space-y-4">
            {items.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card px-6 py-1 transition-colors hover:border-input"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <svg
                    className="size-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </summary>
                <p className="pb-5 text-base leading-relaxed text-muted-foreground">
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
