import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AgencyKimiPage4 — a complete, self-contained creative digital-agency LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Northwind" design: a warm,
 * editorial light-canvas aesthetic with elegant serif display type, a terracotta
 * accent, and generous whitespace. It pairs a sticky navbar with a split hero
 * (copy + hero image with a floating stat card), a trusted-by logos strip, a 6-up
 * services grid with inline SVG icons, a vertical numbered process timeline, a
 * 3-column selected-work gallery with image-zoom hover and category tags, a 3-tier
 * pricing table with a highlighted middle plan, a dark stats bar, a 3-up
 * testimonial grid with avatar headshots, an FAQ accordion, a contact CTA band,
 * and a multi-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * CTA, and link routes through useNavigate (never a dead "#"), and all content
 * imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 *
 * This is the FORTH style sibling to AgencyKimiPage. Use it when you want a
 * warm, editorial, light-canvas agency landing page with serif headings,
 * terracotta accent highlights, generous whitespace, and a classic
 * split-hero + process-timeline + gallery + pricing layout.
 */
export const AgencyKimiPage4 = defineCapsule({
  name: "AgencyKimiPage4",
  description:
    "Complete creative digital-agency / studio LANDING page with a warm, editorial light-canvas aesthetic: elegant serif display type, generous whitespace, terracotta accent highlights, and a split-hero featuring a hero image with a floating stat card. Includes a trusted-by logos strip, a 6-up services grid with inline SVG icons, a vertical numbered process timeline, a 3-column selected-work gallery with image-zoom hover and category tags, a 3-tier pricing table with a highlighted middle plan, a dark stats bar, a 3-up testimonial grid with avatar headshots, an FAQ accordion, a contact CTA band, and a multi-column footer. Use as the ROOT/home page for creative agencies, design studios, branding/marketing shops, freelance creatives, production houses, or portfolio sites when a warm, editorial, premium, conversion-focused page with strong work showcase and social proof is wanted. This is the fourth style sibling to AgencyKimiPage — choose this variant for a lighter, more editorial mood with serif headlines and terracotta accents. Supply content only — brand, nav, hero, logos, services, process, work, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        trustBadges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logos strip. */
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
    /** Process / how-we-work timeline. */
    process: z
      .object({
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
    /** Selected work gallery. */
    work: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tag: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              duration: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              highlighted: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats bar. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      })
      .optional(),
    /** Contact CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        highlight: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        phoneLabel: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        services: z.array(z.string()).optional(),
        company: z.array(z.string()).optional(),
        social: z.array(z.string()).optional(),
        note: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Northwind"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Work", "Process", "Pricing", "FAQ"]

    const hero = {
      badge: props.hero?.badge ?? "Creative Digital Agency",
      heading: props.hero?.heading ?? "We craft brands that",
      highlight: props.hero?.highlight ?? "command attention.",
      subheading:
        props.hero?.subheading ??
        "Northwind partners with founders and marketing teams to build identities, websites, and digital products that stand out in crowded markets.",
      primaryCta: props.hero?.primaryCta ?? "View our work",
      secondaryCta: props.hero?.secondaryCta ?? "Book a call",
      imageAlt:
        props.hero?.imageAlt ??
        "Designer reviewing printed brand layouts on a large wooden desk",
      statValue: props.hero?.statValue ?? "147",
      statLabel: props.hero?.statLabel ?? "Projects shipped since 2019",
      trustBadges: props.hero?.trustBadges?.length
        ? props.hero.trustBadges
        : ["Strategy-led design", "Ship in 6\u201310 weeks"],
    }

    const logos = {
      heading: props.logos?.heading ?? "Trusted by teams at",
      items: props.logos?.items?.length
        ? props.logos.items
        : ["Fathom", "Linear", "Descript", "Notion", "Raycast", "Vercel"],
    }

    const services = {
      heading: props.services?.heading ?? "Full-funnel creative for modern brands",
      description:
        props.services?.description ?? "",
      items: props.services?.items?.length
        ? props.services.items
        :
[
          {
            title: "Brand Strategy \u0026 Identity",
            description:
              "Positioning, naming, visual identity systems, and brand guidelines that give your company a voice and visual language competitors cannot copy.",
          },
          {
            title: "Web Design \u0026 Development",
            description:
              "High-performance marketing sites, product landing pages, and WebGL experiences built with Next.js, React, and modern CMS architecture.",
          },
          {
            title: "Digital Product Design",
            description:
              "End-to-end UX/UI for SaaS dashboards, mobile apps, and internal tools\u2014from research and wireframes to polished design systems.",
          },
          {
            title: "Motion \u0026 Campaign Content",
            description:
              "Launch films, animated explainers, social content systems, and performance creative for paid acquisition and organic channels.",
          },
          {
            title: "Conversion Optimization",
            description:
              "A/B testing, landing-page architecture, and funnel analytics to turn existing traffic into qualified leads and paid customers.",
          },
          {
            title: "Design Systems",
            description:
              "Token-based component libraries in Figma and code, documentation, and governance to keep product teams shipping consistently.",
          },
        ],
    }

    const process = {
      heading: props.process?.heading ?? "How we work from brief to launch",
      description:
        props.process?.description ??
        "Every engagement follows a proven framework: discovery, design, build, and measure. We keep you in the loop at every stage with weekly standups and a shared project dashboard.",
      steps: props.process?.steps?.length
        ? props.process.steps
        : [
            {
              title: "Discovery \u0026 Strategy",
              description:
                "We interview stakeholders, audit competitors, map customer journeys, and define measurable goals. Deliverable: a creative brief with positioning, KPIs, and a 90-day roadmap.",
              duration: "Typical duration: 2 weeks",
            },
            {
              title: "Creative Direction",
              description:
                "Mood boards, typographic studies, and 3 visual directions. We align on a single concept before touching a single screen. Deliverable: approved art direction + component inventory.",
              duration: "Typical duration: 2\u20133 weeks",
            },
            {
              title: "Design \u0026 Prototype",
              description:
                "High-fidelity pages in Figma, interactive prototypes, and responsive breakpoints. We test with real users before writing production code. Deliverable: clickable prototype + design system.",
              duration: "Typical duration: 3\u20134 weeks",
            },
            {
              title: "Build, Launch \u0026 Optimize",
              description:
                "Next.js front end, CMS integration, performance tuning, accessibility audit, and analytics setup. Post-launch: 30 days of conversion-rate support. Deliverable: live site + documentation.",
              duration: "Typical duration: 4\u20136 weeks",
            },
          ],
    }

    const work = {
      heading: props.work?.heading ?? "Case studies that moved the needle",
      description: props.work?.description ?? "",
      viewAll: props.work?.viewAll ?? "View all projects",
      items: props.work?.items?.length
        ? props.work.items
        : [
            {
              title: "Aether Skincare",
              description:
                "Complete rebrand and Shopify storefront for a direct-to-consumer skincare line. 38% increase in average order value within 60 days of launch.",
              tag: "Brand + Web",
              imageAlt:
                "Minimalist skincare packaging with matte black bottles on marble surface",
            },
            {
              title: "Finch Finance",
              description:
                "UX overhaul of a B2B expense-management dashboard. Reduced task-completion time by 42% and improved NPS from 22 to 61.",
              tag: "Product Design",
              imageAlt:
                "Dashboard interface showing analytics charts with clean data visualization",
            },
            {
              title: "Northgate Workspace",
              description:
                "Brand identity and booking platform for a premium coworking chain across three cities. 4.2\u00d7 increase in tour bookings.",
              tag: "Web + Motion",
              imageAlt:
                "Modern coworking office interior with warm lighting and exposed brick walls",
            },
            {
              title: "Forma Studio",
              description:
                "Brand identity and class-booking website for a boutique Pilates chain. Membership sign-ups grew 67% in the first quarter.",
              tag: "Brand + Web",
              imageAlt:
                "Woman stretching in a bright yoga studio with wooden floors and plants",
            },
            {
              title: "Titan Robotics",
              description:
                "Enterprise design system and marketing site for an industrial-automation firm. Cut internal design-to-dev handoff time by 55%.",
              tag: "Design System",
              imageAlt:
                "Close-up of precision manufacturing equipment with metallic components",
            },
            {
              title: "Resonance Audio",
              description:
                "Launch campaign and product site for a spatial-audio plugin. 12,000 pre-orders in the first 48 hours after announcement.",
              tag: "Motion + Web",
              imageAlt:
                "Professional audio mixing console with colorful level meters in a recording studio",
            },
          ],
    }

    const pricing = {
      heading: props.pricing?.heading ?? "Transparent pricing for every stage",
      description:
        props.pricing?.description ??
        "No hidden fees, no hourly guessing. Each package is scoped to a fixed deliverable and timeline. Need something custom? We will scope it in 48 hours.",
      plans: props.pricing?.plans?.length
        ? props.pricing.plans
        : [
            {
              name: "Brand Sprint",
              price: "$8,500",
              duration: "2-week engagement",
              features: [
                "Brand positioning workshop",
                "Logo, color, and type system",
                "Social-media starter kit",
                "Brand guidelines PDF",
              ],
              cta: "Get started",
              highlighted: false,
              badge: undefined,
            },
            {
              name: "Growth Site",
              price: "$18,500",
              duration: "6\u20138 week engagement",
              features: [
                "Everything in Brand Sprint",
                "5-page marketing website",
                "CMS + blog setup",
                "Performance \u0026 SEO audit",
                "30-day post-launch support",
              ],
              cta: "Get started",
              highlighted: true,
              badge: "Most popular",
            },
            {
              name: "Product Partnership",
              price: "Custom",
              duration: "Monthly retainer",
              features: [
                "Dedicated design + dev pod",
                "Unlimited design requests",
                "Design system maintenance",
                "Weekly strategy calls",
                "Conversion experiments",
              ],
              cta: "Book a call",
              highlighted: false,
              badge: undefined,
            },
          ],
    }

    const stats = {
      items: props.stats?.items?.length
        ? props.stats.items
        : [
            { value: "147", label: "Projects shipped since founding in 2019" },
            { value: "$2.4M", label: "Revenue generated for clients last year" },
            { value: "94%", label: "Clients who renew or expand engagements" },
            { value: "6.2s", label: "Average Lighthouse performance score" },
          ],
    }

    const testimonials = {
      heading:
        props.testimonials?.heading ?? "What founders say about working with us",
      description: props.testimonials?.description ?? "",
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              quote:
                "Northwind redesigned our entire brand and site in eight weeks. Our Series A pitch deck looked amateur by comparison once the new identity was live.",
              name: "Daniel Park",
              role: "CEO, Finch Finance",
              avatarAlt:
                "Professional headshot of a smiling male founder with short dark hair and glasses",
            },
            {
              quote:
                "They brought a level of strategic clarity we had not seen from three previous agencies. The design system alone saved our product team months.",
              name: "Sarah Whitmore",
              role: "VP Product, Titan Robotics",
              avatarAlt:
                "Professional headshot of a smiling female executive with auburn hair and a navy blazer",
            },
            {
              quote:
                "Our site went from looking like a template to looking like a category leader. Bookings doubled within a month of the relaunch.",
              name: "Marcus Reid",
              role: "Founder, Northgate Workspace",
              avatarAlt:
                "Professional headshot of a smiling male entrepreneur with a beard and casual button-down shirt",
            },
            {
              quote:
                "The motion work on our launch film was breathtaking. It set the tone for every piece of content we have produced since.",
              name: "Elena Vasquez",
              role: "CMO, Resonance Audio",
              avatarAlt:
                "Professional headshot of a smiling female creative director with curly hair and gold earrings",
            },
            {
              quote:
                "Northwind did not just design a website\u2014they redesigned how we talk about our product. The conversion rate speaks for itself.",
              name: "James Okonkwo",
              role: "Head of Marketing, Aether Skincare",
              avatarAlt:
                "Professional headshot of a confident male marketing director in a tailored suit jacket",
            },
            {
              quote:
                "Fast, opinionated, and relentlessly detail-oriented. They feel like an in-house team that actually hits deadlines.",
              name: "Laura Brennan",
              role: "Founder, Forma Studio",
              avatarAlt:
                "Professional headshot of a smiling female startup founder with blonde hair and a white blouse",
            },
          ],
    }

    const faq = {
      heading: props.faq?.heading ?? "Common questions",
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              question: "How long does a typical website project take?",
              answer:
                "A standard 5-page marketing site takes 6 to 8 weeks from kickoff to launch. Complex builds with custom CMS integrations, e-commerce, or WebGL can extend to 10\u201312 weeks. We provide a fixed timeline during scoping and stick to it.",
            },
            {
              question: "Do you work with startups and enterprise teams?",
              answer:
                "Yes. Our Brand Sprint is designed for pre-seed and seed-stage startups that need identity fast. Our Growth Site and Product Partnership tiers scale to Series B+ companies and established brands that need ongoing creative support.",
            },
            {
              question: "What platforms and technologies do you use?",
              answer:
                "We build marketing sites in Next.js, React, and Tailwind CSS. For content management we typically recommend Sanity, Contentful, or WordPress headless. Product design lives in Figma. We host on Vercel or Netlify by default.",
            },
            {
              question: "Do you offer ongoing support after launch?",
              answer:
                "Every project includes 30 days of bug fixes and minor tweaks. For ongoing optimization and new work, we offer monthly retainers starting at $6,500. Retainer clients get a dedicated Slack channel and weekly priority sprints.",
            },
            {
              question: "How does your pricing work? Are there hidden costs?",
              answer:
                "All project pricing is fixed-fee and agreed before work begins. The only variable costs are third-party subscriptions (CMS hosting, domains, analytics tools) which we pass through at cost. No hourly billing, no surprise invoices.",
            },
          ],
    }

    const cta = {
      heading: props.cta?.heading ?? "Ready to build something",
      highlight: props.cta?.highlight ?? "unforgettable?",
      description:
        props.cta?.description ??
        "Tell us what you are building. We will reply within one business day with a scope, timeline, and transparent quote.",
      email: props.cta?.email ?? "hello@northwind.studio",
      phone: props.cta?.phone ?? "+1 (415) 555-0182",
      phoneLabel: props.cta?.phoneLabel ?? "Or call us directly at",
    }

    const footer = {
      services: props.footer?.services?.length
        ? props.footer.services
        : [
            "Brand Strategy",
            "Web Design",
            "Product Design",
            "Motion \u0026 Content",
            "Design Systems",
          ],
      company: props.footer?.company?.length
        ? props.footer.company
        : ["Case Studies", "Process", "Pricing", "Careers", "Contact"],
      social: props.footer?.social?.length
        ? props.footer.social
        : ["Twitter / X", "LinkedIn", "Dribbble", "Instagram", "hello@northwind.studio"],
      note:
        props.footer?.note ??
        "A creative digital agency building brands, websites, and products for ambitious companies since 2019.",
      links: props.footer?.links?.length
        ? props.footer.links
        : ["Privacy Policy", "Terms of Service", "Sitemap"],
    }

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-black text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const CheckIcon = () => (
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
        <path d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    )

    const ArrowRightIcon = () => (
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
        <path d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      <svg key="s1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.048 4.025a3 3 0 01-4.244-4.243M4.891 4.891A17.965 17.965 0 0112 3.475c4.142 0 7.895 1.46 10.89 3.869M2.109 19.891A17.965 17.965 0 0121 16.025m-4.244-4.243a3 3 0 014.243 4.243"/>
      </svg>,
      <svg key="s2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
      </svg>,
      <svg key="s3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
      </svg>,
      <svg key="s4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/>
        <path d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"/>
      </svg>,
      <svg key="s5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.75m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/>
      </svg>,
      <svg key="s6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
      </svg>,
    ]

    return (
      <div className={cn("relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased", props.className)}>
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Primary navigation">
            <button type="button" onClick={() => go(nav[0])} className="flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground">
              <LogoMark className="size-8 text-sm" />
              {brand}
            </button>
            <div className="hidden items-center gap-10 text-sm font-medium text-muted-foreground md:flex">
              {nav.slice(0, -1).map((label) => (
                <button key={label} type="button" onClick={() => go(label)} className="transition-colors hover:text-foreground">
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
              >
                Start a project
              </button>
            </div>
            <button type="button" aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen((v: boolean) => !v)} className="p-2 text-foreground md:hidden">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
          <section className="relative overflow-hidden bg-muted" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32 lg:py-40">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-xl">
                  <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-primary">{hero.badge}</p>
                  <h1 id="hero-heading" className="mb-8 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                    {hero.heading} <em className="italic text-primary">{hero.highlight}</em>
                  </h1>
                  <p className="mb-10 text-lg leading-relaxed text-muted-foreground md:text-xl">{hero.subheading}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => go(hero.primaryCta)}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/80"
                    >
                      {hero.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(hero.secondaryCta)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
                    >
                      {hero.secondaryCta}
                    </button>
                  </div>
                  <div className="mt-14 flex items-center gap-8 text-sm text-muted-foreground">
                    {hero.trustBadges.map((b) => (
                      <div key={b} className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-foreground/10">
                    <Image alt={hero.imageAlt} w={900} h={700} loading="eager" className="w-full h-auto object-cover" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 md:-left-10 max-w-[200px] rounded-xl border border-border bg-background p-5 shadow-lg shadow-foreground/5">
                    <p className="text-3xl font-bold text-foreground">{hero.statValue}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{hero.statLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border" aria-label="Trusted by leading brands">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">{logos.heading}</p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logos.items.map((name) => (
                  <Image key={name} alt={`${name} logo mark`} w={160} h={48} loading="lazy" className="h-7 w-auto" />
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-24 md:py-32 bg-background" aria-labelledby="services-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">What we do</p>
                <h2 id="services-heading" className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">{services.heading}</h2>
              </div>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {services.items.map((item, i) => (
                  <article key={item.title}>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                      {serviceIcons[i]}
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold text-foreground">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section id="process" className="py-24 md:py-32 bg-muted" aria-labelledby="process-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-start gap-16 lg:grid-cols-2">
                <div className="lg:sticky lg:top-28">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">Our process</p>
                  <h2 id="process-heading" className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">{process.heading}</h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">{process.description}</p>
                </div>
                <div className="space-y-12">
                  {process.steps.map((step, i) => (
                    <div key={step.title} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-foreground", i === 3 ? "bg-primary" : "bg-foreground")}>
                          {i + 1}
                        </div>
                        {i < 3 && <div className="mt-4 w-px flex-1 bg-border" />}
                      </div>
                      <div className={cn(i < 3 && "pb-6")}>
                        <h3 className="mb-2 text-2xl font-semibold text-foreground">{step.title}</h3>
                        <p className="mb-3 leading-relaxed text-muted-foreground">{step.description}</p>
                        <p className="text-sm font-medium text-muted-foreground/80">{step.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Work */}
          <section id="work" className="py-24 md:py-32 bg-background" aria-labelledby="work-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-xl">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">Selected work</p>
                  <h2 id="work-heading" className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">{work.heading}</h2>
                </div>
                <button type="button" onClick={() => go(work.viewAll)} className="inline-flex items-center text-sm font-semibold text-foreground transition-colors hover:text-primary">
                  {work.viewAll}
                  <ArrowRightIcon />
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {work.items.map((proj) => (
                  <button key={proj.title} type="button" onClick={() => go(proj.title)} className="group block w-full cursor-pointer text-left">
                    <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <Image alt={proj.imageAlt} w={800} h={600} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">{proj.tag}</span>
                    </div>
                    <h3 className="mb-1 font-serif text-xl font-semibold text-foreground">{proj.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{proj.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="py-24 md:py-32 bg-muted" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
                <h2 id="pricing-heading" className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">{pricing.heading}</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{pricing.description}</p>
              </div>
              <div className="grid items-start gap-8 md:grid-cols-3">
                {pricing.plans.map((plan) => (
                  <article key={plan.name} className={cn("relative rounded-2xl p-8", plan.highlighted ? "border-2 border-foreground bg-background shadow-lg shadow-foreground/5" : "border border-border bg-background")}>
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">{plan.badge}</span>
                    )}
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{plan.name}</h3>
                    <p className="mb-1 text-4xl font-bold text-foreground">{plan.price}</p>
                    <p className="mb-6 text-sm text-muted-foreground">{plan.duration}</p>
                    <ul className="mb-8 space-y-3 text-sm text-foreground/80">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="shrink-0 text-primary"><CheckIcon /></span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors",
                        plan.highlighted
                          ? "bg-foreground text-background hover:bg-foreground/80"
                          : "bg-muted text-foreground hover:bg-foreground/10",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 md:py-24 bg-foreground text-background" aria-label="Company statistics">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-8">
                {stats.items.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-background md:text-5xl">{s.value}</p>
                    <p className="text-sm leading-relaxed text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 md:py-32 bg-background" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</p>
                <h2 id="testimonials-heading" className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">{testimonials.heading}</h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.items.map((t) => (
                  <figure key={t.name} className="rounded-2xl bg-muted p-8">
                    <blockquote className="mb-6 text-lg leading-relaxed text-foreground/80">
                      <p>&ldquo;{t.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image alt={t.avatarAlt} w={120} h={120} loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-24 md:py-32 bg-muted" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
                <h2 id="faq-heading" className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">{faq.heading}</h2>
              </div>
              <dl className="space-y-6">
                {faq.items.map((item) => (
                  <div key={item.question} className="rounded-xl border border-border bg-background p-6 md:p-8 shadow-sm">
                    <dt className="mb-2 text-lg font-semibold text-foreground">{item.question}</dt>
                    <dd className="leading-relaxed text-muted-foreground">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* CTA */}
          <section id="contact" className="py-24 md:py-32 bg-foreground text-background" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
              <h2 id="cta-heading" className="mb-6 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                {cta.heading} <em className="italic text-primary/80">{cta.highlight}</em>
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-background/70 md:text-xl">{cta.description}</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(cta.email)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-background/80"
                >
                  {cta.email}
                </button>
                <button
                  type="button"
                  onClick={() => go("Book a call")}
                  className="inline-flex items-center justify-center rounded-full border border-background/30 px-8 py-4 text-sm font-semibold text-background transition-colors hover:border-background"
                >
                  Book a 20-minute call
                </button>
              </div>
              <p className="mt-8 text-sm text-background/60">
                {cta.phoneLabel}{" "}
                <button type="button" onClick={() => go(cta.phone)} className="underline underline-offset-4 transition-colors hover:text-background">
                  {cta.phone}
                </button>
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground/90 py-16 text-muted-foreground" aria-label="Site footer">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <button type="button" onClick={() => go(nav[0])} className="mb-5 flex items-center gap-3 text-foreground">
                  <LogoMark className="size-7 text-xs" />
                  <span className="text-lg font-semibold tracking-tight text-foreground">{brand}</span>
                </button>
                <p className="text-sm leading-relaxed">{footer.note}</p>
              </div>
              <div>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-background">Services</h4>
                <ul className="space-y-3 text-sm">
                  {footer.services.map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => go(link)} className="transition-colors hover:text-background">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-background">Company</h4>
                <ul className="space-y-3 text-sm">
                  {footer.company.map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => go(link)} className="transition-colors hover:text-background">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-background">Connect</h4>
                <ul className="space-y-3 text-sm">
                  {footer.social.map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => go(link)} className="transition-colors hover:text-background">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-8 text-xs text-muted-foreground md:flex-row">
              <p>&copy; {new Date().getFullYear()} {brand}, Inc. All rights reserved.</p>
              <div className="flex items-center gap-6">
                {footer.links.map((link) => (
                  <button key={link} type="button" onClick={() => go(link)} className="transition-colors hover:text-background">{link}</button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
