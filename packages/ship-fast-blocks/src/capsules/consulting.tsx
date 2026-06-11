import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ConsultingKimiPage — a complete, self-contained management-consulting firm
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Nexus Strategy Partners"
 * design: a clean, corporate, trust-forward aesthetic on a light surface with
 * a deep neutral (slate-900 → `primary`/`foreground`) used for the brand mark,
 * dark process band, dark stats band, the highlighted pricing tier and the
 * closing CTA card. It pairs a two-column hero (eyebrow pill + headline with a
 * muted highlight + dual CTAs + trust stats + photo with a floating retention
 * stat card) with a client-logo strip, a 6-up services grid with icon tiles, a
 * dark 4-step "How We Work" process, a 6-up case-study gallery, a 3-tier
 * engagement-models pricing block, a dark stats band, a 3-up star-rated
 * testimonials grid, a 3-up latest-insights/articles grid, an accordion FAQ, a
 * dark closing CTA card with phone, and a rich 4-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. The base
 * surface is light (`background`); dark sections invert to `primary` with
 * `primary-foreground` text to preserve Kimi's contrast. Every nav item / CTA /
 * link / form-submit routes through `useNavigate` (never a dead "#"), and the
 * navbar labels match the `nav` array so PageSwitch can swap pages. All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const ConsultingKimiPage = defineCapsule({
  name: "ConsultingKimiPage",
  description:
    "Complete management-consulting / professional-services firm LANDING page with a clean, corporate, trust-forward aesthetic: light surface, deep-neutral brand accents, sharp type hierarchy and authoritative copy. Includes a two-column hero (eyebrow pill, headline with muted highlight, dual CTAs, clients-served / offices trust stats, and a hero photo with a floating client-retention stat card), a trusted-by client-logo strip, a 6-up services grid with icon tiles (Corporate Strategy, Digital Transformation, M&A Advisory, Operations Excellence, Organization & Change, Risk & Compliance), a dark 4-step 'How We Work' process band, a 6-up case-study gallery with industry tags and engagement metrics, a 3-tier engagement-models pricing block with a featured 'Most Popular' tier, a dark headline-stats band (years, engagements, offices, consultants), a 3-up star-rated client-testimonials grid with avatars, a 3-up latest-insights / thought-leadership articles grid with categories and dates, an accordion FAQ, a dark closing call-to-action card with consultation and phone CTAs, and a rich 4-column footer with services, company, contact details and socials. Use as the ROOT/home page for management-consulting firms, strategy advisories, professional-services groups, corporate consultancies, accounting/advisory practices, M&A and transformation shops, or B2B advisory businesses when an enterprise-grade, credibility-driven page with services, case studies, pricing and thought leadership is wanted. Supply content only — brand, nav, hero, logos, services, process, caseStudies, pricing, stats, testimonials, insights, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Firm / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        /** Phrase rendered with the muted highlight color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Inline trust stats beneath the hero copy. */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating stat card over the hero photo. */
        statValue: z.string().optional(),
        statTitle: z.string().optional(),
        statSubtitle: z.string().optional(),
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
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark "How We Work" process band. */
    process: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Case-study gallery. */
    caseStudies: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              description: z.string(),
              duration: z.string(),
              period: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Engagement-models pricing block. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              unit: z.string().optional(),
              description: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark headline-stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Client-testimonials grid. */
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
    /** Latest-insights / thought-leadership grid. */
    insights: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              category: z.string(),
              date: z.string(),
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
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
    /** Dark closing call-to-action card. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        servicesHeading: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyHeading: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Nexus Strategy Partners"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Insights", "Industries", "About", "Careers"]

    const heroEyebrow = props.hero?.eyebrow ?? "Global Management Consulting"
    const heroHeading =
      props.hero?.heading ?? "Transforming Strategy into Sustainable Results"
    const heroHighlight = props.hero?.highlight ?? "Sustainable Results"
    const heroSub =
      props.hero?.subheading ??
      "For 28 years, Nexus Strategy Partners has helped Fortune 500 companies and emerging leaders navigate complex challenges, unlock growth potential, and build enduring competitive advantage."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Our Services"
    const heroSecondary = props.hero?.secondaryCta ?? "View Case Studies"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["850+ Clients Served", "24 Offices Worldwide"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Professional consultants collaborating around a conference table reviewing documents and data on laptops"
    const heroStatValue = props.hero?.statValue ?? "92%"
    const heroStatTitle = props.hero?.statTitle ?? "Client Retention Rate"
    const heroStatSubtitle =
      props.hero?.statSubtitle ?? "Average 8-year partnership"

    const logosHeading =
      props.logos?.heading ?? "Trusted by Industry Leaders Across Sectors"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Alphabet", "Microsoft", "JPMorgan", "Pfizer", "Siemens", "Unilever"]

    const servicesHeading =
      props.services?.heading ?? "Comprehensive Consulting Services"
    const servicesDesc =
      props.services?.description ??
      "From strategy formulation to implementation, we partner with you at every stage of your transformation journey."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
        {
          title: "Corporate Strategy",
          description:
            "Develop winning strategies that define your competitive position, prioritize growth initiatives, and allocate resources for maximum impact. Our approach combines rigorous analysis with creative problem-solving.",
        },
        {
          title: "Digital Transformation",
          description:
            "Navigate the digital landscape with confidence. We help organizations leverage technology to reimagine operations, enhance customer experiences, and build new digital business models.",
        },
        {
          title: "M&A Advisory",
          description:
            "From target identification to post-merger integration, we guide clients through complex transactions. Our team has advised on over 400 deals worth more than $180 billion in total value.",
        },
        {
          title: "Operations Excellence",
          description:
            "Optimize your end-to-end operations to reduce costs, improve quality, and accelerate delivery. We specialize in supply chain transformation, lean manufacturing, and process automation.",
        },
        {
          title: "Organization & Change",
          description:
            "Build high-performing organizations and lead successful transformations. We help you redesign structures, develop talent, and manage cultural change to support your strategic objectives.",
        },
        {
          title: "Risk & Compliance",
          description:
            "Navigate regulatory complexity and protect your enterprise. We help organizations identify, assess, and mitigate risks while ensuring compliance with evolving standards and regulations.",
        },
      ]

    const processHeading = props.process?.heading ?? "How We Work"
    const processDesc =
      props.process?.description ??
      "Our proven methodology ensures every engagement delivers measurable, sustainable results."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
        {
          title: "Discovery & Diagnosis",
          description:
            "We begin by deeply understanding your business, conducting rigorous analysis of your market position, operations, and strategic challenges to identify the core issues.",
        },
        {
          title: "Strategy Development",
          description:
            "Working collaboratively with your team, we develop tailored strategies that leverage your strengths and address your most critical opportunities and challenges.",
        },
        {
          title: "Implementation Support",
          description:
            "We roll up our sleeves to help execute the strategy, providing hands-on support for organizational changes, process improvements, and capability building.",
        },
        {
          title: "Sustained Impact",
          description:
            "We measure success by lasting results. We build your internal capabilities and establish mechanisms to ensure improvements endure long after our engagement.",
        },
      ]

    const caseHeading = props.caseStudies?.heading ?? "Featured Case Studies"
    const caseDesc =
      props.caseStudies?.description ??
      "Real results from real partnerships. Explore how we've helped clients across industries achieve transformative outcomes."
    const caseViewAll = props.caseStudies?.viewAll ?? "View All Insights"
    const caseItems = props.caseStudies?.items?.length
      ? props.caseStudies.items
      : [
        {
          tag: "Financial Services",
          title: "Transforming a Regional Bank's Digital Ecosystem",
          description:
            "Helped First Capital Bank redesign their digital platform, resulting in 47% increase in mobile adoption and $23M in operational savings over 18 months.",
          duration: "18-month engagement",
          period: "2023-2024",
          imageAlt:
            "Modern glass skyscraper headquarters building in downtown business district",
        },
        {
          tag: "Manufacturing",
          title: "Operational Turnaround for Industrial Manufacturer",
          description:
            "Partnered with Meridian Industrial to implement lean manufacturing principles, reducing production costs by 31% and improving on-time delivery to 97%.",
          duration: "24-month engagement",
          period: "2022-2024",
          imageAlt:
            "Advanced manufacturing facility with robotic arms assembling products on production line",
        },
        {
          tag: "Healthcare",
          title: "Post-Merger Integration for Health System Expansion",
          description:
            "Guided Westview Health System through the integration of three acquired hospitals, achieving $85M in synergies while maintaining quality of care standards.",
          duration: "36-month engagement",
          period: "2021-2024",
          imageAlt:
            "Healthcare professionals reviewing patient data on tablets in modern hospital setting",
        },
        {
          tag: "Retail",
          title: "Omnichannel Strategy for National Retailer",
          description:
            "Developed and executed an omnichannel transformation for Carter Retail Group, driving 28% growth in e-commerce revenue and improving customer lifetime value by 34%.",
          duration: "30-month engagement",
          period: "2022-2024",
          imageAlt:
            "Retail store interior with customers shopping and modern product displays",
        },
        {
          tag: "Energy",
          title: "Sustainability Transformation for Energy Provider",
          description:
            "Supported Pacific Energy's transition to renewable sources, developing a 10-year roadmap that positions the company for carbon neutrality by 2035.",
          duration: "15-month engagement",
          period: "2023-2024",
          imageAlt:
            "Sustainable office building with green rooftop garden and solar panels",
        },
        {
          tag: "Technology",
          title: "Product Strategy for SaaS Market Leader",
          description:
            "Helped CloudSync Technologies redefine their product portfolio, entering three new market segments and increasing ARR by $42M in the first year.",
          duration: "12-month engagement",
          period: "2023-2024",
          imageAlt:
            "Software development team collaborating on multiple monitors in modern tech office",
        },
      ]

    const pricingHeading = props.pricing?.heading ?? "Engagement Models"
    const pricingDesc =
      props.pricing?.description ??
      "Flexible approaches tailored to your unique challenges, timeline, and organizational needs."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
        {
          name: "Strategic Advisory",
          price: "$45K",
          unit: "/month",
          description:
            "Ideal for executive-level guidance on strategic direction, market entry, or transformation planning. Includes weekly advisory sessions and strategic roadmapping.",
          features: [
            "Monthly strategy sessions",
            "Executive coaching",
            "Market intelligence reports",
          ],
          cta: "Learn More",
        },
        {
          name: "Transformation Partnership",
          price: "Custom",
          description:
            "Comprehensive support for major transformation initiatives. Dedicated team embedded with your organization for strategy through implementation.",
          features: [
            "Dedicated project team",
            "Full implementation support",
            "Change management",
            "Capability building",
          ],
          cta: "Schedule Consultation",
          featured: true,
          badge: "Most Popular",
        },
        {
          name: "Capability Building",
          price: "$85K",
          unit: "/program",
          description:
            "Intensive training and development programs to build internal consulting capabilities and leadership skills within your organization.",
          features: [
            "Workshop-based training",
            "Real project application",
            "12-week program duration",
          ],
          cta: "Learn More",
        },
      ]

    const statItems = props.stats?.length
      ? props.stats
      : [
        { value: "28", label: "Years of Excellence" },
        { value: "850+", label: "Client Engagements" },
        { value: "24", label: "Global Offices" },
        { value: "1,600+", label: "Consultants Worldwide" },
      ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Long-term partnerships built on trust, results, and shared commitment to excellence."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
        {
          quote:
            "Nexus Strategy Partners delivered exceptional value. Their team's deep expertise in financial services and hands-on approach helped us achieve a 40% improvement in operational efficiency within 12 months.",
          name: "Richard Chen",
          role: "CEO, First Capital Bank",
          avatarAlt:
            "Professional headshot of a confident male executive in a navy suit with silver tie",
        },
        {
          quote:
            "The Nexus team became true partners in our transformation. Their strategic insights and pragmatic implementation approach were instrumental in our successful market expansion into Southeast Asia.",
          name: "Sarah Mitchell",
          role: "COO, Meridian Industrial",
          avatarAlt:
            "Professional headshot of a smiling female business leader in professional attire",
        },
        {
          quote:
            "Working with Nexus on our post-merger integration was a game-changer. They brought structure, expertise, and a collaborative spirit that made a complex process feel manageable.",
          name: "Dr. James Rodriguez",
          role: "President, Westview Health",
          avatarAlt:
            "Professional headshot of a male healthcare executive wearing glasses and a suit",
        },
      ]

    const insightsHeading = props.insights?.heading ?? "Latest Insights"
    const insightsDesc =
      props.insights?.description ??
      "Perspectives from our consultants on the trends and challenges shaping industries today."
    const insightsViewAll = props.insights?.viewAll ?? "View All Articles"
    const insightItems = props.insights?.items?.length
      ? props.insights.items
      : [
        {
          category: "Technology",
          date: "May 15, 2026",
          title:
            "The AI Imperative: Redefining Competitive Advantage in the Enterprise",
          description:
            "How leading organizations are moving beyond pilot projects to scale AI across their operations—and the capabilities that separate winners from laggards.",
          imageAlt:
            "Abstract visualization of AI and machine learning with glowing neural network patterns",
        },
        {
          category: "Supply Chain",
          date: "May 8, 2026",
          title:
            "Building Resilience: Lessons from the Semiconductor Supply Chain Crisis",
          description:
            "An in-depth analysis of supply chain vulnerabilities exposed in recent years and the strategic shifts required for future resilience.",
          imageAlt:
            "Close-up of semiconductor chip with intricate circuit patterns and glowing connections",
        },
        {
          category: "Sustainability",
          date: "April 28, 2026",
          title:
            "From Compliance to Competitive Edge: The New Sustainability Playbook",
          description:
            "How forward-thinking companies are integrating ESG principles to drive innovation, attract talent, and create long-term shareholder value.",
          imageAlt:
            "Wind turbines on a green hillside at sunset representing sustainable energy",
        },
      ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Common questions about working with Nexus Strategy Partners."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
        {
          question: "How do you approach a typical consulting engagement?",
          answer:
            "We begin every engagement with a deep diagnostic phase to understand your unique context, challenges, and opportunities. From there, we develop tailored solutions in close collaboration with your team, ensuring buy-in and building internal capability. We don't just deliver recommendations—we stay to help implement and ensure lasting impact. Our average engagement lasts 12-18 months for transformation projects, though strategic advisory relationships can extend for years.",
        },
        {
          question: "What industries do you specialize in?",
          answer:
            "We have deep expertise across financial services, healthcare, technology, industrials, energy, and consumer sectors. Within these, we maintain specialized practices in areas like digital banking, healthcare provider systems, enterprise SaaS, advanced manufacturing, and renewable energy transition. Our consultants combine industry-specific knowledge with functional expertise to deliver contextualized solutions.",
        },
        {
          question: "How do you measure the success of your engagements?",
          answer:
            "We establish clear, measurable objectives at the outset of every engagement, tied directly to your business outcomes. These might include revenue growth, cost reduction, market share gains, or operational metrics. We track progress rigorously and regularly report on impact. Importantly, we measure not just immediate results but sustained performance—we conduct follow-up assessments 12 months post-engagement to ensure changes have stuck.",
        },
        {
          question: "What is your fee structure?",
          answer:
            "We offer flexible engagement models to meet different client needs. These include monthly retainer arrangements for ongoing advisory work, fixed-fee project pricing for well-defined initiatives, and performance-based fees where a portion of our compensation is tied to achieving agreed-upon outcomes. We're transparent about pricing and work with you to structure arrangements that align incentives and ensure strong return on investment.",
        },
        {
          question: "How do you ensure knowledge transfer to our team?",
          answer:
            "Building your internal capabilities is a core part of our mission. We embed your team members in our work streams, conduct training sessions, create playbooks and tools, and provide coaching throughout the engagement. Our goal is to leave your organization stronger than we found it—with people who can continue driving progress long after we step back. Many of our clients develop internal consulting functions based on our methodologies.",
        },
      ]

    const ctaHeading = props.cta?.heading ?? "Ready to Transform Your Business?"
    const ctaDesc =
      props.cta?.description ??
      "Let's discuss how Nexus Strategy Partners can help you navigate your most pressing challenges and unlock new opportunities for growth."
    const ctaPrimary = props.cta?.primaryCta ?? "Schedule a Consultation"
    const ctaPhone = props.cta?.phone ?? "+1 (800) 555-0199"
    const ctaNote =
      props.cta?.note ??
      "Initial consultations are complimentary. Response within 24 hours guaranteed."

    const footerDesc =
      props.footer?.description ??
      "A leading global management consulting firm helping organizations achieve sustainable competitive advantage through strategy, operations, and transformation."
    const footerServicesHeading = props.footer?.servicesHeading ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
        "Corporate Strategy",
        "Digital Transformation",
        "M&A Advisory",
        "Operations Excellence",
        "Organization & Change",
        "Risk & Compliance",
      ]
    const footerCompanyHeading = props.footer?.companyHeading ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : [
        "About Us",
        "Our Team",
        "Case Studies",
        "Insights",
        "Careers",
        "Contact",
      ]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "350 Park Avenue, Suite 1800, New York, NY 10022"
    const footerEmail = props.footer?.email ?? "contact@nexusstrategy.com"
    const footerPhone = props.footer?.phone ?? "+1 (800) 555-0199"
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand logo tile — solid neutral square with the brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-sm bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const StarRow = () => (
      <div className="mb-6 flex gap-1 text-chart-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    const serviceIcons: ReactNode[] = [
      // chart / strategy
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
      // bolt / digital
      <svg
        key="bolt"
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // currency / M&A
      <svg
        key="currency"
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
      // briefcase / operations
      <svg
        key="briefcase"
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
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // people / org
      <svg
        key="people"
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
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // shield / risk
      <svg
        key="shield"
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
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
    ]

    // Highlight the muted phrase inside the hero heading.
    const renderHeading = () => {
      const idx = heroHighlight ? heroHeading.indexOf(heroHighlight) : -1
      if (idx === -1) return heroHeading
      return (
        <>
          {heroHeading.slice(0, idx)}
          <span className="text-muted-foreground">{heroHighlight}</span>
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
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {brand}
              </span>
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
                className="hidden rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Contact Us
              </button>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground md:hidden"
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
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
                    {heroEyebrow}
                  </div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {renderHeading()}
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-all hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-8 pt-4 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckIcon className="size-5 text-muted-foreground" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-2xl bg-secondary/60"
                  />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="relative aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-lg bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                        {heroStatValue}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {heroStatTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroStatSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
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
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-border bg-muted p-8 transition-all hover:bg-card hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process — dark band */}
          <section className="bg-primary py-24 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {processHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">
                  {processDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 text-6xl font-bold text-primary-foreground/20">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="leading-relaxed text-primary-foreground/60">
                      {step.description}
                    </p>
                    {i < processSteps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden h-px w-full -translate-x-8 bg-primary-foreground/20 lg:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Case Studies */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {caseHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {caseDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(caseViewAll)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
                >
                  {caseViewAll}
                  <ArrowRight />
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {caseItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group block w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-xl"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground">
                          {item.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-muted-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.duration}</span>
                        <span className="h-4 w-px bg-border" />
                        <span>{item.period}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing — Engagement Models */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl border p-8",
                      tier.featured
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted",
                    )}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-xl font-semibold",
                        tier.featured
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-3xl font-bold",
                          tier.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      {tier.unit && (
                        <span
                          className={cn(
                            tier.featured
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.unit}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.description}
                    </p>
                    <ul
                      className={cn(
                        "mb-8 space-y-3 text-sm",
                        tier.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckIcon
                            className={cn(
                              "mt-0.5 size-5 flex-shrink-0",
                              tier.featured
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground",
                            )}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-md px-4 py-3 font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats — dark band */}
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="text-4xl font-bold sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-sm uppercase tracking-wide text-primary-foreground/60">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8 shadow-sm"
                  >
                    <StarRow />
                    <p className="mb-6 leading-relaxed text-card-foreground">
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
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Insights */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {insightsHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {insightsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(insightsViewAll)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
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
                    <div className="relative mb-4 h-48 overflow-hidden rounded-lg">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {item.category}
                        </span>
                        <span className="size-1 rounded-full bg-muted-foreground" />
                        <span>{item.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg border border-border bg-card open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.question}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA — dark card */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12 lg:p-16">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
                  {ctaDesc}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="inline-flex items-center justify-center rounded-md bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {ctaPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaPhone)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {ctaPhone}
                  </button>
                </div>
                <p className="mt-6 text-sm text-primary-foreground/60">
                  {ctaNote}
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-3"
                >
                  <LogoMark className="size-10 text-lg" />
                  <span className="text-lg font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {(["LinkedIn", "Twitter", "YouTube"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-full border border-border bg-background text-sm font-medium text-muted-foreground transition-all hover:border-input hover:text-foreground"
                      >
                        {social.charAt(0)}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerServicesHeading}
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {footerServicesLinks.map((link) => (
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
              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerCompanyHeading}
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {footerCompanyLinks.map((link) => (
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
              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerContactHeading}
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
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
                      className="mt-0.5 size-5 flex-shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
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
                      className="mt-0.5 size-5 flex-shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-left transition-colors hover:text-foreground"
                    >
                      {footerEmail}
                    </button>
                  </li>
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
                      className="mt-0.5 size-5 flex-shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-left transition-colors hover:text-foreground"
                    >
                      {footerPhone}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} {brand}. All rights reserved.
                </p>
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
          </div>
        </footer>
      </div>
    )
  },
})
