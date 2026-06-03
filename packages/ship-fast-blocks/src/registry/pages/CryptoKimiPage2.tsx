import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CryptoKimiPage2 — VARIANT 2 of the crypto / Layer-2 / Web3 landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "NexusChain" design — a bold,
 * dark, glow-heavy DeFi aesthetic that is intentionally DISTINCT from the clean,
 * light, institutional sibling (CryptoKimiPage). It runs on an inverted dark
 * canvas (background mapped to the dark surface), a violet→amber gradient brand
 * mood (primary + accent tokens), blurred radial glows, animated float, and
 * "live mainnet" emerald-style accents. Layout differs from variant 1: a split
 * neon hero with a floating live token-price card + SVG line chart, a 4-up KPI
 * stats band, a 6-up feature grid, a 3-step start flow, a split token-economics
 * panel with a glowing NXC medallion + utility list, a CENTERED ALTERNATING
 * vertical roadmap timeline with status pills, a 6-up platform-preview image
 * gallery with hover captions, a 3-tier pricing table with a highlighted
 * "Most Popular" plan, star-rated testimonials, an accordion FAQ, a gradient
 * glow CTA card, and a 5-column footer with social icons.
 */
export const CryptoKimiPage2 = defineComponent({
  name: "CryptoKimiPage2",
  description:
    "SECOND / alternative crypto, DeFi & Web3 blockchain landing page — a bold, dark, neon glow aesthetic (violet→amber gradient brand, animated floating live token card, radial glows, 'mainnet live' emerald accents) that is a visually DISTINCT sibling to the clean light-canvas CryptoKimiPage. Use this variant when a Layer 2 / Layer 1 chain, DeFi protocol, token project, staking network, NFT/DEX platform or Web3 infrastructure product wants a vibrant high-energy DARK look rather than the institutional fintech style. Sections: split neon hero with status pill, gradient headline, dual CTAs, developer trust avatars and a floating live NXC token price card with a sparkline chart and market-cap/volume/holders stats; trusted-by protocol logo strip; a 4-up live network-stats band (TVL, active wallets, 24h transactions, avg fee); a 6-up feature grid (lightning fast, bank-grade security, EVM compatible, native bridging, carbon neutral, smart-contract suite); a 3-step get-started flow; a split token-economics panel with a glowing NXC medallion, supply/market-cap/APY table and a 4-item utility list; a CENTERED ALTERNATING vertical development-roadmap timeline with completed/live/upcoming status chips, quarters and tag pills; a 6-up platform-preview image gallery with hover captions (DeFi dashboard, network explorer, mobile wallet, developer studio, NFT marketplace, DEX trading); a 3-tier pricing table (Starter free, Developer $49 most-popular, Enterprise custom) with feature checklists; star-rated customer testimonials with avatars; an accordion FAQ; a violet gradient glow final CTA card; and a 5-column footer with social icons and legal links. Supply content only — brand, nav, hero, logos, stats, features, steps, token, roadmap, gallery, pricing, testimonials, faq, cta, footer; the block owns all layout, depth and styling and renders fully on defaults.",
  props: z.object({
    /** Brand / protocol name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Neon split hero with the floating live token price card. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        headingTail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.string().optional(),
        avatars: z.array(z.string()).optional(),
        token: z
          .object({
            symbol: z.string(),
            name: z.string(),
            pair: z.string(),
            price: z.string(),
            change: z.string(),
            marketCap: z.string(),
            volume: z.string(),
            holders: z.string(),
          })
          .optional(),
      })
      .optional(),
    /** Trusted-by Web3 protocol logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Live network statistics band (4 KPI cards). */
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              delta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Feature / capabilities grid. */
    features: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Start building in minutes" 3-step flow. */
    steps: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Token economics — glowing medallion + supply table + utility list. */
    token: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        symbol: z.string().optional(),
        facts: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        utilities: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Centered alternating vertical roadmap timeline. */
    roadmap: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              status: z.enum(["Completed", "Live", "Upcoming"]),
              quarter: z.string(),
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Platform-preview image gallery with hover captions. */
    gallery: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 3-tier pricing table. */
    pricing: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Star-rated testimonials. */
    testimonials: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Gradient glow final call-to-action card. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** 5-column footer. */
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
      : ["Features", "Token", "Roadmap", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Mainnet Live — $2.4B TVL"
    const headingLead = props.hero?.headingLead ?? "The Future of"
    const headingHighlight = props.hero?.headingHighlight ?? "Decentralized"
    const headingTail = props.hero?.headingTail ?? "Finance"
    const heroSub =
      props.hero?.subheading ??
      "NexusChain is a high-performance Layer 2 blockchain delivering sub-second finality, 100,000+ TPS, and 99% lower fees than Ethereum mainnet."
    const heroPrimary = props.hero?.primaryCta ?? "Launch App"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroTrust = props.hero?.trust ?? "Trusted by 50,000+ developers"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "professional headshot of a smiling male developer with short hair",
          "professional headshot of a smiling female engineer with long brown hair",
          "professional headshot of a male product manager with beard and glasses",
        ]
    const token = props.hero?.token ?? {
      symbol: "NXC",
      name: "Nexus Token",
      pair: "NXC / USD",
      price: "$4.28",
      change: "+12.5%",
      marketCap: "$4.2B",
      volume: "$892M",
      holders: "125K+",
    }

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading Web3 projects"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Aave", "Uniswap", "Chainlink", "Compound", "MakerDAO", "Curve"]

    const statsHeading = props.stats?.heading ?? "Live Network Stats"
    const statsDesc =
      props.stats?.description ?? "Real-time metrics from the NexusChain mainnet"
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          {
            value: "$2.4B",
            label: "Total Value Locked",
            delta: "+18.2% this month",
          },
          {
            value: "142K",
            label: "Active Wallets",
            delta: "+5,234 this week",
          },
          {
            value: "2.1M",
            label: "Transactions (24h)",
            delta: "+24.8% vs yesterday",
          },
          {
            value: "$0.001",
            label: "Avg. Transaction Fee",
            delta: "99% cheaper than ETH",
          },
        ]

    const featuresBadge = props.features?.badge ?? "Platform Features"
    const featuresHeading = props.features?.heading ?? "Why Choose NexusChain"
    const featuresDesc =
      props.features?.description ??
      "Built for scale, security, and seamless user experience"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Lightning Fast",
            description:
              "Sub-second finality with 100,000+ TPS. Experience instant transactions without waiting for block confirmations.",
          },
          {
            title: "Bank-Grade Security",
            description:
              "Multi-layered security with formal verification, audited smart contracts, and $50M insurance coverage.",
          },
          {
            title: "EVM Compatible",
            description:
              "Deploy your Ethereum dApps without code changes. Full Solidity support with familiar developer tooling.",
          },
          {
            title: "Native Bridging",
            description:
              "Seamless asset transfers between Ethereum, Polygon, Arbitrum, and 15+ chains in under 5 minutes.",
          },
          {
            title: "Carbon Neutral",
            description:
              "Proof-of-Stake consensus with 99.95% lower energy usage. Fully offset carbon footprint via verified credits.",
          },
          {
            title: "Smart Contract Suite",
            description:
              "Pre-built contracts for tokens, NFTs, DAOs, and DeFi protocols. Deploy in minutes, not weeks.",
          },
        ]

    const stepsBadge = props.steps?.badge ?? "Get Started"
    const stepsHeading = props.steps?.heading ?? "Start Building in Minutes"
    const stepsDesc =
      props.steps?.description ??
      "From wallet setup to deployed dApp in three simple steps"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect Your Wallet",
            description:
              "Download MetaMask, Coinbase Wallet, or WalletConnect. Add NexusChain network with one click.",
          },
          {
            title: "Get Test Tokens",
            description:
              "Visit our faucet to receive free testnet NXC tokens. Or bridge assets from Ethereum mainnet instantly.",
          },
          {
            title: "Deploy & Earn",
            description:
              "Use our developer SDK to deploy contracts. Stake NXC to earn 12.5% APY and governance rights.",
          },
        ]

    const tokenBadge = props.token?.badge ?? "Token Economics"
    const tokenHeading = props.token?.heading ?? "NXC Token Utility"
    const tokenDesc =
      props.token?.description ??
      "NXC powers the entire NexusChain ecosystem. Use it for transaction fees, staking rewards, governance voting, and accessing premium developer features."
    const tokenSymbol = props.token?.symbol ?? "NXC"
    const tokenFacts = props.token?.facts?.length
      ? props.token.facts
      : [
          { label: "Token Standard", value: "ERC-20 / NRC-20" },
          { label: "Total Supply", value: "1,000,000,000 NXC" },
          { label: "Circulating Supply", value: "685,420,000 NXC" },
          { label: "Market Cap", value: "$4.28B" },
          { label: "Staking APY", value: "12.5%" },
        ]
    const tokenUtilities = props.token?.utilities?.length
      ? props.token.utilities
      : [
          {
            title: "Transaction Fee Discounts",
            description:
              "Pay fees in NXC for 50% discount. Average cost: $0.001 per transaction.",
          },
          {
            title: "Governance Rights",
            description:
              "Vote on protocol upgrades, fee structures, and treasury allocations.",
          },
          {
            title: "Staking Rewards",
            description:
              "Stake NXC to secure the network and earn 12.5% APY in real-time rewards.",
          },
          {
            title: "Developer Credits",
            description:
              "Use NXC to pay for RPC calls, storage, and premium API features.",
          },
        ]

    const roadmapBadge = props.roadmap?.badge ?? "Our Journey"
    const roadmapHeading = props.roadmap?.heading ?? "Roadmap"
    const roadmapDesc =
      props.roadmap?.description ??
      "Building the infrastructure for Web3's next billion users"
    const roadmapItems = props.roadmap?.items?.length
      ? props.roadmap.items
      : [
          {
            status: "Completed" as const,
            quarter: "Completed Q4 2023",
            title: "Mainnet Launch",
            description:
              "Genesis block produced December 15, 2023. Initial validator set of 21 nodes deployed globally.",
            tags: ["EVM Compatible", "10K TPS"],
          },
          {
            status: "Completed" as const,
            quarter: "Completed Q1 2024",
            title: "Bridge Expansion",
            description:
              "Native bridges to Ethereum, Polygon, Arbitrum, and Optimism. $500M+ bridged volume in first month.",
            tags: ["4 Chains", "5 Min Finality"],
          },
          {
            status: "Live" as const,
            quarter: "Live Q2 2024",
            title: "Performance Upgrade",
            description:
              "Sharding implementation achieves 100,000+ TPS. Sub-second finality for all transactions.",
            tags: ["100K TPS", "Sub-Second"],
          },
          {
            status: "Upcoming" as const,
            quarter: "Upcoming Q3 2024",
            title: "ZK-Rollup Integration",
            description:
              "Zero-knowledge proof integration for enhanced privacy and 10x scalability improvement.",
            tags: ["Privacy", "1M TPS Target"],
          },
          {
            status: "Upcoming" as const,
            quarter: "Upcoming Q4 2024",
            title: "Mobile SDK & Wallet",
            description:
              "Native iOS and Android SDKs. Biometric-secure mobile wallet with social recovery.",
            tags: ["iOS", "Android", "Biometric"],
          },
          {
            status: "Upcoming" as const,
            quarter: "2025 Vision",
            title: "Decentralized Identity",
            description:
              "Self-sovereign identity protocol with verifiable credentials and reputation system.",
            tags: ["DID", "Verifiable"],
          },
        ]

    const galleryBadge = props.gallery?.badge ?? "Platform Preview"
    const galleryHeading = props.gallery?.heading ?? "Explore the Ecosystem"
    const galleryDesc =
      props.gallery?.description ??
      "Powerful tools for developers and seamless experience for users"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "DeFi Dashboard",
            caption: "Portfolio tracking and yield farming interface",
            imageAlt:
              "Dark themed cryptocurrency dashboard interface with charts and wallet balance display",
          },
          {
            title: "Network Explorer",
            caption: "Real-time blockchain analytics and monitoring",
            imageAlt:
              "Abstract 3D visualization of interconnected blockchain network nodes",
          },
          {
            title: "Mobile Wallet",
            caption: "iOS and Android native applications",
            imageAlt:
              "Modern web3 mobile app interface showing crypto wallet on smartphone",
          },
          {
            title: "Developer Studio",
            caption: "IDE with debugging and deployment tools",
            imageAlt:
              "Code editor showing smart contract development with syntax highlighting",
          },
          {
            title: "NFT Marketplace",
            caption: "Mint, trade, and collect digital assets",
            imageAlt:
              "NFT marketplace interface displaying digital art collectibles grid",
          },
          {
            title: "DEX Trading",
            caption: "Decentralized exchange with AMM pools",
            imageAlt:
              "Decentralized exchange trading interface with price charts and order book",
          },
        ]

    const pricingBadge = props.pricing?.badge ?? "Pricing"
    const pricingHeading = props.pricing?.heading ?? "Choose Your Plan"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for learning and small projects",
            price: "Free",
            period: "/month",
            features: [
              "100,000 RPC calls/month",
              "Testnet access",
              "Community support",
              "Basic analytics",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "Developer",
            tagline: "For serious builders and production dApps",
            price: "$49",
            period: "/month",
            features: [
              "5,000,000 RPC calls/month",
              "Mainnet + Testnet access",
              "Priority email support",
              "Advanced analytics & alerts",
              "Custom webhooks",
              "IPFS storage (10GB)",
            ],
            cta: "Start Building",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "Dedicated infrastructure for large scale",
            price: "Custom",
            period: "",
            features: [
              "Unlimited RPC calls",
              "Dedicated validator nodes",
              "24/7 phone & email support",
              "SLA guarantee (99.99%)",
              "Custom integrations",
              "IPFS storage (unlimited)",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const testimonialsBadge = props.testimonials?.badge ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Developers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what teams are building on NexusChain"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We migrated our DeFi protocol from Ethereum to NexusChain and reduced our gas costs by 98%. The sub-second finality is a game-changer for our users.",
            name: "Marcus Chen",
            role: "CEO, LiquidVault Finance",
            avatarAlt:
              "professional headshot of a smiling male CEO in his 40s with short hair",
          },
          {
            quote:
              "The developer experience is incredible. We went from idea to mainnet deployment in under 2 weeks. The documentation and SDK are best-in-class.",
            name: "Sarah Mitchell",
            role: "CTO, NFTLaunch Labs",
            avatarAlt:
              "professional headshot of a smiling female CTO with blonde hair",
          },
          {
            quote:
              "We've processed over 50M transactions with zero downtime. The reliability and performance have exceeded our expectations for enterprise workloads.",
            name: "David Park",
            role: "Lead Architect, ChainScale",
            avatarAlt:
              "professional headshot of a male blockchain architect with dark hair and glasses",
          },
        ]

    const faqBadge = props.faq?.badge ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about NexusChain"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How is NexusChain different from Ethereum?",
            answer:
              "NexusChain is a Layer 2 solution built on top of Ethereum that offers 100,000+ TPS (compared to Ethereum's 15-30 TPS), sub-second finality, and transaction costs under $0.001. We maintain full EVM compatibility while providing massive scalability improvements through our sharded architecture.",
          },
          {
            question: "How do I bridge assets to NexusChain?",
            answer:
              "Our native bridge supports transfers from Ethereum, Polygon, Arbitrum, Optimism, and 12 other chains. Simply connect your wallet, select the source chain and asset, enter the amount, and confirm. Transfers typically complete in 3-5 minutes with full security guarantees.",
          },
          {
            question: "What are the staking rewards?",
            answer:
              "Current staking APY is 12.5% for validators and 10.2% for delegators. Rewards are distributed every epoch (approximately 6 hours) and can be automatically compounded. The minimum stake is 1,000 NXC for delegators and 100,000 NXC for validator nodes.",
          },
          {
            question: "Is NexusChain secure? Has it been audited?",
            answer:
              "Yes, our core contracts have been audited by Trail of Bits, OpenZeppelin, and CertiK. We maintain a $50 million bug bounty program and insurance coverage through Nexus Mutual. The network has operated for 18 months with zero security incidents and 99.99% uptime.",
          },
          {
            question: "Can I build on NexusChain without blockchain experience?",
            answer:
              "Absolutely! We provide no-code tools for basic deployments, and our SDK abstracts away blockchain complexity for developers. If you know JavaScript/TypeScript, you can build on NexusChain. Our documentation includes tutorials for complete beginners to advanced architects.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Build the Future?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ developers building the next generation of Web3 applications on NexusChain. Start for free today."
    const ctaPrimary = props.cta?.primaryCta ?? "Launch App"
    const ctaSecondary = props.cta?.secondaryCta ?? "Read Documentation"
    const ctaNote =
      props.cta?.note ?? "No credit card required • Free tier forever"

    const footerDesc =
      props.footer?.description ??
      "The high-performance Layer 2 blockchain powering the next generation of decentralized applications."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Product",
            links: ["Features", "Developer SDK", "Pricing", "Status", "Changelog"],
          },
          {
            heading: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Tutorials",
              "GitHub",
              "Grant Program",
            ],
          },
          {
            heading: "Company",
            links: ["About", "Blog", "Careers", "Contact", "Press Kit"],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `${new Date().getFullYear()} ${brand} Labs. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Decorative brand bolt mark.
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

    const ArrowRight = ({ className }: { className?: string }) => (
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
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    )

    const ArrowUp = ({ className }: { className?: string }) => (
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
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    )

    const CheckMark = ({ className }: { className?: string }) => (
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
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg key="bolt" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="lock" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg key="users" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg key="bridge" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>,
      <svg key="leaf" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="doc" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
    ]

    const utilityIcons: ReactNode[] = [
      <svg key="coin" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="cog" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>,
      <svg key="bolt2" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="badge" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    // Status chip + node styling per roadmap status.
    const statusStyle = (status: "Completed" | "Live" | "Upcoming") => {
      if (status === "Completed")
        return {
          chip: "bg-primary/10 border-primary/20 text-primary",
          node: "bg-primary",
          pulse: false,
        }
      if (status === "Live")
        return {
          chip: "bg-accent/10 border-accent/20 text-accent",
          node: "bg-accent",
          pulse: true,
        }
      return {
        chip: "bg-muted border-border text-muted-foreground",
        node: "bg-muted-foreground",
        pulse: false,
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
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  <BoltIcon className="size-6" />
                </span>
                <span className="text-xl font-bold tracking-tight">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-20 pt-20 lg:pb-32 lg:pt-28">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/4 top-1/4 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-accent/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                    {headingLead}{" "}
                    <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                      {headingHighlight}
                    </span>{" "}
                    {headingTail}
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-8 py-4 font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex -space-x-2">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <span>{heroTrust}</span>
                  </div>
                </div>

                {/* Live token price card */}
                <div className="relative">
                  <div className="relative animate-[float_6s_ease-in-out_infinite]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-30 blur-2xl"
                    />
                    <div className="relative rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-2xl backdrop-blur-sm">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                            <span className="text-xl font-bold">{token.symbol}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{token.name}</h3>
                            <p className="text-sm text-muted-foreground">{token.pair}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{token.price}</p>
                          <p className="flex items-center justify-end gap-1 text-sm text-primary">
                            <ArrowUp className="size-4" />
                            {token.change}
                          </p>
                        </div>
                      </div>
                      <div className="relative mb-6 h-48 overflow-hidden rounded-xl bg-muted">
                        <svg className="absolute inset-0 size-full" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
                          <defs>
                            <linearGradient id="nxcChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className="text-primary" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
                            </linearGradient>
                          </defs>
                          <path d="M0,120 Q50,100 100,110 T200,80 T300,60 T400,40 L400,150 L0,150 Z" fill="url(#nxcChartGradient)" className="text-primary" />
                          <path d="M0,120 Q50,100 100,110 T200,80 T300,60 T400,40" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        </svg>
                        <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-muted-foreground">
                          <span>24H</span>
                          <span className="text-foreground">7D</span>
                          <span>1M</span>
                          <span>1Y</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Market Cap</p>
                          <p className="font-semibold">{token.marketCap}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Volume (24h)</p>
                          <p className="font-semibold">{token.volume}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Holders</p>
                          <p className="font-semibold">{token.holders}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-4 -top-4 grid size-20 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
                      <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center gap-2 font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="size-6 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {statsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {statsDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                {statItems.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-card p-6 text-center lg:p-8"
                  >
                    <p
                      className={cn(
                        "mb-2 text-4xl font-bold lg:text-5xl",
                        i % 2 === 0 ? "text-primary" : "text-accent",
                      )}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 flex items-center justify-center gap-1 text-sm text-primary">
                      <ArrowUp className="size-4" />
                      {stat.delta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted/30 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  {featuresBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 lg:p-8"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
                  {stepsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary to-transparent md:block"
                      />
                    )}
                    <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                      <div className="relative z-10 mb-6 grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Token economics */}
          <section className="bg-muted/30 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl"
                    />
                    <div className="relative rounded-3xl border border-border bg-card p-8 lg:p-10">
                      <div className="mb-8 flex items-center justify-center">
                        <div className="relative">
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 animate-pulse rounded-full bg-primary opacity-50 blur-xl"
                          />
                          <div className="relative grid size-32 place-items-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/50 text-4xl font-bold text-primary-foreground shadow-2xl">
                            {tokenSymbol}
                          </div>
                          <div className="absolute -right-2 -top-2 grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg">
                            <CheckMark className="size-5" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {tokenFacts.map((fact, i) => (
                          <div
                            key={fact.label}
                            className={cn(
                              "flex items-center justify-between py-3",
                              i < tokenFacts.length - 1 && "border-b border-border",
                            )}
                          >
                            <span className="text-muted-foreground">{fact.label}</span>
                            <span
                              className={cn(
                                "font-medium",
                                i === tokenFacts.length - 1 && "text-primary",
                              )}
                            >
                              {fact.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                    {tokenBadge}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {tokenHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {tokenDesc}
                  </p>
                  <div className="space-y-6">
                    {tokenUtilities.map((u, i) => (
                      <div key={u.title} className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          {utilityIcons[i % utilityIcons.length]}
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold">{u.title}</h4>
                          <p className="text-sm text-muted-foreground">{u.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Roadmap — centered alternating timeline */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
                  {roadmapBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {roadmapHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {roadmapDesc}
                </p>
              </div>
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary via-accent to-primary lg:block"
                />
                <div className="space-y-12 lg:space-y-0">
                  {roadmapItems.map((item, i) => {
                    const s = statusStyle(item.status)
                    const leftSide = i % 2 === 0
                    return (
                      <div
                        key={item.title}
                        className={cn(
                          "relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-16",
                          i > 0 && "lg:mt-12",
                        )}
                      >
                        <div
                          className={cn(
                            "mb-4 lg:mb-0",
                            leftSide
                              ? "lg:pr-12 lg:text-right"
                              : "lg:order-2 lg:pl-12",
                          )}
                        >
                          <div
                            className={cn(
                              "mb-2 inline-block rounded-full border px-3 py-1 text-xs font-medium",
                              s.chip,
                            )}
                          >
                            {item.quarter}
                          </div>
                          <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div
                          aria-hidden="true"
                          className="absolute left-1/2 hidden size-4 -translate-x-1/2 rounded-full border-4 border-background lg:flex"
                        >
                          <span
                            className={cn(
                              "size-full rounded-full",
                              s.node,
                              s.pulse && "animate-pulse",
                            )}
                          />
                        </div>
                        <div
                          className={cn(
                            leftSide
                              ? "lg:pl-12"
                              : "lg:order-1 lg:pr-12 lg:text-right",
                          )}
                        >
                          <div
                            className={cn(
                              "flex gap-3",
                              leftSide ? "lg:justify-start" : "lg:justify-end",
                            )}
                          >
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted/30 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  {galleryBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative overflow-hidden rounded-2xl border border-border text-left"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={800}
                      h={500}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 translate-y-full p-6 transition-transform duration-300 group-hover:translate-y-0">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.caption}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
                  {pricingBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border bg-card p-6 transition-all lg:p-8",
                      plan.featured
                        ? "border-primary/50 shadow-xl shadow-primary/10"
                        : "border-border hover:border-border/60",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-lg font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <CheckMark className="size-5 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-xl py-3 font-semibold transition-all",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/30 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  {testimonialsBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6 lg:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} className="size-5 text-accent" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
                  {faqBadge}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold">{item.question}</span>
                      <span className="ml-6 grid size-8 shrink-0 place-items-center rounded-full bg-muted transition-transform group-open:rotate-180">
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA — gradient glow card */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground lg:p-16">
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 size-64 rounded-full bg-accent/20 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 size-64 rounded-full bg-background/20 blur-3xl"
                />
                <div className="relative text-center">
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                    {ctaDesc}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-background/90"
                    >
                      {ctaPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-primary-foreground/70">{ctaNote}</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    <BoltIcon className="size-6" />
                  </span>
                  <span className="text-xl font-bold tracking-tight">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">{footerDesc}</p>
                <div className="flex gap-4">
                  {(["Twitter", "Discord", "GitHub", "Telegram"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="text-xs font-bold">{social.charAt(0)}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold">{col.heading}</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
