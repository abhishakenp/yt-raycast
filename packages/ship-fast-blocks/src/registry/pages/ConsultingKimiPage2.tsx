import type { ReactNode } from "react"
import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ConsultingKimiPage2 — SECOND, visually DISTINCT management-consulting LANDING
 * page (sibling/alternative to ConsultingKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Meridian Strategy Partners"
 * design. Where ConsultingKimiPage is a clean light two-column hero with a
 * floating stat card, THIS variant opens BOLD and EDITORIAL: a full-bleed DARK
 * photographic hero (skyscraper image dimmed behind a gradient scrim) with an
 * accent uppercase eyebrow, an oversized headline with a colored highlight
 * word, dual CTAs and an inline 3-up trust-stat row sitting on a hairline.
 * Below: a muted client-logo strip, a colorful 6-up services grid whose icon
 * tiles rotate through chart accent colors, a 2-up large case-study gallery
 * with industry pills and twin metric figures, a 3-up insights/thought-
 * leadership grid with author headshots, a dark brand stats band, an
 * image-tile industries grid with hover captions, a 3-up star-rated
 * testimonials grid, a 4-up leadership/partners headshot grid, a dark
 * full-bleed photographic closing CTA band with consultation + phone CTAs, and
 * a rich 6-column footer (services, industries, company, contact).
 *
 * Base surface is light (`background`); the hero, stats band and CTA band
 * invert to `primary` with `primary-foreground` text to preserve Kimi's
 * dramatic contrast. The multi-color service icons rotate through
 * `chart-1..5`/`primary` (the only place data-viz tokens stand in for Kimi's
 * brand/emerald/violet/rose/cyan tiles). Every nav item / CTA / link /
 * form-submit routes through `useNavigate` (never a dead "#"), navbar labels
 * match the `nav` array, and all imagery uses the alt-driven <Image>
 * component. Callers supply ONLY content; rich defaults render the full page.
 */
export const ConsultingKimiPage2 = defineComponent({
  name: "ConsultingKimiPage2",
  description:
    "SECOND, alternative style of a complete management-consulting / professional-services / strategy-advisory LANDING page — a bold, editorial, photography-forward sibling to ConsultingKimiPage. Opens with a full-bleed DARK photographic hero (dimmed skyscraper image behind a gradient scrim, accent uppercase eyebrow, an oversized headline with a colored highlight word, dual CTAs, and an inline 3-up trust-stat row: client value created, transformations delivered, retention rate), then a muted trusted-by client-logo strip, a colorful 6-up services / capabilities grid with icon tiles that rotate accent colors (Strategy & Growth, Operations Excellence, Digital Transformation, Organization & Change, Financial Advisory, Sustainability & ESG), a 2-up large case-study gallery with industry pills, engagement length and twin metric figures (cost savings, ROI, synergies), a 3-up insights / thought-leadership article grid with category, date, read-time and author headshots, a dark brand stats band (value created, transformations, consultants, retention), an image-tile industries grid with hover captions (Healthcare, Financial Services, Technology, Retail & Consumer, Energy, Transportation, Private Equity, Public Sector), a 3-up star-rated client-testimonials grid with avatars, a 4-up leadership / partners headshot grid, a dark full-bleed photographic closing call-to-action band with schedule-consultation and phone CTAs, and a rich 6-column footer with services, industries, company links and contact details. Use this as a distinct ALTERNATIVE root/home page for Fortune-500 strategy firms, transformation and M&A advisories, corporate consultancies, operations / digital / ESG consulting practices, or B2B professional-services groups when a dramatic, dark-hero, case-study-heavy enterprise page is wanted instead of the cleaner light hero of ConsultingKimiPage. Supply content only — brand, nav, hero, logos, services, caseStudies, insights, stats, industries, testimonials, team, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Firm / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Dark photographic hero content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        /** Word/phrase rendered with the accent highlight color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Inline trust stats beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-by client-logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              points: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Case-study gallery. */
    caseStudies: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              duration: z.string(),
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              metrics: z
                .array(z.object({ value: z.string(), label: z.string() })),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Insights / thought-leadership grid. */
    insights: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              category: z.string(),
              date: z.string(),
              readTime: z.string(),
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              author: z.string(),
              authorRole: z.string(),
              authorAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark brand stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Image-tile industries grid. */
    industries: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              detail: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client-testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
    /** Leadership / partners grid. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark photographic closing call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        servicesHeading: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        industriesHeading: z.string().optional(),
        industriesLinks: z.array(z.string()).optional(),
        companyHeading: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Meridian"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Insights", "Industries", "About", "Careers"]

    const heroEyebrow = props.hero?.eyebrow ?? "Strategic Transformation Partners"
    const heroHeading =
      props.hero?.heading ?? "Build the future your business deserves"
    const heroHighlight = props.hero?.highlight ?? "future"
    const heroSub =
      props.hero?.subheading ??
      "We help Fortune 500 companies and growth-stage enterprises transform operations, accelerate revenue, and build sustainable competitive advantage."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Transformation"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Our Services"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern glass skyscrapers towering against dramatic sky at dusk"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
        { value: "$47B", label: "Client value created" },
        { value: "340+", label: "Transformations delivered" },
        { value: "94%", label: "Client retention rate" },
      ]

    const logosHeading = props.logos?.heading ?? "Trusted by industry leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
        "Acme Corp",
        "Globex",
        "Initech",
        "MassiveDynamic",
        "Umbrella",
        "Wayne Ent",
      ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive solutions for complex challenges"
    const servicesDesc =
      props.services?.description ??
      "We bring deep functional expertise across strategy, operations, technology, and organization to deliver lasting impact."
    const defaultServiceItems = [
        {
          title: "Strategy & Growth",
          description:
            "Develop winning strategies for market expansion, M&A, portfolio optimization, and sustainable competitive positioning.",
          points: [
            "Corporate strategy development",
            "M&A advisory & due diligence",
            "Market entry & expansion",
          ],
        },
        {
          title: "Operations Excellence",
          description:
            "Transform supply chains, optimize processes, reduce costs, and build operational resilience for competitive advantage.",
          points: [
            "Supply chain transformation",
            "Cost optimization programs",
            "Lean & Six Sigma implementation",
          ],
        },
        {
          title: "Digital Transformation",
          description:
            "Accelerate digital initiatives, implement AI/ML solutions, modernize technology architecture, and build data-driven organizations.",
          points: [
            "AI & automation strategy",
            "Cloud migration & modernization",
            "Data & analytics platforms",
          ],
        },
        {
          title: "Organization & Change",
          description:
            "Restructure for agility, develop leadership capabilities, manage cultural transformation, and build high-performing teams.",
          points: [
            "Operating model redesign",
            "Talent & capability building",
            "Change management programs",
          ],
        },
        {
          title: "Financial Advisory",
          description:
            "Optimize capital structure, improve financial planning, enhance investor relations, and navigate complex transactions.",
          points: [
            "FP&A transformation",
            "Working capital optimization",
            "Restructuring & turnaround",
          ],
        },
        {
          title: "Sustainability & ESG",
          description:
            "Embed sustainability into strategy, meet regulatory requirements, and create value through responsible business practices.",
          points: [
            "ESG strategy & reporting",
            "Net-zero transition planning",
            "Circular economy programs",
          ],
        },
      ]
    const serviceItems = (props.services?.items?.length
      ? props.services.items
      : defaultServiceItems
    ).map((item, index) => ({
      ...item,
      points: item.points?.length
        ? item.points
        : defaultServiceItems[index % defaultServiceItems.length].points,
    }))

    const caseEyebrow = props.caseStudies?.eyebrow ?? "Case Studies"
    const caseHeading = props.caseStudies?.heading ?? "Real results, lasting impact"
    const caseItems = props.caseStudies?.items?.length
      ? props.caseStudies.items
      : [
        {
          tag: "Technology",
          duration: "6-month engagement",
          title: "Global SaaS Company Digital Transformation",
          description:
            "Helped a $2B SaaS provider modernize their cloud infrastructure, resulting in 40% cost reduction and 3x improvement in deployment velocity.",
          imageAlt:
            "Business executive reviewing data analytics dashboard on large screen",
          metrics: [
            { value: "$127M", label: "Cost savings achieved" },
            { value: "340%", label: "ROI in first year" },
          ],
        },
        {
          tag: "Healthcare",
          duration: "12-month engagement",
          title: "Healthcare System Operational Excellence",
          description:
            "Partnered with a 45-hospital network to redesign patient flow, reduce wait times, and improve clinical outcomes across the system.",
          imageAlt:
            "Corporate team collaborating in modern conference room with glass walls",
          metrics: [
            { value: "23%", label: "Cost reduction" },
            { value: "47min", label: "Avg wait time reduction" },
          ],
        },
        {
          tag: "Retail",
          duration: "8-month engagement",
          title: "Fortune 100 Retailer Supply Chain Overhaul",
          description:
            "Redesigned end-to-end supply chain for a major retailer, implementing AI-driven demand forecasting and automated replenishment.",
          imageAlt:
            "Modern retail store interior with bright lighting and organized product displays",
          metrics: [
            { value: "$890M", label: "Inventory optimization" },
            { value: "18%", label: "Revenue increase" },
          ],
        },
        {
          tag: "Financial Services",
          duration: "10-month engagement",
          title: "Global Bank Merger Integration",
          description:
            "Led post-merger integration for a $47B banking merger, harmonizing operations, technology, and culture across 12 countries.",
          imageAlt:
            "Financial district with modern banking buildings and glass architecture",
          metrics: [
            { value: "$2.1B", label: "Synergies realized" },
            { value: "14mo", label: "Ahead of schedule" },
          ],
        },
      ]

    const insightsEyebrow = props.insights?.eyebrow ?? "Insights"
    const insightsHeading =
      props.insights?.heading ?? "Perspectives that drive decisions"
    const insightsViewAll = props.insights?.viewAll ?? "View all insights"
    const insightItems = props.insights?.items?.length
      ? props.insights.items
      : [
        {
          category: "AI & Automation",
          date: "May 28, 2026",
          readTime: "12 min read",
          title: "The Enterprise AI Playbook: From Pilot to Production at Scale",
          description:
            "Our analysis of 200+ AI implementations reveals the critical success factors for scaling generative AI across enterprise operations.",
          imageAlt:
            "Abstract visualization of artificial intelligence neural networks and data flows",
          author: "Sarah Chen",
          authorRole: "AI Strategy Director",
          authorAlt:
            "Professional headshot of Sarah Chen, AI Strategy Director",
        },
        {
          category: "Sustainability",
          date: "May 22, 2026",
          readTime: "8 min read",
          title: "Navigating the SEC Climate Disclosure Rules",
          description:
            "A comprehensive guide for executives preparing their first climate-related financial disclosures under the new regulatory framework.",
          imageAlt:
            "Sustainable green energy infrastructure with solar panels and wind turbines",
          author: "Michael Torres",
          authorRole: "ESG Practice Lead",
          authorAlt:
            "Professional headshot of Michael Torres, ESG Practice Lead",
        },
        {
          category: "M&A",
          date: "May 15, 2026",
          readTime: "15 min read",
          title: "M&A in 2026: Strategic Deal-Making in a Volatile Market",
          description:
            "Analysis of Q1 2026 deal activity and our outlook on how private equity and strategic buyers are adapting to new market realities.",
          imageAlt:
            "Business professionals shaking hands during successful merger negotiations",
          author: "Jennifer Walsh",
          authorRole: "M&A Partner",
          authorAlt: "Professional headshot of Jennifer Walsh, M&A Partner",
        },
        {
          category: "Supply Chain",
          date: "May 8, 2026",
          readTime: "10 min read",
          title:
            "Building Resilient Supply Chains: Lessons from the Red Sea Crisis",
          description:
            "How leading companies are rethinking their supply chain strategies to mitigate geopolitical risks and maintain operational continuity.",
          imageAlt:
            "Data visualization dashboard showing supply chain metrics and analytics",
          author: "David Park",
          authorRole: "Operations Partner",
          authorAlt:
            "Professional headshot of David Park, Operations Partner",
        },
        {
          category: "Organization",
          date: "April 30, 2026",
          readTime: "11 min read",
          title: "The Future of Work: Redesigning Organizations for the AI Era",
          description:
            "How AI is reshaping organizational structures, career paths, and the skills that will define success in the next decade.",
          imageAlt:
            "Diverse corporate team collaborating on digital transformation strategy",
          author: "Amanda Foster",
          authorRole: "People & Org Partner",
          authorAlt:
            "Professional headshot of Amanda Foster, People & Organization Partner",
        },
        {
          category: "Technology",
          date: "April 24, 2026",
          readTime: "9 min read",
          title: "Quantum Computing: Preparing Your Cybersecurity Posture",
          description:
            "Why organizations need to start planning for post-quantum cryptography now, and practical steps to begin the transition.",
          imageAlt:
            "Futuristic visualization of quantum computing and cybersecurity infrastructure",
          author: "James Nakamura",
          authorRole: "Technology Partner",
          authorAlt:
            "Professional headshot of James Nakamura, Technology Partner",
        },
      ]

    const statItems = props.stats?.length
      ? props.stats
      : [
        { value: "$47B", label: "Value created for clients" },
        { value: "340+", label: "Transformations delivered" },
        { value: "1,800+", label: "Consultants worldwide" },
        { value: "94%", label: "Client retention rate" },
      ]

    const industriesEyebrow = props.industries?.eyebrow ?? "Industries"
    const industriesHeading =
      props.industries?.heading ?? "Deep expertise across sectors"
    const industriesDesc =
      props.industries?.description ??
      "We bring industry-specific knowledge combined with cross-sector insights to solve your most complex challenges."
    const industryItems = props.industries?.items?.length
      ? props.industries.items
      : [
        {
          name: "Healthcare",
          detail: "Providers, payers, life sciences",
          imageAlt:
            "Modern hospital corridor with healthcare professionals walking",
        },
        {
          name: "Financial Services",
          detail: "Banking, insurance, asset management",
          imageAlt:
            "Wall Street financial district with iconic banking buildings",
        },
        {
          name: "Technology",
          detail: "Software, hardware, semiconductors",
          imageAlt:
            "High-tech manufacturing facility with automated robotics and machinery",
        },
        {
          name: "Retail & Consumer",
          detail: "CPG, retail, e-commerce",
          imageAlt:
            "Modern retail store with digital displays and customer experience technology",
        },
        {
          name: "Energy & Utilities",
          detail: "Oil & gas, renewables, utilities",
          imageAlt:
            "Energy infrastructure with power lines and renewable energy sources",
        },
        {
          name: "Transportation",
          detail: "Airlines, logistics, shipping",
          imageAlt:
            "Logistics warehouse with automated systems and supply chain operations",
        },
        {
          name: "Private Equity",
          detail: "Due diligence, value creation",
          imageAlt:
            "Business team analyzing financial data and analytics dashboards",
        },
        {
          name: "Public Sector",
          detail: "Government, education, defense",
          imageAlt:
            "Government and public sector building with institutional architecture",
        },
      ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Client Impact"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What our clients say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
        {
          quote:
            "Meridian transformed our entire go-to-market strategy. They didn't just deliver recommendations—they rolled up their sleeves and helped us execute. The $40M revenue impact speaks for itself.",
          name: "Robert Harrison",
          role: "CEO, TechVentures Inc.",
          avatarAlt:
            "Professional headshot of Robert Harrison, CEO of TechVentures Inc",
        },
        {
          quote:
            "The Meridian team brought unparalleled expertise to our post-merger integration. They managed complex stakeholder dynamics while delivering $180M in synergies six months ahead of schedule.",
          name: "Catherine Morgan",
          role: "CFO, United Healthcare Systems",
          avatarAlt:
            "Professional headshot of Catherine Morgan, CFO of United Healthcare Systems",
        },
        {
          quote:
            "Working with Meridian on our ESG strategy was transformative. They helped us not just meet regulatory requirements but turn sustainability into a genuine competitive advantage.",
          name: "Marcus Chen",
          role: "CSO, Pacific Energy Group",
          avatarAlt:
            "Professional headshot of Marcus Chen, Chief Sustainability Officer at Pacific Energy Group",
        },
      ]

    const teamEyebrow = props.team?.eyebrow ?? "Our Leadership"
    const teamHeading = props.team?.heading ?? "Meet our partners"
    const teamDesc =
      props.team?.description ??
      "Seasoned executives and consultants with deep experience across industries and functions."
    const teamItems = props.team?.items?.length
      ? props.team.items
      : [
        {
          name: "David Thornton",
          role: "Managing Partner",
          bio: "Former McKinsey partner with 25 years of experience in strategy and transformation.",
          avatarAlt:
            "Professional headshot of David Thornton, Managing Partner at Meridian Strategy Partners",
        },
        {
          name: "Elena Vasquez",
          role: "Partner & COO",
          bio: "Former BCG principal specializing in operations and supply chain excellence.",
          avatarAlt:
            "Professional headshot of Elena Vasquez, Partner & COO at Meridian Strategy Partners",
        },
        {
          name: "James Nakamura",
          role: "Partner, Technology",
          bio: "Former CTO at Fortune 100 tech company. AI and digital transformation expert.",
          avatarAlt:
            "Professional headshot of James Nakamura, Partner & Technology Lead at Meridian Strategy Partners",
        },
        {
          name: "Jennifer Walsh",
          role: "Partner, M&A",
          bio: "Former investment banker with $50B+ in completed M&A transactions.",
          avatarAlt:
            "Professional headshot of Jennifer Walsh, Partner & M&A Lead at Meridian Strategy Partners",
        },
      ]

    const ctaHeading = props.cta?.heading ?? "Ready to transform your business?"
    const ctaDesc =
      props.cta?.description ??
      "Let's discuss how Meridian can help you achieve breakthrough results. Schedule a complimentary consultation with our team."
    const ctaPrimary = props.cta?.primaryCta ?? "Schedule Consultation"
    const ctaPhone = props.cta?.phone ?? "+1 (212) 555-0199"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "Modern corporate office interior with collaborative workspace"

    const footerDesc =
      props.footer?.description ??
      "Helping Fortune 500 companies and growth-stage enterprises transform operations and build sustainable competitive advantage since 2004."
    const footerServicesHeading = props.footer?.servicesHeading ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
        "Strategy & Growth",
        "Operations",
        "Digital Transformation",
        "Organization",
        "Financial Advisory",
        "Sustainability",
      ]
    const footerIndustriesHeading =
      props.footer?.industriesHeading ?? "Industries"
    const footerIndustriesLinks = props.footer?.industriesLinks?.length
      ? props.footer.industriesLinks
      : [
        "Healthcare",
        "Financial Services",
        "Technology",
        "Retail & Consumer",
        "Energy",
        "Private Equity",
      ]
    const footerCompanyHeading = props.footer?.companyHeading ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Our Team", "Careers", "Insights", "Newsroom", "Events"]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerAddress = props.footer?.address ?? "350 Park Avenue, New York, NY 10022"
    const footerPhone = props.footer?.phone ?? "+1 (212) 555-0199"
    const footerEmail = props.footer?.email ?? "contact@meridianconsulting.com"
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand mark — solid neutral square with the brand initial (decorative).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Dot = ({ className }: { className?: string }) => (
      <span className={cn("size-1.5 flex-shrink-0 rounded-full", className)} />
    )

    const StarRow = () => (
      <div className="mb-6 flex items-center gap-1 text-accent-foreground">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    // Rotating accent tints for the service icon tiles (data-viz tokens stand in
    // for Kimi's multi-color tiles — never raw palette colors).
    const iconTints = [
      "bg-primary/10 text-primary",
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
    ]
    const dotTints = [
      "bg-primary",
      "bg-chart-1",
      "bg-chart-2",
      "bg-chart-3",
      "bg-chart-4",
      "bg-chart-5",
    ]

    const serviceIcons: ReactNode[] = [
      <svg
        key="chart"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="ops"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg
        key="digital"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg
        key="org"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      <svg
        key="finance"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="esg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    // Highlight the colored phrase inside the hero heading.
    const renderHeading = () => {
      const idx = heroHighlight ? heroHeading.indexOf(heroHighlight) : -1
      if (idx === -1) return heroHeading
      return (
        <>
          {heroHeading.slice(0, idx)}
          <span className="text-primary-foreground/60">{heroHighlight}</span>
          {heroHeading.slice(idx + heroHighlight.length)}
        </>
      )
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3"
            >
              <LogoMark className="size-10 text-lg" />
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 lg:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="hidden rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Schedule Consultation
              </button>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
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
        </header>

        <main>
          {/* Hero — dark photographic band */}
          <section className="relative overflow-hidden bg-primary text-primary-foreground">
            <div aria-hidden="true" className="absolute inset-0 opacity-30">
              <Image alt={heroImageAlt} w={1920} h={1080} className="size-full object-cover" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
              <div className="max-w-3xl">
                <p className="mb-4 text-lg font-semibold uppercase tracking-wide text-primary-foreground/80">
                  {heroEyebrow}
                </p>
                <h1 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  {renderHeading()}
                </h1>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-primary-foreground/70 sm:text-2xl">
                  {heroSub}
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-primary-foreground/30 px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/50 hover:bg-primary-foreground/10"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-16 grid grid-cols-3 gap-8 border-t border-primary-foreground/20 pt-8">
                  {heroStats.map((s) => (
                    <div key={s.label}>
                      <p className="text-4xl font-bold sm:text-5xl">{s.value}</p>
                      <p className="mt-1 text-sm text-primary-foreground/60">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
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

          {/* Services */}
          <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                  {servicesEyebrow}
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {servicesHeading}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {servicesDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group relative rounded-2xl border border-border bg-muted p-8 transition-all duration-300 hover:bg-card hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-xl transition-colors",
                        iconTints[i % iconTints.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <Dot className={dotTints[i % dotTints.length]} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Case Studies */}
          <section className="bg-muted py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                  {caseEyebrow}
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {caseHeading}
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                {caseItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative block w-full overflow-hidden rounded-2xl bg-card text-left shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-8">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                          {item.tag}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.duration}
                        </span>
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex gap-8 border-t border-border pt-6">
                        {item.metrics.map((m) => (
                          <div key={m.label}>
                            <p className="text-3xl font-bold text-primary">
                              {m.value}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Insights */}
          <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                    {insightsEyebrow}
                  </h2>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {insightsHeading}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(insightsViewAll)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {insightsViewAll}
                  <ArrowRight />
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {insightItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group block w-full text-left"
                  >
                    <div className="mb-6 aspect-[3/2] overflow-hidden rounded-xl">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">
                        {item.category}
                      </span>
                      <span>{item.date}</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={item.authorAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.authorRole}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats — dark band */}
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-5xl font-bold sm:text-6xl">{s.value}</p>
                    <p className="mt-2 text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Industries — image-tile grid */}
          <section className="bg-muted py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                  {industriesEyebrow}
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {industriesHeading}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {industriesDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {industryItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => go(item.name)}
                    className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-primary text-left"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={400}
                      h={300}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-bold text-primary-foreground">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-primary-foreground/80 opacity-0 transition-opacity group-hover:opacity-100">
                        {item.detail}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                  {testimonialsEyebrow}
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted p-8"
                  >
                    <StarRow />
                    <p className="mb-6 text-lg leading-relaxed text-foreground">
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
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Team / Leadership */}
          <section className="bg-muted py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-base font-semibold uppercase tracking-wide text-primary">
                  {teamEyebrow}
                </h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {teamHeading}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {teamDesc}
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teamItems.map((member) => (
                  <article key={member.name} className="text-center">
                    <div className="relative mx-auto mb-6 size-48">
                      <Image
                        alt={member.avatarAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full rounded-2xl object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {member.name}
                    </h3>
                    <p className="font-medium text-primary">{member.role}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA — dark photographic band */}
          <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground sm:py-32">
            <div aria-hidden="true" className="absolute inset-0 opacity-10">
              <Image alt={ctaImageAlt} w={1920} h={1080} className="size-full object-cover" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-xl text-primary-foreground/70">
                {ctaDesc}
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-foreground/30 px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <PhoneIcon />
                  {ctaPhone}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer — dark */}
        <footer className="bg-primary py-16 text-primary-foreground/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6 lg:gap-12">
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <LogoMark className="size-10 text-lg" />
                  <span className="text-2xl font-bold tracking-tight text-primary-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {(["LinkedIn", "Twitter"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-primary-foreground/10 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                    >
                      {social.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-primary-foreground">
                  {footerServicesHeading}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-primary-foreground">
                  {footerIndustriesHeading}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerIndustriesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-primary-foreground">
                  {footerCompanyHeading}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2">
                <h4 className="mb-4 font-semibold text-primary-foreground">
                  {footerContactHeading}
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 size-5 flex-shrink-0 text-primary-foreground/80"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <PhoneIcon className="size-5 flex-shrink-0 text-primary-foreground/80" />
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-left transition-colors hover:text-primary-foreground"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 flex-shrink-0 text-primary-foreground/80"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-left transition-colors hover:text-primary-foreground"
                    >
                      {footerEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 sm:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {brand} Strategy Partners. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-primary-foreground"
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
