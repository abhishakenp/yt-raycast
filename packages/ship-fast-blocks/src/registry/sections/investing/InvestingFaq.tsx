import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * InvestingFaq — Swiss-fintech asymmetric FAQ ledger for an investing /
 * brokerage page. A 5/7 split: a sticky left column carries a mono micro-label
 * eyebrow, a tracking-tight heading, a lede, and a mono meta rule; the right
 * column is a hairline-divided stack of native <details> disclosure rows (binary
 * radius, no cards) — each row a mono Q-index numeral beside a bold question with
 * a plus icon that rotates when open, revealing a muted answer. Tokens only, no
 * links, no JS. Use to answer common questions about a brokerage or trading
 * product — commissions, security, markets, transfers, retirement accounts, AI
 * features. Renders fully with no props via six baked-in Q&As.
 */
export const InvestingFaq = defineCapsule({
  name: 'InvestingFaq',
  description:
    'Swiss-fintech asymmetric FAQ ledger for an investing / brokerage page: a 5/7 split with a sticky left column (mono micro-label eyebrow, tracking-tight heading, lede, mono meta rule) beside a right column that is a hairline-divided stack of native <details> disclosure rows (binary radius, no cards) — each a mono Q-index numeral beside a bold question with a plus icon that rotates when open, revealing a muted answer. Tokens only, no links, no JS. Use to answer common questions about a brokerage or trading product (commissions, security, markets, transfers, retirement accounts, AI features).',
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
      <section
        id="faq"
        className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <MonoTag className="mb-4 block">
                  FAQ
                  <span aria-hidden="true" className="text-primary">
                    {' '}
                    / {String(items.length).padStart(2, '0')}
                  </span>
                </MonoTag>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
                  {heading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground text-pretty">
                  {description}
                </p>
                <p
                  aria-hidden="true"
                  className="mt-8 border-t border-border pt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
                >
                  [ {String(items.length).padStart(2, '0')} answers ] · updated
                  weekly
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion
                variant="divided"
                className="border-t border-border"
              >
                {items.map((item, i) => (
                  <FaqItem key={item.question} variant="divided">
                    <FaqQuestion className="items-start gap-4 py-5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-primary"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-base font-semibold tracking-tight text-foreground">
                        {item.question}
                      </span>
                      <FaqQuestionIcon variant="plus" />
                    </FaqQuestion>
                    <FaqAnswer asChild className="pb-5 pl-9 pr-8">
                      <div>{item.answer}</div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
