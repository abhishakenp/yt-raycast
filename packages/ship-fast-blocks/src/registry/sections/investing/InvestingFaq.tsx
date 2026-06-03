import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * InvestingFaq — accordion FAQ for an investing / fintech page. A narrow,
 * centered column with a heading + lead above a stack of native <details>
 * disclosure cards; each row shows a bold question with a chevron that rotates
 * when open, revealing a muted answer paragraph. Tokens only, no links, no JS.
 * Use to answer common questions about a brokerage or trading product —
 * commissions, security, markets, transfers, retirement accounts, AI features.
 * Renders fully with no props via six baked-in Q&As.
 */
export const InvestingFaq = defineComponent({
  name: "InvestingFaq",
  description:
    "Accordion FAQ for an investing / fintech page: a narrow centered column with a heading + lead above a stack of native <details> disclosure cards, each showing a bold question with a chevron that rotates when open, revealing a muted answer paragraph. Tokens only, no links, no JS. Use to answer common questions about a brokerage or trading product (commissions, security, markets, transfers, retirement accounts, AI features).",
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
    const brand = props.brand ?? "Vestora"
    const heading = props.heading ?? "Frequently asked questions"
    const description = props.description ?? `Everything you need to know about ${brand}.`
    const items = props.items?.length
      ? props.items
      : [
          {
            question: "Is Vestora really commission-free?",
            answer:
              "Yes, absolutely. We charge $0 commission on all stock, ETF, and options trades. There are no account minimums or maintenance fees for Essential accounts. We make money through premium subscriptions, payment for order flow, and interest on uninvested cash.",
          },
          {
            question: "How is my money protected?",
            answer:
              "Your securities are protected up to $500,000 (including $250,000 for cash claims) by the Securities Investor Protection Corporation (SIPC). Additionally, we use bank-grade 256-bit SSL encryption and offer biometric authentication for all accounts.",
          },
          {
            question: "What markets can I trade?",
            answer:
              "Vestora provides access to US stocks and ETFs listed on NYSE, NASDAQ, and BATS exchanges. Pro and Elite members can also trade options and cryptocurrencies including Bitcoin, Ethereum, and 30+ altcoins. International markets coming Q2 2025.",
          },
          {
            question: "Can I transfer my existing portfolio?",
            answer:
              "Absolutely. Our automated transfer service (ACATS) makes it easy to bring your portfolio from any major brokerage. We handle all the paperwork and typically complete transfers within 5-7 business days. Plus, we'll reimburse any transfer fees up to $500.",
          },
          {
            question: "Do you offer retirement accounts?",
            answer:
              "Yes, we support Traditional IRAs, Roth IRAs, and SEP IRAs with no additional fees. Our AI can help optimize your portfolio based on your retirement timeline and goals. You can also roll over 401(k)s from previous employers.",
          },
          {
            question: "How does the AI insights feature work?",
            answer:
              "Our machine learning algorithms analyze your portfolio, market conditions, news sentiment, and historical patterns to generate personalized insights. These include buy/sell recommendations, risk alerts, and diversification suggestions. Available on Pro and Elite plans.",
          },
        ]

    return (
      <section id="faq" className={cn("bg-background py-24", props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-border bg-muted/50"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6">
                  <span className="font-semibold">{item.question}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
