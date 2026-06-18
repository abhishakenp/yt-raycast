import { useState, type ReactNode } from "react"
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
 * TeamKimiPage — a complete, self-contained "Our Team / About Us" company page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Blueprint Studios" design: a
 * clean, editorial, light aesthetic with generous whitespace, large semibold
 * headings, a muted neutral palette, and grayscale-to-color headshot hovers.
 * It pairs an eyebrow + big-statement hero with a leadership card grid (photo,
 * name, role, bio, social links), a row of round department-lead portraits, an
 * inverted dark stats band, a split culture section (principles + photo pair),
 * a "life at the company" photo gallery, a numbered values trio, employee
 * testimonials, a dark careers/benefits split with hero photo, a centered
 * "let's work together" CTA, and a multi-column footer.
 *
 * The block owns ALL layout, spacing and type hierarchy. Surfaces use semantic
 * theme tokens (background / muted / card / foreground) and the dark bands use
 * `bg-foreground` + `text-background` to mirror Kimi's inverted stone-900
 * sections without any palette color. Every nav item / CTA / social / footer
 * link routes through `useNavigate` (never a dead "#"). All imagery (hero,
 * headshots, gallery) uses the alt-driven <Image> component. Callers supply
 * ONLY content data; rich defaults make it render great with no props at all.
 */
export const TeamKimiPage = defineCapsule({
  name: "TeamKimiPage",
  description:
    "Complete 'Our Team / About Us' company page with a clean, editorial, light aesthetic: generous whitespace, large semibold headings, a muted neutral palette and grayscale-to-color headshot hovers. Includes an eyebrow + big-statement hero, a leadership card grid (portrait, name, role, bio and LinkedIn/Twitter/GitHub social links), a row of round department-lead avatars, an inverted dark stats band (team members, countries, years, projects), a split culture section pairing principle bullets with a photo collage, a 'life at the company' square photo gallery, a numbered 01/02/03 values trio, employee testimonial quotes with avatars, a dark careers/benefits split with hero photo and 'view open positions' CTA, a centered 'let's work together' contact CTA, and a multi-column footer with company/services/contact columns and social icons. Use as the ROOT page for a team page, about-us page, meet-the-team / leadership / people page, company culture page, or careers/hiring landing for agencies, studios, startups, consultancies and professional-services firms when showcasing the humans, culture, values and open roles behind a brand. Supply content only — brand, nav, hero, leadership, departmentLeads, stats, culture, gallery, values, testimonials, careers, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Leadership card grid. */
    leadership: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              photoAlt: z.string(),
              socials: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Department-lead round-portrait row. */
    departmentLeads: z
      .object({
        heading: z.string().optional(),
        people: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              photoAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted dark stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Split culture section. */
    culture: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        principles: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Life at the company" photo gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Numbered values trio. */
    values: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Employee testimonials. */
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
    /** Dark careers / benefits split. */
    careers: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        cta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Centered contact CTA. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      inquiries: table({
        name: string(),
        email: string(),
        message: string(),
      }),
      favorites: table({
        memberName: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      favoriteMemberNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.memberName)),
    },
    mutations: {
      submitInquiry: ({ db }, name: string, email: string, message: string) => {
        db.inquiries.insert({ name, email, message })
        return db.inquiries.all()
      },
      toggleFavorite: ({ db }, memberName: string) => {
        const existingFavorite = db.favorites
          .where('memberName', memberName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ memberName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [contactOpen, setContactOpen] = useState(false)
    const [inquiryName, setInquiryName] = useState("")
    const [inquiryEmail, setInquiryEmail] = useState("")
    const [inquiryMessage, setInquiryMessage] = useState("")
    const brand = props.brand ?? "Blueprint"
    const nav = props.nav?.length
      ? props.nav
      : ["Team", "Culture", "Values", "Careers", "Get in touch"]

    const heroEyebrow = props.hero?.eyebrow ?? "About Us"
    const heroHeading = props.hero?.heading ?? "The people behind the work"
    const heroSub =
      props.hero?.subheading ??
      "Meet the leadership, designers, engineers, and strategists who shape Blueprint Studios. We're a collective of 47 craftspeople across 8 countries, united by a shared commitment to exceptional digital experiences."
    const heroCta = props.hero?.cta ?? "Get in touch"

    const leadershipHeading = props.leadership?.heading ?? "Leadership"
    const leadershipDesc =
      props.leadership?.description ??
      "The experienced practitioners guiding our vision and operations."
    const defaultLeadershipMembers = [
          {
            name: "Marcus Chen",
            role: "CEO & Co-founder",
            bio: "Former design director at IDEO. Marcus leads company strategy and client partnerships. Based in San Francisco. 18 years in product design.",
            photoAlt:
              "Professional headshot of Marcus Chen, CEO and co-founder, wearing a navy blazer with a confident expression",
            socials: ["LinkedIn", "Twitter"],
          },
          {
            name: "Sarah Williams",
            role: "CTO & Co-founder",
            bio: "Previously principal engineer at Stripe. Sarah architects our technical infrastructure and engineering culture. Based in Seattle. 15 years in software engineering.",
            photoAlt:
              "Professional headshot of Sarah Williams, CTO and co-founder, with a warm smile and modern glasses",
            socials: ["LinkedIn", "GitHub"],
          },
          {
            name: "David Park",
            role: "Chief Operating Officer",
            bio: "Former McKinsey consultant. David oversees operations, finance, and team scaling. Based in New York. 12 years in operational leadership.",
            photoAlt:
              "Professional headshot of David Park, chief operating officer, in a charcoal sweater with a thoughtful expression",
            socials: ["LinkedIn"],
          },
          {
            name: "Elena Rodriguez",
            role: "Design Director",
            bio: "Former lead at Pentagram. Elena shapes our design philosophy and mentors the creative team. Based in London. 14 years in brand and digital design.",
            photoAlt:
              "Professional headshot of Elena Rodriguez, design director, with creative styling and a confident smile",
            socials: ["LinkedIn", "Dribbble"],
          },
          {
            name: "James Okonkwo",
            role: "Engineering Director",
            bio: "Ex-Google staff engineer. James leads our technical teams and engineering standards. Based in Berlin. 16 years in software architecture.",
            photoAlt:
              "Professional headshot of James Okonkwo, engineering director, wearing casual tech-company attire",
            socials: ["LinkedIn", "GitHub"],
          },
          {
            name: "Priya Sharma",
            role: "Strategy Director",
            bio: "Former Bain strategist. Priya leads client strategy and business transformation. Based in Singapore. 13 years in management consulting.",
            photoAlt:
              "Professional headshot of Priya Sharma, strategy director, with an intelligent expression and professional attire",
            socials: ["LinkedIn"],
          },
        ]
    const leadershipMembers = (props.leadership?.members?.length
      ? props.leadership.members
      : defaultLeadershipMembers
    ).map((member, index) => ({
      ...member,
      socials: member.socials?.length
        ? member.socials
        : defaultLeadershipMembers[index % defaultLeadershipMembers.length].socials,
    }))

    const deptHeading = props.departmentLeads?.heading ?? "Department Leads"
    const deptPeople = props.departmentLeads?.people?.length
      ? props.departmentLeads.people
      : [
          {
            name: "Thomas Anderson",
            role: "Product Lead",
            photoAlt: "Professional headshot of Thomas Anderson, product lead",
          },
          {
            name: "Laura Kim",
            role: "UX Research Lead",
            photoAlt: "Professional headshot of Laura Kim, UX research lead",
          },
          {
            name: "Michael Torres",
            role: "Creative Tech Lead",
            photoAlt:
              "Professional headshot of Michael Torres, creative technology lead",
          },
          {
            name: "Anna Schmidt",
            role: "Client Services Lead",
            photoAlt:
              "Professional headshot of Anna Schmidt, client services lead",
          },
        ]

    const statsItems = props.stats?.length
      ? props.stats
      : [
          { value: "47", label: "Team members" },
          { value: "8", label: "Countries" },
          { value: "12", label: "Years active" },
          { value: "156", label: "Projects shipped" },
        ]

    const cultureEyebrow = props.culture?.eyebrow ?? "Our Culture"
    const cultureHeading =
      props.culture?.heading ?? "Built on craft, collaboration, and care"
    const cultureDesc =
      props.culture?.description ??
      "We believe the best work happens when talented people feel supported, challenged, and empowered. Our culture isn't defined by ping-pong tables or slogans—it's in how we treat each other, how we approach problems, and how we show up for our clients every day."
    const culturePrinciples = props.culture?.principles?.length
      ? props.culture.principles
      : [
          {
            title: "Collaboration first",
            description:
              "No brilliant jerks. Every project is a team sport, and everyone's voice matters.",
          },
          {
            title: "Craft obsession",
            description:
              "We sweat the details. From animation curves to API responses, quality is non-negotiable.",
          },
          {
            title: "Sustainable pace",
            description:
              "No crunch culture. We plan realistically, scope thoughtfully, and respect life outside work.",
          },
        ]
    const cultureImageAlts = props.culture?.imageAlts?.length
      ? props.culture.imageAlts
      : [
          "Team collaboration moment in a studio office with designers working together at a large table",
          "Creative team brainstorming session in a modern workspace with whiteboards and post-it notes",
        ]

    const galleryHeading = props.gallery?.heading ?? "Life at Blueprint"
    const galleryDesc =
      props.gallery?.description ??
      "Glimpses of our workspaces, retreats, and everyday moments."
    const galleryImageAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "Modern minimalist office interior with natural light and plants",
          "Team workshop session with designers presenting work on a large screen",
          "Two colleagues having a focused discussion over a laptop in a bright office space",
          "Team meeting around a conference table with presentation materials",
          "Office lounge area with comfortable seating and a bookshelf for casual meetings",
          "Team celebrating a successful project launch in an office kitchen area",
          "Designer working on a large monitor with sketches and wireframes visible",
          "Group photo of team members at a company retreat in an outdoor setting",
        ]

    const valuesHeading = props.values?.heading ?? "Our Values"
    const valuesDesc =
      props.values?.description ??
      "The principles that guide our decisions, big and small."
    const valueItems = props.values?.items?.length
      ? props.values.items
      : [
          {
            title: "Design with purpose",
            description:
              "Every pixel should earn its place. We create work that communicates clearly, functions beautifully, and serves real human needs.",
          },
          {
            title: "Own the outcome",
            description:
              "We don't just deliver files—we partner for results. If our work doesn't perform, we haven't done our job.",
          },
          {
            title: "Grow together",
            description:
              "We invest in each other's growth. Mentorship, feedback, and continuous learning are woven into our daily practice.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What our team says"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Honest perspectives from the people who work here."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The level of craft here is unmatched. I've learned more in two years at Blueprint than in five years elsewhere. Everyone genuinely cares about the work.",
            name: "Robert Chen",
            role: "Senior Designer, 2 years",
            avatarAlt:
              "Professional headshot of Robert Chen, senior designer",
          },
          {
            quote:
              "Remote-first done right. I work from Amsterdam but feel deeply connected to my team. The async communication culture is thoughtful and inclusive.",
            name: "Emma van der Berg",
            role: "Frontend Engineer, 3 years",
            avatarAlt:
              "Professional headshot of Emma van der Berg, frontend engineer",
          },
          {
            quote:
              "As a parent, flexibility matters. Blueprint respects my time and trusts me to do great work on my own schedule. That trust goes both ways.",
            name: "Jennifer Walsh",
            role: "Project Manager, 4 years",
            avatarAlt:
              "Professional headshot of Jennifer Walsh, project manager",
          },
        ]

    const careersEyebrow = props.careers?.eyebrow ?? "Join Us"
    const careersHeading =
      props.careers?.heading ?? "We're always looking for exceptional people"
    const careersDesc =
      props.careers?.description ??
      "Whether you're a designer, engineer, strategist, or something in between—if you care deeply about craft and collaboration, we want to hear from you. We offer competitive compensation, meaningful equity, and the chance to work on projects that matter."
    const careersBenefits = props.careers?.benefits?.length
      ? props.careers.benefits
      : [
          "Competitive salary + equity",
          "Remote-first with quarterly team retreats",
          "Health, dental, vision (100% covered)",
          "$3,000 annual learning budget",
          "Unlimited PTO with minimum 20 days encouraged",
        ]
    const careersCta = props.careers?.cta ?? "View open positions"
    const careersImageAlt =
      props.careers?.imageAlt ??
      "Team members collaborating in a bright modern workspace with large windows"

    const contactHeading = props.contact?.heading ?? "Let's work together"
    const contactDesc =
      props.contact?.description ??
      "Have a project in mind? We'd love to hear about it. Tell us what you're building and we'll get back to you within 24 hours."
    const contactPrimary = props.contact?.primaryCta ?? "Start a project"
    const contactEmail = props.contact?.email ?? "hello@blueprint.studio"

    const footerTagline =
      props.footer?.tagline ??
      "Crafting exceptional digital experiences since 2012."
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          { title: "Company", links: ["About", "Team", "Careers", "Press"] },
          {
            title: "Services",
            links: [
              "Brand Strategy",
              "Product Design",
              "Development",
              "Consulting",
            ],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "hello@blueprint.studio",
          "+1 (415) 555-0123",
          "555 Mission Street",
          "San Francisco, CA 94105",
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "Instagram"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    const favoriteMemberNames = lakebed.useQuery("favoriteMemberNames")
    const toggleFavorite = lakebed.useMutation("toggleFavorite")
    const submitInquiry = lakebed.useMutation("submitInquiry")
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
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading
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
    const handleSubmitInquiry = (e: React.FormEvent) => {
      e.preventDefault()
      if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
        return
      }
      void submitInquiry(inquiryName, inquiryEmail, inquiryMessage)
      setInquiryName("")
      setInquiryEmail("")
      setInquiryMessage("")
      setContactOpen(false)
    }

    // Brand mark — decorative blueprint/box outline glyph + wordmark.
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
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

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          "size-5",
          active ? "text-primary-foreground" : "text-foreground",
        )}
        fill={active ? "currentColor" : "none"}
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

    // Culture-principle icons rotate through this trio (decorative, currentColor).
    const principleIcons: ReactNode[] = [
      // users
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // lightbulb
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // clock
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-foreground"
              >
                <LogoMark className="size-8" />
                <span className="text-lg font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 md:flex">
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
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
              </nav>

              {/* Actions */}
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
                              {authEmail ?? "Signed in to this session"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go("Account")}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
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
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
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
                            {authEmail ?? "Signed in"}
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
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {heroSub}
                </p>
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroCta}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Team / Leadership */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 md:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {leadershipHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {leadershipDesc}
                </p>
              </div>

              <div className="mb-24 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
                {leadershipMembers.map((member) => {
                  const isFavorite =
                    favoriteMemberNames?.has(member.name) ?? false

                  return (
                    <article key={member.name} className="group">
                      <div className="mb-6 aspect-[4/5] overflow-hidden rounded-lg bg-muted relative">
                        <Image
                          alt={member.photoAlt}
                          w={600}
                          h={750}
                          loading="lazy"
                          className="size-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        />
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(member.name)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${member.name} from favorites`
                              : `Add ${member.name} to favorites`
                          }
                          className={cn(
                            "absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105",
                            isFavorite
                              ? "bg-primary text-primary-foreground"
                              : "bg-background/90 text-foreground hover:bg-background",
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <h3 className="mb-1 text-xl font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <p className="mb-3 text-sm font-medium text-muted-foreground">
                        {member.role}
                      </p>
                      <p className="leading-relaxed text-muted-foreground">
                        {member.bio}
                      </p>
                      <div className="mt-4 flex gap-4">
                        {member.socials.map((social) => (
                          <button
                            key={social}
                            type="button"
                            aria-label={`${member.name} on ${social}`}
                            onClick={() => go(social)}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {social}
                          </button>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  {deptHeading}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                {deptPeople.map((person) => (
                  <article key={person.name} className="text-center">
                    <div className="mx-auto mb-4 size-24 overflow-hidden rounded-full bg-muted">
                      <Image
                        alt={person.photoAlt}
                        w={200}
                        h={200}
                        loading="lazy"
                        className="size-full object-cover grayscale transition-all duration-300 hover:grayscale-0"
                      />
                    </div>
                    <h4 className="font-semibold text-foreground">
                      {person.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {person.role}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (inverted) */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:gap-12">
                {statsItems.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-2 text-4xl font-semibold md:text-5xl">
                      {stat.value}
                    </p>
                    <p className="text-background/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Culture */}
          <section className="bg-muted/40 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {cultureEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {cultureHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {cultureDesc}
                  </p>
                  <div className="space-y-6">
                    {culturePrinciples.map((principle, i) => (
                      <div key={principle.title} className="flex items-start">
                        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                          {principleIcons[i % principleIcons.length]}
                        </div>
                        <div className="ml-4">
                          <h3 className="mb-1 font-semibold text-foreground">
                            {principle.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {principle.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {cultureImageAlts.slice(0, 2).map((alt, i) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={600}
                      h={800}
                      loading="lazy"
                      className={cn(
                        "h-64 w-full rounded-lg object-cover md:h-80",
                        i === 1 && "mt-8",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryImageAlts.map((alt) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="bg-muted/40 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {valuesHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {valuesDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {valueItems.map((value, i) => (
                  <div
                    key={value.title}
                    className="rounded-lg border border-border bg-background p-8"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-muted">
                      <span className="text-2xl font-bold text-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {value.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((item) => (
                  <blockquote
                    key={item.name}
                    className="rounded-lg bg-muted/60 p-8"
                  >
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="flex items-center">
                      <Image
                        alt={item.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="mr-4 size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Careers (inverted) */}
          <section className="bg-foreground py-24 text-background md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-wide text-background/70">
                    {careersEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight md:text-4xl">
                    {careersHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-background/80">
                    {careersDesc}
                  </p>
                  <div className="mb-8 space-y-4">
                    {careersBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-center">
                        <Check className="mr-3 size-5 text-background/70" />
                        <span className="text-background/80">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="inline-flex items-center rounded-md bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                  >
                    {careersCta}
                    <ArrowRight className="ml-2 size-4" />
                  </button>
                </div>
                <div className="hidden lg:block">
                  <Image
                    alt={careersImageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-muted/40 py-24 md:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {contactDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Sheet open={contactOpen} onOpenChange={setContactOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                    >
                      {contactPrimary}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Get in touch</SheetTitle>
                      <SheetDescription>
                        Send us a message and we'll get back to you within 24
                        hours.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <form onSubmit={handleSubmitInquiry} className="space-y-4">
                        <div>
                          <label
                            htmlFor="inquiry-name"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Name
                          </label>
                          <input
                            id="inquiry-name"
                            type="text"
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            placeholder="Your name"
                            required
                            className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="inquiry-email"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Email
                          </label>
                          <input
                            id="inquiry-email"
                            type="email"
                            value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="inquiry-message"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Message
                          </label>
                          <textarea
                            id="inquiry-message"
                            value={inquiryMessage}
                            onChange={(e) => setInquiryMessage(e.target.value)}
                            placeholder="Tell us about your project..."
                            required
                            rows={6}
                            className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                        </div>
                      </form>
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={handleSubmitInquiry}
                        disabled={
                          !inquiryName.trim() ||
                          !inquiryEmail.trim() ||
                          !inquiryMessage.trim()
                        }
                      >
                        Send message
                      </Button>
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
                  onClick={() => go(contactEmail)}
                  className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
                >
                  {contactEmail}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer (inverted) */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-background"
                >
                  <LogoMark className="size-8" />
                  <span className="text-lg font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
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
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {column.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {column.links.map((link) => (
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
              <div>
                <h4 className="mb-4 font-semibold text-background">Contact</h4>
                <ul className="space-y-2 text-sm">
                  {footerContact.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between border-t border-border/30 pt-8 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {brand} Studios. {footerNote}
              </p>
              <div className="mt-4 flex gap-6 text-sm md:mt-0">
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
