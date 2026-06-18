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
 * ResumeCvKimiPage — a complete, self-contained personal resume / CV / portfolio page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Sarah Chen — Senior Product
 * Designer" design: a clean, minimalist, editorial single-column résumé on a
 * light neutral canvas with generous whitespace, soft rounded cards, and a
 * restrained type hierarchy. It pairs a split hero (square headshot + role
 * eyebrow + big headline + bio + dual CTAs + a 3-up KPI strip) with a "trusted
 * by" company logo band, a timeline-style work-experience list (dated rows +
 * achievement bullets) plus an education entry, a skills & expertise section
 * (3 categorized proficiency cards + capability tag cloud), a featured-projects
 * case-study gallery (alternating image/text rows), a 4-up testimonials grid
 * with star ratings and author avatars, a contact section (channel links +
 * real inquiry form), and a footer with social links.
 *
 * The block owns ALL layout, spacing and type hierarchy. Surfaces map to theme
 * tokens (background / card / muted bands), text to foreground / muted, and the
 * dark monochrome accents to `primary`. Every nav item / CTA / contact channel /
 * social / form-submit routes through `useNavigate` (never a dead "#"). All
 * content imagery uses the alt-driven <Image> component (never a raw src);
 * author avatars also use <Image>. Callers supply ONLY content data; rich
 * defaults make it render the full résumé with no props at all.
 */
export const ResumeCvKimiPage = defineCapsule({
  name: "ResumeCvKimiPage",
  description:
    "Complete personal resume / CV / portfolio page for an individual professional, with a clean, minimalist, editorial single-column layout on a light neutral canvas, generous whitespace and soft rounded cards. Includes a split hero (square headshot, role eyebrow, big intro headline, bio, dual CTAs and a 3-up stat strip like years-experience / projects / users-impacted), a 'trusted by' company logo band, a dated timeline of work experience with achievement bullets plus an education entry, a skills & expertise section with categorized proficiency cards (Expert/Advanced/Proficient badges) and a capability tag cloud, a featured-projects case-study gallery with alternating image/text rows and tech tags, a testimonials grid with star ratings and author avatars, and a contact section with channel links (email, phone, LinkedIn, GitHub, Dribbble) plus a real message form. Use as the ROOT/home page for a personal resume, CV, online portfolio, about-me page, freelancer or designer/developer profile, or a 'hire me' page when a polished, professional, content-rich single-page résumé is wanted. Supply content only — brand (person name), nav, hero, logos, experience, education, skills, projects, testimonials, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Person / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero / intro section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headline: z.string().optional(),
        bio: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        photoAlt: z.string().optional(),
        /** 3-up KPI strip beneath the bio. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Trusted by" company logo band. */
    logos: z
      .object({
        caption: z.string().optional(),
        companies: z.array(z.string()).optional(),
      })
      .optional(),
    /** Work-experience timeline section. */
    experience: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              period: z.string(),
              role: z.string(),
              company: z.string(),
              badge: z.string(),
              summary: z.string(),
              bullets: z.array(z.string()),
            }),
          )
          .optional(),
        educationHeading: z.string().optional(),
        education: z
          .object({
            period: z.string(),
            degree: z.string(),
            school: z.string(),
            detail: z.string(),
          })
          .optional(),
      })
      .optional(),
    /** Skills & expertise section. */
    skills: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        categories: z
          .array(
            z.object({
              title: z.string(),
              skills: z.array(
                z.object({ name: z.string(), level: z.string() }),
              ),
            }),
          )
          .optional(),
        extrasHeading: z.string().optional(),
        extras: z.array(z.string()).optional(),
      })
      .optional(),
    /** Featured-projects case-study gallery. */
    projects: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              eyebrow: z.string(),
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()),
              cta: z.string(),
              imageAlt: z.string(),
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
    /** Contact section — channel links + inquiry form. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        channels: z
          .array(z.object({ kind: z.string(), value: z.string() }))
          .optional(),
        formHeading: z.string().optional(),
        submit: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
        links: z.array(z.string()).optional(),
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
        projectTitle: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      favoriteProjectTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.projectTitle)),
    },
    mutations: {
      submitInquiry: ({ db }, name: string, email: string, message: string) => {
        db.inquiries.insert({ name, email, message })
        return db.inquiries.all()
      },
      toggleFavorite: ({ db }, projectTitle: string) => {
        const existingFavorite = db.favorites
          .where('projectTitle', projectTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ projectTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [inquiriesOpen, setInquiriesOpen] = useState(false)
    const brand = props.brand ?? "Sarah Chen"

    const inquiries = lakebed.useQuery('inquiries')
    const favoriteProjectTitles = lakebed.useQuery('favoriteProjectTitles')
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
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
      : ["About", "Experience", "Skills", "Projects", "Get in Touch"]

    const heroEyebrow = props.hero?.eyebrow ?? "Senior Product Designer"
    const heroHeadline =
      props.hero?.headline ??
      "Designing thoughtful digital experiences that connect people and products"
    const heroBio =
      props.hero?.bio ??
      "I'm a product designer based in San Francisco with 8+ years of experience crafting intuitive interfaces, building design systems, and leading cross-functional teams. Currently designing the future of collaborative tools at Notion."
    const heroPrimary = props.hero?.primaryCta ?? "Let's work together"
    const heroSecondary = props.hero?.secondaryCta ?? "View my experience"
    const heroPhotoAlt =
      props.hero?.photoAlt ??
      "Professional headshot of a senior product designer with shoulder-length dark hair wearing a minimalist black blazer against a neutral gray studio background"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "8+", label: "Years Experience" },
          { value: "50+", label: "Projects Shipped" },
          { value: "12M+", label: "Users Impacted" },
        ]

    const logosCaption = props.logos?.caption ?? "Trusted by innovative teams at"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Notion", "Figma", "Dropbox", "Stripe", "Slack"]

    const expHeading = props.experience?.heading ?? "Experience"
    const expDescription =
      props.experience?.description ??
      "A decade of designing products across productivity, fintech, and enterprise SaaS—from early-stage startups to publicly traded companies."
    const expItems = props.experience?.items?.length
      ? props.experience.items
      : [
          {
            period: "2021 — Present",
            role: "Senior Product Designer",
            company: "Notion — San Francisco, CA",
            badge: "Full-time",
            summary:
              "Leading design for the Collaboration team, shipping features that help millions of teams work together. Built the commenting system from scratch, redesigned the notifications experience, and established accessibility standards across the product.",
            bullets: [
              "Increased monthly active commenters by 340% within 6 months of launch",
              "Reduced notification fatigue by 45% through intelligent bundling and preference controls",
              "Mentored 3 junior designers; two have since been promoted to mid-level",
            ],
          },
          {
            period: "2018 — 2021",
            role: "Product Designer",
            company: "Stripe — San Francisco, CA",
            badge: "Full-time",
            summary:
              "Designed products for Stripe Connect, the platform that powers marketplaces and multi-party payments. Focused on developer experience, dashboard redesigns, and onboarding flows for platforms like Shopify, Lyft, and Deliveroo.",
            bullets: [
              "Reduced platform onboarding time from 3 weeks to 3 days through automated workflows",
              "Designed the Express Connect onboarding flow now used by 2M+ connected accounts",
              "Contributed to Stripe's design system, adding 15+ components and establishing patterns",
            ],
          },
          {
            period: "2016 — 2018",
            role: "UX Designer",
            company: "Dropbox — San Francisco, CA",
            badge: "Full-time",
            summary:
              "Joined as the 5th designer on the Paper team, Dropbox's collaborative document editor. Shipped features for real-time collaboration, comment threads, and mobile editing. Later moved to the core Dropbox product to work on sharing and permissions.",
            bullets: [
              "Shipped mobile Paper editor with 4.8★ App Store rating and 500K+ monthly active users",
              "Redesigned sharing permissions, reducing support tickets by 28%",
            ],
          },
          {
            period: "2014 — 2016",
            role: "Junior Designer",
            company: "IDEO — Palo Alto, CA",
            badge: "Full-time",
            summary:
              "Started my career at IDEO's Palo Alto studio, working across multiple client projects spanning healthcare, fintech, and consumer products. Learned human-centered design methodology and the value of rapid prototyping.",
            bullets: [
              "Led design research for a major bank's mobile app redesign, conducting 40+ user interviews",
              "Co-designed a medication adherence app that improved patient compliance by 35%",
            ],
          },
        ]
    const educationHeading = props.experience?.educationHeading ?? "Education"
    const education = props.experience?.education ?? {
      period: "2010 — 2014",
      degree: "B.S. in Product Design",
      school: "Stanford University — Stanford, CA",
      detail: "GPA: 3.8/4.0 • Minor in Computer Science • d.school fellow",
    }

    const skillsHeading = props.skills?.heading ?? "Skills & Expertise"
    const skillsDescription =
      props.skills?.description ??
      "A comprehensive toolkit built over a decade of designing products at scale."
    const skillCategories = props.skills?.categories?.length
      ? props.skills.categories
      : [
          {
            title: "Design Tools",
            skills: [
              { name: "Figma", level: "Expert" },
              { name: "Sketch", level: "Expert" },
              { name: "Framer", level: "Advanced" },
              { name: "Principle", level: "Advanced" },
              { name: "Adobe Creative Suite", level: "Proficient" },
            ],
          },
          {
            title: "Product Strategy",
            skills: [
              { name: "Design Systems", level: "Expert" },
              { name: "User Research", level: "Expert" },
              { name: "Product Analytics", level: "Advanced" },
              { name: "A/B Testing", level: "Advanced" },
              { name: "Roadmapping", level: "Proficient" },
            ],
          },
          {
            title: "Technical",
            skills: [
              { name: "HTML/CSS", level: "Expert" },
              { name: "JavaScript", level: "Proficient" },
              { name: "React", level: "Proficient" },
              { name: "Git/GitHub", level: "Advanced" },
              { name: "Accessibility (WCAG)", level: "Expert" },
            ],
          },
        ]
    const extrasHeading =
      props.skills?.extrasHeading ?? "Additional Capabilities"
    const extras = props.skills?.extras?.length
      ? props.skills.extras
      : [
          "Prototyping",
          "Wireframing",
          "Information Architecture",
          "Interaction Design",
          "Visual Design",
          "Usability Testing",
          "Workshop Facilitation",
          "Design Sprint",
          "Mentoring",
          "Cross-functional Collaboration",
          "Design Ops",
          "Motion Design",
          "Illustration",
          "3D Modeling (Blender)",
        ]

    const projectsHeading = props.projects?.heading ?? "Featured Projects"
    const projectsDescription =
      props.projects?.description ??
      "Selected case studies from my work at Notion, Stripe, and Dropbox."
    const projectItems = props.projects?.items?.length
      ? props.projects.items
      : [
          {
            eyebrow: "Notion — 2023",
            title: "Collaborative Comments",
            description:
              "Redesigned Notion's commenting experience to support threaded discussions, @mentions, and rich media. The project involved complex state management for real-time updates and careful consideration of notification patterns to avoid overwhelming users.",
            tags: ["Product Design", "Interaction Design", "User Research"],
            cta: "View case study",
            imageAlt:
              "Interface mockup of a collaborative document editor with inline comment threads and user avatars in the margin",
          },
          {
            eyebrow: "Stripe — 2020",
            title: "Connect Dashboard",
            description:
              "Designed the merchant-facing dashboard for Stripe Connect, giving platform businesses visibility into their sellers' performance. Created modular components that scaled across different use cases from marketplaces to SaaS platforms.",
            tags: ["Dashboard Design", "Data Visualization", "Design System"],
            cta: "View case study",
            imageAlt:
              "Payment analytics dashboard with charts, transaction tables and a clean minimalist data visualization layout",
          },
          {
            eyebrow: "Dropbox — 2017",
            title: "Paper Mobile",
            description:
              "Led the design of Dropbox Paper's iOS and Android apps, bringing the collaborative document editor to mobile. Balanced feature parity with mobile-specific optimizations, creating touch-friendly interactions for complex formatting.",
            tags: ["Mobile Design", "iOS & Android", "Touch Interaction"],
            cta: "View case study",
            imageAlt:
              "Mobile phone displaying a document editing app interface with clean typography and collaborative editing features",
          },
        ]

    const testimonialsHeading = props.testimonials?.heading ?? "Kind Words"
    const testimonialsDescription =
      props.testimonials?.description ??
      "Feedback from colleagues and collaborators I've worked with over the years."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Sarah's ability to translate complex product requirements into intuitive designs is unmatched. She doesn't just make things look good—she makes them work better. The commenting feature she led at Notion became our highest-user-engagement feature within months.",
            name: "Ivan Zhao",
            role: "CEO & Co-founder, Notion",
            avatarAlt:
              "Professional headshot of a tech CEO with short black hair and glasses wearing a black turtleneck",
          },
          {
            quote:
              "Working with Sarah on the Connect Dashboard was a masterclass in product thinking. She has this rare combination of strategic vision and pixel-perfect execution. Every interaction she designed had purpose and polish.",
            name: "Patrick Collison",
            role: "Co-founder & CEO, Stripe",
            avatarAlt:
              "Professional headshot of a startup co-founder with short brown hair and a friendly expression wearing a casual button-down shirt",
          },
          {
            quote:
              "Sarah was instrumental in building out our design system at Dropbox. She thinks about scale, accessibility, and developer handoff in ways that most designers don't. Her documentation is as thoughtful as her designs.",
            name: "Jennifer Chen",
            role: "VP of Design, Dropbox",
            avatarAlt:
              "Professional headshot of a design director with long dark hair and a warm smile wearing professional attire",
          },
          {
            quote:
              "As a mentor, Sarah is patient, direct, and incredibly insightful. She helped me grow from a junior designer to a confident product thinker. Her feedback always cut to the core of the problem without ever feeling harsh.",
            name: "David Kim",
            role: "Product Designer, Notion",
            avatarAlt:
              "Professional headshot of a product designer with short black hair and a friendly expression wearing a casual sweater",
          },
        ]

    const contactHeading = props.contact?.heading ?? "Let's work together"
    const contactDescription =
      props.contact?.description ??
      "I'm currently open to senior design roles, advisory positions, and select consulting projects. If you're building something meaningful and need design leadership, I'd love to hear from you."
    const contactChannels = props.contact?.channels?.length
      ? props.contact.channels
      : [
          { kind: "email", value: "sarah@sarahchen.design" },
          { kind: "phone", value: "+1 (415) 555-1234" },
          { kind: "linkedin", value: "linkedin.com/in/sarahchen" },
          { kind: "github", value: "github.com/sarahchen" },
          { kind: "dribbble", value: "dribbble.com/sarahchen" },
        ]
    const contactFormHeading = props.contact?.formHeading ?? "Send a message"
    const contactSubmit = props.contact?.submit ?? "Send message"

    const footerTagline = props.footer?.tagline ?? "Senior Product Designer"
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["LinkedIn", "Twitter", "GitHub", "Dribbble"]
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy Policy", "Resume PDF"]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <line x1="3" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Contact-channel + social icons (decorative, currentColor + token text).
    const channelIcon = (kind: string): ReactNode => {
      const k = kind.toLowerCase()
      const base = {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        "aria-hidden": true as const,
      }
      if (k === "email")
        return (
          <svg {...base} fill="none" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )
      if (k === "phone")
        return (
          <svg {...base} fill="none" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        )
      if (k === "linkedin")
        return (
          <svg {...base} fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        )
      if (k === "github")
        return (
          <svg {...base} fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )
      if (k === "twitter")
        return (
          <svg {...base} fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      // dribbble (default)
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm7.163 5.556a10.155 10.155 0 012.588 6.444c-.365-.073-4.02-.809-7.708-.353-.088-.202-.176-.405-.267-.604-.11-.244-.219-.482-.323-.72 4.133-1.673 5.577-4.564 5.71-4.767zm-1.353-1.155c-.105.186-1.39 2.91-5.718 4.38-1.784-3.264-3.752-5.941-4.048-6.354a10.166 10.166 0 019.766 1.974zM7.658 3.282c.283.385 2.247 3.073 4.04 6.295-5.111 1.36-9.61 1.343-10.125 1.335A10.166 10.166 0 017.658 3.282zM1.962 11.999c0-.084.003-.168.005-.251.503.01 5.318.072 10.663-1.375.298.583.585 1.171.852 1.758l-.384.106c-4.022 1.108-6.156 4.54-6.303 4.818a10.158 10.158 0 01-4.833-5.056zm6.573 6.836c.094-.17 1.553-3.353 5.358-4.332 1.617 4.201 2.284 7.73 2.455 8.754a10.17 10.17 0 01-7.813-4.422zm9.306.957c-.143-.862-.747-4.26-2.287-8.314 3.483-.554 6.538.357 6.925.473a10.166 10.166 0 01-4.638 7.841z" />
        </svg>
      )
    }

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {nav[nav.length - 1]}
              </button>
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
                        onClick={() => go('Inquiries')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Inquiries
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
              <Sheet open={inquiriesOpen} onOpenChange={setInquiriesOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="View inquiries"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {inquiries && inquiries.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {inquiries.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Inquiries</SheetTitle>
                    <SheetDescription>
                      {inquiries && inquiries.length > 0
                        ? `${inquiries.length} inquiry${inquiries.length === 1 ? '' : 'ies'} received.`
                        : 'No inquiries yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {inquiries && inquiries.length ? (
                      <div className="space-y-5">
                        {inquiries.map((inquiry) => (
                          <div
                            key={inquiry.id}
                            className="rounded-lg border border-border bg-muted/40 p-4"
                          >
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {inquiry.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {inquiry.email}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {inquiry.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No inquiries yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          When visitors submit the contact form, their messages
                          will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                      >
                        Close
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
          <section className="px-6 pb-20 pt-32 md:pb-32 md:pt-40">
            <div className="mx-auto max-w-5xl">
              <div className="grid items-start gap-12 md:grid-cols-12">
                <div className="md:col-span-4">
                  <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={heroPhotoAlt}
                      w={800}
                      h={800}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
                <div className="md:col-span-8">
                  <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    {heroHeadline}
                  </h1>
                  <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    {heroBio}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-10">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-semibold text-foreground">
                          {s.value}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted py-16">
            <div className="mx-auto max-w-5xl px-6">
              <p className="mb-10 text-center text-sm text-muted-foreground">
                {logosCaption}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-5">
                {logoCompanies.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => go(company)}
                    className="text-lg font-semibold text-foreground"
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="px-6 py-20 md:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="mb-16">
                <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                  {expHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {expDescription}
                </p>
              </div>

              <div className="space-y-12">
                {expItems.map((item, i) => (
                  <div
                    key={`${item.role}-${item.period}`}
                    className={cn(
                      "grid gap-6 md:grid-cols-12",
                      i < expItems.length - 1 && "border-b border-border pb-12",
                    )}
                  >
                    <div className="md:col-span-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.period}
                      </p>
                    </div>
                    <div className="md:col-span-9">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {item.role}
                          </h3>
                          <p className="text-muted-foreground">{item.company}</p>
                        </div>
                        <span className="whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                          {item.badge}
                        </span>
                      </div>
                      <p className="mb-4 leading-relaxed text-muted-foreground">
                        {item.summary}
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {item.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2">
                            <span className="mt-1 text-muted-foreground/60">
                              •
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="mt-20 border-t border-border pt-12">
                <h3 className="mb-8 text-xl font-semibold text-foreground">
                  {educationHeading}
                </h3>
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {education.period}
                    </p>
                  </div>
                  <div className="md:col-span-9">
                    <h4 className="text-lg font-semibold text-foreground">
                      {education.degree}
                    </h4>
                    <p className="text-muted-foreground">{education.school}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {education.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-muted px-6 py-20 md:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="mb-16">
                <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                  {skillsHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {skillsDescription}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {skillCategories.map((cat) => (
                  <div
                    key={cat.title}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <h3 className="mb-4 text-lg font-semibold text-card-foreground">
                      {cat.title}
                    </h3>
                    <ul className="space-y-3">
                      {cat.skills.map((skill) => (
                        <li
                          key={skill.name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-muted-foreground">
                            {skill.name}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                            {skill.level}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="mb-6 text-lg font-semibold text-foreground">
                  {extrasHeading}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {extras.map((extra) => (
                    <span
                      key={extra}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground"
                    >
                      {extra}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="px-6 py-20 md:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="mb-16">
                <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                  {projectsHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {projectsDescription}
                </p>
              </div>

              <div className="space-y-16">
                {projectItems.map((proj, i) => {
                  const imageFirst = i % 2 === 1
                  const isFavorite =
                    favoriteProjectTitles?.has(proj.title) ?? false
                  const ImageBlock = (
                    <div
                      className={cn(
                        imageFirst ? "order-1" : "order-1 md:order-2",
                      )}
                    >
                      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          alt={proj.imageAlt}
                          w={800}
                          h={450}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(proj.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${proj.title} from favorites`
                              : `Add ${proj.title} to favorites`
                          }
                          className={cn(
                            'absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isFavorite
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                    </div>
                  )
                  const TextBlock = (
                    <div
                      className={cn(
                        imageFirst ? "order-2" : "order-2 md:order-1",
                      )}
                    >
                      <span className="mb-2 block text-sm font-medium text-muted-foreground">
                        {proj.eyebrow}
                      </span>
                      <h3 className="mb-4 text-2xl font-semibold text-foreground">
                        {proj.title}
                      </h3>
                      <p className="mb-6 leading-relaxed text-muted-foreground">
                        {proj.description}
                      </p>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => go(proj.title)}
                        className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {proj.cta}
                        <ArrowRight className="ml-2 size-4" />
                      </button>
                    </div>
                  )
                  return (
                    <article
                      key={proj.title}
                      className="grid items-center gap-8 md:grid-cols-2"
                    >
                      {TextBlock}
                      {ImageBlock}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted px-6 py-20 md:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {testimonialsDescription}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} />
                      ))}
                    </div>
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
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="px-6 py-20 md:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-16 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {contactDescription}
                  </p>
                  <div className="space-y-4">
                    {contactChannels.map((channel) => (
                      <button
                        key={channel.value}
                        type="button"
                        onClick={() => go(channel.value)}
                        className="flex items-center gap-3 text-foreground transition-colors hover:text-muted-foreground"
                      >
                        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                          {channelIcon(channel.kind)}
                        </span>
                        <span>{channel.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted p-8">
                  <h3 className="mb-6 text-xl font-semibold text-foreground">
                    {contactFormHeading}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const name = (
                        form.elements.namedItem('resume-name') as HTMLInputElement
                      ).value
                      const email = (
                        form.elements.namedItem('resume-email') as HTMLInputElement
                      ).value
                      const message = (
                        form.elements.namedItem('resume-message') as HTMLTextAreaElement
                      ).value

                      void submitInquiry(name, email, message)
                      setInquiriesOpen(true)
                      form.reset()
                    }}
                  >
                    <div>
                      <label
                        htmlFor="resume-name"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="resume-name"
                        name="resume-name"
                        type="text"
                        required
                        placeholder="Your name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="resume-email"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="resume-email"
                        name="resume-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="resume-message"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="resume-message"
                        name="resume-message"
                        rows={4}
                        required
                        placeholder="Tell me about your project..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {contactSubmit}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="text-lg font-semibold text-foreground">
                  {brand}
                </span>
                <span className="text-muted-foreground/60">|</span>
                <span className="text-sm text-muted-foreground">
                  {footerTagline}
                </span>
              </button>
              <div className="flex items-center gap-6">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {channelIcon(social)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
              <p>
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex items-center gap-6">
                {footerLinks.map((link) => (
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
        </footer>
      </div>
    )
  },
})
