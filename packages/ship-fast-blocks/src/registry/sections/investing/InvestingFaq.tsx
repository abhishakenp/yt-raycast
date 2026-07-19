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
 * InvestingFaq — accordion FAQ for an investing / fintech page. A narrow,
 * centered column with a heading + lead above a stack of native <details>
 * disclosure cards; each row shows a bold question with a chevron that rotates
 * when open, revealing a muted answer paragraph. Tokens only, no links, no JS.
 * Use to answer common questions about a brokerage or trading product —
 * commissions, security, markets, transfers, retirement accounts, AI features.
 * Renders fully with no props via six baked-in Q&As.
 */
export const InvestingFaq = defineCapsule({
  name: 'InvestingFaq',
  description:
    'Accordion FAQ for an investing / fintech page: a narrow centered column with a heading + lead above a stack of native <details> disclosure cards, each showing a bold question with a chevron that rotates when open, revealing a muted answer paragraph. Tokens only, no links, no JS. Use to answer common questions about a brokerage or trading product (commissions, security, markets, transfers, retirement accounts, AI features).',
  props: z.object({
    /** Brand / platform name woven into the lead paragraph. */
    brand: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Question / answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vestora'
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? `Everything you need to know about ${brand}.`
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'Is Vestora really commission-free?',
            answer:
              'Yes, absolutely. We charge $0 commission on all stock, ETF, and options trades. There are no account minimums or maintenance fees for Essential accounts. We make money through premium subscriptions, payment for order flow, and interest on uninvested cash.',
          },
          {
            question: 'How is my money protected?',
            answer:
              'Your securities are protected up to $500,000 (including $250,000 for cash claims) by the Securities Investor Protection Corporation (SIPC). Additionally, we use bank-grade 256-bit SSL encryption and offer biometric authentication for all accounts.',
          },
          {
            question: 'What markets can I trade?',
            answer:
              'Vestora provides access to US stocks and ETFs listed on NYSE, NASDAQ, and BATS exchanges. Pro and Elite members can also trade options and cryptocurrencies including Bitcoin, Ethereum, and 30+ altcoins. International markets coming Q2 2025.',
          },
          {
            question: 'Can I transfer my existing portfolio?',
            answer:
              "Absolutely. Our automated transfer service (ACATS) makes it easy to bring your portfolio from any major brokerage. We handle all the paperwork and typically complete transfers within 5-7 business days. Plus, we'll reimburse any transfer fees up to $500.",
          },
          {
            question: 'Do you offer retirement accounts?',
            answer:
              'Yes, we support Traditional IRAs, Roth IRAs, and SEP IRAs with no additional fees. Our AI can help optimize your portfolio based on your retirement timeline and goals. You can also roll over 401(k)s from previous employers.',
          },
          {
            question: 'How does the AI insights feature work?',
            answer:
              'Our machine learning algorithms analyze your portfolio, market conditions, news sentiment, and historical patterns to generate personalized insights. These include buy/sell recommendations, risk alerts, and diversification suggestions. Available on Pro and Elite plans.',
          },
        ]

    return (
      <section id="faq" className={cn('bg-background py-24', props.className)}>
        <Container size="sm">
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16  gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.question} className="bg-muted/50">
                <FaqQuestion className="p-6">
                  <span className="font-semibold">{item.question}</span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.answer}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
