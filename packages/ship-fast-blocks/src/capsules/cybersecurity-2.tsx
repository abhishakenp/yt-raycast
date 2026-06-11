import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CybersecurityKimiPage2 — TEMPLATE VARIANT 2 for the cybersecurity category.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "SentinelGuard" design rendered
 * in a DARK, command-center / SOC aesthetic — a deliberately DISTINCT sibling to
 * the light corporate CybersecurityKimiPage. The whole page sits on a near-black
 * brand surface (`bg-foreground text-background`) with a primary "cyan" glow,
 * grid-glow blooms, and a terminal-style live-dashboard mockup in the hero
 * (traffic-light chrome, animated "Active Threats Blocked" meter, malware /
 * phishing counters, and a pulsing real-time threat-map). It pairs that split
 * hero (live SOC-2 pill, shield logo, dual CTAs, floating "Uptime SLA" chip,
 * trust microcopy) with a wordmark trust strip, a 4-up threat-intelligence stats
 * band, a sticky-split 6-up security-capabilities grid, a 3-step deploy timeline
 * with connector lines, a 5-tile SOC screenshot gallery, a 3-tier pricing table
 * (highlighted "Professional"), a 3-card CISO testimonial wall with star ratings,
 * an accordion FAQ, a glowing final demo CTA, and a 5-column mega-footer.
 */
export const CybersecurityKimiPage2 = defineCapsule({
  name: "CybersecurityKimiPage2",
  description:
    "Alternative / SECOND-STYLE complete enterprise CYBERSECURITY platform LANDING page — a DARK, neon-cyan SOC / command-center variant and visually distinct sibling to CybersecurityKimiPage (use this when a moody, hacker-grade, terminal-style dark security site is wanted instead of the clean light corporate look). Near-black brand surface with glowing accent blooms and a grid backdrop. Includes a split hero with a live SOC-2-certified pill, shield-logo brand, dual CTAs, trust microcopy, and a terminal-chrome live-dashboard mockup card (animated 'Active Threats Blocked' meter, malware/phishing counters, pulsing real-time threat map) plus a floating 99.99% Uptime SLA chip; an enterprise wordmark trust strip; a 4-up real-time threat-intelligence stats band (threats blocked daily, avg response time, endpoints protected, detection accuracy); a sticky-split 6-up security-capabilities grid (endpoint protection, network detection, cloud security, identity security, email security, threat intelligence); a 3-step deploy-in-minutes timeline with connectors and integration chips; a 5-tile Security Operations Center screenshot gallery; a 3-tier pricing table with a highlighted Professional plan; a CISO/security-leader testimonial wall with 5-star ratings and avatars; an accordion FAQ; a glowing final demo CTA; and a 5-column mega-footer with social links. Use as the ROOT/home page for cybersecurity vendors, SOC/MDR/XDR/SIEM providers, threat-detection, EDR/XDR, zero-trust, cloud-security, endpoint-protection, or any B2B security SaaS wanting a dark, authoritative, conversion-focused enterprise page. Supply content only — brand, nav, hero, logos, stats, features, steps, gallery, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        proofs: z.array(z.string()).optional(),
        /** Terminal dashboard mockup labels. */
        dashboardTag: z.string().optional(),
        threatsLabel: z.string().optional(),
        threatsValue: z.string().optional(),
        malwareLabel: z.string().optional(),
        malwareValue: z.string().optional(),
        malwareDelta: z.string().optional(),
        phishingLabel: z.string().optional(),
        phishingValue: z.string().optional(),
        phishingDelta: z.string().optional(),
        mapLabel: z.string().optional(),
        mapImageAlt: z.string().optional(),
        liveLabel: z.string().optional(),
        floatValue: z.string().optional(),
        floatLabel: z.string().optional(),
      })
      .optional(),
    /** Enterprise trust-logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Threat-intelligence stats band. */
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** Security capabilities grid (sticky-split). */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Deploy-in-minutes timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        /** Integration chips shown under step 1. */
        chips: z.array(z.string()).optional(),
        /** Note shown under step 2. */
        discoverNote: z.string().optional(),
        /** Note shown under step 3. */
        protectNote: z.string().optional(),
      })
      .optional(),
    /** Security Operations Center screenshot gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              features: z.array(z.string()),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** CISO / security-leader testimonial wall. */
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
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Glowing final demo CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Mega-footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        note: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        legal: z.array(z.string()).optional(),
        social: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "SentinelGuard"
    const nav = props.nav?.length
      ? props.nav
      : ["Platform", "Solutions", "Pricing", "Resources", "Company"]

    const heroBadge = props.hero?.badge ?? "Now SOC 2 Type II Certified"
    const heroHeading =
      props.hero?.heading ?? "Defend Your Enterprise from"
    const heroHeadingAccent =
      props.hero?.headingAccent ?? "Advanced Threats"
    const heroSub =
      props.hero?.subheading ??
      "AI-powered threat detection and response platform protecting Fortune 500 companies. Detect breaches in milliseconds, not months."
    const heroPrimary = props.hero?.primaryCta ?? "Start Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroProofs = props.hero?.proofs?.length
      ? props.hero.proofs
      : ["14-day free trial", "No credit card required"]
    const dashboardTag =
      props.hero?.dashboardTag ?? "sentinelguard_dashboard_v3.2"
    const threatsLabel =
      props.hero?.threatsLabel ?? "Active Threats Blocked (24h)"
    const threatsValue = props.hero?.threatsValue ?? "2.4M"
    const malwareLabel = props.hero?.malwareLabel ?? "Malware Detected"
    const malwareValue = props.hero?.malwareValue ?? "847"
    const malwareDelta = props.hero?.malwareDelta ?? "+12% from yesterday"
    const phishingLabel = props.hero?.phishingLabel ?? "Phishing Blocked"
    const phishingValue = props.hero?.phishingValue ?? "15,234"
    const phishingDelta = props.hero?.phishingDelta ?? "-5% from yesterday"
    const mapLabel = props.hero?.mapLabel ?? "Real-time Threat Map"
    const mapImageAlt =
      props.hero?.mapImageAlt ??
      "Dark abstract visualization of global network security monitoring with glowing nodes"
    const liveLabel = props.hero?.liveLabel ?? "LIVE MONITORING"
    const floatValue = props.hero?.floatValue ?? "99.99%"
    const floatLabel = props.hero?.floatLabel ?? "Uptime SLA"

    const logosHeading =
      props.logos?.heading ?? "Trusted by Security Teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Dropbox", "Airbnb", "Google", "Meta", "Pinterest", "Stripe"]

    const statsHeading = props.stats?.heading ?? "Threat Intelligence at Scale"
    const statsDesc =
      props.stats?.description ??
      "Real-time data from our global sensor network protecting enterprises worldwide"
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          {
            value: "2.4B+",
            label: "Threats Blocked Daily",
            note: "+18% from last month",
          },
          {
            value: "14ms",
            label: "Avg. Response Time",
            note: "Industry-leading speed",
          },
          {
            value: "150K+",
            label: "Endpoints Protected",
            note: "Across 87 countries",
          },
          {
            value: "99.99%",
            label: "Detection Accuracy",
            note: "False positive rate: 0.001%",
          },
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Platform Overview"
    const featuresHeading =
      props.features?.heading ??
      "Complete Security Coverage for Modern Enterprises"
    const featuresDesc =
      props.features?.description ??
      "Our unified platform combines AI-powered detection, automated response, and comprehensive visibility across your entire attack surface."
    const featuresCta =
      props.features?.cta ?? "View full platform documentation"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Endpoint Protection",
            description:
              "Advanced threat detection with behavioral AI that stops zero-day attacks before they execute.",
          },
          {
            title: "Network Detection",
            description:
              "Deep packet inspection and network traffic analysis to identify lateral movement.",
          },
          {
            title: "Cloud Security",
            description:
              "CSPM and CIEM capabilities securing AWS, Azure, and GCP environments with compliance monitoring.",
          },
          {
            title: "Identity Security",
            description:
              "Zero Trust access controls with risk-based authentication and privileged access management.",
          },
          {
            title: "Email Security",
            description:
              "AI-powered phishing detection, business email compromise prevention, and sandboxing.",
          },
          {
            title: "Threat Intelligence",
            description:
              "Global threat feeds, dark web monitoring, and attribution analysis from our research team.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Deploy in Minutes, Not Months"
    const stepsDesc =
      props.steps?.description ??
      "Get enterprise-grade protection up and running with our streamlined deployment process"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect",
            description:
              "Integrate with your existing infrastructure using our 200+ pre-built connectors for cloud, on-premise, and hybrid environments.",
          },
          {
            title: "Discover",
            description:
              "Our AI automatically discovers all assets, identifies vulnerabilities, and maps your attack surface in real-time.",
          },
          {
            title: "Protect",
            description:
              "ML-powered detection engines begin blocking threats immediately with automated playbooks for incident response.",
          },
        ]
    const stepChips = props.steps?.chips?.length
      ? props.steps.chips
      : ["AWS", "Azure", "GCP", "+197 more"]
    const stepDiscoverNote =
      props.steps?.discoverNote ?? "Complete visibility in 24 hours"
    const stepProtectNote =
      props.steps?.protectNote ?? "Active protection from day one"

    const galleryHeading =
      props.gallery?.heading ?? "Security Operations Center"
    const galleryDesc =
      props.gallery?.description ??
      "See how our unified console gives your team complete visibility and control"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Unified Dashboard",
            description:
              "Single pane of glass for all security operations with customizable widgets and real-time alerting.",
          },
          {
            title: "Asset Discovery",
            description:
              "Automated inventory management with risk scoring for all cloud and on-premise infrastructure.",
          },
          {
            title: "Threat Hunting",
            description:
              "Proactive threat hunting with advanced query language and MITRE ATT&CK mapping.",
          },
          {
            title: "Incident Response",
            description:
              "Automated playbooks with one-click remediation and full forensic timeline reconstruction.",
          },
          {
            title: "Collaborative Workflows",
            description:
              "Built-in case management with SLAs, assignment rules, and integration with ServiceNow, Jira, and Slack for streamlined team coordination.",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your organization's security needs"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            blurb: "For small teams getting started with security",
            price: "$8",
            period: "/endpoint/month",
            cta: "Get Started",
            features: [
              "Up to 100 endpoints",
              "Endpoint protection",
              "Email security",
              "8/5 support",
            ],
          },
          {
            name: "Professional",
            blurb: "For growing organizations",
            price: "$15",
            period: "/endpoint/month",
            cta: "Get Started",
            featured: true,
            badge: "Most Popular",
            features: [
              "Up to 1,000 endpoints",
              "Everything in Starter",
              "Network detection",
              "Cloud security",
              "24/7 support",
            ],
          },
          {
            name: "Enterprise",
            blurb: "For large organizations",
            price: "Custom",
            cta: "Contact Sales",
            features: [
              "Unlimited endpoints",
              "Everything in Pro",
              "Identity security",
              "Dedicated CSM",
              "Custom integrations",
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by Security Leaders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what CISOs and security teams say about SentinelGuard"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              '"SentinelGuard detected a sophisticated APT campaign that our previous vendor missed for 3 months. The AI-powered behavioral analysis caught lateral movement within hours of deployment."',
            name: "Michael Chen",
            role: "CISO, TechCorp Industries",
            avatarAlt:
              "Professional headshot of a confident male CISO in his 40s wearing a dark suit",
          },
          {
            quote:
              '"We reduced our mean time to respond from 4 hours to 14 minutes. The automated playbooks handle 80% of incidents without human intervention. Game changer for our lean security team."',
            name: "Sarah Williams",
            role: "VP Security, FinServe Global",
            avatarAlt:
              "Professional headshot of a female cybersecurity director with glasses and confident expression",
          },
          {
            quote:
              '"Compliance used to take weeks of manual work. With SentinelGuard\'s automated reporting, we completed our SOC 2 audit in 3 days. The auditors were impressed with the evidence quality."',
            name: "David Park",
            role: "IT Director, HealthFirst Medical",
            avatarAlt:
              "Professional headshot of a male IT director with beard and friendly expression",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about SentinelGuard"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How long does deployment typically take?",
            a: "Most customers are fully deployed within 24-48 hours. Our cloud-native architecture requires no on-premise hardware, and our 200+ pre-built integrations allow for quick connection to your existing infrastructure. The lightweight agent installs in under 5 minutes per endpoint.",
          },
          {
            q: "What compliance standards do you support?",
            a: "SentinelGuard is SOC 2 Type II certified and supports GDPR, HIPAA, PCI-DSS, ISO 27001, NIST, and CIS Controls. Our platform provides automated compliance reporting with pre-built templates for all major frameworks, making audit preparation significantly faster.",
          },
          {
            q: "How does your pricing work for large enterprises?",
            a: "Enterprise pricing is customized based on endpoint count, data volume, and specific feature requirements. We offer volume discounts for organizations with 10,000+ endpoints. Contact our sales team for a personalized quote that includes dedicated support and custom integration work.",
          },
          {
            q: "Can SentinelGuard replace my existing security tools?",
            a: "SentinelGuard is designed as a comprehensive platform that can replace point solutions for endpoint protection, network detection, cloud security, and SIEM. However, we also integrate seamlessly with existing tools if you prefer a defense-in-depth approach. Our professional services team can help plan your migration strategy.",
          },
          {
            q: "What kind of support do you offer?",
            a: "All plans include technical support with varying SLAs: Starter (8/5, 4-hour response), Professional (24/7, 1-hour response), and Enterprise (24/7, 15-minute response with dedicated CSM). Enterprise customers also get access to our threat research team for proactive hunting assistance.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Secure Your Enterprise?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2,500+ organizations protecting their digital assets with SentinelGuard. Start your free trial today."
    const ctaPrimary = props.cta?.primaryCta ?? "Start 14-Day Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule Demo"
    const ctaNote =
      props.cta?.note ??
      "No credit card required. Full platform access. Cancel anytime."

    const footerTagline =
      props.footer?.tagline ??
      "AI-powered cybersecurity platform protecting enterprises from advanced threats with real-time detection and automated response."
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Platform",
            links: [
              "Endpoint Protection",
              "Network Detection",
              "Cloud Security",
              "Identity Security",
              "Threat Intelligence",
            ],
          },
          {
            title: "Solutions",
            links: [
              "Financial Services",
              "Healthcare",
              "Manufacturing",
              "Government",
              "Education",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Partners", "Contact"],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Security"]
    const footerSocial = props.footer?.social?.length
      ? props.footer.social
      : ["Twitter", "LinkedIn", "GitHub"]

    const [openFaq, setOpenFaq] = useState<number | null>(null)

    // Shield mark — brand logo glyph (decorative inline SVG, token-colored).
    const ShieldMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    )

    // Feature icon set (decorative inline SVGs, token-colored).
    const featureIcons = [
      // shield (endpoint protection)
      <path
        key="shield"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />,
      // globe (network detection)
      <path
        key="globe"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />,
      // document (cloud security)
      <path
        key="doc"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />,
      // lock (identity security)
      <path
        key="lock"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />,
      // mail (email security)
      <path
        key="mail"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />,
      // chart (threat intelligence)
      <path
        key="chart"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />,
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
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 lg:size-10">
                  <ShieldMark className="size-5 text-primary-foreground lg:size-6" />
                </span>
                <span className="text-xl font-bold tracking-tight lg:text-2xl">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-background/70 transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden text-sm text-background/70 transition-colors hover:text-background sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go("Get Demo")}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 lg:px-6 lg:py-2.5"
                >
                  Get Demo
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute right-0 top-1/4 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-1/4 left-0 size-72 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeading}{" "}
                    <span className="bg-gradient-to-r from-primary/80 via-primary to-primary bg-clip-text text-transparent">
                      {heroHeadingAccent}
                    </span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-background/60 lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-primary px-8 py-4 text-center text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/20 bg-background/5 px-8 py-4 text-center text-lg font-semibold text-background transition-all hover:bg-background/10"
                    >
                      <PlayIcon className="size-5" />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-background/50">
                    {heroProofs.map((proof) => (
                      <span key={proof} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        {proof}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Terminal dashboard mockup */}
                <div className="relative">
                  <div className="relative rounded-2xl border border-background/10 bg-gradient-to-br from-background/10 to-background/[0.02] p-6 shadow-2xl lg:p-8">
                    <div className="mb-6 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-destructive" />
                      <span className="size-3 rounded-full bg-chart-4" />
                      <span className="size-3 rounded-full bg-primary" />
                      <span className="ml-4 font-mono text-sm text-background/50">
                        {dashboardTag}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-primary/20 bg-foreground/40 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm text-background/60">
                            {threatsLabel}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {threatsValue}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-background/10">
                          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-primary/70" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-background/10 bg-foreground/40 p-4">
                          <div className="mb-1 text-sm text-background/60">
                            {malwareLabel}
                          </div>
                          <div className="text-xl font-bold text-destructive">
                            {malwareValue}
                          </div>
                          <div className="text-xs text-destructive/70">
                            {malwareDelta}
                          </div>
                        </div>
                        <div className="rounded-lg border border-background/10 bg-foreground/40 p-4">
                          <div className="mb-1 text-sm text-background/60">
                            {phishingLabel}
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {phishingValue}
                          </div>
                          <div className="text-xs text-primary/70">
                            {phishingDelta}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-background/10 bg-foreground/40 p-4">
                        <div className="mb-3 text-sm text-background/60">
                          {mapLabel}
                        </div>
                        <div className="relative h-32 overflow-hidden rounded border border-background/10">
                          <Image
                            alt={mapImageAlt}
                            w={800}
                            h={400}
                            loading="eager"
                            className="absolute inset-0 size-full object-cover opacity-30"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <span className="size-2 animate-pulse rounded-full bg-primary" />
                              <span className="font-mono text-sm text-primary">
                                {liveLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -top-6 rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-4 shadow-xl shadow-primary/30">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-foreground">
                        {floatValue}
                      </div>
                      <div className="text-xs text-primary-foreground/80">
                        {floatLabel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust logos */}
          <section className="border-y border-background/10 bg-background/5">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <p className="mb-12 text-center text-sm font-semibold uppercase tracking-wider text-background/50">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-12">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="mx-auto text-xl font-bold text-background/60 opacity-60 transition-opacity hover:opacity-100"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {statsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-background/60">
                  {statsDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {statItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-background/10 bg-background/5 p-8 text-center"
                  >
                    <div className="mb-2 text-4xl font-bold text-primary lg:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-background/60">{s.label}</div>
                    <div className="mt-2 text-sm text-primary/70">{s.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features grid (sticky-split) */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="lg:sticky lg:top-28">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                    <span className="text-sm font-medium text-primary">
                      {featuresEyebrow}
                    </span>
                  </div>
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {featuresHeading}
                  </h2>
                  <p className="mb-8 text-lg text-background/60">
                    {featuresDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(featuresCta)}
                    className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    {featuresCta}
                    <ArrowRight className="size-5" />
                  </button>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {featureItems.map((item, i) => (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-background/10 bg-background/5 p-6 transition-colors hover:border-primary/50"
                    >
                      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <svg
                          className="size-6 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          {featureIcons[i % featureIcons.length]}
                        </svg>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-sm text-background/60">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-background/5 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-background/60">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-16 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-primary/50 to-transparent md:block"
                      />
                    )}
                    <div className="relative rounded-2xl border border-background/10 bg-foreground p-8">
                      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                      <p className="mb-4 text-background/60">
                        {step.description}
                      </p>
                      {i === 0 && (
                        <div className="flex flex-wrap gap-2">
                          {stepChips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full bg-background/10 px-3 py-1 text-xs text-background/60"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}
                      {i === 1 && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Check className="size-5" />
                          <span>{stepDiscoverNote}</span>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Check className="size-5" />
                          <span>{stepProtectNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-background/60">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className={cn(
                      "group overflow-hidden rounded-2xl border border-background/10 bg-background/5 text-left",
                      i === galleryItems.length - 1 && "md:col-span-2",
                    )}
                  >
                    <div
                      className={cn(
                        "overflow-hidden",
                        i === galleryItems.length - 1
                          ? "aspect-video md:aspect-[2/1]"
                          : "aspect-video",
                      )}
                    >
                      <Image
                        alt={item.title}
                        w={800}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-sm text-background/60">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background/5 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-background/60">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl bg-foreground p-8",
                      plan.featured
                        ? "border-2 border-primary"
                        : "border border-background/10",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        {plan.badge}
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-semibold">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-background/60">{plan.blurb}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-background/60">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 flex-1 space-y-3 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <Check className="size-5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl px-6 py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                          : "border border-background/20 bg-background/5 text-background hover:bg-background/10",
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
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-background/60">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-background/10 bg-background/5 p-8"
                  >
                    <div
                      className="mb-6 flex items-center gap-1"
                      aria-label="5 star rating"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-background/80">
                      {t.quote}
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
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-background/60">
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
          <section className="bg-background/5 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-background/60">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div
                      key={item.q}
                      className="overflow-hidden rounded-2xl border border-background/10 bg-foreground"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-background/5"
                      >
                        <span className="font-semibold">{item.q}</span>
                        <svg
                          className={cn(
                            "size-5 shrink-0 text-background/50 transition-transform",
                            open && "rotate-180",
                          )}
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
                      </button>
                      {open && (
                        <div className="px-6 pb-5 text-background/60">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-foreground to-foreground py-20 lg:py-28">
            <div
              aria-hidden="true"
              className="absolute left-0 top-0 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 size-96 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl xl:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/60">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-xl border border-background/20 bg-background/5 px-8 py-4 text-lg font-semibold text-background transition-all hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-background/10 bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                    <ShieldMark className="size-5 text-primary-foreground" />
                  </span>
                  <span className="text-xl font-bold">{brand}</span>
                </button>
                <p className="mb-6 max-w-xs text-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocial.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="rounded-lg bg-background/10 px-3 py-2 text-sm font-medium text-background/60 transition-colors hover:bg-background/20 hover:text-background"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
                  <ul className="space-y-3 text-sm text-background/60">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {brand} Security Inc. {footerNote}
              </p>
              <div className="flex items-center gap-6 text-sm text-background/50">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
