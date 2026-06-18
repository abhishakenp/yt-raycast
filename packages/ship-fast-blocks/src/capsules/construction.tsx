import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
import { Button } from "#/components/ui/button.tsx"
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

/**
 * ConstructionKimiPage — a complete, self-contained construction / general-contractor
 * marketing LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "BuiltRight Construction" design:
 * a grounded, professional aesthetic built on warm neutral (stone) surfaces mapped
 * to semantic tokens. It pairs a full-bleed dark hero (a "now booking" status pill,
 * a huge "Building excellence since 1987" headline over a faded jobsite photo with a
 * left-to-right scrim, dual CTAs, and a licensed/insured trust strip) with a client
 * logo wall, a four-up stats band, a six-up services grid, a six-step numbered
 * process, a featured-projects gallery with category tags, a three-tier pricing
 * table (Kitchen Remodel / Custom Home / Commercial Build), star-rated testimonials,
 * a six-item FAQ accordion, a dark "request a free estimate" quote form (name, email,
 * phone, project type, budget, timeline, details), and a four-column footer with
 * services / company / contact columns and social links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Surfaces use only
 * semantic theme tokens (background / card / muted / primary / foreground), so it is
 * theme-injectable. Every nav item / CTA / link / form submit routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav` array so
 * PageSwitch can swap pages. All content imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults make
 * it render great with no props at all.
 */
export const ConstructionKimiPage = defineCapsule({
  name: "ConstructionKimiPage",
  description:
    "Complete construction company / general-contractor marketing LANDING page with a grounded, trustworthy, professional aesthetic on warm neutral surfaces. Includes a full-bleed dark hero over a faded jobsite/crane photo (a 'now booking' status pill, a huge 'building excellence since 1987' headline, dual CTAs, and a licensed-and-insured trust strip), a trusted-by client logo wall, a four-up stats band (projects completed, years in business, total project value, client satisfaction), a six-up services grid (commercial construction, residential building, renovation & remodeling, project management, design-build, pre-construction) with icon tiles, a six-step numbered process timeline (consultation → site assessment → design → proposal → construction → delivery), a featured-projects gallery with category tags and image-zoom hover, a three-tier pricing table (Kitchen Remodel / Custom Home / Commercial Build with a Most Popular highlight), star-rated client testimonials with avatars, a six-item FAQ accordion, a dark 'request a free estimate' lead-capture quote form (name, email, phone, project type, budget, timeline, project details), and a four-column footer with services / company / contact columns and social links. Use as the ROOT/home page for construction firms, general contractors, builders, home-builders, remodeling and renovation companies, design-build firms, commercial contractors, or trades businesses when a credible, conversion-focused page with strong services, project showcase, transparent pricing, social proof and a quote form is wanted. Supply content only — brand, nav, hero, logos, stats, services, process, projects, pricing, testimonials, faq, quote form, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading top line. */
        headingTop: z.string().optional(),
        /** Heading bottom line (rendered stacked below the top line). */
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Trust badges beneath the hero copy. */
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by client logo wall. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Headline stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Services / capabilities grid. */
    services: z
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
    /** Numbered process / how-it-works timeline. */
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
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              tag: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Three-tier pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        popularLabel: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              priceSuffix: z.string(),
              note: z.string(),
              features: z.array(z.string()),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client testimonials. */
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
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark quote / lead-capture form. */
    quote: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
        projectTypes: z.array(z.string()).optional(),
        budgets: z.array(z.string()).optional(),
        timelines: z.array(z.string()).optional(),
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
  lakebed: {
    schema: {
      leadRequests: table({
        name: string(),
        email: string(),
        phone: string(),
        projectType: string(),
        budget: string(),
        timeline: string(),
        details: string(),
        status: string(),
      }),
    },
    queries: {
      leadRequests: ({ db }) => db.leadRequests.orderBy("createdAt").all(),
    },
    mutations: {
      addLeadRequest: (
        { db },
        name: string,
        email: string,
        phone: string,
        projectType: string,
        budget: string,
        timeline: string,
        details: string,
      ) => {
        db.leadRequests.insert({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          projectType,
          budget,
          timeline,
          details: details.trim(),
          status: "new",
        })

        return db.leadRequests.all()
      },
      markLeadReviewed: ({ db }, leadRequestId: string) => {
        for (const lead of db.leadRequests.where("id", leadRequestId).all()) {
          db.leadRequests.update(lead.id, { status: "reviewed" })
        }

        return db.leadRequests.all()
      },
      removeLeadRequest: ({ db }, leadRequestId: string) => {
        for (const lead of db.leadRequests.where("id", leadRequestId).all()) {
          db.leadRequests.delete(lead.id)
        }

        return db.leadRequests.all()
      },
      clearLeadRequests: ({ db }) => {
        for (const lead of db.leadRequests.all()) {
          db.leadRequests.delete(lead.id)
        }

        return db.leadRequests.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [leadDrawerOpen, setLeadDrawerOpen] = useState(false)
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authStatus = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const storedLeadRequests = lakebed.useQuery("leadRequests")
    const leadRequests = storedLeadRequests ?? []
    const addLeadRequest = lakebed.useMutation("addLeadRequest")
    const markLeadReviewed = lakebed.useMutation("markLeadReviewed")
    const removeLeadRequest = lakebed.useMutation("removeLeadRequest")
    const clearLeadRequests = lakebed.useMutation("clearLeadRequests")
    const openLeadCount = leadRequests.filter(
      (lead) => lead.status === "new",
    ).length
    const leadTotal = leadRequests.length
    const brand = props.brand ?? "BuiltRight"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Projects", "Process", "Pricing", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now booking projects for Q3 2026"
    const heroHeadingTop = props.hero?.headingTop ?? "Building excellence"
    const heroHeadingBottom = props.hero?.headingBottom ?? "since 1987"
    const heroSub =
      props.hero?.subheading ??
      "Commercial and residential construction across the Pacific Northwest. Licensed, bonded, and trusted by 500+ clients for projects from $50K to $50M."
    const heroPrimary = props.hero?.primaryCta ?? "Request Free Estimate"
    const heroSecondary = props.hero?.secondaryCta ?? "View Our Projects"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Construction crane and steel framework at a commercial building site during golden hour"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Licensed & Insured", "38 Years Experience", "A+ BBB Rating"]

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading organizations"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Microsoft", "Amazon", "Starbucks", "Boeing", "Nordstrom", "Costco"]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "500+", label: "Projects Completed" },
          { value: "38", label: "Years in Business" },
          { value: "$2.4B", label: "Total Project Value" },
          { value: "98%", label: "Client Satisfaction" },
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Full-service construction solutions"
    const servicesDesc =
      props.services?.description ??
      "From initial concept to final inspection, we handle every phase of your construction project with precision and care."
    const servicesCta = props.services?.cta ?? "Learn more"
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Commercial Construction",
            description:
              "Office buildings, retail centers, warehouses, and industrial facilities. Projects from 5,000 to 500,000 square feet.",
          },
          {
            title: "Residential Building",
            description:
              "Custom homes, multi-family housing, and residential developments. Crafted with attention to every detail.",
          },
          {
            title: "Renovation & Remodeling",
            description:
              "Transform existing spaces with modern upgrades, structural modifications, and complete interior renovations.",
          },
          {
            title: "Project Management",
            description:
              "End-to-end oversight including scheduling, budgeting, subcontractor coordination, and quality control.",
          },
          {
            title: "Design-Build Services",
            description:
              "Integrated design and construction services for streamlined delivery, reduced costs, and faster timelines.",
          },
          {
            title: "Pre-Construction",
            description:
              "Site analysis, feasibility studies, permitting, budgeting, and value engineering to set your project up for success.",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading =
      props.process?.heading ?? "How we bring your vision to life"
    const processDesc =
      props.process?.description ??
      "A proven six-phase process refined over 38 years and 500+ successful projects."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Initial Consultation",
            description:
              "We meet to understand your vision, requirements, timeline, and budget. This free consultation helps us align on project scope and goals.",
            duration: "Duration: 1-2 hours",
          },
          {
            title: "Site Assessment",
            description:
              "Our team visits the site to evaluate conditions, utilities, access, and any constraints that may impact the project design or timeline.",
            duration: "Duration: 1-3 days",
          },
          {
            title: "Design & Planning",
            description:
              "Architects and engineers develop detailed plans, blueprints, and 3D renderings. We finalize materials, finishes, and specifications.",
            duration: "Duration: 2-8 weeks",
          },
          {
            title: "Proposal & Contract",
            description:
              "We present a comprehensive proposal with detailed pricing, timeline, and terms. Upon approval, we finalize contracts and permits.",
            duration: "Duration: 1-2 weeks",
          },
          {
            title: "Construction",
            description:
              "Our skilled crews execute the build with daily oversight, quality checks, and regular progress updates to keep you informed.",
            duration: "Duration: Varies by project",
          },
          {
            title: "Final Delivery",
            description:
              "Thorough inspections, punch list completion, final walkthrough, and handover of all documentation, warranties, and keys.",
            duration: "Duration: 1-2 weeks",
          },
        ]

    const projectsEyebrow = props.projects?.eyebrow ?? "Featured Projects"
    const projectsHeading =
      props.projects?.heading ?? "Recent work we're proud of"
    const projectsDesc =
      props.projects?.description ??
      "A selection of our completed commercial and residential projects across Washington and Oregon."
    const projectsViewAll = props.projects?.viewAll ?? "View all 500+ projects"
    const projectItems = props.projects?.items?.length
      ? props.projects.items
      : [
          {
            title: "Pacific Tower Office Complex",
            meta: "Downtown Seattle, WA • 120,000 sq ft • Completed 2024",
            tag: "Commercial",
          },
          {
            title: "Mercer Island Estate",
            meta: "Mercer Island, WA • 8,500 sq ft • Completed 2024",
            tag: "Residential",
          },
          {
            title: "The Willows Apartments",
            meta: "Bellevue, WA • 48 units • Completed 2023",
            tag: "Multi-Family",
          },
          {
            title: "Harvest Kitchen & Bar",
            meta: "Portland, OR • 4,200 sq ft • Completed 2023",
            tag: "Retail",
          },
          {
            title: "Aurora Distribution Center",
            meta: "Tacoma, WA • 250,000 sq ft • Completed 2023",
            tag: "Industrial",
          },
          {
            title: "Green Lake Craftsman",
            meta: "Seattle, WA • 3,800 sq ft • Completed 2022",
            tag: "Residential",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Transparent pricing for every project"
    const pricingDesc =
      props.pricing?.description ??
      "Every project is unique. Here are typical starting points for our most common project types. Final pricing depends on scope, materials, and timeline."
    const pricingCta = props.pricing?.cta ?? "Get estimate"
    const pricingPopular = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Kitchen Remodel",
            price: "$45K",
            priceSuffix: "+",
            note: "Starting price",
            features: [
              "Cabinet replacement",
              "Countertop installation",
              "Flooring & lighting",
              "6-8 week timeline",
            ],
          },
          {
            name: "Custom Home",
            price: "$650K",
            priceSuffix: "+",
            note: "Starting price",
            features: [
              "Complete design-build",
              "3,000-5,000 sq ft",
              "Premium finishes",
              "12-18 month timeline",
            ],
            featured: true,
          },
          {
            name: "Commercial Build",
            price: "$2M",
            priceSuffix: "+",
            note: "Starting price",
            features: [
              "Turnkey delivery",
              "20,000+ sq ft",
              "LEED certification available",
              "18-36 month timeline",
            ],
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What our clients say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's feedback from clients we've had the privilege to work with."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "BuiltRight transformed our outdated office into a modern workspace that our team loves. They completed the project two weeks ahead of schedule and $15K under budget. Exceptional work.",
            name: "David Chen",
            role: "CEO, Pacific Tech Solutions",
            avatarAlt:
              "Professional headshot of a smiling businessman in a navy suit",
          },
          {
            quote:
              "From the first meeting to the final walkthrough, BuiltRight exceeded our expectations. Our custom home is everything we dreamed of and more. The craftsmanship is outstanding.",
            name: "Sarah Mitchell",
            role: "Homeowner, Bainbridge Island",
            avatarAlt:
              "Professional headshot of a smiling woman architect with dark hair",
          },
          {
            quote:
              "We hired BuiltRight for our restaurant renovation and they delivered a space that has completely transformed our business. Sales are up 40% since reopening. Worth every penny.",
            name: "Marcus Rodriguez",
            role: "Owner, Harvest Kitchen",
            avatarAlt:
              "Professional headshot of a smiling man chef with a beard wearing a white coat",
          },
          {
            quote:
              "BuiltRight constructed our 48-unit apartment complex with zero safety incidents and impeccable quality. Their project management kept everything on track for our tight deadline.",
            name: "Jennifer Walsh",
            role: "Development Director, Walsh Properties",
            avatarAlt:
              "Professional headshot of a smiling businesswoman with blonde hair wearing a blazer",
          },
          {
            quote:
              "After a bad experience with another contractor, BuiltRight restored our faith in the construction industry. Honest, transparent, and delivered exactly what they promised.",
            name: "Robert Thompson",
            role: "Homeowner, Seattle",
            avatarAlt:
              "Professional headshot of a smiling middle-aged man with glasses and gray hair",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working with BuiltRight."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How long does a typical project take?",
            a: "Project timelines vary significantly based on scope. Kitchen renovations typically take 6-8 weeks, custom homes 12-18 months, and commercial projects 18-36 months. During your consultation, we'll provide a detailed timeline specific to your project.",
          },
          {
            q: "Do you offer financing options?",
            a: "Yes, we partner with several lending institutions to offer construction financing options for qualified clients. We also work with your own lender if preferred. Our team can help you explore financing options during the planning phase.",
          },
          {
            q: "Are you licensed and insured?",
            a: "Absolutely. We are fully licensed in Washington (License #BUILDRR12345) and Oregon (CCB License No. 123456), carry comprehensive general liability insurance ($5M), and maintain workers' compensation coverage for all employees. Certificates available upon request.",
          },
          {
            q: "What areas do you serve?",
            a: "We primarily serve the greater Seattle and Portland metropolitan areas, including King, Pierce, Snohomish, Multnomah, Washington, and Clackamas counties. For larger commercial projects, we operate throughout Washington and Oregon.",
          },
          {
            q: "How do you handle project changes?",
            a: "We understand changes happen. All change orders are documented in writing with detailed pricing and timeline impact before work proceeds. We use a digital project management system that keeps you informed of any changes in real-time.",
          },
          {
            q: "Do you offer warranties?",
            a: "Yes, we stand behind our work with a comprehensive warranty program: 1-year workmanship warranty on all projects, 10-year structural warranty on new construction, and we pass through all manufacturer warranties on materials and fixtures.",
          },
        ]

    const quoteHeading =
      props.quote?.heading ?? "Ready to start your project?"
    const quoteDesc =
      props.quote?.description ??
      "Get a free, no-obligation estimate. We'll respond within 24 hours."
    const quoteSubmit = props.quote?.submit ?? "Request Free Estimate"
    const quoteDisclaimer =
      props.quote?.disclaimer ??
      "By submitting, you agree to our privacy policy. We'll never share your information."
    const quoteProjectTypes = props.quote?.projectTypes?.length
      ? props.quote.projectTypes
      : [
          "Select a project type",
          "Kitchen Remodel",
          "Bathroom Remodel",
          "Home Addition",
          "Custom Home",
          "Commercial Building",
          "Whole Home Renovation",
          "Other",
        ]
    const quoteBudgets = props.quote?.budgets?.length
      ? props.quote.budgets
      : [
          "Select budget range",
          "$50,000 - $100,000",
          "$100,000 - $250,000",
          "$250,000 - $500,000",
          "$500,000 - $1,000,000",
          "$1,000,000+",
        ]
    const quoteTimelines = props.quote?.timelines?.length
      ? props.quote.timelines
      : [
          "Select timeline",
          "ASAP",
          "Within 3 months",
          "Within 6 months",
          "Within 1 year",
          "Just planning",
        ]

    const footerAbout =
      props.footer?.about ??
      "Building excellence since 1987. Commercial and residential construction across the Pacific Northwest."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Commercial Construction",
          "Residential Building",
          "Renovation & Remodeling",
          "Project Management",
          "Design-Build",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Projects", "Careers", "News", "Contact"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "1234 Construction Ave, Seattle, WA 98101"
    const footerPhone = props.footer?.phone ?? "(206) 555-1234"
    const footerEmail = props.footer?.email ?? "info@builtright.com"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["LinkedIn", "Instagram", "Facebook"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Licenses"]
    const footerNote = props.footer?.note ?? "All rights reserved."

    // Brand logo tile — a hard-hat/building glyph in a token-colored tile (decorative brand mark).
    const LogoMark = ({
      className,
      tone = "primary",
    }: {
      className?: string
      tone?: "primary" | "foreground"
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-md",
          tone === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
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
        >
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      </span>
    )

    const ArrowRight = () => (
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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    const ChevronRight = () => (
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
        <polyline points="9 5 16 12 9 19" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
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
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
      </svg>,
      // home / residential
      <svg
        key="home"
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
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
      </svg>,
      // pencil / renovation
      <svg
        key="pencil"
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
        <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      // cube / project management
      <svg
        key="cube"
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
        <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.806-.984A3 3 0 0 0 15 8m-6 4v8m0 0l6-3" />
      </svg>,
      // document / design-build
      <svg
        key="document"
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
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>,
      // bolt / pre-construction
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
    ]

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
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" tone="foreground" />
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
                  onClick={() => go(footerPhone)}
                  className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:flex"
                >
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
                    <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {footerPhone}
                </button>
                <Sheet open={leadDrawerOpen} onOpenChange={setLeadDrawerOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="relative flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Lead Queue
                      <span
                        className={cn(
                          "ml-1 grid size-5 place-items-center rounded-full text-[0.7rem] font-bold",
                          openLeadCount > 0
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {leadTotal}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>Lead requests</SheetTitle>
                      <SheetDescription>
                        {leadTotal > 0
                          ? `${leadTotal} quote request${
                              leadTotal === 1 ? "" : "s"
                            } saved for this page session.`
                          : "No quote requests yet. Add one from the form below."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {leadTotal > 0 ? (
                        <div className="space-y-4">
                          {leadRequests.map((lead) => (
                            <article
                              key={lead.id}
                              className="rounded-lg border border-border bg-muted p-4"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-semibold text-foreground">
                                    {lead.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {lead.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {lead.phone}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "mt-0.5 rounded-full px-2 py-1 text-[0.65rem] font-semibold",
                                    lead.status === "reviewed"
                                      ? "bg-accent text-accent-foreground/80"
                                      : "bg-foreground text-background",
                                  )}
                                >
                                  {lead.status === "reviewed" ? "Reviewed" : "New"}
                                </span>
                              </div>
                              <p className="mb-2 text-xs text-muted-foreground">
                                {lead.projectType} • {lead.budget} • {lead.timeline}
                              </p>
                              {lead.details ? (
                                <p className="mb-3 line-clamp-2 text-sm text-foreground/90">
                                  {lead.details}
                                </p>
                              ) : null}
                              <div className="flex items-center justify-end gap-2">
                                {lead.status === "new" ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void markLeadReviewed(lead.id)}
                                  >
                                    Mark reviewed
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => void removeLeadRequest(lead.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center">
                          <p className="text-sm font-medium text-foreground">
                            No requests yet
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Submit the quote form to start building your lead queue.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pending review</span>
                        <span className="font-semibold text-foreground">
                          {openLeadCount}
                        </span>
                      </div>
                      <div className="mb-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        {isSignedIn
                          ? `Signed in as ${authDisplayName}`
                          : "Sign in to sync these leads across devices."}
                      </div>
                      <div className="grid gap-2">
                        {isSignedIn ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleSignOut}
                          >
                            Sign out
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleSignIn}
                            disabled={auth.isLoading}
                          >
                            {authStatus}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => void clearLeadRequests()}
                          disabled={leadTotal === 0}
                        >
                          Clear queue
                        </Button>
                        <SheetClose asChild>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full rounded-full"
                          >
                            Continue
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Get a Quote
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground">
            <div aria-hidden="true" className="absolute inset-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 backdrop-blur-sm">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-medium text-background/80">
                    {heroBadge}
                  </span>
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
                  {heroHeadingTop}
                  <br />
                  {heroHeadingBottom}
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-background/70 sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-background/90"
                  >
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/10 px-6 py-3.5 font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/20"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-background/60">
                  {heroTrust.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-card py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div key={logo} className="flex items-center justify-center">
                    <span className="text-xl font-bold text-muted-foreground">
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-muted py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold text-foreground lg:text-5xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-xl bg-muted p-8 transition-colors hover:bg-accent"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-foreground text-background">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center gap-1 font-medium text-foreground transition-all hover:gap-2"
                    >
                      {servicesCta}
                      <ChevronRight />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {processEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {processHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{processDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="absolute -left-2 -top-4 text-6xl font-bold text-foreground/10">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative rounded-xl bg-card p-8 shadow-sm">
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="mt-4 text-sm text-muted-foreground">
                        {step.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Projects gallery */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {projectsEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {projectsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{projectsDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projectItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full text-left"
                  >
                    <div className="relative mb-4 overflow-hidden rounded-xl">
                      <Image
                        alt={proj.title}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4">
                        <span className="mb-2 inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                          {proj.tag}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{proj.meta}</p>
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(projectsViewAll)}
                  className="inline-flex items-center gap-2 font-semibold text-foreground transition-all hover:gap-3"
                >
                  {projectsViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl p-8",
                      tier.featured
                        ? "bg-foreground shadow-lg"
                        : "bg-card shadow-sm",
                    )}
                  >
                    {tier.featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                          {pricingPopular}
                        </span>
                      </div>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        tier.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <div
                      className={cn(
                        "mb-1 text-4xl font-bold",
                        tier.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {tier.price}
                      <span
                        className={cn(
                          "text-lg font-normal",
                          tier.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.priceSuffix}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured
                          ? "text-background/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.note}
                    </p>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-3 text-sm",
                            tier.featured
                              ? "text-background/80"
                              : "text-muted-foreground",
                          )}
                        >
                          <Check className="shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${pricingCta} — ${tier.name}`)}
                      className={cn(
                        "block w-full rounded-lg py-3 text-center font-semibold transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "bg-muted text-foreground hover:bg-accent",
                      )}
                    >
                      {pricingCta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl bg-muted p-8"
                  >
                    <div className="mb-4 flex gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl bg-card shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-4 text-lg font-semibold text-foreground">
                        {item.q}
                      </h3>
                      <span className="transition-transform group-open:rotate-180">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9" />
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
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-background sm:text-4xl">
                  {quoteHeading}
                </h2>
                <p className="text-lg text-background/60">{quoteDesc}</p>
              </div>

              <form
                className="rounded-xl bg-card p-8 shadow-xl lg:p-12"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const formData = new FormData(form)
                  const name = String(formData.get("con-name") ?? "").trim()
                  const email = String(formData.get("con-email") ?? "").trim()
                  const phone = String(formData.get("con-phone") ?? "").trim()
                  const projectType = String(
                    formData.get("con-type") ?? "",
                  ).trim()
                  const budget = String(formData.get("con-budget") ?? "").trim()
                  const timeline = String(formData.get("con-timeline") ?? "").trim()
                  const details = String(formData.get("con-message") ?? "").trim()

                  if (
                    !name ||
                    !email ||
                    !phone ||
                    !projectType ||
                    !budget ||
                    !timeline ||
                    projectType.startsWith("Select a project type") ||
                    budget.startsWith("Select budget range") ||
                    timeline.startsWith("Select timeline")
                  ) {
                    return
                  }

                  void addLeadRequest(
                    name,
                    email,
                    phone,
                    projectType,
                    budget,
                    timeline,
                    details,
                  )
                  form.reset()
                  go(quoteSubmit)
                  setLeadDrawerOpen(true)
                }}
              >
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="con-name"
                      className="mb-2 block text-sm font-medium text-foreground/80"
                    >
                      Full Name
                    </label>
                    <input
                      id="con-name"
                      name="con-name"
                      type="text"
                      required
                      placeholder="John Smith"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="con-email"
                      className="mb-2 block text-sm font-medium text-foreground/80"
                    >
                      Email Address
                    </label>
                    <input
                      id="con-email"
                      name="con-email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="con-phone"
                      className="mb-2 block text-sm font-medium text-foreground/80"
                    >
                      Phone Number
                    </label>
                    <input
                      id="con-phone"
                      name="con-phone"
                      type="tel"
                      required
                      placeholder="(206) 555-1234"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="con-type"
                      className="mb-2 block text-sm font-medium text-foreground/80"
                    >
                      Project Type
                    </label>
                    <select
                      id="con-type"
                      name="con-type"
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

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="con-budget"
                      className="mb-2 block text-sm font-medium text-foreground/80"
                    >
                      Estimated Budget
                    </label>
                    <select
                      id="con-budget"
                      name="con-budget"
                      required
                      className={cn(inputCls, "appearance-none")}
                    >
                      {quoteBudgets.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="con-timeline"
                      className="mb-2 block text-sm font-medium text-foreground/80"
                    >
                      Desired Timeline
                    </label>
                    <select
                      id="con-timeline"
                      name="con-timeline"
                      required
                      className={cn(inputCls, "appearance-none")}
                    >
                      {quoteTimelines.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="con-message"
                    className="mb-2 block text-sm font-medium text-foreground/80"
                  >
                    Project Details
                  </label>
                  <textarea
                    id="con-message"
                    name="con-message"
                    rows={4}
                    placeholder="Tell us about your project, goals, and any specific requirements..."
                    className={cn(inputCls, "resize-none")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-foreground py-4 text-lg font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  {quoteSubmit}
                </button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {quoteDisclaimer}
                </p>
              </form>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <LogoMark className="size-8" tone="foreground" />
                  <span className="text-xl font-semibold tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span className="text-xs font-semibold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-3">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
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
                      className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
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
                        className="shrink-0"
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
                      className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
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
                        className="shrink-0"
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand} Construction. {footerNote}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
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
