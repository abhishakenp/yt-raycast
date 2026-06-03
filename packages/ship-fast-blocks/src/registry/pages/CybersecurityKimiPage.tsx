import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CybersecurityKimiPage — a complete, self-contained enterprise CYBERSECURITY
 * platform landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "SentinelGuard" design: a
 * crisp, trustworthy, light corporate aesthetic with a slate/near-black brand
 * surface for high-contrast stat and CTA bands. It pairs a split hero (live SOC
 * pill + shield logo + dual CTAs + a floating "Threat Blocked" alert card over a
 * command-center photo) with a trust-logo strip, a dark real-time threat-intel
 * stats band, a 6-up security-capability grid, a 3-step deployment timeline, a
 * platform screenshot gallery, a 3-tier pricing table (with a highlighted
 * "Professional" plan), a 6-up CISO testimonial wall with star ratings, an
 * accordion FAQ, a dark final demo CTA, and a 5-column mega-footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * CTA, pricing button, FAQ row, footer link and social routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const CybersecurityKimiPage = defineComponent({
  name: "CybersecurityKimiPage",
  description:
    "Complete enterprise CYBERSECURITY / security-platform LANDING page with a crisp, trustworthy corporate aesthetic: clean light surfaces, a dark slate brand band for stats and CTAs, shield iconography and a live-monitoring vibe. Includes a split hero (SOC-certified live pill, shield logo, dual CTAs, trust microcopy, and a floating 'Threat Blocked' alert card over a security command-center photo), an enterprise trust-logo strip, a dark real-time threat-intelligence stats band (threats blocked, response time, uptime SLA, countries, breach cost savings), a 6-up security capabilities grid (AI threat detection, zero-trust, cloud security posture, 24/7 SOC, compliance automation, API security), a 3-step deploy-in-minutes timeline with a code snippet, a platform-screenshot gallery, a 3-tier pricing table with a highlighted Professional plan, a 6-card CISO/security-leader testimonial wall with 5-star ratings and avatars, an accordion FAQ, a dark final demo CTA, and a 5-column mega-footer with social links. Use as the ROOT/home page for cybersecurity vendors, SOC/MDR/XDR/SIEM providers, threat-detection, zero-trust, cloud-security, compliance-automation, or any B2B security SaaS when an authoritative, conversion-focused enterprise page with strong social proof is wanted. Supply content only — brand, nav, hero, logos, stats, features, steps, gallery, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
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
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust microcopy chips under the CTAs. */
        proofs: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating alert card over the hero image. */
        alertTitle: z.string().optional(),
        alertSubtitle: z.string().optional(),
        alertMeta: z.string().optional(),
      })
      .optional(),
    /** Enterprise trust-logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        /** Logo wordmark labels (rendered as styled text, not brand assets). */
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark real-time threat-intelligence stats band. */
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
        secondary: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Security capabilities grid. */
    features: z
      .object({
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
        /** Inline code snippet shown under step 1. */
        snippet: z.string().optional(),
        /** Checklist chips shown under step 2. */
        checklist: z.array(z.string()).optional(),
        /** Live-status label shown under step 3. */
        liveLabel: z.string().optional(),
      })
      .optional(),
    /** Platform screenshot gallery. */
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
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark final demo CTA. */
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
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
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
      : ["Platform", "Solutions", "Pricing", "Resources"]

    const heroBadge = props.hero?.badge ?? "Now SOC 2 Type II Certified"
    const heroHeading =
      props.hero?.heading ?? "Security that never sleeps, so you can"
    const heroSub =
      props.hero?.subheading ??
      "SentinelGuard's AI-powered platform detected and neutralized 2.4 million threats last quarter for Fortune 500 companies. Our 24/7 Security Operations Center monitors your infrastructure while you focus on growth."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Live Demo"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Platform"
    const heroProofs = props.hero?.proofs?.length
      ? props.hero.proofs
      : ["14-day free trial", "No credit card required"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Cybersecurity command center with multiple monitors displaying threat monitoring dashboards and network security visualizations"
    const alertTitle = props.hero?.alertTitle ?? "Threat Blocked"
    const alertSubtitle = props.hero?.alertSubtitle ?? "Ransomware attempt"
    const alertMeta = props.hero?.alertMeta ?? "Just now • Acme Corp infrastructure"

    const logosHeading =
      props.logos?.heading ?? "Trusted by security teams at leading enterprises"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Google", "Amazon", "Microsoft", "Apple", "Netflix", "Tesla"]

    const statsHeading = props.stats?.heading ?? "Real-time threat intelligence"
    const statsDesc =
      props.stats?.description ??
      "Our global security network processes billions of events daily"
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          {
            value: "2.4M+",
            label: "Threats blocked this quarter",
            note: "+18% vs last quarter",
          },
          {
            value: "847ms",
            label: "Average threat response time",
            note: "-23% improvement",
          },
          {
            value: "99.99%",
            label: "Platform uptime SLA",
            note: "24/7/365 monitoring",
          },
          {
            value: "156",
            label: "Countries protected",
            note: "Global SOC coverage",
          },
        ]
    const statsSecondary = props.stats?.secondary?.length
      ? props.stats.secondary
      : [
          {
            value: "$4.2M",
            label: "Average customer cost savings from prevented breaches (2024)",
          },
          {
            value: "3,847",
            label: "Zero-day vulnerabilities discovered and patched",
          },
          {
            value: "12TB",
            label: "Threat intelligence data processed daily",
          },
        ]

    const featuresHeading = props.features?.heading ?? "Complete security coverage"
    const featuresDesc =
      props.features?.description ??
      "From endpoint to cloud, our unified platform protects every layer of your digital infrastructure with enterprise-grade precision."
    const featuresCta = props.features?.cta ?? "Learn more"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "AI Threat Detection",
            description:
              "Machine learning models trained on 50B+ security events detect anomalies in real-time with 99.7% accuracy. Identifies zero-day exploits before they spread.",
          },
          {
            title: "Zero Trust Architecture",
            description:
              "Never trust, always verify. Multi-factor authentication, device posture checks, and least-privilege access for every user and endpoint.",
          },
          {
            title: "Cloud Security Posture",
            description:
              "Continuous monitoring of AWS, Azure, and GCP configurations. Auto-remediation for 500+ compliance checks including CIS benchmarks.",
          },
          {
            title: "24/7 SOC Monitoring",
            description:
              "Expert security analysts in 4 global centers monitor your environment around the clock. Average alert-to-response time under 15 minutes.",
          },
          {
            title: "Compliance Automation",
            description:
              "Automated evidence collection and reporting for SOC 2, ISO 27001, PCI DSS, HIPAA, and GDPR. Reduce audit prep time by 80%.",
          },
          {
            title: "API Security",
            description:
              "Protect your APIs from OWASP Top 10 threats. Real-time schema validation, anomaly detection, and bot mitigation for GraphQL and REST.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Deploy in minutes, not months"
    const stepsDesc =
      props.steps?.description ??
      "Get enterprise-grade protection without the enterprise-grade complexity"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your infrastructure",
            description:
              "One-line agent deployment or API integration. Support for AWS, Azure, GCP, Kubernetes, and on-premise environments. No configuration changes required.",
          },
          {
            title: "Discover & baseline",
            description:
              "Our platform automatically maps your assets, identifies vulnerabilities, and establishes behavioral baselines. Full visibility in under 24 hours.",
          },
          {
            title: "Start protecting",
            description:
              "Threat detection activates immediately. Customize policies, set up notifications, and access your dashboard. SOC team available 24/7 for escalation.",
          },
        ]
    const stepSnippet =
      props.steps?.snippet ?? "curl -sL https://sg.io/install | bash"
    const stepChecklist = props.steps?.checklist?.length
      ? props.steps.checklist
      : ["Asset inventory", "Risk scoring", "Baseline profiles"]
    const stepLiveLabel = props.steps?.liveLabel ?? "Live protection active"

    const galleryHeading = props.gallery?.heading ?? "Platform overview"
    const galleryDesc =
      props.gallery?.description ??
      "Unified security management from a single pane of glass"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Threat Intelligence Dashboard",
            description:
              "Real-time global threat map with attack vector analysis and severity scoring.",
          },
          {
            title: "Vulnerability Management",
            description:
              "Continuous scanning with prioritized remediation recommendations.",
          },
          {
            title: "Incident Response",
            description:
              "Automated playbooks with team collaboration and audit trails.",
          },
          {
            title: "Cloud Security Posture",
            description:
              "Multi-cloud configuration monitoring with auto-remediation.",
          },
          {
            title: "Zero Trust Network",
            description:
              "Micro-segmentation with identity-based access controls.",
          },
          {
            title: "Compliance Reports",
            description:
              "Automated evidence collection for SOC 2, ISO 27001, and more.",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your security needs. All plans include our core AI detection engine."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            blurb: "For small teams getting started with security",
            price: "$999",
            period: "/month",
            cta: "Start free trial",
            features: [
              "Up to 100 endpoints",
              "Email support (business hours)",
              "Basic threat detection",
              "Weekly security reports",
              "1 cloud account",
            ],
          },
          {
            name: "Professional",
            blurb: "For growing companies with complex infrastructure",
            price: "$4,999",
            period: "/month",
            cta: "Start free trial",
            featured: true,
            badge: "MOST POPULAR",
            features: [
              "Up to 1,000 endpoints",
              "24/7 phone & email support",
              "Advanced AI threat detection",
              "Real-time security dashboard",
              "5 cloud accounts",
              "Compliance reporting (SOC 2, ISO)",
              "API access",
            ],
          },
          {
            name: "Enterprise",
            blurb: "For large organizations with custom requirements",
            price: "Custom",
            cta: "Contact sales",
            features: [
              "Unlimited endpoints",
              "Dedicated account manager",
              "Custom AI model training",
              "Unlimited cloud accounts",
              "On-premise deployment option",
              "Custom SLA & response times",
              "White-glove onboarding",
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by security leaders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what CISOs and security teams say about SentinelGuard"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              '"SentinelGuard detected a sophisticated APT attack that our previous vendor missed for 3 weeks. Their AI caught the lateral movement within 4 minutes. That response time saved us millions."',
            name: "Michael Chen",
            role: "CISO, FinTech Solutions Inc.",
            avatarAlt:
              "Professional headshot of Michael Chen, a middle-aged Asian-American male executive with short black hair wearing a navy suit",
          },
          {
            quote:
              '"The compliance automation alone paid for the platform in 3 months. What used to take our team 2 weeks of manual work for SOC 2 audits now happens automatically. Game changer."',
            name: "Sarah Williams",
            role: "VP Security, HealthCloud Systems",
            avatarAlt:
              "Professional headshot of Sarah Williams, a professional Caucasian woman with shoulder-length brown hair wearing business attire",
          },
          {
            quote:
              '"We evaluated 12 vendors before choosing SentinelGuard. Their zero-trust implementation was the most seamless, and their SOC team\'s expertise is unmatched. Our mean time to respond dropped 87%."',
            name: "David Rodriguez",
            role: "Director of Security, RetailMax Corp",
            avatarAlt:
              "Professional headshot of David Rodriguez, a Hispanic male security director in his 40s with glasses and a beard wearing a dark suit",
          },
          {
            quote:
              '"The cloud security posture management caught 147 misconfigurations in our first week. Without SentinelGuard, we would have been exposed to data exfiltration through S3 bucket leaks."',
            name: "Emily Watson",
            role: "Cloud Security Lead, DataStream AI",
            avatarAlt:
              "Professional headshot of Emily Watson, a young Caucasian woman with blonde hair pulled back wearing a professional blazer",
          },
          {
            quote:
              '"Their API security stopped a credential stuffing attack on our payment endpoints that would have compromised 40,000 customer accounts. The automated blocking kicked in within seconds."',
            name: "James Park",
            role: "CTO, PayFlow Technologies",
            avatarAlt:
              "Professional headshot of James Park, an Asian male CTO in his 30s with short black hair wearing a casual button-up shirt",
          },
          {
            quote:
              '"After migrating from a legacy SIEM, we reduced our security tooling costs by 60% while improving detection accuracy. The unified platform eliminated data silos between our security tools."',
            name: "Robert Kim",
            role: "IT Director, Global Logistics Partners",
            avatarAlt:
              "Professional headshot of Robert Kim, a Korean-American male IT director in his 50s with graying hair wearing glasses and a suit",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about SentinelGuard"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How quickly can we deploy SentinelGuard?",
            a: "Most customers achieve full deployment within 24-48 hours. The lightweight agent installs with a single command and requires no system restarts. Cloud integrations connect via read-only IAM roles in under 10 minutes. For enterprise deployments across multiple regions, our professional services team ensures complete coverage within one week.",
          },
          {
            q: "What compliance standards do you support?",
            a: "SentinelGuard provides automated compliance monitoring and reporting for SOC 2 Type I & II, ISO 27001, PCI DSS, HIPAA, GDPR, CCPA, NIST CSF, and CIS Controls. Our platform continuously checks your configurations against these frameworks and provides auditor-ready evidence packages. We maintain our own SOC 2 Type II certification and are PCI DSS Level 1 compliant.",
          },
          {
            q: "How does your AI threat detection work?",
            a: "Our AI models are trained on over 50 billion security events from our global customer base. We use a combination of supervised learning for known threats and unsupervised anomaly detection for zero-day attacks. The system analyzes endpoint behavior, network traffic patterns, and user activity to detect threats with 99.7% accuracy and a false positive rate under 0.1%. Models update automatically every 4 hours based on new threat intelligence.",
          },
          {
            q: "Can we keep data on-premise?",
            a: "Yes, our Enterprise plan offers on-premise deployment for organizations with strict data sovereignty requirements. The on-premise version includes all platform features and can operate air-gapped for highly sensitive environments. We also offer hybrid deployments where sensitive data remains on-premise while threat intelligence updates come from our cloud. Professional services are included for on-premise installations.",
          },
          {
            q: "What is your SLA for threat response?",
            a: "We guarantee an average threat detection-to-notification time of under 5 minutes for critical alerts. Our automated response playbooks can isolate compromised endpoints within seconds. For customers with our SOC add-on, human analysts investigate high-priority alerts within 15 minutes, 24/7/365. Enterprise customers receive custom SLAs with dedicated response teams and executive escalation paths for critical incidents.",
          },
          {
            q: "How do you handle false positives?",
            a: "Our AI models achieve a false positive rate below 0.1% through continuous learning from analyst feedback. When you dismiss an alert, the system learns your environment's normal behavior patterns. You can also create custom suppression rules based on asset tags, user groups, or time windows. Professional and Enterprise plans include access to our ML tuning team who will customize detection thresholds for your specific environment during onboarding.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to see SentinelGuard in action?"
    const ctaDesc =
      props.cta?.description ??
      "Join 500+ enterprises protecting their infrastructure with AI-powered security. Schedule a personalized demo with our security experts."
    const ctaPrimary = props.cta?.primaryCta ?? "Schedule Live Demo"
    const ctaSecondary = props.cta?.secondaryCta ?? "Start 14-Day Free Trial"
    const ctaNote =
      props.cta?.note ??
      "No credit card required. Full platform access. Cancel anytime."

    const footerTagline =
      props.footer?.tagline ??
      "AI-powered cybersecurity platform protecting enterprises worldwide since 2018."
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Platform",
            links: [
              "Threat Detection",
              "Cloud Security",
              "Zero Trust",
              "Compliance",
              "API Security",
            ],
          },
          {
            title: "Solutions",
            links: [
              "Enterprise",
              "Financial Services",
              "Healthcare",
              "Retail",
              "Government",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Blog", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "System Status",
              "Security",
              "Privacy Policy",
            ],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Terms of Service", "Privacy Policy", "Cookie Settings"]
    const footerSocial = props.footer?.social?.length
      ? props.footer.social
      : ["Twitter", "LinkedIn", "GitHub"]

    const [openFaq, setOpenFaq] = useState<number | null>(0)

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

    // Feature icon set (rotates token colors; decorative inline SVGs).
    const featureIcons = [
      // shield (AI threat detection)
      <path
        key="shield"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />,
      // lock (zero trust)
      <path
        key="lock"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />,
      // cloud (cloud security)
      <path
        key="cloud"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />,
      // chart (SOC monitoring)
      <path
        key="chart"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />,
      // document (compliance)
      <path
        key="doc"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />,
      // code (API security)
      <path
        key="code"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <ShieldMark className="size-8 text-foreground" />
                <span className="text-xl font-bold tracking-tight">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Contact Sales")}
                  className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Contact Sales
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-primary px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-xl border border-input bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroProofs.map((proof) => (
                      <span key={proof} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        {proof}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-muted to-accent"
                  />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl bg-card p-4 shadow-xl sm:p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                        <svg
                          className="size-5 text-destructive"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {alertTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alertSubtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{alertMeta}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust logos */}
          <section className="border-y border-border bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="mx-auto text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-100"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (dark brand surface) */}
          <section className="bg-foreground text-background">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {statsHeading}
                </h2>
                <p className="text-lg text-background/60">{statsDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold sm:text-5xl lg:text-6xl">
                      {s.value}
                    </div>
                    <div className="text-background/60">{s.label}</div>
                    <div className="mt-2 text-sm text-primary">{s.note}</div>
                  </div>
                ))}
              </div>
              <div className="mt-16 border-t border-background/20 pt-16">
                <div className="grid gap-8 text-center md:grid-cols-3">
                  {statsSecondary.map((s) => (
                    <div key={s.label}>
                      <p className="mb-1 text-2xl font-bold">{s.value}</p>
                      <p className="text-sm text-background/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features grid */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-border/80 hover:shadow-lg"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary">
                      <svg
                        className="size-7 text-foreground transition-colors group-hover:text-primary-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        {featureIcons[i % featureIcons.length]}
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="flex items-center gap-1 font-medium text-foreground hover:underline"
                    >
                      {featuresCta}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden w-full border-t-2 border-dashed border-border md:block"
                      />
                    )}
                    <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-foreground text-2xl font-bold text-background">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    {i === 0 && (
                      <div className="mt-4 rounded-lg border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
                        {stepSnippet}
                      </div>
                    )}
                    {i === 1 && (
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {stepChecklist.map((c) => (
                          <li key={c} className="flex items-center gap-2">
                            <Check className="size-4 text-primary" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                    {i === 2 && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="size-2 animate-pulse rounded-full bg-primary" />
                        {stepLiveLabel}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group overflow-hidden rounded-2xl border border-border text-left shadow-lg"
                  >
                    <Image
                      alt={item.title}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border p-8",
                      plan.featured
                        ? "border-border bg-foreground text-background md:-translate-y-4"
                        : "border-border bg-card text-card-foreground",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                        {plan.badge}
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        plan.featured ? "text-background" : "text-card-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        plan.featured
                          ? "text-background/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.blurb}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span
                          className={cn(
                            plan.featured
                              ? "text-background/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul
                      className={cn(
                        "mb-8 space-y-3 text-sm",
                        plan.featured
                          ? "text-background/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-input text-foreground hover:bg-muted",
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
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
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
                    className="rounded-2xl border border-border bg-muted/50 p-8"
                  >
                    <div
                      className="mb-4 flex gap-1"
                      aria-label="5 star rating"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div
                      key={item.q}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full cursor-pointer items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="text-lg font-semibold">{item.q}</span>
                        <svg
                          className={cn(
                            "size-5 shrink-0 text-muted-foreground transition-transform",
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
                        <div className="px-6 pb-6 text-muted-foreground">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Final CTA (dark band) */}
          <section className="bg-foreground py-24 text-background">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/60">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-xl bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-xl border border-background/40 bg-transparent px-8 py-4 text-lg font-semibold text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <ShieldMark className="size-8 text-background" />
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocial.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-sm font-medium transition-colors hover:text-background"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {brand} Security, Inc. {footerNote}
              </p>
              <div className="flex gap-6 text-sm">
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
