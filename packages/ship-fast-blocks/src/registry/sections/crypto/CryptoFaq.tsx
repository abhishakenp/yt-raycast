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
import { Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CryptoFaq — Web3-terminal query ledger FAQ for a crypto / DeFi landing
 * page. An asymmetric 5/7 split: left column holds a sticky left-aligned
 * heading + description with a mono "[ QUERY ] INDEX" meta line and a ghost
 * "?" watermark; right column is a hairline-divided ledger of
 * detail/summary rows — each question prefixed by a mono zero-padded index
 * numeral with a plus icon that rotates on open, answers indented under the
 * numeral column. No card chrome, no rounding. Use for common questions
 * about protocols, pricing, security, or onboarding.
 */
export const CryptoFaq = defineCapsule({
  name: 'CryptoFaq',
  description:
    'Web3-terminal query ledger FAQ for a crypto / DeFi landing page: asymmetric 5/7 split with a sticky left-aligned heading + mono meta line and ghost "?" watermark, and a hairline-divided ledger of detail/summary rows on the right — each question prefixed by a mono zero-padded index numeral with a rotating plus icon, answers indented beneath. Use for common questions about protocols, pricing, security, or onboarding.',
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
    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ?? 'Common questions about building on NexusChain.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is the average transaction fee on NexusChain?',
            answer:
              'The average transaction fee on NexusChain mainnet is $0.002, with peak congestion rarely exceeding $0.01. This is achieved through our optimistic rollup architecture and efficient data compression. Developers can also implement meta-transactions where users pay fees in stablecoins instead of NEX tokens.',
          },
          {
            question: 'How long does mainnet deployment take?',
            answer:
              'Most protocols complete their first deployment within 15 minutes of connecting their wallet. Our pre-audited contract templates can be deployed instantly, while custom contracts require approximately 2-3 minutes for compilation, verification, and indexing. Full documentation and video tutorials are available in our developer portal.',
          },
          {
            question: 'What chains does the bridge support?',
            answer:
              "NexusChain's native bridge currently supports Ethereum, Solana, Arbitrum, Optimism, Base, Polygon PoS, Polygon zkEVM, Avalanche C-Chain, BNB Chain, Cosmos Hub, Osmosis, Stargaze, and 8 additional IBC-enabled chains. New chains are added quarterly based on developer demand. The bridge has processed $890M in volume with zero security incidents.",
          },
          {
            question: 'How do I become a validator?',
            answer:
              'The current validator set of 156 nodes is permissioned while we optimize network stability. Permissionless validator entry is scheduled for Q2 2025, requiring 50,000 NEX tokens staked as collateral. Interested operators can join our validator waitlist now to receive hardware requirements and early access to testnet validation.',
          },
          {
            question: 'Is NexusChain audited and secure?',
            answer:
              'NexusChain has completed 4 comprehensive audits by OpenZeppelin, Trail of Bits, Spearbit, and Certik. Our bridge contracts use a multi-sig threshold scheme with 8 independent signers. We maintain a $10M bug bounty program through Immunefi and have never had a critical vulnerability exploited in production since mainnet launch in January 2024.',
          },
          {
            question: 'What APIs and SDKs are available?',
            answer:
              'We provide TypeScript and Python SDKs with full type definitions, React hooks for wallet connection and contract interaction, and a GraphQL API for real-time indexed data. Enterprise customers also get access to dedicated RPC endpoints with 99.99% SLA and priority support. All documentation includes copy-paste code examples for common use cases.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-28',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="relative lg:col-span-5">
              <Watermark className="-top-8 right-0 font-mono text-[8rem] sm:text-[12rem]">
                ?
              </Watermark>
              <div className="relative lg:sticky lg:top-24">
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                  subtitleClassName="text-lg"
                />
                <p
                  aria-hidden="true"
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
                >
                  [ query ] index / 0{items.length}
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion variant="divided">
                {items.map((item, i) => (
                  <FaqItem key={item.question} variant="divided">
                    <FaqQuestion className="items-baseline gap-4 py-1 pr-1">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
                      >
                        0{i + 1}
                      </span>
                      <span className="flex-1 text-base font-semibold tracking-tight">
                        {item.question}
                      </span>
                      <FaqQuestionIcon
                        variant="plus"
                        className="self-center text-muted-foreground"
                      />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="pb-1 pl-9 pr-10 pt-4 text-sm leading-relaxed"
                    >
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
