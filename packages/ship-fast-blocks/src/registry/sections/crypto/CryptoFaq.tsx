import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * CryptoFaq — accordion FAQ section for a crypto / DeFi landing page. A
 * centered heading + description followed by a vertical stack of bordered
 * detail/summary cards. Each item shows a question as a clickable summary
 * with a chevron that rotates on open, and the answer in the details panel.
 * Use for common questions about protocols, pricing, security, or onboarding.
 */
export const CryptoFaq = defineComponent({
  name: "CryptoFaq",
  description:
    "Accordion FAQ section for a crypto / DeFi landing page: centered heading + description, then a vertical stack of bordered detail/summary cards. Each item shows a question as a clickable summary with a rotating chevron, and the answer in the details panel. Use for common questions about protocols, pricing, security, or onboarding.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section description. */
    description: z.string().optional(),
    /** FAQ items (question + answer pairs). */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Frequently Asked Questions"
    const description =
      props.description ?? "Common questions about building on NexusChain."
    const items = props.items?.length
      ? props.items
      : [
          {
            question: "What is the average transaction fee on NexusChain?",
            answer:
              "The average transaction fee on NexusChain mainnet is $0.002, with peak congestion rarely exceeding $0.01. This is achieved through our optimistic rollup architecture and efficient data compression. Developers can also implement meta-transactions where users pay fees in stablecoins instead of NEX tokens.",
          },
          {
            question: "How long does mainnet deployment take?",
            answer:
              "Most protocols complete their first deployment within 15 minutes of connecting their wallet. Our pre-audited contract templates can be deployed instantly, while custom contracts require approximately 2-3 minutes for compilation, verification, and indexing. Full documentation and video tutorials are available in our developer portal.",
          },
          {
            question: "What chains does the bridge support?",
            answer:
              "NexusChain's native bridge currently supports Ethereum, Solana, Arbitrum, Optimism, Base, Polygon PoS, Polygon zkEVM, Avalanche C-Chain, BNB Chain, Cosmos Hub, Osmosis, Stargaze, and 8 additional IBC-enabled chains. New chains are added quarterly based on developer demand. The bridge has processed $890M in volume with zero security incidents.",
          },
          {
            question: "How do I become a validator?",
            answer:
              "The current validator set of 156 nodes is permissioned while we optimize network stability. Permissionless validator entry is scheduled for Q2 2025, requiring 50,000 NEX tokens staked as collateral. Interested operators can join our validator waitlist now to receive hardware requirements and early access to testnet validation.",
          },
          {
            question: "Is NexusChain audited and secure?",
            answer:
              "NexusChain has completed 4 comprehensive audits by OpenZeppelin, Trail of Bits, Spearbit, and Certik. Our bridge contracts use a multi-sig threshold scheme with 8 independent signers. We maintain a $10M bug bounty program through Immunefi and have never had a critical vulnerability exploited in production since mainnet launch in January 2024.",
          },
          {
            question: "What APIs and SDKs are available?",
            answer:
              "We provide TypeScript and Python SDKs with full type definitions, React hooks for wallet connection and contract interaction, and a GraphQL API for real-time indexed data. Enterprise customers also get access to dedicated RPC endpoints with 99.99% SLA and priority support. All documentation includes copy-paste code examples for common use cases.",
          },
        ]

    return (
      <section className={cn("py-20 lg:py-32", props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
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
                <summary className="flex cursor-pointer items-center justify-between p-6">
                  <span className="font-medium">{item.question}</span>
                  <svg
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
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
