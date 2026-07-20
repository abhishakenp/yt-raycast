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
 * CrmFaq — asymmetric 4/8 FAQ ledger for a CRM / SaaS landing page on a muted
 * wash band. The left rail holds a mono "[ FAQ ]" micro-label, the heading
 * with a tilted primary marker block behind the key word, the supporting
 * paragraph and a giant ghost "?" watermark; the right column stacks native
 * <details> rows in a hairline-divided ledger — each row pairs a mono
 * question-index numeral with the question, a plus icon that rotates open,
 * and a revealed answer paragraph. Sharp, scannable, ledger-precise. Use to
 * answer common objections for CRM, sales-pipeline or B2B SaaS products.
 * Renders fully with no props.
 */
export const CrmFaq = defineCapsule({
  name: 'CrmFaq',
  description:
    'Asymmetric 4/8 FAQ ledger for a CRM / SaaS landing page on a muted wash band: a left rail with mono FAQ micro-label, marker-highlighted heading, supporting paragraph and giant ghost ? watermark beside a hairline-divided ledger of native <details> rows, each pairing a mono question-index numeral with the question, a plus icon that rotates open, and a revealed answer paragraph. Sharp and scannable. Use to answer common objections for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Question/answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about Pipeline Pro.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How long does it take to get set up?',
            answer:
              'Most teams are up and running in under 30 minutes. Importing from another CRM typically takes 10-15 minutes depending on data size. Our onboarding wizard guides you through pipeline setup, team invites, and first deal creation. Enterprise customers get a dedicated onboarding specialist for white-glove setup.',
          },
          {
            question: 'Can I import data from my existing CRM?',
            answer:
              'Absolutely. We support direct imports from Salesforce, HubSpot, Pipedrive, Zoho, and 20+ other platforms. You can also upload CSV/Excel files with our smart field mapping tool. We automatically detect duplicates and suggest merges during import. Your historical data, notes, and activities transfer seamlessly.',
          },
          {
            question: 'Is there a limit on contacts or deals?',
            answer:
              "Starter plans include 1,000 contacts. Professional and Enterprise plans offer unlimited contacts, deals, and storage. We never throttle your usage or charge overage fees. If you're approaching your Starter plan limit, we'll notify you with upgrade options (and prorate any time remaining on your current plan).",
          },
          {
            question: 'What integrations are available?',
            answer:
              'Pipeline Pro integrates with 200+ tools including Gmail, Outlook, Slack, Zoom, Stripe, QuickBooks, Zapier, and major marketing platforms. Our REST API and webhooks enable custom integrations. Enterprise customers get access to our Integration Partner Program for priority support on complex custom connections.',
          },
          {
            question: 'Do you offer annual billing discounts?',
            answer:
              'Yes! Annual plans save you 20% compared to monthly billing. You can switch to annual billing anytime from your account settings. We also offer additional discounts for non-profits (25% off), educational institutions (40% off), and startups in their first year (30% off first 12 months).',
          },
          {
            question: 'How secure is my data?',
            answer:
              'Security is our top priority. We use 256-bit SSL encryption, SOC 2 Type II certified infrastructure, and GDPR compliance. Data is stored in redundant data centers with daily backups. Enterprise plans include SSO (SAML 2.0), audit logs, and custom data retention policies. We never sell or share your data with third parties.',
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
                <FaqItem key={item.question} variant="divided" className="py-0">
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
