import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * InteriorDesignKimiPage — a complete, self-contained interior-design STUDIO
 * landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Atelier Studio" design: a
 * warm, editorial, gallery-like aesthetic with airy whitespace, light-font
 * serif/sans headings (some italicized), uppercase tracked eyebrows, and a
 * neutral stone palette mapped to semantic tokens. It pairs a split hero
 * (eyebrow + light headline with italic accent + dual CTAs + award badges +
 * a featured-project photo card) with a trusted-by logo strip, a 3-up design
 * services grid, a numbered 4-step process band, a filterable 6-up project
 * portfolio gallery with image-zoom hover, an inverted dark services/pricing
 * list, a 4-up stats band, a 3-up client testimonials grid with star ratings
 * and headshots, a 5-item FAQ accordion, a contact CTA with studio details +
 * a real inquiry form, and a rich footer with social links.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces. Every nav
 * item / CTA / footer link / social / form submit routes through
 * `useNavigate` (never a dead "#"). All imagery (hero, portfolio, headshots)
 * uses the alt-driven <Image> component (never a raw src). Callers supply only
 * content data; rich defaults make it render great with no props at all.
 */
export const InteriorDesignKimiPage = defineCapsule({
  name: "InteriorDesignKimiPage",
  description:
    "Complete interior-design / architecture STUDIO landing page with a warm, editorial, gallery-like aesthetic: airy whitespace, light-weight headings with italic accents, uppercase tracked eyebrow labels and a refined neutral stone palette. Includes a split hero (Est. eyebrow, elegant headline, dual CTAs, award badges and a featured-project photo card), a trusted-by brand logo strip, a 3-up design-services grid with line icons (residential, commercial, furniture curation), a numbered 4-step process band (Discovery, Concept, Development, Delivery), a filterable 6-up project portfolio gallery with image-zoom hover and location captions, an inverted dark services-and-pricing list, a 4-up stats band, a 3-up client testimonials grid with star ratings and headshots, a 5-question FAQ accordion, and a contact section with studio address/email/phone plus a real inquiry form. Use as the ROOT/home page for interior designers, design studios, architecture firms, home staging, renovation, furniture or decor businesses when an upscale, timeless, conversion-focused page with strong project showcase and social proof is wanted. Supply content only — brand, nav, hero, logos, services, process, projects, pricing, stats, testimonials, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** First heading line. */
        headingTop: z.string().optional(),
        /** Italic-accented word in the headline. */
        headingItalic: z.string().optional(),
        /** Trailing heading text after the italic word. */
        headingEnd: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        featuredEyebrow: z.string().optional(),
        featuredTitle: z.string().optional(),
        featuredMeta: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Design services grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered process steps band. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Project portfolio gallery. */
    projects: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              meta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted services + pricing list. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              price: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Client testimonials grid. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Contact CTA + inquiry form. */
    contact: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        submit: z.string().optional(),
        footnote: z.string().optional(),
        studioLabel: z.string().optional(),
        studioAddress: z.string().optional(),
        emailLabel: z.string().optional(),
        email: z.string().optional(),
        phoneLabel: z.string().optional(),
        phone: z.string().optional(),
        projectTypes: z.array(z.string()).optional(),
        budgets: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Atelier Studio"
    const nav = props.nav?.length
      ? props.nav
      : ["Projects", "Services", "Process", "About", "Contact"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2014 — San Francisco"
    const headingTop = props.hero?.headingTop ?? "Spaces that"
    const headingItalic = props.hero?.headingItalic ?? "inspire"
    const headingEnd = props.hero?.headingEnd ?? "living"
    const heroSub =
      props.hero?.subheading ??
      "Award-winning interior design studio crafting elegant, timeless spaces. We transform houses into homes and offices into environments where creativity flourishes."
    const heroPrimary = props.hero?.primaryCta ?? "View Our Work"
    const heroSecondary = props.hero?.secondaryCta ?? "Start Your Project"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["AD100 Designer", "250+ Projects"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Minimalist living room with neutral tones featuring a cream sofa, natural light through large windows, and contemporary interior design"
    const featuredEyebrow = props.hero?.featuredEyebrow ?? "Featured Project"
    const featuredTitle = props.hero?.featuredTitle ?? "Pacific Heights Residence"
    const featuredMeta = props.hero?.featuredMeta ?? "San Francisco, CA — Residential"

    const logosHeading = props.logos?.heading ?? "Trusted by leading brands"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "West Elm",
          "Restoration",
          "Crate&Barrel",
          "Design Within",
          "Herman Miller",
          "Knoll",
        ]

    const servicesHeading =
      props.services?.heading ?? "Design excellence in every detail"
    const servicesDesc =
      props.services?.description ??
      "We believe that exceptional design lies in the thoughtful curation of space, light, and material. Our approach combines architectural integrity with personalized aesthetics."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Residential Design",
            description:
              "Complete home transformations from single rooms to full estates. We create living spaces that reflect your lifestyle while maximizing comfort and functionality.",
          },
          {
            title: "Commercial Spaces",
            description:
              "Offices, retail, and hospitality environments designed to enhance productivity and brand identity. Strategic layouts that inspire teams and impress clients.",
          },
          {
            title: "Furniture Curation",
            description:
              "Bespoke furniture selection and custom piece design. From vintage finds to contemporary maker collaborations, every piece tells a story in your space.",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "How we work"
    const processDesc =
      props.process?.description ??
      "A refined approach to interior design that ensures every project receives the attention and expertise it deserves."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery",
            description:
              "In-depth consultation to understand your vision, lifestyle, and spatial needs. We visit your site and assess every dimension.",
          },
          {
            title: "Concept",
            description:
              "Mood boards, material palettes, and spatial layouts. We present 2-3 distinct design directions for your consideration.",
          },
          {
            title: "Development",
            description:
              "Detailed drawings, 3D renderings, and furniture specifications. Every element is meticulously planned and documented.",
          },
          {
            title: "Delivery",
            description:
              "Project management through installation and final styling. We ensure flawless execution down to the last accessory.",
          },
        ]

    const projectsEyebrow = props.projects?.eyebrow ?? "Portfolio"
    const projectsHeading = props.projects?.heading ?? "Selected projects"
    const projectFilters = props.projects?.filters?.length
      ? props.projects.filters
      : ["All", "Residential", "Commercial"]
    const projectsViewAll = props.projects?.viewAll ?? "View All Projects"
    const projectItems = props.projects?.items?.length
      ? props.projects.items
      : [
          {
            tag: "Residential",
            title: "Tiburon Bay House",
            meta: "Tiburon, California — 2024",
          },
          {
            tag: "Residential",
            title: "Napa Valley Retreat",
            meta: "St. Helena, California — 2023",
          },
          {
            tag: "Commercial",
            title: "Meridian Offices",
            meta: "San Francisco, California — 2023",
          },
          {
            tag: "Residential",
            title: "Presidio Heights Kitchen",
            meta: "San Francisco, California — 2024",
          },
          {
            tag: "Hospitality",
            title: "The Calistoga Inn",
            meta: "Calistoga, California — 2022",
          },
          {
            tag: "Residential",
            title: "Sausalito Master Bath",
            meta: "Sausalito, California — 2023",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Services"
    const pricingHeading =
      props.pricing?.heading ?? "Comprehensive design services"
    const pricingDesc =
      props.pricing?.description ??
      "From initial concept to final installation, we offer a full spectrum of interior design services tailored to projects of every scale."
    const pricingCta = props.pricing?.cta ?? "Request Service Guide"
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            title: "Full-Service Design",
            price: "From $25,000",
            description:
              "Complete interior design from concept through installation. Includes space planning, material selection, custom furniture design, and project management.",
          },
          {
            title: "Design Consultation",
            price: "$500/hour",
            description:
              "Professional guidance for DIY projects or renovation planning. Includes detailed recommendations, material suggestions, and vendor referrals.",
          },
          {
            title: "Furniture Procurement",
            price: "Project-based",
            description:
              "Access to trade-only furniture and decor with designer discounts. We source, procure, and coordinate delivery and placement.",
          },
          {
            title: "Styling & Accessories",
            price: "From $5,000",
            description:
              "The finishing touches that make a house a home. Art curation, accessory selection, and professional styling for photography or living.",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "250+", label: "Projects Completed" },
          { value: "10", label: "Years Experience" },
          { value: "15", label: "Design Awards" },
          { value: "98%", label: "Client Satisfaction" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What our clients say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Atelier transformed our Victorian into a space that honors its history while feeling completely contemporary. Their attention to detail and understanding of how we live made all the difference.",
            name: "Sarah Chen",
            role: "Pacific Heights Residence",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length dark hair wearing a navy blazer",
          },
          {
            quote:
              "The team at Atelier understood our brand immediately. Our new office space has transformed how we work and how clients perceive us. Truly exceptional work.",
            name: "Michael Torres",
            role: "CEO, Meridian Ventures",
            avatarAlt:
              "Professional headshot of a smiling man in his 40s with short gray hair wearing a crisp white dress shirt",
          },
          {
            quote:
              "Working with Atelier on our inn was a dream. They captured the essence of wine country elegance while creating spaces that feel intimate and welcoming.",
            name: "Emma Richardson",
            role: "Owner, Calistoga Inn",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair wearing a sage green blouse and simple gold jewelry",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is your typical project timeline?",
            answer:
              "Residential projects typically range from 3-6 months from concept to completion, depending on scope. Full home renovations may take 8-12 months. We provide detailed timelines during our initial consultation and keep you informed throughout every phase.",
          },
          {
            question: "How do you charge for your services?",
            answer:
              "We offer both flat-fee and hourly arrangements depending on project complexity. Full-service design typically starts at $25,000 for single-room projects. Consultations are $500/hour. We provide detailed proposals after our initial discovery meeting so you know exactly what to expect.",
          },
          {
            question: "Do you work with contractors and architects?",
            answer:
              "Absolutely. We have established relationships with top contractors, architects, and artisans throughout the Bay Area. We can recommend trusted professionals or work seamlessly with your existing team. Our project management ensures everyone stays aligned.",
          },
          {
            question: "Do you take on small projects or single rooms?",
            answer:
              "Yes, we love projects of all scales. Whether it's a complete home transformation or a single room refresh, we bring the same level of care and expertise. Our consultation services are also perfect for clients who want professional guidance for DIY projects.",
          },
          {
            question: "What areas do you serve?",
            answer:
              "We're based in San Francisco and primarily serve the Bay Area including Marin County, the Peninsula, and Napa/Sonoma. For select commercial and hospitality projects, we work nationally and internationally. Virtual consultations are available for out-of-area clients.",
          },
        ]

    const contactEyebrow = props.contact?.eyebrow ?? "Start Your Project"
    const contactHeading =
      props.contact?.heading ?? "Let's create something beautiful together"
    const contactDesc =
      props.contact?.description ??
      "Ready to transform your space? We'd love to hear about your project. Schedule a complimentary consultation to discuss your vision, timeline, and investment."
    const contactSubmit = props.contact?.submit ?? "Request Consultation"
    const contactFootnote =
      props.contact?.footnote ??
      "We typically respond within 24-48 hours. Initial consultations are complimentary."
    const studioLabel = props.contact?.studioLabel ?? "Studio"
    const studioAddress =
      props.contact?.studioAddress ??
      "465 California Street, Suite 1200\nSan Francisco, CA 94104"
    const emailLabel = props.contact?.emailLabel ?? "Email"
    const contactEmail = props.contact?.email ?? "hello@atelierstudio.co"
    const phoneLabel = props.contact?.phoneLabel ?? "Phone"
    const contactPhone = props.contact?.phone ?? "(415) 555-0147"
    const projectTypes = props.contact?.projectTypes?.length
      ? props.contact.projectTypes
      : [
          "Select project type",
          "Residential — Full Home",
          "Residential — Single Room",
          "Commercial Office",
          "Hospitality",
          "Design Consultation",
          "Other",
        ]
    const budgets = props.contact?.budgets?.length
      ? props.contact.budgets
      : [
          "Select budget range",
          "$25,000 — $50,000",
          "$50,000 — $100,000",
          "$100,000 — $250,000",
          "$250,000+",
        ]

    const footerAbout =
      props.footer?.about ??
      "Award-winning interior design studio based in San Francisco. Creating timeless, elegant spaces since 2014."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Pinterest", "LinkedIn"]
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Residential Design",
          "Commercial Spaces",
          "Hospitality",
          "Furniture Curation",
          "Design Consultation",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Portfolio", "Press", "Careers", "Contact"]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service"]

    // Split a two-word brand into mark + faded suffix (e.g. "Atelier Studio").
    const brandParts = brand.split(" ")
    const brandMark = brandParts[0]
    const brandSuffix = brandParts.slice(1).join(" ")

    const Star = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-foreground"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // home
      <svg
        key="home"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // briefcase
      <svg
        key="briefcase"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // sofa / furniture
      <svg
        key="furniture"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
    ]

    const inputCls =
      "w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-2xl font-light tracking-tight"
              >
                <span className="text-foreground">{brandMark}</span>
                {brandSuffix && (
                  <span className="text-muted-foreground">{brandSuffix}</span>
                )}
              </button>
              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="hidden items-center border border-foreground px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background md:inline-flex"
              >
                Book Consultation
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
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
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="px-4 pb-20 pt-32 sm:px-6 md:pb-32 md:pt-40 lg:px-8 lg:pb-40 lg:pt-48">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="text-4xl font-light leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="font-extralight italic">
                      {headingItalic}
                    </span>{" "}
                    {headingEnd}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center border border-border px-8 py-4 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
                    {heroBadges.map((badge, i) => (
                      <div key={badge} className="flex items-center gap-2">
                        {i === 0 ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={1200}
                    h={800}
                    className="h-[400px] w-full object-cover md:h-[500px] lg:h-[600px]"
                  />
                  <div className="absolute inset-x-6 bottom-6 bg-card/95 p-6 backdrop-blur-sm md:p-8">
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {featuredEyebrow}
                    </p>
                    <h3 className="mb-1 text-xl font-medium text-card-foreground">
                      {featuredTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {featuredMeta}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted-by logos */}
          <section className="border-y border-border bg-muted py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <div
                    key={logo}
                    className={cn(
                      "flex h-12 items-center justify-center",
                      i >= 4 && "hidden lg:flex",
                    )}
                  >
                    <span className="text-xl font-light tracking-wide text-foreground">
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services / features */}
          <section className="px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-16 max-w-2xl md:mb-24">
                <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {servicesDesc}
                </p>
              </div>
              <div className="grid gap-12 md:grid-cols-3 md:gap-16">
                {serviceItems.map((item, i) => (
                  <div key={item.title} className="space-y-6">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="text-xl font-medium text-foreground">
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

          {/* Process steps */}
          <section className="bg-muted px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {processEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
                  {processHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {processDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-4 md:gap-6 lg:gap-12">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <span className="absolute -left-2 -top-4 text-5xl font-extralight text-muted-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="pt-12">
                      <h3 className="mb-3 text-lg font-medium text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Project gallery */}
          <section className="px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {projectsEyebrow}
                  </p>
                  <h2 className="text-3xl font-light text-foreground md:text-4xl">
                    {projectsHeading}
                  </h2>
                </div>
                <div className="flex gap-4">
                  {projectFilters.map((filter, i) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => go(filter)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        i === 0
                          ? "border-b-2 border-foreground text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {projectItems.map((project) => (
                  <button
                    key={project.title}
                    type="button"
                    onClick={() => go(project.title)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div className="mb-5 overflow-hidden">
                      <Image
                        alt={`${project.title} — ${project.tag} interior design project`}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-96"
                      />
                    </div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {project.tag}
                    </p>
                    <h3 className="mb-1 text-xl font-medium text-foreground">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.meta}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-16 text-center">
                <button
                  type="button"
                  onClick={() => go(projectsViewAll)}
                  className="inline-flex items-center border border-border px-8 py-4 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  {projectsViewAll}
                </button>
              </div>
            </div>
          </section>

          {/* Inverted services + pricing */}
          <section className="bg-foreground px-4 py-20 text-background sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
                <div>
                  <p className="mb-4 text-xs font-medium uppercase tracking-widest text-background/60">
                    {pricingEyebrow}
                  </p>
                  <h2 className="mb-8 text-3xl font-light md:text-4xl">
                    {pricingHeading}
                  </h2>
                  <p className="mb-12 max-w-lg leading-relaxed text-background/70">
                    {pricingDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(pricingCta)}
                    className="inline-flex items-center bg-background px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
                  >
                    {pricingCta}
                  </button>
                </div>

                <div className="space-y-8">
                  {pricingItems.map((item, i) => (
                    <div
                      key={item.title}
                      className={cn(
                        "pb-8",
                        i < pricingItems.length - 1 &&
                          "border-b border-background/20",
                      )}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <h3 className="text-xl font-medium">{item.title}</h3>
                        <span className="whitespace-nowrap text-sm text-background/60">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-background/70">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border bg-muted px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:gap-12">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-2 text-4xl font-light text-foreground md:text-5xl">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3 md:gap-12">
                {testimonialItems.map((t) => (
                  <blockquote key={t.name} className="space-y-6">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} />
                      ))}
                    </div>
                    <p className="italic leading-relaxed text-foreground/80">
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
                        <p className="font-medium text-foreground">{t.name}</p>
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

          {/* FAQ */}
          <section className="bg-muted px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-16 text-center">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="text-3xl font-light text-foreground md:text-4xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-sm bg-card transition-shadow open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-8 text-lg font-medium text-card-foreground">
                        {item.question}
                      </h3>
                      <span className="text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
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

          {/* Contact CTA + form */}
          <section className="px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div>
                    <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {contactEyebrow}
                    </p>
                    <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
                      {contactHeading}
                    </h2>
                    <p className="leading-relaxed text-muted-foreground">
                      {contactDesc}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {studioLabel}
                        </p>
                        <p className="whitespace-pre-line text-muted-foreground">
                          {studioAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {emailLabel}
                        </p>
                        <button
                          type="button"
                          onClick={() => go(contactEmail)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {contactEmail}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {phoneLabel}
                        </p>
                        <button
                          type="button"
                          onClick={() => go(contactPhone)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {contactPhone}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(contactSubmit)
                  }}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="id-first-name"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        First Name
                      </label>
                      <input
                        id="id-first-name"
                        type="text"
                        required
                        placeholder="Enter first name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="id-last-name"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Last Name
                      </label>
                      <input
                        id="id-last-name"
                        type="text"
                        required
                        placeholder="Enter last name"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="id-email"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Email Address
                    </label>
                    <input
                      id="id-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="id-project-type"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Project Type
                    </label>
                    <select
                      id="id-project-type"
                      className={cn(inputCls, "appearance-none")}
                    >
                      {projectTypes.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="id-budget"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Estimated Budget
                    </label>
                    <select
                      id="id-budget"
                      className={cn(inputCls, "appearance-none")}
                    >
                      {budgets.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="id-message"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Tell Us About Your Project
                    </label>
                    <textarea
                      id="id-message"
                      rows={4}
                      placeholder="Describe your space, timeline, and any specific design goals..."
                      className={cn(inputCls, "resize-none")}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                  >
                    {contactSubmit}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    {contactFootnote}
                  </p>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground px-4 py-16 text-background sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2 text-2xl font-light tracking-tight"
                >
                  <span>{brandMark}</span>
                  {brandSuffix && (
                    <span className="text-background/60">{brandSuffix}</span>
                  )}
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-background/70">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      <span className="text-xs font-medium">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-medium text-background/80">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-3 text-sm text-background/70">
                  {footerServicesLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-medium text-background/80">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3 text-sm text-background/70">
                  {footerCompanyLinks.map((link) => (
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
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/60">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm text-background/60">
                {footerLegalLinks.map((link) => (
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
