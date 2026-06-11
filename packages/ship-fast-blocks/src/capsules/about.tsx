import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AboutKimiPage — a complete, self-contained company / ABOUT page.
 *
 * A faithful Tailwind v4 port of the Kimi-generated "Kinetic Labs" design (a
 * modern product-studio about page). It reproduces, in order: a glassy sticky
 * navbar, a mission hero with gradient-accented headline over soft blurred
 * ambient orbs, an "our story" split with a photo + founded badge + pull-quote,
 * a 6-up core-values icon grid, an "by the numbers" stats grid with gradient
 * numerals, a 6-up team member grid (portrait + role + bio + socials), a dark
 * dotted CTA band, and a slim footer.
 *
 * Kimi's identity is light-themed with an indigo (#4f46e5) primary accent and a
 * violet gradient on display numerals/headlines; the block translates the inline
 * CSS color system into Tailwind theme tokens (background/foreground/muted/
 * border) so dark mode works, while preserving the indigo→violet accent
 * gradients on the brand mark, headline highlight, stats and CTA. Every nav item
 * / CTA / link routes through `useNavigate` (never a dead "#"), and the navbar
 * labels match the `nav` array so PageSwitch can swap pages. All content imagery
 * uses the alt-only `Image` component. Callers supply ONLY content data; rich
 * defaults sourced from the original HTML make it render great with no props.
 */
export const AboutKimiPage = defineCapsule({
  name: "AboutKimiPage",
  description:
    "Complete company / ABOUT page with a polished, premium indigo-to-violet aesthetic: glassy sticky navbar, a mission hero with a gradient-accented headline floating over soft blurred ambient orbs, an 'our story' split pairing a photo (with a 'founded' badge) and narrative copy plus a pull-quote, a 6-up core-values icon grid, an 'by the numbers' stats grid with gradient numerals, a 6-up team/leadership grid (portrait + role + short bio + social links), a dark dotted CTA band, and a slim legal footer. Use as the ABOUT / company / mission / team / who-we-are page for startups, product studios, agencies, SaaS companies or any modern brand that wants to tell its story, share values, show metrics and introduce the people. Supply content only — brand, nav, hero, story, values, stats, team, cta, footer; the block owns all layout, imagery and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Mission hero section. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        /** Phrase inside the heading rendered with the indigo→violet gradient. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** "Our story" split section. */
    story: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        /** Alt text driving the story photo. */
        imageAlt: z.string().optional(),
        /** Small badge over the photo, e.g. "Founded in 2016". */
        badge: z.string().optional(),
        /** Narrative paragraphs. */
        paragraphs: z.array(z.string()).optional(),
        /** Pull-quote shown beneath the narrative. */
        quote: z.string().optional(),
      })
      .optional(),
    /** Core values icon grid (up to 6 items render well). */
    values: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "By the numbers" stats grid. */
    stats: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Team / leadership member grid. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              /** Alt text driving the portrait; defaults to the member name. */
              imageAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Closing dark CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        copyright: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Kinetic Labs"
    const nav = props.nav?.length
      ? props.nav
      : ["Our Story", "Values", "Team", "Stats"]

    const heroEyebrow = props.hero?.eyebrow ?? `About ${brand}`
    const heroHeading = props.hero?.heading ?? "We build products that"
    const heroHighlight = props.hero?.highlight ?? "move the world forward"
    const heroSub =
      props.hero?.subheading ??
      `${brand} is a product studio focused on clarity, craft, and impact. We partner with ambitious teams to design and ship modern software that people love to use.`
    const heroPrimary = props.hero?.primaryCta ?? "Read our story"
    const heroSecondary = props.hero?.secondaryCta ?? "Get in touch"

    const storyEyebrow = props.story?.eyebrow ?? "Our Story"
    const storyHeading =
      props.story?.heading ?? "From a garage experiment to a global studio"
    const storyDesc =
      props.story?.description ??
      "What started as late-night prototypes turned into a team obsessed with one question: how do we make software feel effortless?"
    const storyImageAlt =
      props.story?.imageAlt ??
      "Team collaborating at a long table in a bright modern office"
    const storyBadge = props.story?.badge ?? "Founded in 2016"
    const storyParagraphs = props.story?.paragraphs?.length
      ? props.story.paragraphs
      : [
          "In 2016, we were three designers and engineers shipping side projects out of a small garage in Portland. We didn't have a playbook—just a shared belief that great products are built at the intersection of deep user empathy and technical excellence.",
          "Today, Kinetic Labs is a distributed team of strategists, designers, and engineers across 12 time zones. We've shipped products used by millions, but our process remains the same: start with people, iterate with data, and polish until it feels inevitable.",
        ]
    const storyQuote =
      props.story?.quote ?? "We don't chase trends. We chase outcomes."

    const valuesEyebrow = props.values?.eyebrow ?? "Core Values"
    const valuesHeading =
      props.values?.heading ?? "The principles that guide our work"
    const valuesDesc =
      props.values?.description ??
      "Culture isn't a poster on the wall. It's the sum of small decisions made under pressure—and we try to make them consistent."
    const valueItems = props.values?.items?.length
      ? props.values.items
      : [
          {
            title: "People first",
            description:
              "We hire for curiosity, empathy, and ownership. Teams do their best work when they feel safe to challenge ideas and admit what they don't know.",
          },
          {
            title: "Radical clarity",
            description:
              "Complexity is easy. Simplicity is hard. We cut scope, sharpen messaging, and build interfaces that require zero training.",
          },
          {
            title: "Ship to learn",
            description:
              "We prefer fast experiments over slow perfection. Every launch is a hypothesis; every metric teaches us what to build next.",
          },
          {
            title: "Integrity by default",
            description:
              "We say what we mean, set realistic timelines, and own our mistakes. Trust is our most important long-term investment.",
          },
          {
            title: "Global perspective",
            description:
              "Great ideas come from everywhere. Our remote-first culture means we build for diverse users, not just the ones next door.",
          },
          {
            title: "Obsessive craft",
            description:
              "Details matter. Animation timing, error copy, loading states—we treat every pixel and interaction as part of the product.",
          },
        ]

    const statsEyebrow = props.stats?.eyebrow ?? "By the numbers"
    const statsHeading = props.stats?.heading ?? "Impact at a glance"
    const statsDesc =
      props.stats?.description ??
      "Numbers don't tell the whole story, but they give you a sense of scale."
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "8M+", label: "Monthly active users" },
          { value: "140+", label: "Products shipped" },
          { value: "42", label: "Team members" },
          { value: "12", label: "Countries represented" },
        ]

    const teamEyebrow = props.team?.eyebrow ?? "Leadership"
    const teamHeading =
      props.team?.heading ?? "Meet the people behind the products"
    const teamDesc =
      props.team?.description ??
      "Our leadership team brings together decades of experience across design, engineering, and product strategy."
    const defaultTeamMembers = [
          {
            name: "Maya Chen",
            role: "CEO & Co-founder",
            bio: "Former product lead at Stripe. Obsessed with onboarding flows and clear pricing pages.",
          },
          {
            name: "Daniel Osei",
            role: "CTO & Co-founder",
            bio: "Systems thinker. Built infrastructure at scale. Believes the best code is the code you don't write.",
          },
          {
            name: "Priya Nair",
            role: "Head of Design",
            bio: "Champion of accessibility and motion. Runs design sprints that actually ship.",
          },
          {
            name: "Lucas Reyes",
            role: "VP of Engineering",
            bio: "Full-stack polyglot. Focused on developer experience, CI/CD, and platform reliability.",
          },
          {
            name: "Aisha Mbeki",
            role: "Head of Strategy",
            bio: "Former consultant turned operator. Connects business goals to product roadmaps.",
          },
          {
            name: "Yuki Tanaka",
            role: "Director of Research",
            bio: "Turns user interviews into product insights. Advocate for inclusive research practices.",
          },
        ]
    const teamMembers: Array<{ name: string; role: string; bio: string; imageAlt?: string }> = props.team?.members?.length
      ? props.team.members
          .filter((member): member is NonNullable<typeof member> => Boolean(member))
          .map((member, index) => ({
            name: member.name || `Team member ${index + 1}`,
            role: member.role || "Team member",
            bio: member.bio || "Focused on creating a thoughtful customer experience.",
            imageAlt: member.imageAlt || `Portrait of ${member.name || `team member ${index + 1}`}`,
          }))
      : defaultTeamMembers

    const ctaHeading =
      props.cta?.heading ?? "Ready to build something meaningful?"
    const ctaSub =
      props.cta?.subheading ??
      "Whether you need a full product team or a focused design sprint, we'd love to hear what you're working on."
    const ctaPrimary = props.cta?.primaryCta ?? "Start a project"
    const ctaSecondary = props.cta?.secondaryCta ?? "View case studies"

    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "Contact"]

    // Shared brand mark — indigo→violet gradient tile + zap glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const TwitterIcon = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    )

    const LinkedInIcon = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )

    // Core-value icons (decorative), keyed to the default value order.
    const valueIcons: ReactNode[] = [
      // users
      <svg
        key="users"
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // eye
      <svg
        key="eye"
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
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>,
      // trending-up
      <svg
        key="trending"
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
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>,
      // shield-check
      <svg
        key="shield"
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      // globe
      <svg
        key="globe"
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
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>,
      // layers
      <svg
        key="layers"
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
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>,
    ]

    // Reusable eyebrow pill — indigo soft chip with optional icon.
    const Eyebrow = ({
      icon,
      children,
    }: {
      icon: ReactNode
      children: ReactNode
    }) => (
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        {icon}
        {children}
      </span>
    )

    const SparkleIcon = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      </svg>
    )

    const SmallIcon = ({ children }: { children: ReactNode }) => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    )

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2.5 text-[1.05rem] font-extrabold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <ul className="hidden items-center gap-7 text-[0.92rem] font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => go(heroSecondary)}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
            >
              <span className="hidden sm:inline">Work with us</span>
              <ArrowRight />
            </button>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -right-32 size-[520px] rounded-full bg-primary/25 blur-3xl" />
              <div className="absolute -bottom-28 -left-24 size-[380px] rounded-full bg-accent/40 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <Eyebrow icon={<SparkleIcon />}>{heroEyebrow}</Eyebrow>
              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heroHeading}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {heroHighlight}
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {heroSub}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-[0.95rem] font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-md"
                >
                  {heroPrimary}
                  <SmallIcon>
                    <polyline points="6 9 12 15 18 9" />
                  </SmallIcon>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 text-[0.95rem] font-semibold text-foreground shadow-sm transition-all hover:-translate-y-px hover:border-muted-foreground/30 hover:shadow-sm"
                >
                  {heroSecondary}
                </button>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mb-10 max-w-2xl">
                <Eyebrow
                  icon={
                    <SmallIcon>
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </SmallIcon>
                  }
                >
                  {storyEyebrow}
                </Eyebrow>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {storyHeading}
                </h2>
                <p className="mt-2.5 text-lg leading-relaxed text-muted-foreground">
                  {storyDesc}
                </p>
              </div>
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                  <Image
                    alt={storyImageAlt}
                    w={1200}
                    h={760}
                    loading="lazy"
                    className="aspect-[4/3] size-full object-cover"
                  />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/90 px-3.5 py-2.5 text-sm font-bold text-foreground shadow-sm backdrop-blur">
                    <SmallIcon>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </SmallIcon>
                    {storyBadge}
                  </span>
                </div>
                <div>
                  {storyParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className={cn(
                        "leading-relaxed text-muted-foreground",
                        i > 0 && "mt-4",
                      )}
                    >
                      {para}
                    </p>
                  ))}
                  <blockquote className="mt-5 rounded-r-xl border-l-[3px] border-primary bg-primary/[0.06] px-4 py-4 font-semibold text-foreground">
                    &ldquo;{storyQuote}&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="border-y border-border bg-card py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mb-10 max-w-2xl">
                <Eyebrow
                  icon={
                    <SmallIcon>
                      <path d="M11 14h2a3 3 0 0 0 0-6h-3l-4 4" />
                      <path d="m7 20 2-2" />
                      <path d="M16 7 14 9" />
                      <path d="m12 18 5-5" />
                    </SmallIcon>
                  }
                >
                  {valuesEyebrow}
                </Eyebrow>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {valuesHeading}
                </h2>
                <p className="mt-2.5 text-lg leading-relaxed text-muted-foreground">
                  {valuesDesc}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {valueItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-muted-foreground/25 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="mb-3.5 grid size-11 place-items-center rounded-xl bg-primary/[0.08] text-primary">
                      {valueIcons[i % valueIcons.length]}
                    </div>
                    <h3 className="mb-2 text-[1.05rem] font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mb-10 max-w-2xl">
                <Eyebrow
                  icon={
                    <SmallIcon>
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </SmallIcon>
                  }
                >
                  {statsEyebrow}
                </Eyebrow>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {statsHeading}
                </h2>
                <p className="mt-2.5 text-lg leading-relaxed text-muted-foreground">
                  {statsDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-[2.4rem]">
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-[0.92rem] font-medium text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="border-t border-border bg-card py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mb-10 max-w-2xl">
                <Eyebrow
                  icon={
                    <SmallIcon>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </SmallIcon>
                  }
                >
                  {teamEyebrow}
                </Eyebrow>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {teamHeading}
                </h2>
                <p className="mt-2.5 text-lg leading-relaxed text-muted-foreground">
                  {teamDesc}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <article
                    key={member.name}
                    className="overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                  >
                    <Image
                      alt={member.imageAlt ?? `Portrait of ${member.name}`}
                      w={800}
                      h={560}
                      loading="lazy"
                      className="h-56 w-full bg-muted object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-base font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        {member.role}
                      </p>
                      <p className="mt-2.5 text-[0.92rem] leading-relaxed text-muted-foreground">
                        {member.bio}
                      </p>
                      <div className="mt-3 flex gap-2.5">
                        {(
                          [
                            { label: "Twitter", node: <TwitterIcon /> },
                            { label: "LinkedIn", node: <LinkedInIcon /> },
                          ] as const
                        ).map((social) => (
                          <button
                            key={social.label}
                            type="button"
                            aria-label={`${member.name} on ${social.label}`}
                            onClick={() => go(social.label)}
                            className="grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:-translate-y-px hover:border-primary/40 hover:text-primary"
                          >
                            {social.node}
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section className="relative overflow-hidden bg-foreground py-20 text-background sm:py-28">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:24px_24px]"
            />
            <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-background/70">
                {ctaSub}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-[0.95rem] font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(79,70,229,0.35)]"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center rounded-xl border border-background/35 px-5 py-3 text-[0.95rem] font-semibold text-background transition-all hover:-translate-y-px hover:border-background/60"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-7 text-sm text-muted-foreground">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8 lg:px-12">
            <p>{footerCopyright}</p>
            <div className="flex flex-wrap items-center gap-5">
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
        </footer>
      </div>
    )
  },
})
