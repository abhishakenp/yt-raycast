import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CrmFaq — centered FAQ accordion for a CRM / SaaS landing page on a subtle
 * muted band. A narrow heading + supporting paragraph above a stack of native
 * <details> cards: a bordered card with a question summary, a chevron that
 * rotates open, and a revealed answer paragraph. Clean and scannable. Use to
 * answer common objections for CRM, sales-pipeline or B2B SaaS products.
 * Renders fully with no props.
 */
export const CrmFaq = defineCapsule({
  name: 'CrmFaq',
  description:
    'Centered FAQ accordion for a CRM / SaaS landing page on a subtle muted band: a narrow heading + supporting paragraph above a stack of native <details> cards, each a bordered card with a question summary, a chevron that rotates open, and a revealed answer paragraph. Clean and scannable. Use to answer common objections for CRM, sales-pipeline or B2B SaaS products.',
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

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <section className={cn('bg-muted/50 py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between p-6">
                  <span className="font-semibold text-card-foreground">
                    {item.question}
                  </span>
                  <ChevronDown />
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
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
