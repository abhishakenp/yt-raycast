import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ConstructionKimiPage2 — TEMPLATE VARIANT 2 for the construction category.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Ironclad Construction" design.
 * This is the BRIGHT / warm-orange sibling of ConstructionKimiPage: where the first
 * variant leans on a full-bleed dark photographic hero, this one opens with a LIGHT
 * split two-column hero — bold "Building Your Vision Into Reality" headline, rating +
 * stacked-avatar social proof on the left, a framed jobsite/crane photo card with
 * floating "New Project" caption and an "On-Time Delivery" stat chip on the right.
 * It then runs a dark four-up stats band, a six-up icon-and-checklist services grid,
 * a dark numbered six-phase process, a featured-projects gallery with colored category
 * tags, a three-tier per-square-foot pricing table (Residential Essentials / Commercial
 * Builder featured-dark / Enterprise Development), a five-quote testimonials grid with a
 * highlighted "Join 500+ Happy Clients" CTA card, a six-item FAQ accordion with rotating
 * circular chevrons, a gradient "Ready to Build Something Amazing?" lead-capture quote
 * form, and a dark four-column footer. Every surface uses only semantic theme tokens
 * (background / card / muted / primary / accent / foreground) so it is theme-injectable.
 */
export const ConstructionKimiPage2 = defineComponent({
  name: "ConstructionKimiPage2",
  description:
    "Construction company / general-contractor marketing LANDING page — VARIANT 2, an alternative SECOND style and bright sibling to ConstructionKimiPage. Distinct LIGHT, warm, energetic aesthetic: a split two-column hero (bold 'Building Your Vision Into Reality' headline, star-rating + stacked client avatars and trust pill on the left, a framed construction crane/jobsite photo card with a floating 'New Project' caption and an 'On-Time Delivery' percentage chip on the right) instead of variant 1's dark full-bleed hero. Includes a dark four-up stats band (projects completed, years experience, expert workers, project value), a trusted-by client logo wall with inline brand glyphs, a six-up services grid (commercial construction, residential projects, renovation & remodeling, site development, project management, emergency services) where each card has an icon tile plus a feature checklist, a dark six-phase numbered process timeline (consultation, design & planning, proposal, pre-construction, construction, final delivery) with durations, a featured-projects gallery with colored category tags (commercial, residential, institutional, industrial) and image-zoom hover, a three-tier per-square-foot pricing table (Residential Essentials / Commercial Builder as a dark Most Popular tier / Enterprise Development), a five-quote star-rated testimonials grid with avatars and a highlighted 'Join 500+ Happy Clients' CTA card, a six-item FAQ accordion with rotating circular chevrons, a gradient 'Ready to Build Something Amazing?' lead-capture quote form (name, email, phone, project type, project details, call-us line), and a dark four-column footer with services / company / contact columns and social links. Use as the ROOT/home page for construction firms, general contractors, builders, home builders, remodeling and renovation companies, design-build firms, commercial or industrial contractors and trades businesses when a credible, conversion-focused construction page with a brighter, more vibrant look than variant 1 is wanted — pick this when a repeat construction prompt should yield a visually different result. Supply content only — brand, nav, hero, stats, logos, services, process, projects, pricing, testimonials, faq, quote form, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Highlighted word inside the heading. */
        headingHighlight: z.string().optional(),
        headingEnd: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        cardTag: z.string().optional(),
        cardTitle: z.string().optional(),
        cardMeta: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        ratingNote: z.string().optional(),
        /** Alt text for the stacked reviewer avatars. */
        avatars: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark headline stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Trusted-by client logo wall. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services / capabilities grid (icon tile + checklist per card). */
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
              points: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark numbered process timeline. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              duration: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Featured-projects gallery. */
    projects: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              detail: z.string(),
              tag: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Three-tier per-square-foot pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              priceSuffix: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client testimonials grid (last cell is a CTA card). */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
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
        ctaTitle: z.string().optional(),
        ctaDescription: z.string().optional(),
        ctaButton: z.string().optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Gradient quote / lead-capture form. */
    quote: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        submit: z.string().optional(),
        callNote: z.string().optional(),
        callNumber: z.string().optional(),
        disclaimer: z.string().optional(),
        projectTypes: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Ironclad"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Projects", "Process", "Testimonials"]

    const heroBadge = props.hero?.badge ?? "25+ Years of Building Excellence"
    const heroHeadingTop = props.hero?.headingTop ?? "Building Your "
    const heroHeadingHighlight = props.hero?.headingHighlight ?? "Vision"
    const heroHeadingEnd = props.hero?.headingEnd ?? " Into Reality"
    const heroSub =
      props.hero?.subheading ??
      "From commercial high-rises to custom homes, Ironclad Construction delivers precision engineering, quality craftsmanship, and on-time delivery. Your project deserves nothing less than extraordinary."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Project"
    const heroSecondary = props.hero?.secondaryCta ?? "View Our Work"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Construction crane lifting materials at a high-rise building site during golden hour"
    const heroCardTag = props.hero?.cardTag ?? "New Project"
    const heroCardTitle = props.hero?.cardTitle ?? "Meridian Tower"
    const heroCardMeta = props.hero?.cardMeta ?? "42-Story Commercial Complex"
    const heroStatValue = props.hero?.statValue ?? "98%"
    const heroStatLabel = props.hero?.statLabel ?? "On-Time Delivery"
    const heroRatingNote = props.hero?.ratingNote ?? "Trusted by 500+ clients"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "Professional headshot of a construction manager in a hard hat",
          "Professional headshot of a female project manager smiling",
          "Professional headshot of a senior site supervisor",
          "Professional headshot of an architect with glasses",
        ]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "500+", label: "Projects Completed" },
          { value: "25", label: "Years Experience" },
          { value: "180+", label: "Expert Workers" },
          { value: "$2.4B", label: "Project Value" },
        ]

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading companies across industries"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Acme Corp", "Voltex Inc", "Orbit LLC", "Block & Co", "Apex Group", "Shield Co"]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Full-Service Construction Solutions"
    const servicesDesc =
      props.services?.description ??
      "From initial design to final inspection, we handle every aspect of your construction project with expertise and precision."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Commercial Construction",
            description:
              "Office buildings, retail centers, warehouses, and industrial facilities built to spec with modern amenities and sustainable practices.",
            points: ["Office Buildings", "Retail Centers", "Warehouses"],
          },
          {
            title: "Residential Projects",
            description:
              "Custom homes, multi-family developments, and luxury estates designed for modern living with timeless appeal.",
            points: ["Custom Homes", "Townhomes", "Luxury Estates"],
          },
          {
            title: "Renovation & Remodeling",
            description:
              "Transform existing spaces with our comprehensive renovation services. Kitchen, bath, additions, and full property overhauls.",
            points: ["Kitchen Remodels", "Bathroom Upgrades", "Home Additions"],
          },
          {
            title: "Site Development",
            description:
              "Complete site preparation including excavation, grading, utilities installation, and landscaping for ready-to-build sites.",
            points: ["Land Clearing", "Grading & Excavation", "Utility Installation"],
          },
          {
            title: "Project Management",
            description:
              "End-to-end project oversight ensuring on-time delivery, budget compliance, and quality control at every phase.",
            points: ["Schedule Management", "Budget Tracking", "Quality Assurance"],
          },
          {
            title: "Emergency Services",
            description:
              "24/7 rapid response for storm damage, structural repairs, and urgent construction needs. We're always on call.",
            points: ["Storm Damage Repair", "Structural Stabilization", "24/7 Response Team"],
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "How We Build Excellence"
    const processDesc =
      props.process?.description ??
      "A proven six-phase approach that delivers exceptional results on every project, every time."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Initial Consultation",
            description:
              "We meet to understand your vision, requirements, timeline, and budget. This foundational conversation ensures we align on expectations from day one.",
            duration: "Timeline: 1-2 Days",
          },
          {
            title: "Design & Planning",
            description:
              "Our architects and engineers create detailed plans, 3D renderings, and comprehensive specifications. We handle permits and regulatory compliance.",
            duration: "Timeline: 2-4 Weeks",
          },
          {
            title: "Detailed Proposal",
            description:
              "You receive a comprehensive quote with transparent pricing, project milestones, material specifications, and payment schedule.",
            duration: "Timeline: 3-5 Days",
          },
          {
            title: "Pre-Construction",
            description:
              "Site preparation, material procurement, team assembly, and final schedule confirmation. We set the stage for efficient execution.",
            duration: "Timeline: 1-2 Weeks",
          },
          {
            title: "Construction",
            description:
              "Our skilled crews execute with precision. Regular progress updates, quality inspections, and open communication keep you informed throughout.",
            duration: "Timeline: Project Dependent",
          },
          {
            title: "Final Delivery",
            description:
              "Thorough inspection, punch list completion, final walkthrough, and documentation handover. We don't consider it done until you're thrilled.",
            duration: "Timeline: 3-7 Days",
          },
        ]

    const projectsEyebrow = props.projects?.eyebrow ?? "Featured Projects"
    const projectsHeading =
      props.projects?.heading ?? "Buildings That Define Skylines"
    const projectsDesc =
      props.projects?.description ??
      "Explore our portfolio of landmark commercial and residential projects completed across the nation."
    const projectsFilters = props.projects?.filters?.length
      ? props.projects.filters
      : ["All", "Commercial", "Residential"]
    const projectsViewAll = props.projects?.viewAll ?? "View All 500+ Projects"
    const projectItems = props.projects?.items?.length
      ? props.projects.items
      : [
          {
            title: "Meridian Plaza",
            meta: "42-Story Mixed-Use Tower • Chicago, IL",
            detail: "Completed: March 2024 • $84M",
            tag: "Commercial",
          },
          {
            title: "Apex Corporate Center",
            meta: "Class-A Office Complex • Austin, TX",
            detail: "Completed: December 2023 • $42M",
            tag: "Commercial",
          },
          {
            title: "Summit Ridge Estate",
            meta: "Custom Luxury Home • Denver, CO",
            detail: "Completed: August 2023 • $3.2M",
            tag: "Residential",
          },
          {
            title: "Harborview Cultural Center",
            meta: "Arts & Performance Venue • Seattle, WA",
            detail: "Completed: June 2023 • $28M",
            tag: "Institutional",
          },
          {
            title: "Casa del Sol",
            meta: "Mediterranean Villa • Phoenix, AZ",
            detail: "Completed: April 2023 • $4.8M",
            tag: "Residential",
          },
          {
            title: "Vanguard Distribution Hub",
            meta: "Logistics Center • Nashville, TN",
            detail: "Completed: January 2023 • $56M",
            tag: "Industrial",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Service Packages"
    const pricingHeading =
      props.pricing?.heading ?? "Transparent Pricing for Every Project"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the engagement model that fits your needs. All quotes include detailed breakdowns with no hidden fees."
    const pricingPopular = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Residential Essentials",
            description:
              "Perfect for home renovations, additions, and custom builds up to 3,000 sq ft.",
            price: "$175",
            priceSuffix: "/sq ft starting",
            features: [
              "Full design consultation",
              "Permit acquisition included",
              "Premium material selection",
              "1-year workmanship warranty",
              "Project management included",
            ],
            cta: "Get Custom Quote",
          },
          {
            name: "Commercial Builder",
            description:
              "Mid-size commercial projects including offices, retail, and light industrial.",
            price: "$225",
            priceSuffix: "/sq ft starting",
            features: [
              "Complete project management",
              "LEED consultation available",
              "Advanced scheduling software",
              "2-year warranty coverage",
              "Dedicated project superintendent",
              "24/7 emergency support",
            ],
            cta: "Get Commercial Quote",
            featured: true,
          },
          {
            name: "Enterprise Development",
            description:
              "Large-scale developments, high-rises, and complex institutional projects.",
            price: "Custom",
            priceSuffix: "",
            features: [
              "Executive oversight team",
              "Full BIM integration",
              "Value engineering analysis",
              "5-year warranty coverage",
              "Post-construction services",
            ],
            cta: "Contact Enterprise Team",
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Client Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what industry leaders and homeowners say about working with Ironclad."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Ironclad delivered our 240,000 sq ft distribution center two weeks ahead of schedule and $200K under budget. Their communication was exceptional throughout the entire process.",
            name: "Michael Chen",
            role: "VP of Operations, LogiTech Industries",
            avatarAlt: "Professional headshot of Michael Chen, VP of Operations",
          },
          {
            quote:
              "After a devastating storm damaged our headquarters, Ironclad's emergency team responded within hours. They had us back in business in 6 weeks—unbelievable work.",
            name: "Sarah Williams",
            role: "CEO, Coastal Financial Group",
            avatarAlt: "Professional headshot of Sarah Williams, CEO",
          },
          {
            quote:
              "They built our dream home with such attention to detail. Every finish is perfect, and they were transparent about costs from day one. Worth every penny.",
            name: "David & Jennifer Park",
            role: "Homeowners, Austin TX",
            avatarAlt: "Professional headshot of David Park, homeowner",
          },
          {
            quote:
              "Working with Ironclad on our medical office expansion was seamless. They understood the unique requirements of healthcare construction and delivered flawlessly.",
            name: "Dr. Emily Rodriguez",
            role: "Medical Director, HealthFirst Clinics",
            avatarAlt: "Professional headshot of Dr. Emily Rodriguez",
          },
          {
            quote:
              "Our retail chain has used Ironclad for 12 store builds. Consistent quality, predictable timelines, and they always clean up the site perfectly. True professionals.",
            name: "Robert Thompson",
            role: "Director of Development, Urban Retail Inc",
            avatarAlt: "Professional headshot of Robert Thompson",
          },
        ]
    const testimonialsCtaTitle =
      props.testimonials?.ctaTitle ?? "Join 500+ Happy Clients"
    const testimonialsCtaDesc =
      props.testimonials?.ctaDescription ??
      "Ready to start your project? Get a free, no-obligation quote in 24 hours."
    const testimonialsCtaButton =
      props.testimonials?.ctaButton ?? "Get Your Quote"

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working with Ironclad Construction."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How long does a typical project take?",
            a: "Project timelines vary based on scope and complexity. A typical home renovation takes 3-6 months, custom homes 8-14 months, and commercial projects 12-36 months. We provide detailed schedules during the proposal phase and have a 98% on-time completion rate.",
          },
          {
            q: "What areas do you serve?",
            a: "We operate across 15 states with regional offices in Chicago, Austin, Denver, Seattle, and Nashville. For larger commercial projects, we'll travel nationwide. Contact us to confirm service availability in your area.",
          },
          {
            q: "Do you offer financing options?",
            a: "Yes, we've partnered with leading construction lenders to offer competitive financing for qualified residential and commercial clients. We also offer phased payment schedules for larger projects. Ask about options during your consultation.",
          },
          {
            q: "Are you licensed and insured?",
            a: "Absolutely. We maintain full licensing in every state we operate, carry comprehensive general liability insurance ($10M), workers' compensation, and professional liability coverage. Certificates of insurance available upon request.",
          },
          {
            q: "What warranties do you provide?",
            a: "All projects include our standard 1-year workmanship warranty. Commercial Builder packages include 2-year coverage, and Enterprise clients receive 5-year comprehensive warranties. Structural elements carry industry-standard 10-year coverage.",
          },
          {
            q: "Can you work with my architect?",
            a: "Yes, we regularly collaborate with external architects and designers. We also have in-house design-build capabilities if you prefer a streamlined approach. We're flexible to match your preferred working style.",
          },
        ]

    const quoteHeading =
      props.quote?.heading ?? "Ready to Build Something Amazing?"
    const quoteDesc =
      props.quote?.description ??
      "Get your free, detailed quote within 24 hours. No obligation, no pressure—just expert guidance and transparent pricing."
    const quoteSubmit = props.quote?.submit ?? "Get My Free Quote"
    const quoteCallNote = props.quote?.callNote ?? "Or call us directly at"
    const quoteCallNumber = props.quote?.callNumber ?? "1-800-555-BUILD"
    const quoteDisclaimer =
      props.quote?.disclaimer ??
      "By submitting, you agree to our privacy policy. We'll never share your information with third parties."
    const quoteProjectTypes = props.quote?.projectTypes?.length
      ? props.quote.projectTypes
      : [
          "Select a project type",
          "Custom Home",
          "Renovation/Addition",
          "Commercial Building",
          "Industrial/Warehouse",
          "Institutional/Public",
          "Other",
        ]

    const footerAbout =
      props.footer?.about ??
      "Building excellence since 1999. Commercial and residential construction with a commitment to quality, safety, and on-time delivery."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Commercial Construction",
          "Residential Projects",
          "Renovation & Remodeling",
          "Site Development",
          "Emergency Services",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Our Projects", "Careers", "News & Blog", "Contact"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "1250 Industrial Parkway, Chicago, IL 60608"
    const footerPhone = props.footer?.phone ?? "1-800-555-BUILD"
    const footerEmail = props.footer?.email ?? "build@ironclad.com"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "LinkedIn", "Instagram"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "License Info"]
    const footerNote = props.footer?.note ?? "All rights reserved."

    // Brand logo tile — a building glyph in a token-colored tile (decorative brand mark).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
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

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons = [
      // building / commercial
      <svg
        key="building"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
      </svg>,
      // home / residential
      <svg
        key="home"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
      </svg>,
      // star / renovation
      <svg
        key="star"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118L2.07 12.81c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" />
      </svg>,
      // cube / site development
      <svg
        key="cube"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 7m0 13V7" />
      </svg>,
      // document / project management
      <svg
        key="document"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>,
      // bolt / emergency
      <svg
        key="bolt"
        width="32"
        height="32"
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
    ]

    // Tag → token color rotation for project category chips.
    const tagToneFor = (tag: string) => {
      const t = tag.toLowerCase()
      if (t.includes("residential")) return "bg-chart-2 text-primary-foreground"
      if (t.includes("institutional")) return "bg-chart-4 text-primary-foreground"
      if (t.includes("industrial")) return "bg-chart-3 text-primary-foreground"
      return "bg-primary text-primary-foreground"
    }

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="group flex items-center gap-3"
              >
                <LogoMark className="size-10 transition-colors group-hover:bg-primary/90" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {brand}
                  <span className="text-primary">Construction</span>
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get a Quote
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-primary md:hidden"
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
                  <path d="M4 6h16M4 12h16M4 18h16" />
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
          <section className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-primary/5 py-20 lg:py-28">
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground lg:text-7xl">
                    {heroHeadingTop}
                    <span className="text-primary">{heroHeadingHighlight}</span>
                    {heroHeadingEnd}
                  </h1>
                  <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-card px-8 py-4 text-lg font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-4">
                    <div className="flex -space-x-3">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-12 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-5" />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {heroRatingNote}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 size-72 rounded-full bg-primary/20 blur-3xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-10 -left-10 size-72 rounded-full bg-accent/40 blur-3xl"
                  />
                  <div className="relative overflow-hidden rounded-2xl bg-card shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="h-80 w-full object-cover lg:h-96"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground">
                          {heroCardTag}
                        </div>
                        <div className="text-background">
                          <p className="font-semibold">{heroCardTitle}</p>
                          <p className="text-sm text-background/80">
                            {heroCardMeta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -left-6 flex items-center gap-4 rounded-xl bg-card p-4 shadow-xl">
                    <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
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
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {heroStatValue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {heroStatLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-4xl font-extrabold text-primary lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 font-medium text-background/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Logo wall */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center font-medium text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center gap-2 text-xl font-bold text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {i % 6 === 0 ? (
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      ) : i % 6 === 1 ? (
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      ) : i % 6 === 2 ? (
                        <circle cx="12" cy="12" r="10" />
                      ) : i % 6 === 3 ? (
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      ) : i % 6 === 4 ? (
                        <polygon points="12 2 22 22 2 22" />
                      ) : (
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      )}
                    </svg>
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-extrabold text-foreground lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted p-8 transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <div className="mb-6 grid size-16 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <Check className="size-4 text-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-foreground py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-primary">
                  {processEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-extrabold text-background lg:text-5xl">
                  {processHeading}
                </h2>
                <p className="text-xl text-background/60">{processDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {processSteps.map((step, i) => (
                  <div
                    key={step.title}
                    className="relative rounded-2xl border border-background/10 bg-background/5 p-8"
                  >
                    <div className="absolute -left-4 -top-4 grid size-12 place-items-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 mt-2 text-2xl font-bold text-background">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-background/60">
                      {step.description}
                    </p>
                    <div className="mt-6 border-t border-background/10 pt-6">
                      <p className="text-sm font-semibold text-primary">
                        {step.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Projects gallery */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-primary">
                    {projectsEyebrow}
                  </span>
                  <h2 className="mb-4 text-4xl font-extrabold text-foreground lg:text-5xl">
                    {projectsHeading}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    {projectsDesc}
                  </p>
                </div>
                <div className="flex gap-3">
                  {projectsFilters.map((filter, i) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => go(filter)}
                      className={cn(
                        "rounded-lg px-4 py-2 font-semibold transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projectItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group relative block overflow-hidden rounded-2xl text-left shadow-lg"
                  >
                    <Image
                      alt={proj.title}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span
                        className={cn(
                          "mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold",
                          tagToneFor(proj.tag),
                        )}
                      >
                        {proj.tag}
                      </span>
                      <h3 className="mb-1 text-xl font-bold text-background">
                        {proj.title}
                      </h3>
                      <p className="text-sm text-background/80">{proj.meta}</p>
                      <p className="mt-2 text-xs text-background/60">
                        {proj.detail}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(projectsViewAll)}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 text-lg font-bold text-background transition-colors hover:bg-foreground/90"
                >
                  {projectsViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-extrabold text-foreground lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8 shadow-lg",
                      tier.featured
                        ? "border-4 border-primary bg-foreground shadow-2xl"
                        : "border border-border bg-card",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                        {pricingPopular}
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-xl",
                        tier.featured
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {serviceIcons[tier.featured ? 0 : 1]}
                    </div>
                    <h3
                      className={cn(
                        "mb-2 text-2xl font-bold",
                        tier.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        tier.featured
                          ? "text-background/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.description}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-5xl font-extrabold",
                          tier.featured ? "text-background" : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      {tier.priceSuffix ? (
                        <span
                          className={cn(
                            tier.featured
                              ? "text-background/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.priceSuffix}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-3",
                            tier.featured
                              ? "text-background/80"
                              : "text-muted-foreground",
                          )}
                        >
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${tier.cta} — ${tier.name}`)}
                      className={cn(
                        "block w-full rounded-xl py-4 text-center font-bold transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-foreground text-background hover:bg-foreground/90",
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
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-extrabold text-foreground lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}

                <div className="flex flex-col items-center justify-center rounded-2xl bg-primary p-8 text-center text-primary-foreground">
                  <div className="mb-6 grid size-20 place-items-center rounded-full bg-primary-foreground/20">
                    <ArrowRight className="size-10" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">
                    {testimonialsCtaTitle}
                  </h3>
                  <p className="mb-6 text-primary-foreground/80">
                    {testimonialsCtaDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(testimonialsCtaButton)}
                    className="inline-block rounded-xl bg-background px-6 py-3 font-bold text-foreground transition-colors hover:bg-background/90"
                  >
                    {testimonialsCtaButton}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-extrabold text-foreground lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted">
                      <span className="text-lg font-bold text-foreground">
                        {item.q}
                      </span>
                      <span className="ml-6 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-all group-open:rotate-180 group-open:bg-primary/10 group-open:text-primary">
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
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Quote / CTA form */}
          <section className="relative overflow-hidden bg-primary py-24">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70"
            />
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-extrabold text-primary-foreground lg:text-5xl">
                  {quoteHeading}
                </h2>
                <p className="text-xl text-primary-foreground/80">
                  {quoteDesc}
                </p>
              </div>

              <form
                className="rounded-2xl bg-card p-8 shadow-2xl lg:p-10"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(quoteSubmit)
                }}
              >
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="con2-name"
                      className="mb-2 block text-sm font-bold text-foreground/80"
                    >
                      Full Name
                    </label>
                    <input
                      id="con2-name"
                      type="text"
                      required
                      placeholder="John Smith"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="con2-email"
                      className="mb-2 block text-sm font-bold text-foreground/80"
                    >
                      Email Address
                    </label>
                    <input
                      id="con2-email"
                      type="email"
                      required
                      placeholder="john@company.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="con2-phone"
                      className="mb-2 block text-sm font-bold text-foreground/80"
                    >
                      Phone Number
                    </label>
                    <input
                      id="con2-phone"
                      type="tel"
                      required
                      placeholder="(555) 123-4567"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="con2-type"
                      className="mb-2 block text-sm font-bold text-foreground/80"
                    >
                      Project Type
                    </label>
                    <select
                      id="con2-type"
                      required
                      className={cn(inputCls, "appearance-none")}
                    >
                      {quoteProjectTypes.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="con2-details"
                    className="mb-2 block text-sm font-bold text-foreground/80"
                  >
                    Project Details
                  </label>
                  <textarea
                    id="con2-details"
                    rows={4}
                    placeholder="Tell us about your project: size, timeline, budget range, special requirements..."
                    className={cn(inputCls, "resize-none")}
                  />
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:w-auto"
                  >
                    {quoteSubmit}
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {quoteCallNote}{" "}
                    <button
                      type="button"
                      onClick={() => go(quoteCallNumber)}
                      className="font-bold text-primary hover:underline"
                    >
                      {quoteCallNumber}
                    </button>
                  </p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {quoteDisclaimer}
                </p>
              </form>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <LogoMark className="size-10" />
                  <span className="text-xl font-bold text-background">
                    {brand}
                    <span className="text-primary">Construction</span>
                  </span>
                </button>
                <p className="mb-6 leading-relaxed text-background/60">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-xs font-bold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-bold text-background">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-3">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-bold text-background">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-bold text-background">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-3 text-background/60">
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
                      className="mt-0.5 shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="flex items-center gap-3 transition-colors hover:text-primary"
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
                        className="shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {footerPhone}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="flex items-center gap-3 transition-colors hover:text-primary"
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
                        className="shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                      </svg>
                      {footerEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {brand} Construction. {footerNote}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-primary"
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
