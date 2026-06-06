import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ResumeCvKimiPage2 — a bold, dark, high-contrast personal resume / CV / portfolio
 * page. This is the SECOND, visually DISTINCT style sibling to ResumeCvKimiPage:
 * where that one is a light, minimalist, editorial single-column résumé, THIS
 * variant is a dramatic dark-canvas layout with heavy "font-black" display type,
 * a warm amber/primary accent, a glowing floating headshot, an "available for
 * work" status pill, a 4-up big-number stats band, a center-spine timeline of
 * work experience with alternating photos and colored period chips, a 6-up
 * icon-card skills grid plus a "tools I use daily" tag cloud, a 3-up star-rated
 * testimonials grid with author avatars, and a centered closing CTA with
 * email/phone buttons and a location card. Footer carries monogram + social
 * links.
 *
 * Surfaces map to theme tokens (background / card / muted bands), text to
 * foreground / muted, and the warm accent + colored timeline chips rotate over
 * primary / accent / secondary / chart tokens (no raw palette). Every nav item /
 * CTA / contact channel / social routes through useNavigate (never a dead "#").
 * All imagery (headshot, experience photos, testimonial avatars) uses the
 * alt-driven <Image> component. Callers supply ONLY content; rich defaults make
 * it render the full résumé with no props at all.
 */
export const ResumeCvKimiPage2 = defineComponent({
  name: "ResumeCvKimiPage2",
  description:
    "Bold, dark, high-contrast personal resume / CV / portfolio / 'hire me' page for an individual professional, with dramatic font-black display headings, a warm amber/primary accent, a glowing floating headshot and an 'available for new projects' status pill. This is the DARK, dramatic ALTERNATIVE / second style sibling to ResumeCvKimiPage (which is the light, minimalist editorial version) — pick this when a punchy, confident, dark-themed personal site is wanted. Includes a split hero (name display headline, tagline, Hire Me / View Work CTAs and inline social links), a 4-up big-number stats band (years experience / projects shipped / awards / client satisfaction), a center-spine work-experience timeline with alternating photos and colored period chips, a skills & expertise section with 6 icon feature cards (UI Design, UX Research, Design Systems, Prototyping, Team Leadership, Strategic Thinking) plus a 'tools I use daily' tag cloud, a 3-up testimonials grid with star ratings and author avatars, and a centered closing call-to-action with email/phone buttons and a location card. Use as the ROOT/home page for a personal resume, CV, online portfolio, about-me page, freelancer or designer/developer profile. Supply content only — brand, nav, hero, stats, experience, skills, testimonials, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Person / brand monogram shown in the navbar and footer (e.g. "MC."). */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero / intro section content. */
    hero: z
      .object({
        statusLabel: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        tagline: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        photoAlt: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** 4-up big-number stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Work-experience center-spine timeline section. */
    experience: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              period: z.string(),
              role: z.string(),
              company: z.string(),
              summary: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Skills & expertise section. */
    skills: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        cards: z
          .array(
            z.object({
              icon: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
        toolsHeading: z.string().optional(),
        tools: z.array(z.string()).optional(),
      })
      .optional(),
    /** Testimonials grid. */
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
    /** Closing contact / call-to-action section. */
    contact: z
      .object({
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        locationLabel: z.string().optional(),
        location: z.string().optional(),
        locationNote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "MC."
    const nav = props.nav?.length
      ? props.nav
      : ["About", "Experience", "Skills", "Let's Talk"]

    const statusLabel = props.hero?.statusLabel ?? "Available for new projects"
    const firstName = props.hero?.firstName ?? "Marcus"
    const lastName = props.hero?.lastName ?? "Chen"
    const heroTagline =
      props.hero?.tagline ??
      "Senior Product Designer with 8+ years crafting digital experiences for Fortune 500 companies and fast-growing startups."
    const heroPrimary = props.hero?.primaryCta ?? "Hire Me"
    const heroSecondary = props.hero?.secondaryCta ?? "View Work"
    const heroPhotoAlt =
      props.hero?.photoAlt ??
      "Professional headshot of a confident Asian male designer with short black hair, wearing a dark blazer, against a neutral studio background"
    const heroSocials = props.hero?.socials?.length
      ? props.hero.socials
      : ["LinkedIn", "Dribbble", "GitHub"]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "8+", label: "Years Experience" },
          { value: "47", label: "Projects Shipped" },
          { value: "12", label: "Awards Won" },
          { value: "100%", label: "Client Satisfaction" },
        ]

    const expEyebrow = props.experience?.eyebrow ?? "Career Path"
    const expHeading = props.experience?.heading ?? "Experience"
    const expItems = props.experience?.items?.length
      ? props.experience.items
      : [
          {
            period: "2022 - Present",
            role: "Senior Product Designer",
            company: "Stripe",
            summary:
              "Leading design for the Payments team, improving checkout conversion by 23% through user research and iterative prototyping. Mentoring 4 junior designers and establishing the design system foundation.",
            imageAlt:
              "Modern fintech office interior with sleek desk setup showing payment dashboard on large monitors",
          },
          {
            period: "2019 - 2022",
            role: "Lead UX Designer",
            company: "Airbnb",
            summary:
              "Redesigned the host onboarding flow, reducing time-to-first-listing by 40%. Built and maintained the Experiences design system, used by 200+ designers across 12 product teams.",
            imageAlt:
              "Creative design workspace with multiple screens showing travel booking interface designs",
          },
          {
            period: "2017 - 2019",
            role: "Product Designer",
            company: "Dropbox",
            summary:
              "Shipped the redesigned sharing experience, increasing collaboration metrics by 34%. Collaborated with engineering to implement the first accessible color system company-wide.",
            imageAlt:
              "Collaborative tech office space with cloud storage interface displayed on screens",
          },
          {
            period: "2015 - 2017",
            role: "UI/UX Designer",
            company: "IDEO",
            summary:
              "Worked with Fortune 500 clients including Nike, Ford, and Kaiser Permanente. Led user research sessions with 200+ participants and prototyped solutions using Framer and Principle.",
            imageAlt:
              "Innovative design studio workspace with whiteboards covered in user journey maps and wireframes",
          },
        ]

    const skillsEyebrow = props.skills?.eyebrow ?? "What I Bring"
    const skillsHeading = props.skills?.heading ?? "Skills & Expertise"
    const skillCards = props.skills?.cards?.length
      ? props.skills.cards
      : [
          {
            icon: "ui",
            title: "UI Design",
            description:
              "Figma, Sketch, Adobe Creative Suite. Crafting pixel-perfect interfaces with attention to detail and visual hierarchy.",
          },
          {
            icon: "research",
            title: "UX Research",
            description:
              "User interviews, usability testing, journey mapping, A/B testing. Data-driven design decisions backed by research.",
          },
          {
            icon: "systems",
            title: "Design Systems",
            description:
              "Component libraries, style guides, tokens management. Built systems serving 500+ components across multiple products.",
          },
          {
            icon: "prototype",
            title: "Prototyping",
            description:
              "Framer, Principle, ProtoPie. High-fidelity interactive prototypes for stakeholder presentations and user testing.",
          },
          {
            icon: "team",
            title: "Team Leadership",
            description:
              "Mentoring, design critiques, cross-functional collaboration. Led teams of 3-8 designers with focus on growth.",
          },
          {
            icon: "strategy",
            title: "Strategic Thinking",
            description:
              "Product strategy, OKRs, roadmapping. Aligning design initiatives with business goals and user needs.",
          },
        ]
    const toolsHeading = props.skills?.toolsHeading ?? "Tools I Use Daily"
    const tools = props.skills?.tools?.length
      ? props.skills.tools
      : [
          "Figma",
          "Framer",
          "Principle",
          "Sketch",
          "Adobe XD",
          "Maze",
          "Notion",
          "Linear",
          "Jira",
          "GitHub",
          "Storybook",
          "Slack",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Kind Words"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What People Say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Marcus transformed our checkout experience completely. His user research uncovered insights we'd missed for years, and the resulting 23% conversion lift speaks for itself. A true strategic partner.",
            name: "Sarah Mitchell",
            role: "VP of Product, Stripe",
            avatarAlt:
              "Professional headshot of a female tech executive with shoulder-length blonde hair, smiling warmly",
          },
          {
            quote:
              "Working with Marcus was a game-changer for our design team. He built our design system from the ground up and mentored our junior designers with patience and expertise.",
            name: "David Chen",
            role: "Design Director, Airbnb",
            avatarAlt:
              "Professional headshot of a male product manager with glasses and short dark hair, friendly expression",
          },
          {
            quote:
              "Marcus has an exceptional ability to balance user needs with business goals. His accessibility work at Dropbox became the gold standard for our entire product suite.",
            name: "James Wilson",
            role: "Engineering Manager, Dropbox",
            avatarAlt:
              "Professional headshot of a male engineering manager with short brown hair and a light beard",
          },
        ]

    const contactTop = props.contact?.headingTop ?? "Let's Create"
    const contactAccent = props.contact?.headingAccent ?? "Something Great"
    const contactDescription =
      props.contact?.description ??
      "I'm currently available for full-time roles, freelance projects, and consulting opportunities. Let's discuss how I can help elevate your product experience."
    const contactEmail = props.contact?.email ?? "marcus@example.com"
    const contactPhone = props.contact?.phone ?? "+1 (555) 123-4567"
    const locationLabel = props.contact?.locationLabel ?? "Based in"
    const contactLocation = props.contact?.location ?? "San Francisco, CA"
    const locationNote =
      props.contact?.locationNote ?? "Open to remote & relocation opportunities"

    const footerNote = props.footer?.note ?? "© 2024 Marcus Chen. All rights reserved."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["LinkedIn", "Dribbble", "GitHub", "Twitter"]

    // Rotating accent tokens for the timeline period chips / spine dots.
    const chipTokens = [
      { chip: "bg-primary/10 text-primary", dot: "bg-primary" },
      { chip: "bg-accent/15 text-accent-foreground", dot: "bg-accent" },
      { chip: "bg-secondary text-secondary-foreground", dot: "bg-secondary" },
      { chip: "bg-chart-4/15 text-foreground", dot: "bg-chart-4" },
    ]

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Skill-card icons (decorative, currentColor + token text).
    const skillIcon = (icon: string): ReactNode => {
      const base = {
        className: "size-6",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        viewBox: "0 0 24 24",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        "aria-hidden": true as const,
      }
      switch (icon) {
        case "research":
          return (
            <svg {...base}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )
        case "systems":
          return (
            <svg {...base}>
              <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          )
        case "prototype":
          return (
            <svg {...base}>
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          )
        case "team":
          return (
            <svg {...base}>
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        case "strategy":
          return (
            <svg {...base}>
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )
        default: // "ui"
          return (
            <svg {...base}>
              <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          )
      }
    }

    const socialIcon = (kind: string): ReactNode => {
      const k = kind.toLowerCase()
      const base = {
        className: "size-5",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        "aria-hidden": true as const,
      }
      if (k === "linkedin")
        return (
          <svg {...base}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      if (k === "dribbble")
        return (
          <svg {...base}>
            <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-3.166-1.024-5.86-1.04-8.18-.016-1.085.446-2.103 1.107-3.023 1.974-.77.726-1.415 1.535-1.92 2.418-.513-.883-1.158-1.692-1.927-2.418-.923-.867-1.94-1.528-3.026-1.974-2.32-1.024-5.013-1.008-8.18.016 1.68-3.954 5.562-6.733 10.12-6.733 4.558 0 8.44 2.78 10.12 6.733zm-4.068 2.872c1.515 1.262 2.554 2.89 2.972 4.757 1.642-1.922 2.652-4.396 2.652-7.124 0-.672-.06-1.33-.174-1.97-1.843.93-3.472 2.35-4.45 4.337zm-4.978 3.43c-.705 1.194-1.257 2.53-1.62 3.967-1.406-.404-2.686-1.134-3.73-2.094-1.044.96-2.324 1.69-3.73 2.094-.363-1.437-.915-2.773-1.62-3.967 1.406-1.13 2.686-2.88 3.73-4.82 1.044 1.94 2.324 3.69 3.73 4.82h.24zm-6.35-1.837c-.978-1.986-2.607-3.406-4.45-4.336-.114.64-.174 1.298-.174 1.97 0 2.728 1.01 5.202 2.652 7.124.418-1.867 1.457-3.495 2.972-4.758z" />
          </svg>
        )
      if (k === "twitter")
        return (
          <svg {...base}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      // github (default)
      return (
        <svg {...base}>
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      )
    }

    const mailIcon = (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    )
    const phoneIcon = (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="text-2xl font-black tracking-tighter text-foreground"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-8 md:flex">
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
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {nav[nav.length - 1]}
              </button>
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
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
          <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary">
                    {statusLabel}
                  </span>
                </div>
                <h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
                  {firstName}
                  <br />
                  <span className="text-primary">{lastName}</span>
                </h1>
                <p className="max-w-lg text-xl text-muted-foreground">
                  {heroTagline}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="rounded-full border border-border bg-secondary px-8 py-4 font-bold text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="flex gap-6 pt-4">
                  {heroSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {socialIcon(social)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-primary/30 blur-3xl" />
                <div className="relative h-[500px] w-full animate-[float_3s_ease-in-out_infinite] overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    alt={heroPhotoAlt}
                    w={600}
                    h={700}
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border bg-muted py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="space-y-2">
                    <p className="text-4xl font-black text-primary sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                  {expEyebrow}
                </h2>
                <h3 className="text-4xl font-black sm:text-5xl">{expHeading}</h3>
              </div>
              <div className="relative">
                <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent md:left-1/2" />
                <div className="space-y-12">
                  {expItems.map((item, i) => {
                    const tone = chipTokens[i % chipTokens.length]
                    const textFirst = i % 2 === 0
                    const TextBlock = (
                      <div
                        className={cn(
                          textFirst
                            ? "md:pr-12 md:text-right"
                            : "md:order-2 md:pl-12",
                        )}
                      >
                        <span
                          className={cn(
                            "mb-3 inline-block rounded-full px-3 py-1 text-sm font-semibold",
                            tone.chip,
                          )}
                        >
                          {item.period}
                        </span>
                        <h4 className="mb-2 text-2xl font-bold text-foreground">
                          {item.role}
                        </h4>
                        <p className="mb-3 text-lg text-muted-foreground">
                          {item.company}
                        </p>
                        <p className="text-muted-foreground/80">
                          {item.summary}
                        </p>
                      </div>
                    )
                    const ImageBlock = (
                      <div
                        className={cn(
                          textFirst
                            ? "md:pl-12"
                            : "md:order-1 md:pr-12 md:text-right",
                        )}
                      >
                        <div className="h-48 w-full overflow-hidden rounded-2xl shadow-xl">
                          <Image
                            alt={item.imageAlt}
                            w={400}
                            h={250}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        </div>
                      </div>
                    )
                    return (
                      <div
                        key={`${item.role}-${item.period}`}
                        className="relative grid items-center gap-8 md:grid-cols-2"
                      >
                        <div
                          className={cn(
                            "absolute left-4 hidden size-4 -translate-x-1/2 rounded-full border-4 border-background md:left-1/2 md:block",
                            tone.dot,
                          )}
                        />
                        {TextBlock}
                        {ImageBlock}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                  {skillsEyebrow}
                </h2>
                <h3 className="text-4xl font-black sm:text-5xl">
                  {skillsHeading}
                </h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {skillCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {skillIcon(card.icon)}
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-card-foreground">
                      {card.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-16 rounded-3xl border border-border bg-card/50 p-8">
                <h4 className="mb-6 text-center text-2xl font-bold text-foreground">
                  {toolsHeading}
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {tools.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => go(tool)}
                      className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                  {testimonialsEyebrow}
                </h2>
                <h3 className="text-4xl font-black sm:text-5xl">
                  {testimonialsHeading}
                </h3>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6"
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
                        <p className="font-bold text-card-foreground">
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

          {/* Contact / CTA */}
          <section className="bg-gradient-to-br from-primary/20 via-muted to-background py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-5xl font-black sm:text-6xl">
                {contactTop}
                <br />
                <span className="text-primary">{contactAccent}</span>
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                {contactDescription}
              </p>
              <div className="mb-12 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(contactEmail)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {mailIcon}
                  {contactEmail}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactPhone)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-8 py-4 font-bold text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  {phoneIcon}
                  {contactPhone}
                </button>
              </div>
              <div className="inline-block rounded-2xl border border-border bg-card/50 p-6">
                <p className="text-sm text-muted-foreground">
                  {locationLabel}{" "}
                  <span className="font-semibold text-foreground">
                    {contactLocation}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {locationNote}
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="text-2xl font-black tracking-tighter text-foreground">
                  {brand}
                </span>
                <span className="text-muted-foreground">{footerNote}</span>
              </button>
              <div className="flex items-center gap-6">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {socialIcon(social)}
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
