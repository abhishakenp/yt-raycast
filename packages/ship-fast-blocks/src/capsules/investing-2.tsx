import { useState } from "react"
import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * InvestingKimiPage2 — VARIANT 2 of the investing / brokerage landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "TradeVault" design. Where the
 * sibling InvestingKimiPage is a clean LIGHT, trustworthy aesthetic, THIS variant
 * is the DARK, high-energy counterpart: an inverted near-black trading-terminal
 * surface (bg-foreground / text-background) with a glowing neon-green brand accent
 * (mapped to chart-1), a fixed blurred navbar, a split hero pairing a "Trade
 * Smarter. Grow Faster." headline with a floating live portfolio card (sparkline +
 * YTD badge + AAPL/NVDA/TSLA holdings rows + Today's-Gain pill), a scrolling press
 * ticker (Bloomberg / Forbes / TechCrunch / WSJ / CNBC), a 6-up dark feature grid,
 * a split markets section with a live Trending-Stocks board, a bold full-bleed
 * green stat band, a connected 3-step "start in 3 minutes" timeline, a 3-tier dark
 * pricing table (Starter / Pro Most-Popular / Elite), a 6-up star-rated testimonial
 * wall with investor headshots, an FAQ list, a glowing closing CTA, and a rich
 * multi-column footer with social icons + FINRA/SIPC disclosures.
 */
export const InvestingKimiPage2 = defineCapsule({
  name: "InvestingKimiPage2",
  description:
    "ALTERNATIVE / second-style investing, trading-platform, stock-brokerage, fintech, robo-advisor or crypto-exchange LANDING page — the DARK, high-energy sibling to InvestingKimiPage (which is light). Distinct dark trading-terminal aesthetic: inverted near-black surface with a glowing neon-green brand accent, a fixed blurred navbar, a split hero ('Trade Smarter. Grow Faster.' with AI-portfolio-insights badge + dual CTAs) beside a floating live portfolio-value card (sparkline, YTD-return badge, AAPL/NVDA/TSLA holdings rows, Today's-Gain pill); a scrolling press-logo ticker (Bloomberg, Forbes, TechCrunch, WSJ, CNBC, Reuters, FT, Barron's); a 6-up feature grid (advanced charting, zero commission, AI insights, bank-grade security, global markets, mobile first); a split real-time markets section with a live Trending-Stocks board (AAPL/NVDA/MSFT/TSLA/AMZN/GOOGL); a bold full-bleed green key-metrics stat band ($12B+ traded, 2.4M investors, 150+ countries, 99.9% uptime); a connected 3-step onboarding timeline ('Start Investing in 3 Minutes'); a 3-tier dark pricing table (Starter free, Pro Most-Popular, Elite); a 6-up star-rated testimonial wall with investor headshots; an FAQ list; a glowing closing CTA; and a rich multi-column footer with social icons and FINRA/SIPC legal disclosures. Choose this when a bold, dark, conversion-focused trading product page is wanted instead of the light sibling. Supply content only — brand, nav, hero, logos, features, markets, stats, steps, pricing, testimonials, faq, cta, footer; the block owns all layout and styling; renders fully on defaults.",
  props: z.object({
    /** Brand / platform name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero: copy + floating live portfolio card. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLine1: z.string().optional(),
        headingLine2: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        signIn: z.string().optional(),
        getStarted: z.string().optional(),
        trustNote: z.string().optional(),
        portfolioLabel: z.string().optional(),
        portfolioValue: z.string().optional(),
        portfolioChange: z.string().optional(),
        ytdLabel: z.string().optional(),
        ytdValue: z.string().optional(),
        gainLabel: z.string().optional(),
        gainValue: z.string().optional(),
        holdings: z
          .array(
            z.object({
              symbol: z.string(),
              name: z.string(),
              shares: z.string(),
              value: z.string(),
              change: z.string(),
              up: z.boolean(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Scrolling press-logo ticker. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
      })
      .optional(),
    /** Markets section: checklist + live trending-stocks board. */
    markets: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        checks: z.array(z.string()).optional(),
        cta: z.string().optional(),
        boardHeading: z.string().optional(),
        boardNote: z.string().optional(),
        quotes: z
          .array(
            z.object({
              symbol: z.string(),
              name: z.string(),
              price: z.string(),
              change: z.string(),
              up: z.boolean(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Full-bleed key-metrics stat band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** 3-step onboarding timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
      })
      .optional(),
    /** 3-tier pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              popular: z.boolean().optional(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Star-rated testimonial wall. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
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
    /** FAQ list. */
    faq: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      })
      .optional(),
    /** Glowing closing CTA. */
    cta: z
      .object({
        headingLine1: z.string().optional(),
        headingLine2: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z.array(z.object({ title: z.string(), links: z.array(z.string()) })).optional(),
        disclosure: z.string().optional(),
        copyright: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      watchlist: table({
        symbol: string(),
        name: string(),
        price: string(),
        change: string(),
        up: string(),
      }),
      leads: table({
        email: string(),
      }),
    },
    queries: {
      watchlist: ({ db }) => db.watchlist.orderBy("createdAt").all(),
      leads: ({ db }) => db.leads.orderBy("createdAt").all(),
      watchlistSymbols: ({ db }) =>
        new Set(db.watchlist.all().map((w) => w.symbol)),
    },
    mutations: {
      addToWatchlist: (
        { db },
        symbol: string,
        name: string,
        price: string,
        change: string,
        up: boolean,
      ) => {
        const existing = db.watchlist.where("symbol", symbol).all()[0]
        if (!existing) {
          db.watchlist.insert({ symbol, name, price, change, up: up ? "true" : "false" })
        }
        return db.watchlist.all()
      },
      removeFromWatchlist: ({ db }, symbol: string) => {
        for (const item of db.watchlist.where("symbol", symbol).all()) {
          db.watchlist.delete(item.id)
        }
        return db.watchlist.all()
      },
      clearWatchlist: ({ db }) => {
        for (const item of db.watchlist.all()) {
          db.watchlist.delete(item.id)
        }
        return []
      },
      subscribeLead: ({ db }, email: string) => {
        const existing = db.leads.where("email", email).all()[0]
        if (!existing) {
          db.leads.insert({ email })
        }
        return db.leads.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [watchlistOpen, setWatchlistOpen] = useState(false)
    const [emailInput, setEmailInput] = useState("")
    const [subscribed, setSubscribed] = useState(false)

    // Lakebed
    const storedWatchlist = lakebed.useQuery("watchlist")
    const watchlistSymbols = lakebed.useQuery("watchlistSymbols")
    const addToWatchlist = lakebed.useMutation("addToWatchlist")
    const removeFromWatchlist = lakebed.useMutation("removeFromWatchlist")
    const clearWatchlist = lakebed.useMutation("clearWatchlist")
    const subscribeLead = lakebed.useMutation("subscribeLead")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign In"

    const safeWatchlist = storedWatchlist ?? []
    const watchlistCount = safeWatchlist.length
    const brand = props.brand ?? "TradeVault"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Markets", "Pricing", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "New: AI-Powered Portfolio Insights"
    const heroLine1 = props.hero?.headingLine1 ?? "Trade Smarter."
    const heroLine2 = props.hero?.headingLine2 ?? "Grow Faster."
    const heroSub =
      props.hero?.subheading ??
      "The all-in-one investing platform with real-time market data, intelligent portfolio tracking, and zero-commission trades. Join 2M+ investors building wealth."
    const heroPrimary = props.hero?.primaryCta ?? "Start Trading Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroSignIn = props.hero?.signIn ?? "Sign In"
    const heroGetStarted = props.hero?.getStarted ?? "Get Started"
    const heroTrust = props.hero?.trustNote ?? "Trusted by 2.4M+ investors"
    const portfolioLabel = props.hero?.portfolioLabel ?? "Portfolio Value"
    const portfolioValue = props.hero?.portfolioValue ?? "$124,893.50"
    const portfolioChange = props.hero?.portfolioChange ?? "+24.5%"
    const ytdLabel = props.hero?.ytdLabel ?? "YTD Return"
    const ytdValue = props.hero?.ytdValue ?? "+18.3%"
    const gainLabel = props.hero?.gainLabel ?? "Today's Gain"
    const gainValue = props.hero?.gainValue ?? "+$1,247.30"
    const holdings = props.hero?.holdings?.length
      ? props.hero.holdings
      : [
          { symbol: "AAPL", name: "Apple Inc.", shares: "35 shares", value: "$6,230.50", change: "+2.4%", up: true },
          { symbol: "NVDA", name: "NVIDIA Corp", shares: "12 shares", value: "$4,891.20", change: "+5.7%", up: true },
          { symbol: "TSLA", name: "Tesla Inc.", shares: "20 shares", value: "$3,452.80", change: "-1.2%", up: false },
        ]

    const logosLabel = props.logos?.label ?? "Featured in leading publications"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Bloomberg", "Forbes", "TechCrunch", "WSJ", "CNBC", "Reuters", "Financial Times", "Barron's"]

    const featuresHeading = props.features?.heading ?? "Everything You Need to"
    const featuresAccent = props.features?.headingAccent ?? "Win"
    const featuresDesc =
      props.features?.description ??
      "Professional-grade tools with a simple, intuitive interface. Built for both beginners and experienced traders."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          { title: "Advanced Charting", description: "Professional technical analysis with 100+ indicators, drawing tools, and real-time data. Customize your view with multiple timeframes." },
          { title: "Zero Commission", description: "Trade stocks, ETFs, and options with $0 commission. Keep more of your profits with our transparent, low-cost pricing." },
          { title: "AI Insights", description: "Smart portfolio recommendations powered by machine learning. Get personalized alerts and market opportunities tailored to you." },
          { title: "Bank-Grade Security", description: "256-bit encryption, two-factor authentication, and SIPC insurance up to $500,000. Your assets are protected around the clock." },
          { title: "Global Markets", description: "Access 25+ stock exchanges worldwide. Trade US, European, Asian, and emerging markets all from one account." },
          { title: "Mobile First", description: "Trade on the go with our award-winning iOS and Android apps. Sync seamlessly across all your devices in real-time." },
        ]

    const marketsHeading = props.markets?.heading ?? "Real-Time Market"
    const marketsAccent = props.markets?.headingAccent ?? "Intelligence"
    const marketsDesc =
      props.markets?.description ??
      "Stay ahead with live market data, breaking news, and advanced analytics. Our platform processes millions of data points to surface what matters most to your portfolio."
    const marketsChecks = props.markets?.checks?.length
      ? props.markets.checks
      : [
          "Live price updates every 100ms",
          "Customizable watchlists & alerts",
          "Institutional-grade research reports",
          "Earnings calendars & SEC filings",
        ]
    const marketsCta = props.markets?.cta ?? "Explore Markets"
    const boardHeading = props.markets?.boardHeading ?? "Trending Stocks"
    const boardNote = props.markets?.boardNote ?? "Updated 2 min ago"
    const quotes = props.markets?.quotes?.length
      ? props.markets.quotes
      : [
          { symbol: "AAPL", name: "Apple Inc.", price: "$178.05", change: "+2.45%", up: true },
          { symbol: "NVDA", name: "NVIDIA Corp", price: "$892.10", change: "+5.72%", up: true },
          { symbol: "MSFT", name: "Microsoft Corp", price: "$425.35", change: "+1.28%", up: true },
          { symbol: "TSLA", name: "Tesla Inc.", price: "$172.64", change: "-1.15%", up: false },
          { symbol: "AMZN", name: "Amazon.com Inc.", price: "$186.45", change: "+0.89%", up: true },
          { symbol: "GOOGL", name: "Alphabet Inc.", price: "$156.78", change: "+0.45%", up: true },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$12B+", label: "Assets Traded" },
          { value: "2.4M", label: "Active Investors" },
          { value: "150+", label: "Countries Served" },
          { value: "99.9%", label: "Uptime SLA" },
        ]

    const stepsHeading = props.steps?.heading ?? "Start Investing in"
    const stepsAccent = props.steps?.headingAccent ?? "3 Minutes"
    const stepsDesc =
      props.steps?.description ??
      "No paperwork, no waiting. Fund your account instantly and start building your wealth today."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          { title: "Create Account", description: "Sign up with your email or phone. Verify your identity in seconds with our secure KYC process." },
          { title: "Fund Instantly", description: "Connect your bank, wire transfer, or use a debit card. Funds available for trading immediately." },
          { title: "Start Trading", description: "Buy stocks, ETFs, options, or crypto. Set up recurring investments and watch your wealth grow." },
        ]

    const pricingHeading = props.pricing?.heading ?? "Simple, Transparent"
    const pricingAccent = props.pricing?.headingAccent ?? "Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees. No surprises. Choose the plan that fits your investment style."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for beginners",
            price: "$0",
            period: "/month",
            cta: "Get Started Free",
            features: ["Commission-free trades", "Basic charting tools", "3 watchlists", "Mobile app access"],
          },
          {
            name: "Pro",
            tagline: "For serious investors",
            price: "$9",
            period: "/month",
            cta: "Start Pro Trial",
            popular: true,
            features: [
              "Everything in Starter",
              "Advanced charting (100+ indicators)",
              "Unlimited watchlists",
              "Options trading",
              "AI-powered insights",
              "Priority support",
            ],
          },
          {
            name: "Elite",
            tagline: "Professional trading",
            price: "$29",
            period: "/month",
            cta: "Contact Sales",
            features: [
              "Everything in Pro",
              "Level 2 market data",
              "Margin trading (4:1)",
              "API access",
              "Dedicated account manager",
            ],
          },
        ]

    const testimonialsHeading = props.testimonials?.heading ?? "Loved by"
    const testimonialsAccent = props.testimonials?.headingAccent ?? "Investors"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join millions who've transformed their financial future with TradeVault."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "TradeVault completely changed how I invest. The AI insights helped me identify opportunities I would have missed. My portfolio is up 34% this year!",
            name: "Michael Chen",
            role: "Software Engineer, San Francisco",
            avatarAlt: "professional headshot of a confident male executive in a suit",
          },
          {
            quote:
              "As a day trader, I need fast execution and reliable data. TradeVault delivers both. The mobile app is incredible—I can trade from anywhere.",
            name: "Sarah Williams",
            role: "Day Trader, New York",
            avatarAlt: "professional headshot of a businesswoman in professional attire",
          },
          {
            quote:
              "I switched from my old broker and saved over $400 in fees last month alone. The customer service is exceptional—they actually answer the phone!",
            name: "David Park",
            role: "Retirement Investor, Chicago",
            avatarAlt: "professional headshot of a businessman in formal attire with glasses",
          },
          {
            quote:
              "The portfolio analytics are incredibly detailed. I finally understand exactly where my money is going and how each investment is performing.",
            name: "Emily Rodriguez",
            role: "Financial Analyst, Miami",
            avatarAlt: "professional headshot of a smiling woman with curly hair",
          },
          {
            quote:
              "I've used many platforms over 20 years, and TradeVault is hands-down the best. The interface is clean, execution is instant, and fees are the lowest.",
            name: "Robert Thompson",
            role: "Hedge Fund Manager, London",
            avatarAlt: "professional headshot of a middle-aged man with a friendly smile",
          },
          {
            quote:
              "Started with $100 just to test it out. Six months later, I've built a diverse portfolio and learned more about investing than in years of reading books.",
            name: "Jennifer Liu",
            role: "First-Time Investor, Seattle",
            avatarAlt: "professional headshot of a young woman with long dark hair",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked"
    const faqAccent = props.faq?.headingAccent ?? "Questions"
    const faqDesc = props.faq?.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is TradeVault really commission-free?",
            answer:
              "Yes! We charge $0 commission on all stock, ETF, and options trades. We also don't charge account maintenance or inactivity fees. The only fees you'll encounter are regulatory fees (like SEC fees) that all brokers pass through, and optional premium features in our Pro and Elite plans.",
          },
          {
            question: "How do I fund my account?",
            answer:
              "You can fund your account via bank transfer (ACH), wire transfer, or debit card. ACH transfers are free and typically take 1-3 business days. Wire transfers are same-day but may incur a small fee from your bank. Debit card deposits are instant with a 2.5% convenience fee.",
          },
          {
            question: "Is my money safe with TradeVault?",
            answer:
              "Absolutely. We're a member of SIPC, which protects securities in your account up to $500,000 (including $250,000 for cash claims). We also use 256-bit SSL encryption, two-factor authentication, and biometric login options. Your cash is held at FDIC-insured partner banks.",
          },
          {
            question: "Can I trade on margin?",
            answer:
              "Yes, margin trading is available with our Elite plan. We offer competitive margin rates starting at 4.5% and up to 4:1 buying power on qualifying accounts. You must maintain a minimum account balance of $2,000 to use margin. Risk disclosure required.",
          },
          {
            question: "What markets can I trade?",
            answer:
              "With TradeVault, you can trade stocks and ETFs on major US exchanges (NYSE, NASDAQ, BATS), options, cryptocurrencies (Bitcoin, Ethereum, and 30+ altcoins), and with Elite membership, access 25+ international exchanges including London, Tokyo, Hong Kong, and Frankfurt.",
          },
          {
            question: "How does the AI insights feature work?",
            answer:
              "Our AI analyzes millions of data points including market trends, news sentiment, earnings reports, and your personal trading history to surface personalized opportunities. It can alert you to unusual options activity, potential portfolio rebalancing suggestions, and upcoming catalysts for stocks you own or watch.",
          },
          {
            question: "Can I set up automatic investments?",
            answer:
              "Yes! You can set up recurring investments daily, weekly, bi-weekly, or monthly. Many users automate their investment strategy by setting recurring buys into index funds or dividend stocks. You can also enable dividend reinvestment (DRIP) to compound your returns automatically.",
          },
          {
            question: "What customer support options are available?",
            answer:
              "We offer 24/7 support via in-app chat and email. Pro and Elite members get priority support with faster response times. Elite members also get access to a dedicated account manager and phone support. Our average response time is under 5 minutes during market hours.",
          },
        ]

    const ctaLine1 = props.cta?.headingLine1 ?? "Ready to Start Your"
    const ctaLine2 = props.cta?.headingLine2 ?? "Investment Journey?"
    const ctaDesc =
      props.cta?.description ??
      "Join millions of investors who trust TradeVault. Get started in minutes with as little as $1. No hidden fees, no minimums."
    const ctaPrimary = props.cta?.primaryCta ?? "Open Free Account"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch Demo"
    const ctaNote = props.cta?.note ?? "Protected by SIPC up to $500,000 • Regulated by SEC & FINRA"

    const footerTagline =
      props.footer?.tagline ??
      "The modern investing platform for the next generation of investors. Trade stocks, ETFs, options, and crypto with zero commission."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          { title: "Product", links: ["Features", "Pricing", "Mobile Apps", "API", "Stocks", "Crypto"] },
          { title: "Company", links: ["About Us", "Careers", "Press", "Blog", "Contact"] },
          { title: "Resources", links: ["Help Center", "Community", "Investing 101", "Market News", "Research"] },
          { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Disclosures", "FINRA BrokerCheck"] },
        ]
    const footerDisclosure =
      props.footer?.disclosure ??
      `Securities trading offered through ${brand} Securities, Inc. Member FINRA/SIPC. Cryptocurrency trading offered through ${brand} Crypto, Inc. Investments are not FDIC insured and may lose value. Investing involves risk, including the possible loss of principal.`
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "Instagram", "LinkedIn"]

    // Brand trend-line glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn("grid place-items-center rounded-xl bg-chart-1 text-background", className)}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[60%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const ArrowUp = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    )

    const ArrowDown = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg key="coin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg key="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="mobile" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-foreground font-sans text-background antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-background/10 bg-foreground/80 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button type="button" onClick={() => go(nav[0])} className="flex items-center gap-2">
                <LogoMark className="size-10" />
                <span className="text-xl font-bold tracking-tight lg:text-2xl">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-background/60 transition-colors hover:text-background"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Watchlist drawer trigger */}
                <Sheet open={watchlistOpen} onOpenChange={setWatchlistOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Watchlist"
                      className="relative flex items-center gap-2 text-background/60 transition-colors hover:text-background"
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {watchlistCount > 0 && (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-chart-1 text-[0.625rem] font-bold text-background">
                          {watchlistCount}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Watchlist</SheetTitle>
                      <SheetDescription>
                        {watchlistCount > 0
                          ? `${watchlistCount} stock${watchlistCount === 1 ? "" : "s"} on your watchlist.`
                          : "Your watchlist is empty. Add stocks from the markets section."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeWatchlist.length ? (
                        <div className="space-y-3">
                          {safeWatchlist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted p-4">
                              <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-lg bg-chart-1/15 text-sm font-bold text-chart-1">
                                  {item.symbol.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground">{item.symbol}</p>
                                  <p className="text-xs text-muted-foreground">{item.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-bold text-foreground">{item.price}</p>
                                  <p className={cn("text-xs", item.up === "true" ? "text-chart-1" : "text-destructive")}>{item.change}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void removeFromWatchlist(item.symbol)}
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                  aria-label={`Remove ${item.symbol} from watchlist`}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">No stocks in watchlist</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click the + button next to any trending stock to add it here.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        disabled={!safeWatchlist.length}
                        className="w-full rounded-xl"
                        onClick={() => { setWatchlistOpen(false); go("Markets") }}
                      >
                        Go to Markets
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => void clearWatchlist()}
                          disabled={!safeWatchlist.length}
                        >
                          Clear All
                        </Button>
                        <SheetClose asChild>
                          <Button type="button" variant="secondary" className="rounded-xl">
                            Close
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {/* Auth */}
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-background/20 bg-background/10 px-2 py-1 text-background shadow-sm transition hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-1 sm:inline-flex"
                      >
                        <Avatar size="sm" className="ring-2 ring-foreground" aria-hidden="true">
                          {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                          <AvatarFallback className="bg-chart-1 text-[0.65rem] font-bold text-background">{authInitials}</AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">{authDisplayName}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={10} className="w-64 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl">
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                            <AvatarFallback className="bg-chart-1 text-sm font-bold text-background">{authInitials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">{authDisplayName}</p>
                            <p className="truncate text-xs text-muted-foreground">{authEmail ?? "Signed in"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={() => lakebed.signOut()}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={() => { if (!auth.isLoading) void lakebed.signInWithGoogle() }}
                    disabled={auth.isLoading}
                    className="hidden font-medium text-background/60 transition-colors hover:text-background disabled:opacity-60 sm:block"
                  >
                    {authLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go(heroGetStarted)}
                  className="rounded-xl bg-chart-1 px-4 py-2.5 font-bold text-background transition-all hover:scale-105 hover:bg-chart-1/90 lg:px-6"
                >
                  {heroGetStarted}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-20 pt-16 lg:pb-32 lg:pt-24">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-transparent to-transparent" />
            <div aria-hidden="true" className="absolute right-0 top-20 size-96 rounded-full bg-chart-1/20 blur-3xl" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-chart-1/30 bg-chart-1/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-chart-1" />
                    <span className="text-sm font-semibold text-chart-1">{heroBadge}</span>
                  </div>
                  <h1 className="text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                    {heroLine1}
                    <br />
                    <span className="text-chart-1">{heroLine2}</span>
                  </h1>
                  <p className="max-w-xl text-xl leading-relaxed text-background/60">{heroSub}</p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-chart-1 px-8 py-4 text-lg font-bold text-background shadow-[0_0_30px_hsl(var(--chart-1)/0.4)] transition-all hover:scale-105 hover:bg-chart-1/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-background/20 bg-background/5 px-8 py-4 text-lg font-semibold text-background transition-all hover:bg-background/10"
                    >
                      <PlayIcon className="size-5" />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-background/50">
                    <div className="flex -space-x-2">
                      {[
                        "professional headshot of a young male investor",
                        "professional headshot of a smiling businesswoman",
                        "professional headshot of a mature businessman",
                        "professional headshot of a confident female professional",
                      ].map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-foreground object-cover"
                        />
                      ))}
                    </div>
                    <p>{heroTrust}</p>
                  </div>
                </div>

                {/* Live portfolio card */}
                <div className="relative lg:pl-8">
                  <div className="relative rounded-3xl border border-background/10 bg-card p-6 text-card-foreground shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{portfolioLabel}</p>
                        <p className="text-3xl font-bold">{portfolioValue}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-chart-1/10 px-3 py-1 text-sm font-semibold text-chart-1">
                        <ArrowUp className="size-4" />
                        {portfolioChange}
                      </div>
                    </div>
                    <div className="relative mb-6 h-48 overflow-hidden rounded-xl bg-gradient-to-t from-chart-1/20 to-transparent">
                      <svg className="absolute bottom-0 h-full w-full text-chart-1" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
                        <path fill="currentColor" fillOpacity="0.2" d="M0,120 Q50,100 100,90 T200,60 T300,40 T400,20 L400,150 L0,150 Z" />
                        <path fill="none" stroke="currentColor" strokeWidth="3" d="M0,120 Q50,100 100,90 T200,60 T300,40 T400,20" />
                      </svg>
                      <div className="absolute right-4 top-4 rounded-lg bg-popover/90 px-3 py-2 text-xs text-popover-foreground backdrop-blur">
                        <span className="text-muted-foreground">{ytdLabel}</span>
                        <p className="font-bold text-chart-1">{ytdValue}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {holdings.map((h) => {
                        const inWatchlist = watchlistSymbols?.has(h.symbol) ?? false
                        return (
                          <div key={h.symbol} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                            <div className="flex items-center gap-3">
                              <div className="grid size-10 place-items-center rounded-lg bg-chart-1/15 text-sm font-bold text-chart-1">
                                {h.symbol}
                              </div>
                              <div>
                                <p className="font-semibold">{h.name}</p>
                                <p className="text-xs text-muted-foreground">{h.shares}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-semibold">{h.value}</p>
                                <p className={cn("text-xs", h.up ? "text-chart-1" : "text-destructive")}>{h.change}</p>
                              </div>
                              <button
                                type="button"
                                aria-pressed={inWatchlist}
                                aria-label={inWatchlist ? `Remove ${h.symbol} from watchlist` : `Add ${h.symbol} to watchlist`}
                                onClick={() => {
                                  if (inWatchlist) {
                                    void removeFromWatchlist(h.symbol)
                                  } else {
                                    void addToWatchlist(h.symbol, h.name, h.value, h.change, h.up)
                                    setWatchlistOpen(true)
                                  }
                                }}
                                className={cn(
                                  "grid size-7 place-items-center rounded-md text-xs font-bold transition-all",
                                  inWatchlist
                                    ? "bg-chart-1 text-background"
                                    : "bg-card-foreground/10 text-card-foreground/60 hover:bg-chart-1/20 hover:text-chart-1",
                                )}
                              >
                                {inWatchlist ? "✓" : "+"}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 rounded-2xl border border-background/10 bg-card p-4 text-card-foreground shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-chart-1/20 text-chart-1">
                        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{gainLabel}</p>
                        <p className="text-xl font-bold text-chart-1">{gainValue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos ticker */}
          <section className="border-y border-background/10 bg-background/5 py-12" aria-label="Featured in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-background/50">{logosLabel}</p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-2xl font-bold text-background/40 transition-colors hover:text-background/70"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {featuresHeading} <span className="text-chart-1">{featuresAccent}</span>
                </h2>
                <p className="text-xl text-background/60">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map((f, i) => (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-background/10 bg-background/5 p-8 transition-all hover:border-chart-1/50"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-chart-1/10 text-chart-1 transition-colors group-hover:bg-chart-1/20 [&>svg]:size-7">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                    <p className="leading-relaxed text-background/60">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Markets */}
          <section id="markets" className="bg-background/5 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                    {marketsHeading} <span className="text-chart-1">{marketsAccent}</span>
                  </h2>
                  <p className="mb-8 text-xl text-background/60">{marketsDesc}</p>
                  <div className="mb-8 space-y-4">
                    {marketsChecks.map((c) => (
                      <div key={c} className="flex items-center gap-4">
                        <div className="grid size-6 flex-shrink-0 place-items-center rounded-full bg-chart-1 text-background">
                          <Check className="size-4" />
                        </div>
                        <span className="text-lg">{c}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(marketsCta)}
                    className="rounded-2xl bg-chart-1 px-8 py-4 font-bold text-background transition-all hover:scale-105 hover:bg-chart-1/90"
                  >
                    {marketsCta}
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-background/10 bg-card p-6 text-card-foreground">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">{boardHeading}</h3>
                    <span className="text-xs text-muted-foreground">{boardNote}</span>
                  </div>
                  <div className="space-y-3">
                    {quotes.map((q) => {
                      const inWatchlist = watchlistSymbols?.has(q.symbol) ?? false
                      return (
                        <div
                          key={q.symbol}
                          className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                        >
                          <button
                            type="button"
                            onClick={() => go(q.symbol)}
                            className="flex flex-1 items-center gap-4 text-left"
                          >
                            <div className="grid size-12 place-items-center rounded-xl bg-chart-1/15 font-bold text-chart-1">
                              {q.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{q.symbol}</p>
                              <p className="text-sm text-muted-foreground">{q.name}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold">{q.price}</p>
                              <p
                                className={cn(
                                  "flex items-center justify-end gap-1 text-sm",
                                  q.up ? "text-chart-1" : "text-destructive",
                                )}
                              >
                                {q.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                                {q.change}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-pressed={inWatchlist}
                              aria-label={inWatchlist ? `Remove ${q.symbol} from watchlist` : `Add ${q.symbol} to watchlist`}
                              onClick={() => {
                                if (inWatchlist) {
                                  void removeFromWatchlist(q.symbol)
                                } else {
                                  void addToWatchlist(q.symbol, q.name, q.price, q.change, q.up)
                                  setWatchlistOpen(true)
                                }
                              }}
                              className={cn(
                                "grid size-8 place-items-center rounded-lg text-sm font-bold transition-all hover:scale-105",
                                inWatchlist
                                  ? "bg-chart-1 text-background"
                                  : "bg-background/10 text-background/60 hover:bg-chart-1/20 hover:text-chart-1",
                              )}
                            >
                              {inWatchlist ? "✓" : "+"}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stat band */}
          <section className="relative overflow-hidden bg-chart-1 py-20">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-5xl font-black text-background lg:text-6xl">{s.value}</p>
                    <p className="font-semibold text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {stepsHeading} <span className="text-chart-1">{stepsAccent}</span>
                </h2>
                <p className="text-xl text-background/60">{stepsDesc}</p>
              </div>
              <div className="relative grid gap-8 md:grid-cols-3 lg:gap-12">
                <div
                  aria-hidden="true"
                  className="absolute left-1/3 right-1/3 top-24 hidden h-0.5 bg-gradient-to-r from-chart-1/50 via-chart-1 to-chart-1/50 md:block"
                />
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-6 grid size-20 place-items-center rounded-2xl border-4 border-chart-1 bg-background/5">
                      <span className="text-3xl font-black text-chart-1">{i + 1}</span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">{step.title}</h3>
                    <p className="text-background/60">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-background/5 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {pricingHeading} <span className="text-chart-1">{pricingAccent}</span>
                </h2>
                <p className="text-xl text-background/60">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-3xl p-8 transition-all",
                      tier.popular
                        ? "border-2 border-chart-1 bg-background/5 md:scale-105"
                        : "border border-background/10 bg-background/5 hover:border-background/20",
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-chart-1 px-4 py-1 text-sm font-bold text-background">
                          {popularLabel}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold">{tier.name}</h3>
                      <p className="text-background/50">{tier.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className={cn("text-5xl font-black", tier.popular && "text-chart-1")}>{tier.price}</span>
                      <span className="text-background/50">{tier.period}</span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <Check className="size-5 flex-shrink-0 text-chart-1" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-2xl py-4 font-bold transition-all",
                        tier.popular
                          ? "bg-chart-1 text-background hover:scale-105 hover:bg-chart-1/90"
                          : "border border-background/20 text-background hover:bg-background/10",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="reviews" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {testimonialsHeading} <span className="text-chart-1">{testimonialsAccent}</span> Worldwide
                </h2>
                <p className="text-xl text-background/60">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl border border-background/10 bg-background/5 p-8">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-background/80">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image alt={t.avatarAlt} w={100} h={100} loading="lazy" className="size-12 rounded-full object-cover" />
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="text-sm text-background/50">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-background/5 py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {faqHeading} <span className="text-chart-1">{faqAccent}</span>
                </h2>
                <p className="text-xl text-background/60">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.question} className="group rounded-2xl border border-background/10 bg-background/5 p-6">
                    <summary className="flex cursor-pointer items-center justify-between text-lg font-bold">
                      {item.question}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 flex-shrink-0 text-background/50 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-3 leading-relaxed text-background/60">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="relative overflow-hidden py-24 lg:py-32">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-chart-1/20 via-transparent to-chart-1/10" />
            <div aria-hidden="true" className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-chart-1 to-transparent" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black lg:text-6xl">
                {ctaLine1}
                <br />
                <span className="text-chart-1">{ctaLine2}</span>
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/60">{ctaDesc}</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-chart-1 px-10 py-5 text-lg font-bold text-background shadow-[0_0_30px_hsl(var(--chart-1)/0.4)] transition-all hover:scale-105 hover:bg-chart-1/90"
                >
                  {ctaPrimary}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-background/20 bg-background/5 px-10 py-5 text-lg font-semibold text-background transition-all hover:bg-background/10"
                >
                  <PlayIcon className="size-5" />
                  {ctaSecondary}
                </button>
              </div>
              {subscribed ? (
                <p className="mt-8 rounded-2xl border border-chart-1/30 bg-chart-1/10 px-6 py-4 text-sm font-semibold text-chart-1">
                  ✓ You're on the list! We'll notify you when your account is ready.
                </p>
              ) : (
                <form
                  className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const val = emailInput.trim()
                    if (!val) return
                    void subscribeLead(val)
                    setEmailInput("")
                    setSubscribed(true)
                  }}
                >
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email for early access"
                    aria-label="Email for early access"
                    required
                    className="flex-1 rounded-2xl border border-background/20 bg-background/10 px-6 py-4 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-chart-1/50"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-2xl border border-chart-1/40 bg-background/10 px-6 py-4 font-semibold text-background transition-all hover:bg-chart-1/20"
                  >
                    Notify Me
                  </button>
                </form>
              )}
              <p className="mt-6 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-background/10 bg-background/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button type="button" onClick={() => go(nav[0])} className="mb-4 flex items-center gap-2">
                  <LogoMark className="size-10" />
                  <span className="text-2xl font-bold">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-background/60">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 transition-all hover:bg-chart-1 hover:text-background"
                    >
                      <span className="text-xs font-semibold">{social.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold">{col.title}</h4>
                  <ul className="space-y-3 text-background/60">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button type="button" onClick={() => go(link)} className="transition-colors hover:text-chart-1">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-background/10 pt-8">
              <p className="mb-4 text-sm text-background/50">{footerDisclosure}</p>
              <p className="text-sm text-background/40">{footerCopyright}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
