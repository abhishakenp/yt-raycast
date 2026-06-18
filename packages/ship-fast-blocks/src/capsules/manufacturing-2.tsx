import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * ManufacturingKimiPage2 — a complete, self-contained precision-manufacturing /
 * industrial-fabrication LANDING page.
 *
 * VARIANT 2 — a visually DISTINCT alternative to ManufacturingKimiPage. Where the
 * sibling block is a clean, neutral, light-surface B2B layout, THIS port of a Kimi
 * "ApexForge Industries" design leans bold and dramatic: a dark charcoal hero with
 * an animated gradient + photo overlay, a vivid orange/primary brand accent used as
 * a saturated CTA color, image-tiled industry cards with gradient scrims, numbered
 * process steps connected by gradient rails, project-gallery cards with category
 * badges and client stats, a split about/stats band on a dark surface, star-rated
 * testimonials with company attributions, and a full-bleed orange gradient CTA band.
 *
 * Sections: split-free centered hero (certification pill, headline, dual CTAs, trust
 * stats), trusted-by logo strip, a 6-up capabilities grid (CNC machining, welding &
 * fabrication, sheet metal, 3D printing & additive, finishing & coating, quality &
 * inspection) each with bullet specs, an 8-up image-tiled industries grid, a 5-step
 * process with a lead-time stats panel, a project portfolio gallery with category
 * tags and delivery stats, a dark about/stats split, a 3-up testimonials grid, an
 * orange gradient CTA band with trust badges, and a 4-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors itself
 * entirely with semantic theme tokens. Every nav item / CTA / link routes through
 * `useNavigate` (never a dead "#"), and navbar labels match the `nav` array so
 * PageSwitch can swap pages. All content imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults make
 * it render great with no props.
 */
export const ManufacturingKimiPage2 = defineCapsule({
  name: "ManufacturingKimiPage2",
  description:
    "Bold, dramatic precision-manufacturing / industrial-fabrication LANDING page — VARIANT 2 and a visually distinct alternative/second style sibling to ManufacturingKimiPage (which is the cleaner, neutral, light-surface version). This 'ApexForge Industries' port features a dark charcoal hero with an animated gradient and photo overlay, a saturated orange/primary brand-accent CTA color, image-tiled industry cards with gradient scrims, numbered process steps on gradient rails, project-gallery cards with category badges and client stats, a dark split about/stats band, star-rated testimonials with company names, and a full-bleed orange gradient closing CTA. Includes a centered hero (ISO certification pill, headline, dual CTAs, trust-stat strip), a 'trusted by industry leaders' logo strip, a 6-up capabilities grid (CNC machining, welding & fabrication, sheet metal work, 3D printing & additive, finishing & coating, quality & inspection) with bullet specs, an 8-up image-tiled industries grid (aerospace, automotive, energy, construction, medical, defense, industrial, renewable), a 5-step engineering process (consultation, engineering, production, finishing, delivery) with a lead-time stats panel, a featured-projects gallery with category tags and delivery metrics, a dark about-the-company stats split, a 3-up testimonials grid, an orange gradient CTA band with trust badges, and a 4-column footer. Use as the ROOT/home page for CNC machine shops, metal fabricators, contract manufacturers, industrial engineering firms, foundries or precision-parts suppliers serving aerospace, automotive, energy, medical, defense, construction or renewable sectors when a high-impact, photography-rich, conversion-focused page is wanted. Supply content only — brand, nav, hero, logos, capabilities, industries, process, gallery, about, testimonials, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Optional secondary brand line (e.g. "INDUSTRIES"). */
    brandTagline: z.string().optional(),
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
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Capabilities / services grid. */
    capabilities: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              bullets: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Industries-served image grid. */
    industries: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Engineering process steps. */
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
              bullets: z.array(z.string()),
            }),
          )
          .optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured-projects gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tag: z.string(),
              imageAlt: z.string(),
              metric: z.string(),
              client: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** About-the-company split with stats. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        body: z.array(z.string()).optional(),
        certs: z.array(z.string()).optional(),
        link: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonials. */
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
              company: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        capabilitiesTitle: z.string().optional(),
        capabilities: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        company: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      quoteRequests: table({
        projectName: string(),
        company: string(),
        email: string(),
        phone: string(),
        description: string(),
        quantity: string(),
        timeline: string(),
      }),
      favorites: table({
        projectName: string(),
      }),
    },
    queries: {
      quoteRequests: ({ db }) => db.quoteRequests.orderBy('createdAt').all(),
      favoriteProjectNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.projectName)),
    },
    mutations: {
      submitQuoteRequest: ({ db }, data: {
        projectName: string
        company: string
        email: string
        phone: string
        description: string
        quantity: string
        timeline: string
      }) => {
        db.quoteRequests.insert(data)
        return db.quoteRequests.all()
      },
      toggleFavorite: ({ db }, projectName: string) => {
        const existingFavorite = db.favorites
          .where('projectName', projectName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ projectName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [quoteOpen, setQuoteOpen] = useState(false)
    const [quoteForm, setQuoteForm] = useState({
      projectName: '',
      company: '',
      email: '',
      phone: '',
      description: '',
      quantity: '',
      timeline: '',
    })
    const brand = props.brand ?? "ApexForge"
    const brandTagline = props.brandTagline ?? "INDUSTRIES"

    const favoriteProjectNames = lakebed.useQuery('favoriteProjectNames')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const submitQuoteRequest = lakebed.useMutation('submitQuoteRequest')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const nav = props.nav?.length
      ? props.nav
      : ["Capabilities", "Industries", "Process", "Projects", "About", "Get Quote"]

    const heroBadge = props.hero?.badge ?? "ISO 9001:2015 CERTIFIED"
    const heroHeading = props.hero?.heading ?? "Forging the Future of"
    const heroAccent = props.hero?.headingAccent ?? "Industrial Excellence"
    const heroSub =
      props.hero?.subheading ??
      "Precision manufacturing, custom fabrication, and engineering solutions for the world's most demanding industries. From aerospace to energy infrastructure."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Capabilities"
    const heroSecondary = props.hero?.secondaryCta ?? "View Projects"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Industrial CNC machining facility with sparks and precision metalworking"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "ISO 9001", label: "Certified Quality" },
          { value: "24/7", label: "Production Support" },
          { value: "Global", label: "Delivery Network" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by Industry Leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "BOEING",
          "SIEMENS",
          "GE AVIATION",
          "ROLLS-ROYCE",
          "CATERPILLAR",
          "TESLA",
        ]

    const capEyebrow = props.capabilities?.eyebrow ?? "Our Capabilities"
    const capHeading =
      props.capabilities?.heading ?? "Comprehensive Manufacturing Solutions"
    const capDesc =
      props.capabilities?.description ??
      "From concept to completion, we deliver precision-engineered components and assemblies with industry-leading quality and speed."
    const capItems = props.capabilities?.items?.length
      ? props.capabilities.items
      : [
          {
            title: "CNC Machining",
            description:
              '5-axis CNC milling and turning with tolerances to ±0.0005". Materials include titanium, Inconel, aluminum, and engineering plastics.',
            bullets: [
              "30+ CNC centers",
              "24-hour turnaround available",
              'Parts up to 60" x 40" x 30"',
            ],
          },
          {
            title: "Welding & Fabrication",
            description:
              "MIG, TIG, and robotic welding for structural steel, aluminum, and exotic alloys. Certified welders with AWS D1.1 and ASME Section IX.",
            bullets: [
              "Automated welding cells",
              "Structural steel up to 50 tons",
              "X-ray inspection certified",
            ],
          },
          {
            title: "Sheet Metal Work",
            description:
              "Laser cutting, punching, bending, and forming. From prototypes to high-volume production runs with quick die changeovers.",
            bullets: [
              "6kW fiber laser cutting",
              "250-ton press brakes",
              "Materials 0.5mm to 25mm",
            ],
          },
          {
            title: "3D Printing & Additive",
            description:
              "Industrial SLA, SLS, and DMLS additive manufacturing. Metal 3D printing in titanium, stainless steel, and aluminum.",
            bullets: [
              "Build volume 400x400x500mm",
              "Layer resolution 20 microns",
              "Post-processing included",
            ],
          },
          {
            title: "Finishing & Coating",
            description:
              "Anodizing, powder coating, electroplating, and specialized surface treatments. MIL-SPEC finishes and custom color matching.",
            bullets: [
              "Type II & III anodizing",
              "Powder coat line 12'x8'x25'",
              "Chrome & nickel plating",
            ],
          },
          {
            title: "Quality & Inspection",
            description:
              "CMM inspection, material certification, and full traceability. AS9100D and NADCAP accredited quality systems.",
            bullets: [
              'Zeiss CMM 24" x 20" x 16"',
              "First Article Inspection",
              "Full material certs",
            ],
          },
        ]

    const indEyebrow = props.industries?.eyebrow ?? "Industries Served"
    const indHeading = props.industries?.heading ?? "Powering Critical Industries"
    const indDesc =
      props.industries?.description ??
      "From aerospace to renewable energy, we manufacture components that keep the world moving, flying, and advancing."
    const indItems = props.industries?.items?.length
      ? props.industries.items
      : [
          {
            title: "Aerospace",
            description:
              "Flight-critical components, turbine parts, and structural assemblies for commercial and defense aviation.",
            imageAlt: "Aerospace jet engine turbine blade manufacturing",
          },
          {
            title: "Automotive",
            description:
              "Powertrain components, EV battery enclosures, and precision chassis parts for leading OEMs.",
            imageAlt: "Automotive assembly line manufacturing robotic arms",
          },
          {
            title: "Energy",
            description:
              "Oil & gas extraction equipment, wind turbine components, and solar mounting systems.",
            imageAlt: "Offshore oil rig energy infrastructure platform",
          },
          {
            title: "Construction",
            description:
              "Structural steel, heavy equipment components, and infrastructure hardware.",
            imageAlt: "Heavy construction equipment excavator at building site",
          },
          {
            title: "Medical",
            description:
              "Surgical instruments, implantable devices, and diagnostic equipment housings. ISO 13485 certified.",
            imageAlt: "Medical device manufacturing clean room",
          },
          {
            title: "Defense",
            description:
              "Armored vehicle components, weapons systems, and tactical gear. ITAR registered facility.",
            imageAlt: "Defense military vehicle manufacturing facility",
          },
          {
            title: "Industrial",
            description:
              "Automation equipment, conveyor systems, and custom machinery for manufacturing plants.",
            imageAlt: "Industrial robotics and automation manufacturing",
          },
          {
            title: "Renewable",
            description:
              "Wind turbine nacelles, solar tracking systems, and hydroelectric components.",
            imageAlt: "Wind turbines renewable energy infrastructure",
          },
        ]

    const procEyebrow = props.process?.eyebrow ?? "Our Process"
    const procHeading =
      props.process?.heading ?? "Engineering Excellence in 5 Steps"
    const procDesc =
      props.process?.description ??
      "From initial concept to final delivery, our streamlined process ensures quality, transparency, and on-time results."
    const procSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Consultation",
            description:
              "Deep-dive discussion to understand your specifications, timeline, and budget requirements.",
            bullets: ["Technical review", "Material selection", "DFM feedback"],
          },
          {
            title: "Engineering",
            description:
              "CAD modeling, prototyping, and process planning to validate design before production.",
            bullets: ["3D modeling", "Prototype samples", "Tooling design"],
          },
          {
            title: "Production",
            description:
              "Precision manufacturing with real-time monitoring and in-process quality checks.",
            bullets: ["CNC machining", "Quality checkpoints", "Progress updates"],
          },
          {
            title: "Finishing",
            description:
              "Surface treatments, coatings, and final assembly to meet exact specifications.",
            bullets: ["Heat treating", "Surface finishing", "Assembly"],
          },
          {
            title: "Delivery",
            description:
              "Final inspection with full documentation and global shipping coordination.",
            bullets: ["Quality reports", "Material certs", "Global logistics"],
          },
        ]
    const procStats = props.process?.stats?.length
      ? props.process.stats
      : [
          { value: "48 Hours", label: "Average quote turnaround for standard projects" },
          { value: "99.2%", label: "On-time delivery rate across all industries" },
          { value: "24/7", label: "Customer support and production monitoring" },
        ]

    const galEyebrow = props.gallery?.eyebrow ?? "Featured Projects"
    const galHeading =
      props.gallery?.heading ?? "Manufacturing Excellence in Action"
    const galDesc =
      props.gallery?.description ??
      "Real projects delivered on-time and to-spec for demanding clients across industries."
    const galItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Titanium Turbine Components",
            description:
              'Precision-machined Ti-6Al-4V turbine blades for next-generation commercial jet engines. Tolerances held to ±0.001".',
            tag: "AEROSPACE",
            imageAlt:
              "CNC machined titanium turbine blade for aerospace application",
            metric: "2,400 units delivered",
            client: "Boeing Contract",
          },
          {
            title: "EV Battery Enclosures",
            description:
              "Aluminum 6061-T6 battery housings with integrated cooling channels and EMI shielding for electric vehicle platforms.",
            tag: "AUTOMOTIVE",
            imageAlt: "Electric vehicle battery enclosure made from aluminum",
            metric: "15,000 units/month",
            client: "Tesla Supplier",
          },
          {
            title: "Offshore Platform Components",
            description:
              "Corrosion-resistant Inconel 625 pressure vessels and flow control systems for North Sea drilling operations.",
            tag: "ENERGY",
            imageAlt: "Offshore oil platform equipment and drilling machinery",
            metric: "312 assemblies",
            client: "Shell Energy",
          },
          {
            title: "Stadium Structural Framework",
            description:
              "A36 structural steel truss assemblies with hot-dip galvanizing for 65,000-seat arena roof support system.",
            tag: "CONSTRUCTION",
            imageAlt: "Heavy structural steel framework for construction project",
            metric: "850 tons fabricated",
            client: "AECOM Project",
          },
          {
            title: "Orthopedic Surgical Instruments",
            description:
              "17-4 PH stainless steel surgical tools with electropolished surfaces. Class II medical device manufacturing.",
            tag: "MEDICAL",
            imageAlt: "Surgical medical device components",
            metric: "50,000 units/year",
            client: "Stryker Medical",
          },
          {
            title: "Wind Turbine Gearbox Housings",
            description:
              "Ductile iron gearbox enclosures for 3.5MW offshore wind turbines. Cast, machined, and painted to marine spec.",
            tag: "RENEWABLE",
            imageAlt: "Wind turbine nacelle assembly and components",
            metric: "120 units delivered",
            client: "Vestas Wind",
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? `About ${brand}`
    const aboutHeading =
      props.about?.heading ?? "Four Decades of Manufacturing Excellence"
    const aboutBody = props.about?.body?.length
      ? props.about.body
      : [
          "Founded in 1983, ApexForge Industries has grown from a small machine shop to a global manufacturing partner serving Fortune 500 companies across six continents.",
          "Our 340,000 sq ft facility in Detroit, Michigan houses over 200 CNC machines, robotic welding cells, and dedicated quality labs. With 450 skilled employees working three shifts, we deliver precision components on time, every time.",
        ]
    const aboutCerts = props.about?.certs?.length
      ? props.about.certs
      : [
          "AS9100D Certified",
          "ITAR Registered",
          "ISO 13485 Medical",
          "NADCAP Aerospace",
        ]
    const aboutLink = props.about?.link ?? "Learn more about our certifications"
    const aboutStats = props.about?.stats?.length
      ? props.about.stats
      : [
          { value: "41", label: "Years in Operation" },
          { value: "450+", label: "Skilled Employees" },
          { value: "200+", label: "CNC Machines" },
          { value: "2.4M", label: "Parts Delivered (2024)" },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Client Testimonials"
    const testHeading =
      props.testimonials?.heading ?? "Trusted by Industry Leaders"
    const testDesc =
      props.testimonials?.description ??
      `What our partners say about working with ${brand} Industries.`
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "ApexForge has been our primary supplier for titanium components for over 15 years. Their quality is consistently exceptional, and their on-time delivery rate is unmatched in the industry.",
            name: "Michael Chen",
            role: "Director of Procurement",
            company: "Boeing Commercial Airplanes",
            avatarAlt:
              "Professional headshot of Michael Chen, Director of Procurement at Boeing",
          },
          {
            quote:
              "When we needed to scale EV battery enclosure production 3x in 6 months, ApexForge delivered. Their engineering team optimized our design for manufacturability, reducing costs by 18%.",
            name: "Sarah Johnson",
            role: "VP of Manufacturing",
            company: "Tesla, Inc.",
            avatarAlt:
              "Professional headshot of Sarah Johnson, VP of Manufacturing at Tesla",
          },
          {
            quote:
              "The team at ApexForge understood the critical nature of our surgical instruments. Their attention to detail and commitment to quality helped us pass FDA inspections with zero findings.",
            name: "Dr. James Rodriguez",
            role: "Chief of Operations",
            company: "Stryker Medical",
            avatarAlt:
              "Professional headshot of Dr. James Rodriguez, Chief of Operations at Stryker",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Start Your Project?"
    const ctaDesc =
      props.cta?.description ??
      "Get a detailed quote within 48 hours. Our engineering team is ready to review your designs and provide DFM feedback to optimize for manufacturing."
    const ctaPrimary = props.cta?.primaryCta ?? "Request a Quote"
    const ctaSecondary = props.cta?.secondaryCta ?? "Call (800) 555-1234"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["Quotes in 48 hours", "Free DFM analysis", "No minimum order quantity"]

    const footerAbout =
      props.footer?.about ??
      "Precision manufacturing for aerospace, automotive, energy, and medical industries since 1983."
    const footerCapTitle = props.footer?.capabilitiesTitle ?? "Capabilities"
    const footerCap = props.footer?.capabilities?.length
      ? props.footer.capabilities
      : [
          "CNC Machining",
          "Welding & Fabrication",
          "Sheet Metal Work",
          "3D Printing",
          "Finishing & Coating",
          "Quality Inspection",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompany = props.footer?.company?.length
      ? props.footer.company
      : ["About Us", "Projects", "Careers", "News", "Certifications", "Contact"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "3400 Industrial Boulevard, Detroit, MI 48207"
    const footerPhone = props.footer?.phone ?? "(800) 555-1234"
    const footerEmail = props.footer?.email ?? "quotes@apexforge.com"
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Sitemap"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Industries. All rights reserved.`

    const ForgeLogo = () => (
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
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )

    const Check = () => (
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
        className="shrink-0"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="text-chart-4"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const heroStatIcons: ReactNode[] = [
      <svg key="h0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="h1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="h2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
    ]

    const capIcons: ReactNode[] = [
      <svg key="c0" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-.486a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>,
      <svg key="c1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>,
      <svg key="c2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg key="c3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>,
      <svg key="c4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
      <svg key="c5" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
    ]

    const indIcons: ReactNode[] = [
      <svg key="n0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>,
      <svg key="n1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>,
      <svg key="n2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="n3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      <svg key="n4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg key="n5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg key="n6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg key="n7" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <nav
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="group flex items-center gap-3"
                aria-label={`${brand} Home`}
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg transition-all"
                >
                  <ForgeLogo />
                </span>
                <span className="text-left">
                  <span className="block text-xl font-bold tracking-tight text-foreground">
                    {brand.toUpperCase()}
                  </span>
                  <span className="block text-xs font-medium tracking-wider text-muted-foreground">
                    {brandTagline}
                  </span>
                </span>
              </button>

              <div className="hidden items-center gap-8 lg:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                        <ChevronDown />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? (
                              <AvatarImage
                                src={authPicture}
                                alt={authDisplayName}
                              />
                            ) : null}
                            <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                              {authInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {authDisplayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {authEmail ?? 'Signed in to this session'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Quote History')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Quote History
                          <ArrowRight />
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    aria-label="Sign in with Google"
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
                <Sheet open={quoteOpen} onOpenChange={setQuoteOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      onClick={() => go(nav[nav.length - 1])}
                      className="hidden items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 sm:inline-flex"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {nav[nav.length - 1]}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Request a Quote</SheetTitle>
                      <SheetDescription>
                        Get a detailed quote within 48 hours. Our engineering team is ready to review your designs.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault()
                          void submitQuoteRequest(quoteForm)
                          setQuoteOpen(false)
                          setQuoteForm({
                            projectName: '',
                            company: '',
                            email: '',
                            phone: '',
                            description: '',
                            quantity: '',
                            timeline: '',
                          })
                        }}
                      >
                        <div>
                          <label
                            htmlFor="projectName"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Project Name
                          </label>
                          <input
                            id="projectName"
                            type="text"
                            required
                            value={quoteForm.projectName}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, projectName: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., Titanium Turbine Components"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="company"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Company
                          </label>
                          <input
                            id="company"
                            type="text"
                            required
                            value={quoteForm.company}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, company: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Your company name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            value={quoteForm.email}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, email: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="you@company.com"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Phone
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={quoteForm.phone}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, phone: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Project Description
                          </label>
                          <textarea
                            id="description"
                            required
                            rows={4}
                            value={quoteForm.description}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, description: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Describe your project requirements, materials, specifications..."
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="quantity"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Quantity
                          </label>
                          <input
                            id="quantity"
                            type="text"
                            value={quoteForm.quantity}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, quantity: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., 100 units, 5000 units/month"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="timeline"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Timeline
                          </label>
                          <input
                            id="timeline"
                            type="text"
                            value={quoteForm.timeline}
                            onChange={(e) =>
                              setQuoteForm({ ...quoteForm, timeline: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., 4 weeks, 3 months"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full rounded-full"
                        >
                          Submit Quote Request
                        </Button>
                      </form>
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Cancel
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-primary lg:hidden"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/90 to-foreground" />
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={900}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-semibold tracking-wide text-primary">
                    {heroBadge}
                  </span>
                </div>

                <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-background sm:text-6xl lg:text-7xl">
                  {heroHeading}
                  <span className="block text-primary">{heroAccent}</span>
                </h1>

                <p className="mb-8 max-w-2xl text-xl leading-relaxed text-background/70 lg:text-2xl">
                  {heroSub}
                </p>

                <div className="mb-12 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setQuoteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center gap-2 rounded-lg border border-background/20 bg-background/10 px-8 py-4 text-lg font-semibold text-background backdrop-blur-sm transition-all hover:bg-background/20"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {heroSecondary}
                  </button>
                </div>

                <div className="flex flex-wrap gap-8 lg:gap-12">
                  {heroStats.map((s, i) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-lg bg-background/10 text-primary">
                        {heroStatIcons[i % heroStatIcons.length]}
                      </span>
                      <div>
                        <div className="text-2xl font-bold text-background">
                          {s.value}
                        </div>
                        <div className="text-sm text-background/60">
                          {s.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span className="text-lg font-bold">{logo}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Capabilities */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {capEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
                  {capHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{capDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {capItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted p-8 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                      {capIcons[i % capIcons.length]}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setQuoteForm({ ...quoteForm, projectName: item.title })
                        setQuoteOpen(true)
                      }}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Get Quote
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Industries */}
          <section className="bg-foreground py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {indEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-background lg:text-5xl">
                  {indHeading}
                </h2>
                <p className="text-xl text-background/60">{indDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {indItems.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative block overflow-hidden rounded-2xl text-left"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={600}
                      h={640}
                      loading="lazy"
                      className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                        {indIcons[i % indIcons.length]}
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-background">
                        {item.title}
                      </h3>
                      <p className="text-sm text-background/70">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {procEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
                  {procHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{procDesc}</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-5">
                {procSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-xl">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    {i < procSteps.length - 1 && (
                      <div className="absolute left-20 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-primary to-primary/20 lg:block" />
                    )}
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                      {step.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-16 rounded-2xl border border-border bg-muted p-8">
                <div className="grid gap-8 text-center md:grid-cols-3">
                  {procStats.map((s) => (
                    <div key={s.label}>
                      <div className="mb-2 text-4xl font-bold text-primary">
                        {s.value}
                      </div>
                      <p className="text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {galEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
                  {galHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{galDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galItems.map((item) => {
                  const isFavorite =
                    favoriteProjectNames?.has(item.title) ?? false

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => go(item.title)}
                      className="group block overflow-hidden rounded-2xl bg-card text-left shadow-lg transition-all hover:shadow-2xl"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          alt={item.imageAlt}
                          w={600}
                          h={448}
                          loading="lazy"
                          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                          {item.tag}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void toggleFavorite(item.title)
                          }}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${item.title} from favorites`
                              : `Add ${item.title} to favorites`
                          }
                          className={cn(
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-2 text-xl font-bold text-card-foreground">
                          {item.title}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.metric}</span>
                          <span className="font-semibold text-primary">
                            {item.client}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setQuoteForm({ ...quoteForm, projectName: item.title })
                            setQuoteOpen(true)
                          }}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          Request Similar Quote
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* About / Stats */}
          <section className="relative overflow-hidden bg-foreground py-24">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay">
              <Image
                alt="Precision manufacturing factory floor with industrial machinery"
                w={1920}
                h={900}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {aboutEyebrow}
                  </span>
                  <h2 className="mb-6 text-4xl font-bold text-background lg:text-5xl">
                    {aboutHeading}
                  </h2>
                  {aboutBody.map((p) => (
                    <p key={p} className="mb-6 text-lg text-background/70">
                      {p}
                    </p>
                  ))}

                  <div className="mb-8 grid grid-cols-2 gap-6">
                    {aboutCerts.map((c) => (
                      <div key={c} className="flex items-center gap-3">
                        <span className="text-primary">
                          <Check />
                        </span>
                        <span className="text-background/70">{c}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => go(aboutLink)}
                    className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    {aboutLink}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {aboutStats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-border bg-background/5 p-8 text-center backdrop-blur-sm"
                    >
                      <div className="mb-2 text-5xl font-bold text-primary lg:text-6xl">
                        {s.value}
                      </div>
                      <div className="font-medium text-background/60">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
                  {testHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{testDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted p-8"
                  >
                    <div className="mb-6 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 italic leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {t.company}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-24">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-bold text-primary-foreground lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-primary-foreground/90">
                {ctaDesc}
              </p>

              <div className="mb-12 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-background px-8 py-4 text-lg font-bold text-foreground shadow-xl transition-all hover:bg-background/90 hover:shadow-2xl"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-primary-foreground/20"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {ctaSecondary}
                </button>
              </div>

              <div className="grid gap-8 text-sm text-primary-foreground/80 sm:grid-cols-3">
                {ctaBadges.map((b) => (
                  <div key={b} className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60">
          <h2 className="sr-only">Footer</h2>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
                  >
                    <ForgeLogo />
                  </span>
                  <span className="text-left">
                    <span className="block text-lg font-bold text-background">
                      {brand.toUpperCase()}
                    </span>
                    <span className="block text-xs text-background/50">
                      {brandTagline}
                    </span>
                  </span>
                </button>
                <p className="mb-4 text-sm">{footerAbout}</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    aria-label="LinkedIn"
                    onClick={() => go("LinkedIn")}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Twitter"
                    onClick={() => go("Twitter")}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="YouTube"
                    onClick={() => go("YouTube")}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-bold text-background">
                  {footerCapTitle}
                </h3>
                <ul className="space-y-2 text-sm">
                  {footerCap.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-bold text-background">
                  {footerCompanyTitle}
                </h3>
                <ul className="space-y-2 text-sm">
                  {footerCompany.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-bold text-background">
                  {footerContactTitle}
                </h3>
                <address className="space-y-3 text-sm not-italic">
                  <p className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-primary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <span>{footerAddress}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="shrink-0 text-primary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => go(footerContactTitle)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerPhone}
                    </button>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="shrink-0 text-primary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => go(footerContactTitle)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerEmail}
                    </button>
                  </p>
                </address>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 text-sm">
              <p>{footerCopyright}</p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-primary"
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
