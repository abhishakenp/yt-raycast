import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * PortfolioDevKimiPage2 — a complete, self-contained personal portfolio LANDING
 * page for a full-stack developer / freelance software engineer.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "alex.dev — Building digital
 * experiences that matter" design. This is the SECOND, visually DISTINCT style
 * SIBLING to PortfolioDevKimiPage: where that block is a calm, light, editorial
 * monochrome layout, THIS one is a bold, dark, high-contrast aesthetic with a
 * fuchsia/violet brand accent, gradient glows and blurred orbs, an extra-black
 * (font-black) display type scale, rounded-full pill CTAs and a fixed blurred
 * navbar. It pairs a two-column hero (availability pill with pulsing dot,
 * gradient-highlighted headline, dual CTAs, inline mini-stats, and a portrait
 * Image with a floating "Currently Building" status card) with a grayscale
 * company-logo trust strip, a 3-up technical-expertise card grid (icon tiles +
 * tech chips), a 2-up selected-projects grid (image cards with colored tech
 * tags, launch year and a metric), a split open-source section (repo list with
 * star badges + language dots, a Top Contributor highlight, and a workspace
 * Image), a stats card band, a 6-up star-rated testimonials grid with avatars,
 * an FAQ accordion (native details/summary), a gradient contact CTA card with
 * email / schedule buttons and social links, and a rich 4-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. It uses ONLY
 * semantic theme tokens (background/foreground/card/muted/primary/secondary/
 * accent + chart-1..5 for the multi-color icon tiles, tech tags and language
 * dots) so it is theme-injectable. Every nav item / CTA / project / repo /
 * social / FAQ routes through `useNavigate` (never a dead "#"), and navbar
 * labels match the `nav` array so PageSwitch can swap pages. All content imagery
 * (portrait, project shots, workspace, avatars) uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const PortfolioDevKimiPage2 = defineCapsule({
  name: "PortfolioDevKimiPage2",
  description:
    "Complete personal PORTFOLIO landing page for a full-stack developer / freelance software engineer with a BOLD, DARK, high-contrast aesthetic: fuchsia/violet brand accent, gradient glows and blurred orbs, extra-black display headings, rounded-full pill buttons and a fixed blurred navbar. This is the SECOND, visually DISTINCT alternative / style sibling to PortfolioDevKimiPage (which is the calm, light, minimal editorial monochrome version) — pick this one when a punchy, vibrant, dark-mode freelancer vibe is wanted. Includes a two-column hero (Available-for-freelance-work pill with pulsing dot, gradient-highlighted headline, intro paragraph, View-My-Work + GitHub CTAs, inline Years/Projects/Stars mini-stats, and a portrait photo with a floating Currently-Building status card), a grayscale 'trusted by teams at' company-logo strip, a 3-up technical-expertise card grid (Frontend/Backend/Cloud/Performance/Testing/Leadership icon tiles with tech chips), a 2-up selected-projects grid (image cards with colored React/Node/AWS tech tags, launch year and a traction metric and View-Project links), a split open-source section (repo list with star-count badges, language dots and MIT-License labels, a Top Contributor highlight card, and a developer-workspace image), a stats card band (years/projects/stars/satisfaction), a 6-up star-rated testimonials grid with headshot avatars and roles, an FAQ accordion (native details/summary on timeline, team fit, tech stack, communication, rates, support), a gradient contact CTA card with email + Schedule-a-Call buttons and GitHub/Twitter/LinkedIn/Dev.to social links, and a 4-column footer with brand, quick links and contact details. Use as the ROOT/home page for a freelance developer, full-stack engineer, indie hacker, technical consultant or open-source maintainer personal site / dev portfolio when a bold, credible, content-rich dark showcase of projects, skills, open-source work and client testimonials is wanted. Supply content only — brand, nav, hero, logos, expertise, projects, openSource, stats, testimonials, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Person / brand name shown in the navbar and footer (rendered as name + accent suffix). */
    brand: z.string().optional(),
    /** Accent-colored suffix appended to the brand wordmark (e.g. ".dev"). */
    brandSuffix: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        headingTrail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        portraitAlt: z.string().optional(),
        statusLabel: z.string().optional(),
        statusValue: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Grayscale trust / logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        /** Logo alt labels — rendered as grayscale brand marks. */
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Technical expertise card grid. */
    expertise: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Selected projects grid. */
    projects: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              tags: z.array(z.string()),
              launched: z.string(),
              metric: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Open-source contributions split section. */
    openSource: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        highlightTitle: z.string().optional(),
        highlightText: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              stars: z.string(),
              description: z.string(),
              language: z.string(),
              license: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats card band. */
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Gradient contact CTA card. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        linksTitle: z.string().optional(),
        links: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        email: z.string().optional(),
        location: z.string().optional(),
        timezone: z.string().optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const brand = props.brand ?? "alex"
    const brandSuffix = props.brandSuffix ?? ".dev"
    const nav = props.nav?.length
      ? props.nav
      : ["Projects", "Skills", "Open Source", "Testimonials", "Let's Talk"]

    const heroBadge = props.hero?.badge ?? "Available for freelance work"
    const heroLead = props.hero?.headingLead ?? "Building"
    const heroHighlight = props.hero?.headingHighlight ?? "digital"
    const heroTrail = props.hero?.headingTrail ?? "experiences that matter"
    const heroSub =
      props.hero?.subheading ??
      "I'm Alex Chen, a full-stack developer with 8+ years crafting scalable web applications. I specialize in React, Node.js, and cloud infrastructure — turning complex problems into elegant solutions."
    const heroPrimary = props.hero?.primaryCta ?? "View My Work"
    const heroSecondary = props.hero?.secondaryCta ?? "GitHub"
    const portraitAlt =
      props.hero?.portraitAlt ??
      "professional headshot of Alex Chen, a software developer with a confident smile wearing a casual button-up shirt"
    const statusLabel = props.hero?.statusLabel ?? "Currently Building"
    const statusValue = props.hero?.statusValue ?? "React Query Toolkit v3"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "8+", label: "Years Exp" },
          { value: "50+", label: "Projects" },
          { value: "12K", label: "GitHub Stars" },
        ]

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Vercel", "GitHub", "Linear", "Notion", "Figma"]

    const expertiseHeading = props.expertise?.heading ?? "Technical Expertise"
    const expertiseDesc =
      props.expertise?.description ??
      "A deep toolkit built over 8 years of shipping production applications across startups and enterprises."
    const expertiseItems = props.expertise?.items?.length
      ? props.expertise.items
      : [
          {
            title: "Frontend Architecture",
            description:
              "React, TypeScript, Next.js, Tailwind CSS. Building performant, accessible interfaces with thoughtful UX.",
            tags: ["React", "TypeScript", "Next.js"],
          },
          {
            title: "Backend Systems",
            description:
              "Node.js, PostgreSQL, Redis, GraphQL. Designing APIs and data layers that scale with your business.",
            tags: ["Node.js", "PostgreSQL", "GraphQL"],
          },
          {
            title: "Cloud & DevOps",
            description:
              "AWS, Docker, Kubernetes, Terraform. Infrastructure as code with automated CI/CD pipelines.",
            tags: ["AWS", "Docker", "Terraform"],
          },
          {
            title: "Performance",
            description:
              "Core Web Vitals optimization, lazy loading, code splitting. Making fast applications faster.",
            tags: ["Lighthouse", "Web Vitals", "CDN"],
          },
          {
            title: "Testing & Quality",
            description:
              "Jest, Cypress, Playwright, TDD. Comprehensive test coverage for confidence in every deploy.",
            tags: ["Jest", "Cypress", "TDD"],
          },
          {
            title: "Technical Leadership",
            description:
              "Code reviews, architecture decisions, mentoring. Building teams that ship quality software.",
            tags: ["Mentoring", "Architecture", "Agile"],
          },
        ]

    const projectsHeading = props.projects?.heading ?? "Selected Projects"
    const projectsDesc =
      props.projects?.description ??
      "A showcase of production applications I've built — from real-time collaboration tools to e-commerce platforms processing millions in transactions."
    const projectsCta = props.projects?.cta ?? "View all on GitHub"
    const projectItems = props.projects?.items?.length
      ? props.projects.items
      : [
          {
            title: "Analytics Dashboard Pro",
            description:
              "Real-time business intelligence platform serving 50K+ daily active users. Features custom drag-and-drop report builder, sub-second query performance via ClickHouse, and role-based access control.",
            imageAlt:
              "dashboard interface showing analytics charts with colorful data visualizations and metric cards",
            tags: ["React", "Node.js", "AWS"],
            launched: "Launched 2023",
            metric: "2.4M page views/mo",
          },
          {
            title: "ShopStream E-commerce",
            description:
              "Headless e-commerce platform with real-time inventory sync. Processed $12M+ in transactions. Features AI-powered recommendations, abandoned cart recovery, and multi-currency support.",
            imageAlt:
              "e-commerce checkout interface showing shopping cart with product cards and payment form",
            tags: ["Next.js", "Stripe", "PostgreSQL"],
            launched: "Launched 2022",
            metric: "$12M+ revenue",
          },
          {
            title: "CollabSpace Real-time",
            description:
              "Video conferencing + collaborative whiteboard for remote teams. Supports 100+ concurrent users per room with sub-100ms latency. End-to-end encryption for enterprise clients.",
            imageAlt:
              "team collaboration interface with video call grid and shared document editing workspace",
            tags: ["WebRTC", "Socket.io", "Redis"],
            launched: "Launched 2023",
            metric: "50K+ teams",
          },
          {
            title: "FinTrack Mobile Banking",
            description:
              "Cross-platform mobile app for personal finance management. Bank-grade security with Plaid integration. Features expense categorization, budget goals, and investment tracking across 12K+ active users.",
            imageAlt:
              "mobile banking app interface showing account balance and transaction history on smartphone",
            tags: ["React Native", "Node.js", "Plaid API"],
            launched: "Launched 2021",
            metric: "4.8 App Store rating",
          },
        ]

    const osHeading = props.openSource?.heading ?? "Open Source Contributions"
    const osDesc =
      props.openSource?.description ??
      "I believe in giving back to the community. My projects and contributions help thousands of developers build better applications every day."
    const osImageAlt =
      props.openSource?.imageAlt ??
      "developer workspace with multiple monitors showing code editor with open source project and terminal"
    const osHighlightTitle = props.openSource?.highlightTitle ?? "Top Contributor"
    const osHighlightText =
      props.openSource?.highlightText ??
      "Recognized contributor to React, Next.js, and TanStack Query"
    const osItems = props.openSource?.items?.length
      ? props.openSource.items
      : [
          {
            name: "react-query-toolkit",
            stars: "8.2K stars",
            description:
              "Simplified data fetching hooks built on top of TanStack Query with automatic caching and background refetching.",
            language: "TypeScript",
            license: "MIT License",
          },
          {
            name: "node-caching-layer",
            stars: "2.1K stars",
            description:
              "Lightweight caching middleware for Express.js with Redis and in-memory fallbacks for high-performance APIs.",
            language: "JavaScript",
            license: "MIT License",
          },
          {
            name: "tailwind-animation-utils",
            stars: "1.5K stars",
            description:
              "Collection of pre-built animation utilities and keyframes for Tailwind CSS with accessibility considerations.",
            language: "CSS",
            license: "MIT License",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          {
            value: "8+",
            label: "Years Experience",
            note: "Full-stack development",
          },
          {
            value: "50+",
            label: "Projects Shipped",
            note: "Production applications",
          },
          {
            value: "12K",
            label: "GitHub Stars",
            note: "Across my repositories",
          },
          {
            value: "99%",
            label: "Client Satisfaction",
            note: "Based on 30+ reviews",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take my word for it. Here's what founders, CTOs, and product leaders have to say about working together."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Alex transformed our legacy Rails app into a modern React architecture. The performance improvements were immediate — page load times dropped from 4s to under 800ms. Beyond technical skills, Alex's communication made the project a breeze.",
            name: "Sarah Mitchell",
            role: "CEO, DataStream Analytics",
            avatarAlt:
              "professional headshot of Sarah Mitchell, a startup CEO with short brown hair and a confident expression",
          },
          {
            quote:
              "We hired Alex to architect our real-time collaboration features. The WebRTC implementation was rock-solid from day one, handling 100+ concurrent users per room. Alex's attention to edge cases saved us months of bug fixing.",
            name: "Marcus Johnson",
            role: "CTO, CollabSpace",
            avatarAlt:
              "professional headshot of Marcus Johnson, a CTO with dark skin and a friendly smile wearing glasses",
          },
          {
            quote:
              "Alex joined our team as a tech lead and immediately improved our engineering culture. The testing standards and code review practices Alex introduced are still in place three years later. A true professional who elevates everyone around them.",
            name: "Elena Rodriguez",
            role: "VP Product, TechVentures",
            avatarAlt:
              "professional headshot of Elena Rodriguez, a product director with long dark hair and warm smile",
          },
          {
            quote:
              "Working with Alex on our e-commerce platform was a game-changer. The headless architecture with Next.js and Stripe integration handled Black Friday traffic without a hiccup. $2M in sales in 24 hours — zero downtime.",
            name: "David Park",
            role: "Founder, ShopStream",
            avatarAlt:
              "professional headshot of David Park, a startup founder with Asian features and business casual attire",
          },
          {
            quote:
              "Alex built our mobile banking app from concept to App Store launch in just 4 months. The code quality is exceptional — we've had zero critical bugs in production. Alex's expertise in React Native and security best practices was invaluable.",
            name: "James Wilson",
            role: "CEO, FinTrack",
            avatarAlt:
              "professional headshot of James Wilson, a fintech executive in a navy suit with silver hair",
          },
          {
            quote:
              "Alex's open-source contributions saved our team weeks of development time. We adopted react-query-toolkit and it streamlined our entire data layer. The documentation and TypeScript support are world-class.",
            name: "Amanda Foster",
            role: "Senior Engineer, Stripe",
            avatarAlt:
              "professional headshot of Amanda Foster, a senior engineer with curly red hair and a friendly smile",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working together."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What's your typical project timeline?",
            answer:
              "Most projects range from 4-12 weeks depending on scope. A typical MVP takes 6-8 weeks, including discovery, design collaboration, development, and testing. I'll provide a detailed timeline during our initial consultation based on your specific requirements.",
          },
          {
            question: "Do you work with existing teams or only solo?",
            answer:
              "Both! I've successfully embedded with existing engineering teams at companies like Stripe and Notion, and I've led projects as the sole developer for early-stage startups. I adapt my workflow to fit your team's needs — whether that's daily standups or async updates.",
          },
          {
            question: "What technologies do you specialize in?",
            answer:
              "My core stack is React, TypeScript, Node.js, and PostgreSQL. For infrastructure, I work extensively with AWS, Docker, and Kubernetes. I'm also experienced with Next.js, GraphQL, Redis, and various real-time technologies like WebRTC and Socket.io.",
          },
          {
            question: "How do you handle project communication?",
            answer:
              "Clear communication is crucial. I provide weekly progress reports with live demos, maintain detailed documentation in Notion or your preferred tool, and I'm available on Slack for quick questions. For larger projects, we can schedule regular video check-ins.",
          },
          {
            question: "What are your rates and payment terms?",
            answer:
              "I offer both project-based fixed pricing and hourly consulting rates. Fixed projects typically require a 50% deposit to begin, with the balance due on delivery. For ongoing work, I invoice bi-weekly. I'm happy to discuss retainer arrangements for long-term partnerships.",
          },
          {
            question: "Do you provide ongoing support after launch?",
            answer:
              "Absolutely. All projects include a 30-day bug-fixing period post-launch. After that, I offer monthly maintenance retainers that include monitoring, security updates, performance optimization, and priority feature development.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Let's build something amazing"
    const contactDesc =
      props.contact?.description ??
      "Have a project in mind? I'm currently accepting new clients for Q3 2026. Let's discuss how we can bring your vision to life."
    const contactPrimary = props.contact?.primaryCta ?? "alex@alexchen.dev"
    const contactSecondary = props.contact?.secondaryCta ?? "Schedule a Call"
    const contactSocials = props.contact?.socials?.length
      ? props.contact.socials
      : ["GitHub", "Twitter", "LinkedIn", "Dev.to"]

    const footerAbout =
      props.footer?.about ??
      "Full-stack developer building scalable applications with React, Node.js, and cloud infrastructure. Based in San Francisco, working worldwide."
    const footerLinksTitle = props.footer?.linksTitle ?? "Quick Links"
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Projects", "Skills", "Open Source", "Testimonials"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerEmail = props.footer?.email ?? "alex@alexchen.dev"
    const footerLocation = props.footer?.location ?? "San Francisco, CA"
    const footerTimezone = props.footer?.timezone ?? "UTC-7 (PST)"
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]
    const footerSocials = ["GitHub", "Twitter", "LinkedIn"]

    // Rotating token palette for decorative icon tiles / tech tags / dots.
    // Static class strings so Tailwind JIT emits them (no dynamic interpolation).
    const toneTile = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
      "bg-primary/10 text-primary",
    ]
    const toneText = [
      "text-chart-1",
      "text-chart-2",
      "text-chart-3",
      "text-chart-4",
      "text-chart-5",
      "text-primary",
    ]
    const toneDot = [
      "bg-chart-1",
      "bg-chart-2",
      "bg-chart-3",
      "bg-chart-4",
      "bg-chart-5",
      "bg-primary",
    ]
    const toneCount = toneTile.length

    const expertiseIcons = [
      // Frontend
      "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      // Backend
      "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
      // Cloud
      "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
      // Performance
      "M13 10V3L4 14h7v7l9-11h-7z",
      // Testing
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      // Leadership
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    ]

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ClockIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const SparkIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )

    const StarSolid = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )

    const CalendarIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )

    const PinIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-6", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const TrophyIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )

    const GithubIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-6", className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    )

    const TwitterIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-6", className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )

    const LinkedinIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-6", className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )

    const DevtoIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-6", className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6.1v4.06h.45c.4 0 .69-.08.87-.24.18-.17.27-.41.27-.72 0-.32-.09-.56-.27-.72v.01zM19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9.15 9.07h-1.96V8.23h1.96c.73 0 1.36.26 1.89.78.53.52.79 1.16.79 1.92 0 .76-.26 1.4-.79 1.92-.53.52-1.16.78-1.89.78v-.01zM18 13.74c0 .5-.39.89-.88.89h-2.52c-.49 0-.88-.39-.88-.89V8.24c0-.5.39-.89.88-.89h2.52c.49 0 .88.39.88.89v5.5zm-5.32-2.5l2.05 3.39h-1.66l-1.04-1.83-.96 1.83H10.8l2.08-3.39v-.01zm-3.86-.72c0 .28-.09.52-.27.72-.18.16-.46.24-.84.24H6.1V8.23h.47c.4 0 .69.08.87.24.18.17.27.41.27.72v2.27z" />
      </svg>
    )

    const socialIcon = (name: string, className?: string) => {
      const key = name.toLowerCase()
      if (key.includes("twitter") || key === "x")
        return <TwitterIcon className={className} />
      if (key.includes("linkedin")) return <LinkedinIcon className={className} />
      if (key.includes("dev")) return <DevtoIcon className={className} />
      return <GithubIcon className={className} />
    }

    const Wordmark = ({ className }: { className?: string }) => (
      <span className={cn("font-black tracking-tight text-foreground", className)}>
        {brand}
        <span className="text-primary">{brandSuffix}</span>
      </span>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button type="button" onClick={() => go(nav[0])}>
                <Wordmark className="text-xl lg:text-2xl" />
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div
              id="mobile-menu"
              className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
            >
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    go(label)
                  }}
                  className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </nav>

        <main className="pt-16 lg:pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden pb-20 pt-16 lg:pb-32 lg:pt-28">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
            <div className="pointer-events-none absolute right-0 top-20 size-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-20 size-72 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                    {heroLead}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>{" "}
                    {heroTrail}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ChevronDown className="ml-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border px-6 py-3 text-base font-semibold text-foreground transition-all hover:border-border hover:bg-card"
                    >
                      <GithubIcon className="mr-2 size-5" />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 flex items-center gap-8 text-muted-foreground">
                    {heroStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 && <span className="h-10 w-px bg-border" />}
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {s.value}
                          </div>
                          <div className="text-sm">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/30 to-accent/30 blur-2xl" />
                  <Image
                    alt={portraitAlt}
                    w={800}
                    h={1000}
                    className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                        <CheckIcon />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-card-foreground">
                          {statusLabel}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {statusValue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust / logos */}
          <section className="border-y border-border bg-muted/50 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <span
                    key={logo}
                    className={cn(
                      "mx-auto text-center text-lg font-black tracking-tight text-foreground grayscale transition-all hover:grayscale-0",
                      i >= 4 && "hidden lg:block",
                    )}
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Technical expertise */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight lg:text-5xl">
                  {expertiseHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{expertiseDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {expertiseItems.map((item, i) => (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 lg:p-8"
                    >
                      <div
                        className={cn(
                          "mb-6 flex size-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                          toneTile[i % toneCount],
                        )}
                      >
                        <svg
                          className="size-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={expertiseIcons[i % expertiseIcons.length]} />
                        </svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* Selected projects */}
          <section className="bg-muted/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="mb-4 text-4xl font-black tracking-tight lg:text-5xl">
                    {projectsHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{projectsDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(projectsCta)}
                  className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {projectsCta}
                  <ArrowRight className="ml-2" />
                </button>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {projectItems.map((proj) => (
                  <article
                    key={proj.title}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30"
                  >
                    <div className="aspect-video overflow-hidden">
                      <Image
                        alt={proj.imageAlt}
                        w={800}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 lg:p-8">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {proj.tags.map((tag, ti) => (
                            <span
                              key={tag}
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium",
                                toneTile[ti % toneCount],
                              )}
                            >
                              {tag}
                            </span>
                        ))}
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-card-foreground transition-colors group-hover:text-primary">
                        {proj.title}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {proj.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ClockIcon />
                          {proj.launched}
                        </span>
                        <span className="flex items-center gap-1">
                          <SparkIcon />
                          {proj.metric}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Open source */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-4xl font-black tracking-tight lg:text-5xl">
                    {osHeading}
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">{osDesc}</p>

                  <div className="space-y-6">
                    {osItems.map((repo, i) => (
                        <button
                          key={repo.name}
                          type="button"
                          onClick={() => go(repo.name)}
                          className="flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30"
                        >
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <GithubIcon className={cn("size-6", toneText[i % toneCount])} />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-3">
                              <h3 className="text-lg font-bold text-card-foreground">
                                {repo.name}
                              </h3>
                              <span className="rounded bg-chart-4/10 px-2 py-0.5 text-xs font-medium text-chart-4">
                                {repo.stars}
                              </span>
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              {repo.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span
                                  className={cn(
                                    "size-2 rounded-full",
                                    toneDot[i % toneCount],
                                  )}
                                />
                                {repo.language}
                              </span>
                              <span>{repo.license}</span>
                            </div>
                          </div>
                        </button>
                    ))}
                  </div>

                  <div className="mt-8 rounded-xl border border-primary/20 bg-primary/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <TrophyIcon />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {osHighlightTitle}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {osHighlightText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
                  <Image
                    alt={osImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="relative w-full rounded-2xl object-cover shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-muted/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-card p-8 text-center"
                  >
                    <div className="mb-2 text-5xl font-black text-primary lg:text-6xl">
                      {s.value}
                    </div>
                    <div className="mb-1 text-lg font-semibold text-card-foreground">
                      {s.label}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t, i) => (
                  <div
                    key={t.name}
                    className={cn(
                      "rounded-2xl border border-border bg-card p-6 lg:p-8",
                      i >= 5 && "hidden lg:block",
                    )}
                  >
                    <div className="mb-4 flex gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <StarSolid key={si} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/50 py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-card transition-all open:border-primary/30"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-8 text-lg font-semibold text-card-foreground">
                        {item.question}
                      </h3>
                      <span className="transition-transform group-open:rotate-180">
                        <ChevronDown className="text-muted-foreground" />
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

          {/* Contact CTA */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent">
                <div className="relative px-8 py-16 text-center lg:px-16 lg:py-24">
                  <h2 className="mb-6 text-4xl font-black tracking-tight text-primary-foreground lg:text-5xl xl:text-6xl">
                    {contactHeading}
                  </h2>
                  <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 lg:text-xl">
                    {contactDesc}
                  </p>

                  <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(contactPrimary)}
                      className="inline-flex items-center rounded-full bg-background px-8 py-4 text-lg font-semibold text-primary shadow-xl transition-all hover:scale-105 hover:bg-background/90"
                    >
                      <MailIcon className="mr-3" />
                      {contactPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(contactSecondary)}
                      className="inline-flex items-center rounded-full border-2 border-primary-foreground/30 px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
                    >
                      <CalendarIcon className="mr-3" />
                      {contactSecondary}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    {contactSocials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                      >
                        {socialIcon(social)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 inline-block"
                >
                  <Wordmark className="text-2xl" />
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                    >
                      {socialIcon(social, "size-5")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerLinksTitle}
                </h4>
                <ul className="space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <MailIcon className="size-4" />
                      {footerEmail}
                    </button>
                  </li>
                  <li>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <PinIcon />
                      {footerLocation}
                    </span>
                  </li>
                  <li>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ClockIcon />
                      {footerTimezone}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}
                {brandSuffix}. {footerNote}
              </p>
              <div className="flex items-center gap-6 text-sm">
                {footerLegal.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => go(item)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
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
