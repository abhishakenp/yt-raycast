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
 * LendingFaq — a native-disclosure accordion FAQ for a lending or fintech
 * marketing page. A centered heading + description above a vertical stack of
 * bordered white <details> cards; each summary shows the question with a chevron
 * that rotates open, revealing the answer paragraph below. Uses no JS state — the
 * browser's open/close handles interactivity. Use to answer common borrower
 * questions on personal-loan, debt-consolidation, or financing pages. Renders
 * fully with no props via baked-in defaults.
 */
export const LendingFaq = defineCapsule({
  name: 'LendingFaq',
  description:
    'Native-disclosure accordion FAQ for a lending or fintech marketing page: centered heading + description above a vertical stack of bordered white <details> cards; each summary shows the question with a chevron that rotates open, revealing the answer paragraph. No JS state — native open/close handles interactivity. Use to answer common borrower questions on personal-loan, debt-consolidation, or financing pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqHeading = props.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.description ?? 'Everything you need to know about ClearLoan.'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: 'What can I use a ClearLoan for?',
            a: "You can use a ClearLoan for almost any personal purpose: debt consolidation, home improvements, medical expenses, auto purchases, education costs, major purchases, vacations, or unexpected expenses. We don't allow loans for illegal activities, gambling, or investing in securities.",
          },
          {
            q: 'Will checking my rate affect my credit score?',
            a: 'No. Checking your rate with ClearLoan uses a soft credit inquiry, which does not affect your credit score. Only if you choose to accept a loan offer and proceed with the full application will we perform a hard credit inquiry, which may have a small temporary impact on your score.',
          },
          {
            q: 'How quickly will I receive my funds?',
            a: "Once your loan is approved and you e-sign your documents, we typically deposit funds directly to your bank account within 1 business day. In some cases, it may take up to 3 business days depending on your bank's processing times. You'll receive an email with tracking details as soon as the transfer is initiated.",
          },
          {
            q: 'Can I pay off my loan early?',
            a: "Absolutely. You can pay off your ClearLoan in full at any time with zero prepayment penalties. You can also make additional principal payments anytime through your online account or mobile app. Paying early reduces the total interest you'll pay over the life of the loan.",
          },
          {
            q: 'What are the eligibility requirements?',
            a: 'To qualify for a ClearLoan, you must: be at least 18 years old (19 in Alabama and Nebraska), be a U.S. citizen or permanent resident, have a valid Social Security number, have a verifiable bank account, and have a minimum annual income of $25,000. We also consider your credit history, debt-to-income ratio, and other factors.',
          },
          {
            q: 'What happens if I miss a payment?',
            a: "Unlike traditional lenders, ClearLoan doesn't charge late fees. However, missed payments may be reported to credit bureaus and could impact your credit score. If you're having trouble making a payment, contact us immediately—our support team can work with you on options like payment date changes or temporary hardship programs.",
          },
          {
            q: 'How is ClearLoan different from a credit card?',
            a: 'ClearLoan offers fixed-rate installment loans with set monthly payments and a defined payoff date. Credit cards typically have variable rates, minimum payments that can keep you in debt longer, and no clear end date. Our loans are designed to help you pay off debt faster and save money on interest—our average borrower saves $4,200 compared to carrying the same balance on a credit card.',
          },
        ]

    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <Container className="max-w-4xl">
          <SectionHeading
            title={faqHeading}
            subtitle={faqDesc}
            className="mb-16 gap-0"
            titleClassName="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="mt-4 text-lg text-muted-foreground"
          />
          <FaqAccordion>
            {faqItems.map((item) => (
              <FaqItem key={item.q} variant="overflow-bordered">
                <FaqQuestion className="p-6 transition-colors hover:bg-accent">
                  <span className="pr-4 font-medium text-card-foreground">
                    {item.q}
                  </span>
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
