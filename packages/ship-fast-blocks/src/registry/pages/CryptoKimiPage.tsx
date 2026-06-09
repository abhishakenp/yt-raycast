import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CryptoKimiPage — a complete, self-contained crypto / DeFi-infrastructure
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "NexusChain" design: a clean,
 * institutional fintech aesthetic on a light canvas with a high-contrast
 * foreground brand mark, a glassy sticky navbar, and emerald-style "live"
 * accents mapped to the primary token. It pairs a split hero (mainnet-live
 * pill + bold headline + audit trust chips + a live NEX token price card with a
 * mini bar chart) with a trusted-by logo strip, a 6-up feature grid, a 3-step
 * "deploy in minutes" flow, an inverted dark network-statistics band (KPI
 * counters + 24h volume chart + network-health panel), a vertical phased
 * roadmap timeline with completed/in-progress/planned status chips, a 6-up
 * testimonials grid, an accordion FAQ, an inverted dark final CTA, and a rich
 * multi-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Dark bands
 * (stats / CTA / footer) invert via foreground/background tokens to preserve
 * Kimi's mood. Every nav item / CTA / link / form-submit routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component; avatars/logos stay decorative. Rich defaults make it
 * render great with no props at all.
 */
export const CryptoKimiPage = defineComponent({
  name: "CryptoKimiPage",
  description:
    "Complete crypto / DeFi / blockchain INFRASTRUCTURE landing page with a clean institutional-fintech aesthetic: light canvas, glassy sticky navbar, high-contrast brand mark, and live emerald-style accents. Includes a split hero (mainnet-live status pill, bold headline, audit/TVL trust chips, dual CTAs, and a live token price card with mini bar chart), a trusted-by protocol logo strip, a 6-up feature grid (high-speed settlement, cross-chain bridge, institutional custody, smart-contract security, real-time analytics, DAO governance), a 3-step deploy flow, an inverted dark network-statistics band (TVL / transactions / validators / fee KPIs plus a 24h volume chart and network-health panel), a vertical phased development-roadmap timeline with completed/in-progress/planned status chips and quarters, a 6-up customer testimonials grid with avatars, an accordion FAQ, an inverted dark final call-to-action, and a multi-column footer with social and legal links. Use as the ROOT/home page for crypto protocols, layer-1/layer-2 chains, DeFi platforms, cross-chain bridges, Web3 infrastructure, staking/validator networks, token projects, or institutional digital-asset products when a credible, data-rich, conversion-focused page is wanted. Supply content only — brand, nav, hero, logos, features, steps, networkStats, roadmap, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / protocol name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content, including the live token price card. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust chips beneath the hero CTAs (audits, TVL, etc). */
        trust: z.array(z.string()).optional(),
        /** Live token price card. */
        token: z
          .object({
            name: z.string(),
            kind: z.string(),
            change: z.string(),
            price: z.string(),
            marketCap: z.string(),
            imageAlt: z.string(),
            volume: z.string(),
            supply: z.string(),
          })
          .optional(),
      })
      .optional(),
    /** Trusted-by protocol/institution logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature / capabilities grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Deploy in minutes" 3-step flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Inverted dark network-statistics band. */
    networkStats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        kpis: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        volumeLabel: z.string().optional(),
        volumeChange: z.string().optional(),
        volumeUpdated: z.string().optional(),
        healthLabel: z.string().optional(),
        healthStatus: z.string().optional(),
        health: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    /** Vertical phased development-roadmap timeline. */
    roadmap: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              status: z.enum(["Completed", "In Progress", "Planned"]),
              quarter: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Customer testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
              quote: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Inverted dark final call-to-action. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "NexusChain"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Network", "Roadmap", "Partners"]

    const heroBadge = props.hero?.badge ?? "Mainnet Live • v2.4 Released"
    const heroHeading =
      props.hero?.heading ?? "The infrastructure layer for decentralized finance"
    const heroSub =
      props.hero?.subheading ??
      "NexusChain provides enterprise-grade infrastructure for DeFi protocols, cross-chain bridges, and institutional tokenization. Process 50,000+ TPS with sub-second finality."
    const heroPrimary = props.hero?.primaryCta ?? "Start Building"
    const heroSecondary = props.hero?.secondaryCta ?? "View Documentation"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Audited by OpenZeppelin", "$2.4B TVL Secured"]
    const token = props.hero?.token ?? {
      name: "NEX Token",
      kind: "Utility & Governance",
      change: "+12.4%",
      price: "$4.28",
      marketCap: "$856M",
      imageAlt:
        "Abstract data visualization showing upward trending financial chart with gradient glow",
      volume: "24h Volume: $48.2M",
      supply: "Circulating: 200M NEX",
    }

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading protocols and institutions"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Aave", "Compound", "Uniswap", "Chainlink", "Polygon", "Arbitrum"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to scale"
    const featuresDesc =
      props.features?.description ??
      "From settlement layers to cross-chain messaging, NexusChain provides modular infrastructure for every DeFi use case."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "High-Speed Settlement",
            description:
              "50,000+ TPS with 400ms finality. Optimistic rollup architecture with ZK-proof verification for maximum throughput.",
          },
          {
            title: "Cross-Chain Bridge",
            description:
              "Native bridging to Ethereum, Solana, Cosmos, and 15+ chains. $2.4B secured with zero exploit history since 2022.",
          },
          {
            title: "Institutional Custody",
            description:
              "MPC-based key management with hardware security modules. SOC 2 Type II certified and regulated in 12 jurisdictions.",
          },
          {
            title: "Smart Contract Security",
            description:
              "Formal verification toolkit and automated auditing. Over 340 protocols secured with $890M in vulnerability prevention.",
          },
          {
            title: "Real-Time Analytics",
            description:
              "Sub-second indexing of on-chain data. Custom dashboards for TVL, volume, MEV metrics, and protocol health monitoring.",
          },
          {
            title: "DAO Governance",
            description:
              "On-chain voting with delegation and quadratic mechanisms. 47,000+ active voters governing protocol upgrades and treasury.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Deploy in minutes, not months"
    const stepsDesc =
      props.steps?.description ??
      "From first connection to production deployment, our developer experience is designed for speed."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect Wallet",
            description:
              "Integrate with MetaMask, WalletConnect, or 40+ supported wallets. One-line SDK initialization with automatic network detection.",
          },
          {
            title: "Configure Contracts",
            description:
              "Deploy pre-audited contract templates or upload your own. Automatic verification on Etherscan, Sourcify, and 8+ explorers.",
          },
          {
            title: "Go Live",
            description:
              "Instant mainnet deployment with automatic monitoring. Real-time alerts, gas optimization, and 99.99% uptime SLA.",
          },
        ]

    const networkHeading = props.networkStats?.heading ?? "Network Statistics"
    const networkDesc =
      props.networkStats?.description ??
      "Live data from the NexusChain mainnet and bridge infrastructure."
    const networkKpis = props.networkStats?.kpis?.length
      ? props.networkStats.kpis
      : [
          { value: "$2.4B", label: "Total Value Locked" },
          { value: "847K", label: "Daily Transactions" },
          { value: "156", label: "Validators Active" },
          { value: "$0.002", label: "Avg. Transaction Fee" },
        ]
    const volumeLabel =
      props.networkStats?.volumeLabel ?? "Transaction Volume (24h)"
    const volumeChange = props.networkStats?.volumeChange ?? "+8.3%"
    const volumeUpdated =
      props.networkStats?.volumeUpdated ?? "Updated: 2 minutes ago"
    const healthLabel = props.networkStats?.healthLabel ?? "Network Health"
    const healthStatus = props.networkStats?.healthStatus ?? "Operational"
    const healthItems = props.networkStats?.health?.length
      ? props.networkStats.health
      : [
          { label: "Block Time", value: "2.1s avg" },
          { label: "Finality", value: "~400ms" },
          { label: "Uptime (30d)", value: "99.97%" },
          { label: "Active Validators", value: "156 / 156" },
        ]

    const roadmapHeading = props.roadmap?.heading ?? "Development Roadmap"
    const roadmapDesc =
      props.roadmap?.description ??
      "Our phased approach to building the infrastructure layer for the next generation of DeFi."
    const roadmapItems = props.roadmap?.items?.length
      ? props.roadmap.items
      : [
          {
            status: "Completed" as const,
            quarter: "Q1 2024",
            title: "Mainnet Launch v1.0",
            description:
              "Genesis block production began January 15, 2024. Initial validator set of 64 nodes with 100,000 TPS capacity. Bridge contracts deployed to Ethereum, Solana, and Arbitrum.",
          },
          {
            status: "Completed" as const,
            quarter: "Q2 2024",
            title: "NEX Token Launch",
            description:
              "Public sale completed April 8, 2024. $42M raised from 12,400 participants. Token listed on Binance, Coinbase, and Kraken. Staking rewards activated with 12% APY.",
          },
          {
            status: "Completed" as const,
            quarter: "Q3 2024",
            title: "Institutional Custody Partnership",
            description:
              "Strategic partnership with Fireblocks and Anchorage Digital. $890M in institutional assets onboarded. SOC 2 Type II certification achieved.",
          },
          {
            status: "In Progress" as const,
            quarter: "Q4 2024",
            title: "ZK-Rollup Integration",
            description:
              "Zero-knowledge proof verification for cross-chain transactions. Testing with 47 protocols. Expected 10x reduction in bridge confirmation times.",
          },
          {
            status: "Planned" as const,
            quarter: "Q1 2025",
            title: "Enterprise SDK Release",
            description:
              "Complete TypeScript and Python SDKs with white-label wallet components. Fiat on/off-ramp integrations with Stripe and Circle.",
          },
          {
            status: "Planned" as const,
            quarter: "Q2 2025",
            title: "Validator Expansion",
            description:
              "Validator set expansion to 500 nodes with permissionless entry. Expected throughput increase to 100,000 TPS.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by DeFi leaders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Protocols and institutions building on NexusChain infrastructure."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Marcus Chen",
            role: "CTO, Vertex Finance",
            avatarAlt:
              "Professional headshot of Marcus Chen, a fintech CTO with glasses and short black hair",
            quote:
              "NexusChain cut our settlement costs by 80%. We process $200M daily volume and haven't had a single failed transaction in 6 months.",
          },
          {
            name: "Sarah Williams",
            role: "Product Director, BlockVault",
            avatarAlt:
              "Professional headshot of Sarah Williams, a product director with blonde hair wearing professional attire",
            quote:
              "The cross-chain bridge saved us months of engineering. Integration took 3 days, and our users love the instant finality.",
          },
          {
            name: "David Park",
            role: "Lead Architect, StakeStream",
            avatarAlt:
              "Professional headshot of David Park, a blockchain architect with beard and dark hair",
            quote:
              "We've deployed 14 protocols on NexusChain. The developer tooling is the best in the industry—comprehensive docs and responsive support.",
          },
          {
            name: "James Rodriguez",
            role: "Founder, YieldMatrix",
            avatarAlt:
              "Professional headshot of James Rodriguez, a DeFi founder with short brown hair and warm smile",
            quote:
              "The security audits and formal verification tools gave our institutional clients the confidence they needed. TVL grew 400% in Q2.",
          },
          {
            name: "Elena Vasquez",
            role: "Managing Partner, Digital Assets Fund",
            avatarAlt:
              "Professional headshot of Elena Vasquez, a crypto fund manager with dark curly hair and confident expression",
            quote:
              "We custody $180M through NexusChain's MPC infrastructure. The institutional-grade security and compliance tools are unmatched.",
          },
          {
            name: "Michael Foster",
            role: "Protocol Engineer, ChainWeave",
            avatarAlt:
              "Professional headshot of Michael Foster, a protocol engineer with light hair and friendly smile",
            quote:
              "The real-time analytics dashboard caught a potential MEV attack before it happened. That alone paid for our infrastructure costs.",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? "Common questions about building on NexusChain."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
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

    const ctaHeading =
      props.cta?.heading ?? "Start building on NexusChain today"
    const ctaDesc =
      props.cta?.description ??
      "Join 340+ protocols processing $2.4B in daily volume. Deploy your first contract in minutes with our comprehensive developer tools."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started"
    const ctaSecondary = props.cta?.secondaryCta ?? "Contact Sales"
    const ctaTrust = props.cta?.trust?.length
      ? props.cta.trust
      : [
          "Free testnet access",
          "No credit card required",
          "Enterprise support available",
        ]

    const footerDesc =
      props.footer?.description ??
      "Enterprise-grade infrastructure for DeFi protocols, cross-chain bridges, and institutional tokenization."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Product",
            links: ["Infrastructure", "Bridge", "Analytics", "SDK", "Pricing"],
          },
          {
            heading: "Developers",
            links: [
              "Documentation",
              "API Reference",
              "GitHub",
              "Status",
              "Bug Bounty",
            ],
          },
          {
            heading: "Company",
            links: ["About", "Careers", "Blog", "Press", "Contact"],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Foundation. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Brand bolt mark — decorative brand asset.
    const BoltIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // bolt — settlement
      <svg
        key="bolt"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      // swap — bridge
      <svg
        key="swap"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>,
      // lock — custody
      <svg
        key="lock"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>,
      // shield — security
      <svg
        key="shield"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>,
      // chart — analytics
      <svg
        key="chart"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>,
      // users — governance
      <svg
        key="users"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>,
    ]

    // Hero token-card mini bar chart heights (decorative data viz).
    const heroBars = [40, 55, 45, 70, 60, 85, 100]
    // Network volume chart heights.
    const volumeBars = [45, 60, 55, 70, 65, 80, 75, 90, 100]

    // Status chip + timeline-node styling per roadmap status.
    const statusStyle = (status: "Completed" | "In Progress" | "Planned") => {
      if (status === "Completed")
        return {
          node: "bg-primary/15 text-primary",
          line: "bg-primary/30",
          chip: "text-primary bg-primary/10",
          showCheck: true,
        }
      if (status === "In Progress")
        return {
          node: "bg-accent text-accent-foreground",
          line: "bg-border",
          chip: "text-accent-foreground bg-accent",
          showCheck: false,
        }
      return {
        node: "bg-muted text-muted-foreground",
        line: "bg-border",
        chip: "text-muted-foreground bg-muted",
        showCheck: false,
      }
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                  <BoltIcon className="size-5" />
                </span>
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Documentation
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Launch App
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live token price card */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-muted to-muted/40"
                  />
                  <div className="relative rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-foreground to-foreground/70 text-background">
                          <svg
                            className="size-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold">{token.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {token.kind}
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {token.change}
                      </span>
                    </div>
                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted p-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Price
                        </p>
                        <p className="text-xl font-semibold">{token.price}</p>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Market Cap
                        </p>
                        <p className="text-xl font-semibold">
                          {token.marketCap}
                        </p>
                      </div>
                    </div>
                    <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
                      <Image
                        alt={token.imageAlt}
                        w={800}
                        h={300}
                        loading="lazy"
                        className="size-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex items-end p-4">
                        <div className="flex h-20 items-end gap-1">
                          {heroBars.map((h, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-3 rounded-t",
                                i === heroBars.length - 1
                                  ? "bg-foreground"
                                  : "bg-muted-foreground/60",
                              )}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{token.volume}</span>
                      <span>{token.supply}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-6 text-card-foreground transition-colors hover:border-border/60"
                  >
                    <div className="mb-4 grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="border-y border-border bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-xl bg-foreground text-lg font-semibold text-background">
                        {i + 1}
                      </div>
                      {i < stepItems.length - 1 && (
                        <div className="hidden h-px flex-1 bg-border md:block" />
                      )}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Network statistics — inverted dark band */}
          <section className="bg-foreground py-20 text-background lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {networkHeading}
                </h2>
                <p className="text-lg text-background/60">{networkDesc}</p>
              </div>
              <div className="mb-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
                {networkKpis.map((kpi) => (
                  <div key={kpi.label} className="text-center">
                    <p className="mb-2 text-4xl font-semibold lg:text-5xl">
                      {kpi.value}
                    </p>
                    <p className="text-sm text-background/60">{kpi.label}</p>
                  </div>
                ))}
              </div>
              <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-background/20 bg-background/10 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-medium text-background/90">
                      {volumeLabel}
                    </h4>
                    <span className="text-sm text-primary">{volumeChange}</span>
                  </div>
                  <div className="flex h-24 items-end gap-2">
                    {volumeBars.map((h, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-t",
                          i === volumeBars.length - 1
                            ? "bg-primary/80"
                            : "bg-background/40",
                        )}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-background/50">
                    {volumeUpdated}
                  </p>
                </div>
                <div className="rounded-xl border border-background/20 bg-background/10 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-medium text-background/90">
                      {healthLabel}
                    </h4>
                    <span className="flex items-center gap-2 text-sm text-primary">
                      <span className="size-2 animate-pulse rounded-full bg-primary" />
                      {healthStatus}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {healthItems.map((h) => (
                      <div
                        key={h.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-background/60">{h.label}</span>
                        <span className="text-background">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {roadmapHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{roadmapDesc}</p>
              </div>
              <div className="mx-auto max-w-4xl space-y-8">
                {roadmapItems.map((item, i) => {
                  const s = statusStyle(item.status)
                  const isLast = i === roadmapItems.length - 1
                  return (
                    <div key={item.title} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "grid size-10 place-items-center rounded-full",
                            s.node,
                          )}
                        >
                          {s.showCheck ? (
                            <Check className="size-5" />
                          ) : (
                            <span className="text-sm font-medium">
                              {item.quarter.split(" ")[0]}
                            </span>
                          )}
                        </div>
                        {!isLast && (
                          <div className={cn("mt-2 h-full w-px", s.line)} />
                        )}
                      </div>
                      <div className={cn("flex-1", !isLast && "pb-8")}>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-2 py-1 text-sm font-medium",
                              s.chip,
                            )}
                          >
                            {item.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.quarter}
                          </span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">
                          {item.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="border-y border-border bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-muted p-6"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
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

          {/* Final CTA — inverted dark band */}
          <section className="bg-foreground py-20 text-background lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/60">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-lg bg-background px-8 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-lg border border-background/40 px-8 py-3 font-medium text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-background/50">
                {ctaTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle className="size-4" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer — inverted dark band */}
        <footer className="border-t border-border bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-background text-foreground">
                    <BoltIcon className="size-5" />
                  </span>
                  <span className="text-xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-background/60">
                  {footerDesc}
                </p>
                <div className="flex items-center gap-4">
                  {(["Twitter", "GitHub", "LinkedIn", "Discord"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-8 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-background/20 hover:text-background"
                      >
                        <span className="text-xs font-bold">
                          {social.charAt(0)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.heading}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerNote}</p>
              <div className="flex items-center gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-background/50 transition-colors hover:text-background"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
