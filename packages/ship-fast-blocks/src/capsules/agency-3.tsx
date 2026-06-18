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

export const AgencyKimiPage3 = defineCapsule({
  name: "AgencyKimiPage3",
  description:
    "A premium dark-themed creative digital agency LANDING page — the third style sibling to AgencyKimiPage — featuring a sophisticated violet-fuchsia gradient accent system, ambient glow orbs, and a structured layout with hero badge, avatar social proof, end-to-end capabilities grid, four-phase process timeline, selected-work gallery with hover-zoom overlays, transparent three-tier pricing, testimonial cards with star ratings, accordion FAQ, and a bold contact CTA. Use when a moody, premium agency page with strong work showcase, pricing transparency, and structured process narrative is desired for design studios, branding agencies, marketing firms, or creative consultancies. Supply content only — brand, nav, hero, logos, services, process, work, stats, pricing, testimonials, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        avatars: z
          .array(
            z.object({
              alt: z.string(),
            }),
          )
          .optional(),
        trustLabel: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    process: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(
            z.object({
              number: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    work: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              tag: z.string(),
              metric: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z
                .array(
                  z.object({
                    text: z.string(),
                    included: z.boolean().optional().default(true),
                  }),
                )
                .optional(),
              featured: z.boolean().optional().default(false),
              cta: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
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
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        note: z.string().optional(),
        services: z.array(z.string()).optional(),
        company: z.array(z.string()).optional(),
        contactInfo: z
          .object({
            email: z.string().optional(),
            phone: z.string().optional(),
            address: z.array(z.string()).optional(),
          })
          .optional(),
        socials: z.array(z.string()).optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedProjects: table({
        title: string(),
        tag: string(),
        metric: string(),
        imageAlt: string(),
      }),
      inquiries: table({
        name: string(),
        email: string(),
        company: string(),
        message: string(),
      }),
    },
    queries: {
      savedProjects: ({ db }) => db.savedProjects.orderBy('createdAt').all(),
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
    },
    mutations: {
      saveProject: ({ db }, title: string, tag: string, metric: string, imageAlt: string) => {
        const existing = db.savedProjects.where('title', title).all()[0]
        if (existing) {
          db.savedProjects.delete(existing.id)
          return false
        }
        db.savedProjects.insert({ title, tag, metric, imageAlt })
        return true
      },
      removeProject: ({ db }, title: string) => {
        for (const item of db.savedProjects.where('title', title).all()) {
          db.savedProjects.delete(item.id)
        }
        return db.savedProjects.all()
      },
      submitInquiry: ({ db }, name: string, email: string, company: string, message: string) => {
        db.inquiries.insert({ name, email, company, message })
        return db.inquiries.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [inquiryOpen, setInquiryOpen] = useState(false)
    const [savedProjectsOpen, setSavedProjectsOpen] = useState(false)

    const savedProjects = lakebed.useQuery('savedProjects')
    const inquiries = lakebed.useQuery('inquiries')
    const saveProject = lakebed.useMutation('saveProject')
    const removeProject = lakebed.useMutation('removeProject')
    const submitInquiry = lakebed.useMutation('submitInquiry')
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

    const brand = props.brand ?? "Luminary"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Work", "Process", "Pricing", "Contact"]
    const navCta = "Start a Project"

    const heroBadge = props.hero?.badge ?? "Award-Winning Creative Agency"
    const headingTop = props.hero?.headingTop ?? "We Build Digital "
    const heroHighlight = props.hero?.highlight ?? "Experiences"
    const headingBottom = props.hero?.headingBottom ?? " That Define Brands"
    const heroSub =
      props.hero?.subheading ??
      "Strategy, design, and engineering for companies ready to lead. From Series A startups to Fortune 500s, we craft websites and identities that drive measurable growth."
    const heroPrimary = props.hero?.primaryCta ?? "View Our Work"
    const heroSecondary = props.hero?.secondaryCta ?? "Book a Strategy Call"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          { alt: "Professional headshot of a smiling female executive with dark hair in a white blazer" },
          { alt: "Professional headshot of a Black businessman with a short beard wearing a navy suit" },
          { alt: "Professional headshot of a smiling Latina woman with curly brown hair and gold earrings" },
          { alt: "Professional headshot of a middle-aged man with glasses and a friendly expression" },
        ]
    const trustLabel =
      props.hero?.trustLabel ?? "Trusted by 340+ founders & executives"

    const logosHeading =
      props.logos?.heading ?? "Trusted by industry leaders"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Vertex Labs",
          "Aura Beauty",
          "Meridian Hotels",
          "Terra Botanicals",
          "Pulse Fitness",
          "Cipher Security",
        ]

    const servicesHeading =
      props.services?.heading ?? "End-to-end creative capabilities"
    const servicesDesc =
      props.services?.description ??
      "We handle the full lifecycle—from initial brand strategy through production-grade engineering. Every touchpoint is intentional, every interaction is polished."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Brand Strategy & Identity",
            description:
              "Positioning, visual identity systems, voice & tone guidelines, and brand architecture that scales across every channel.",
          },
          {
            title: "Web Design & Development",
            description:
              "Next.js, React, and headless CMS builds. Performance-optimized, accessible, and designed to convert visitors into customers.",
          },
          {
            title: "Motion Design & Video",
            description:
              "3D animation, product explainers, social reels, and interactive motion systems that make interfaces feel alive.",
          },
          {
            title: "Growth & CRO",
            description:
              "Conversion rate optimization, landing page testing, SEO infrastructure, and paid creative that lowers acquisition costs.",
          },
        ]

    const processHeading = props.process?.heading ?? "How we work"
    const processDesc =
      props.process?.description ??
      "Our process is designed to de-risk creativity. Every phase includes structured checkpoints, clear deliverables, and room for iteration."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            number: "01",
            title: "Discover",
            description:
              "Strategy Intensive: stakeholder interviews, competitive audits, analytics review, and customer research to define the real problem.",
          },
          {
            number: "02",
            title: "Design",
            description:
              "Wireframes, high-fidelity UI, motion prototypes, and a full component library. Every screen is tested for accessibility and responsiveness.",
          },
          {
            number: "03",
            title: "Develop",
            description:
              "Production-grade engineering in Next.js or Webflow, headless CMS integration, performance tuning, and cross-browser QA.",
          },
          {
            number: "04",
            title: "Deliver",
            description:
              "Launch support, 30-day warranty, analytics setup, training sessions, and a seamless handoff to your internal team or our retainer program.",
          },
        ]

    const workHeading = props.work?.heading ?? "Selected Work"
    const workDesc =
      props.work?.description ??
      "A curated set of recent launches spanning e-commerce, fintech, hospitality, and consumer brands."
    const workViewAll = props.work?.viewAll ?? "View All Projects"
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          {
            title: "Aura Skincare",
            tag: "E-Commerce Redesign",
            metric: "Launched March 2024 · 240% increase in add-to-cart rate",
            imageAlt:
              "Minimalist skincare product flat lay with rose quartz serum bottle and dried flowers on a warm beige stone surface",
          },
          {
            title: "Vertex Finance",
            tag: "SaaS Platform",
            metric: "Shipped November 2023 · 4.9/5 user satisfaction score",
            imageAlt:
              "Modern fintech analytics dashboard displayed on a large desktop monitor showing dark mode charts and data visualizations",
          },
          {
            title: "Terra Botanicals",
            tag: "Brand Identity & Web",
            metric: "Launched June 2024 · 3 flagship locations opened",
            imageAlt:
              "Bright modern botanical retail interior with hanging plants, natural wood shelving, and abundant sunlight streaming through large windows",
          },
          {
            title: "Pulse Fitness",
            tag: "App & Website",
            metric: "Shipped January 2024 · 50K app downloads in 60 days",
            imageAlt:
              "High-end modern gym interior with dramatic overhead lighting, black rubber flooring, and rows of kettlebells and dumbbells",
          },
          {
            title: "Meridian Hotels",
            tag: "Booking Platform",
            metric: "Launched September 2023 · 18% boost in direct bookings",
            imageAlt:
              "Luxury infinity pool overlooking a tropical ocean at sunset with warm golden light reflecting on the calm water surface",
          },
          {
            title: "Cipher Security",
            tag: "Corporate Site",
            metric: "Shipped April 2024 · Series B announcement campaign",
            imageAlt:
              "Cybersecurity server room with blue neon LED lights illuminating rows of rack-mounted hardware and fiber optic cables",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12", label: "Years of Excellence" },
          { value: "340+", label: "Projects Delivered" },
          { value: "98%", label: "Client Retention" },
          { value: "28", label: "Industry Awards" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees, no surprise scope creep. Every package includes discovery, design, development, and a 30-day post-launch warranty."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Launch",
            description:
              "Perfect for startups validating a new idea or launching an MVP.",
            price: "$8,500",
            period: " / project",
            features: [
              { text: "Single landing page or brand identity", included: true },
              { text: "3-week design sprint", included: true },
              { text: "Mobile-responsive build", included: true },
              { text: "Basic SEO setup", included: true },
              { text: "Custom CMS integration", included: false },
            ],
            featured: false,
            cta: "Get Started",
          },
          {
            name: "Scale",
            description:
              "For growth-stage companies ready to invest in a flagship digital presence.",
            price: "$24,000",
            period: " / project",
            features: [
              { text: "Full website (up to 12 pages)", included: true },
              {
                text: "Headless CMS (Sanity/Contentful)",
                included: true,
              },
              {
                text: "Motion design & micro-interactions",
                included: true,
              },
              {
                text: "Technical SEO & performance tuning",
                included: true,
              },
              {
                text: "Brand strategy workshop included",
                included: true,
              },
            ],
            featured: true,
            cta: "Get Started",
          },
          {
            name: "Partner",
            description:
              "An embedded creative team for organizations with ongoing product needs.",
            price: "Custom",
            period: " / month",
            features: [
              {
                text: "Dedicated strategist & designer",
                included: true,
              },
              { text: "Priority engineering support", included: true },
              { text: "Monthly CRO & analytics review", included: true },
              { text: "Shared Slack channel", included: true },
              { text: "Quarterly strategy planning", included: true },
            ],
            featured: false,
            cta: "Contact Us",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "We measure success by the longevity of our partnerships. Here is what founders and marketing leaders say about working with Luminary."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Working with Luminary transformed our entire digital presence. The conversion rate on our product pages jumped 240% within the first quarter after launch.",
            name: "Sarah Chen",
            role: "Founder & CEO, Aura Skincare",
            avatarAlt:
              "Professional headshot of Sarah Chen, a confident Asian woman CEO with shoulder-length dark hair wearing a white blazer against a neutral studio background",
          },
          {
            quote:
              "The technical execution was flawless, and the design language finally matches the sophistication of our product. Our enterprise demos close faster because the site builds instant credibility.",
            name: "Marcus Webb",
            role: "CTO, Vertex Finance",
            avatarAlt:
              "Professional headshot of Marcus Webb, a Black man with a short beard and warm smile wearing a tailored navy suit and light blue dress shirt",
          },
          {
            quote:
              "They didn't just redesign our site—they redefined how we talk to customers online. The brand workshop alone clarified positioning we'd struggled with for two years.",
            name: "Elena Rodriguez",
            role: "VP of Marketing, Terra Botanicals",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, a Latina woman with curly brown hair and a bright smile wearing gold hoop earrings and a rust-colored blouse",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before starting a project. Can't find what you're looking for? Book a call and we'll walk through it together."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How long does a typical project take?",
            answer:
              "A focused brand sprint takes 4–6 weeks. A full website redesign typically spans 10–14 weeks depending on scope, CMS complexity, and the number of unique page templates. Enterprise engagements with custom animation or 3D work may extend to 16–20 weeks. We build detailed timelines during our Strategy Intensive so there are no surprises.",
          },
          {
            question: "Do you work with early-stage startups?",
            answer:
              "Yes. We have tailored Launch packages designed specifically for pre-seed to Series A companies that need maximum impact on a defined budget. We've helped startups like Aura Skincare and Pulse Fitness go from concept to live product in under six weeks. If you're fundraising, we also offer investor-deck design as a fast add-on.",
          },
          {
            question: "What platforms and technologies do you use?",
            answer:
              "We specialize in Next.js, React, TypeScript, and Tailwind CSS for production web applications. For content management, we deploy headless architectures using Sanity, Contentful, or Strapi. For marketing sites that need rapid iteration without engineering overhead, we deliver production-grade Webflow builds. Every stack decision is made based on your team's capacity and long-term maintainability.",
          },
          {
            question: "How do you handle ongoing support after launch?",
            answer:
              "Every project includes a 30-day warranty period post-launch covering bug fixes, browser compatibility issues, and minor adjustments. For ongoing needs, our Partner retainer provides priority support, iterative improvements, a dedicated Slack channel, and quarterly strategic planning sessions. About 60% of our clients transition into a retainer within three months of launch.",
          },
          {
            question: "What does your discovery process involve?",
            answer:
              "We begin with a multi-day Strategy Intensive—structured workshops, competitive audits, stakeholder interviews, analytics review, and customer insight synthesis. The output is a strategic brief that defines positioning, information architecture, key performance indicators, and creative direction. This ensures every design decision we make is backed by insight, not opinion.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Ready to Build Something Iconic?"
    const contactDesc =
      props.contact?.description ??
      "Tell us what you're making. We'll reply within one business day with honest feedback on scope, timeline, and whether we're the right fit."
    const contactPrimary = props.contact?.primaryCta ?? "Schedule a Call"
    const contactSecondary =
      props.contact?.secondaryCta ?? "Explore Our Work"
    const contactEmail = props.contact?.email ?? "hello@luminary.digital"

    const footerNote =
      props.footer?.note ??
      "Premium digital experiences for ambitious brands. Based in San Francisco, working globally."
    const footerServices = props.footer?.services?.length
      ? props.footer.services
      : [
          "Brand Strategy",
          "Web Design",
          "Development",
          "Motion Design",
          "Growth & CRO",
        ]
    const footerCompany = props.footer?.company?.length
      ? props.footer.company
      : ["About Us", "Case Studies", "Careers", "Blog", "Contact"]
    const footerContact = props.footer?.contactInfo ?? {
      email: "hello@luminary.digital",
      phone: "+1 (415) 555-0147",
      address: [
        "580 Market Street",
        "Suite 400",
        "San Francisco, CA 94104",
      ],
    }
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "Instagram", "Dribbble"]
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy Policy", "Terms of Service"]

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
        className="h-5 w-5 shrink-0 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
    )

    const CrossIcon = () => (
      <svg
        className="h-5 w-5 shrink-0 text-muted-foreground/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    )

    const ArrowRightIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
        />
      </svg>
    )

    const StarIcon = () => (
      <svg
        className="h-5 w-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'h-5 w-5',
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
        className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
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

    const serviceIcons: ReactNode[] = [
      <svg
        key="brand"
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
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.048 4.025a3 3 0 01-4.356-3.636m5.048 4.025a3 3 0 014.356-3.636M15.59 14.23a3 3 0 015.78-1.128 2.25 2.25 0 012.4-2.245 4.5 4.5 0 00-8.4 2.245c0 .399.077.78.22 1.128zm0 0a15.997 15.997 0 01-3.388 1.62m5.048-4.025a3 3 0 004.356 3.636m-5.048-4.025a3 3 0 01-4.356 3.636M7.5 9.75a3 3 0 114.472 0 3 3 0 01-4.472 0z" />
      </svg>,
      <svg
        key="web"
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
        <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>,
      <svg
        key="motion"
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
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>,
      <svg
        key="growth"
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
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
                aria-label={`${brand} Home`}
              >
                <LogoMark className="h-8 w-8 text-sm" />
                {brand}
              </button>

              {/* Desktop Nav */}
              <div className="hidden items-center gap-8 lg:flex">
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
                          onClick={() => {
                            setSavedProjectsOpen(true)
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Saved Projects
                          <span className="ml-auto text-xs text-muted-foreground">
                            {savedProjects?.length ?? 0}
                          </span>
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
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-lg"
                >
                  {navCta}
                </button>
              </div>

              {/* Mobile Toggle */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="flex flex-col border-t border-border bg-background px-4 py-6 lg:hidden gap-4">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
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
                        setMenuOpen(false)
                        setSavedProjectsOpen(true)
                      }}
                      className="w-full rounded-full"
                    >
                      Saved Projects ({savedProjects?.length ?? 0})
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
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
                      setMenuOpen(false)
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
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setInquiryOpen(true)
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 mt-2"
              >
                {navCta}
              </button>
            </div>
          )}
        </nav>

        {/* Hero */}
        <header className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-40">
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 pointer-events-none"
          >
            <div className="size-96 rounded-full bg-primary/20 blur-3xl" />
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-0 right-0 -z-10 pointer-events-none"
          >
            <div className="size-96 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-input bg-card/60 px-4 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground/90">
                    {heroBadge}
                  </span>
                </div>
                <h1 className="mb-8 text-5xl leading-tight font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  {headingTop}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {heroHighlight}
                  </span>
                  {headingBottom}
                </h1>
                <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-xl"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-full border border-input bg-card/50 px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-ring hover:bg-card"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex items-center gap-6 text-muted-foreground">
                  <div className="flex -space-x-3">
                    {heroAvatars.map((avatar, i) => (
                      <Image
                        key={i}
                        alt={avatar.alt}
                        w={80}
                        h={80}
                        className="h-10 w-10 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <p className="text-sm">{trustLabel}</p>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-primary/30 to-accent/20 blur-3xl"
                />
                <Image
                  alt="Abstract 3D render of flowing metallic purple and blue ribbons swirling against a deep black background, symbolizing creative digital design"
                  w={800}
                  h={600}
                  loading="lazy"
                  className="relative aspect-video w-full rounded-2xl border border-border object-cover shadow-xl"
                />
                <div className="absolute -bottom-8 -left-8 rounded-xl border border-input bg-card/90 p-5 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Project Aura Live
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Launched March 12, 2024
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Logos */}
        <section className="border-y border-border/60 bg-muted/30 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground/70">
              {logosHeading}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-16">
              {logosItems.map((logo) => (
                <span
                  key={logo}
                  className="text-xl font-bold tracking-tight text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="relative py-24 lg:py-32">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-0 -z-10 -translate-y-1/2 pointer-events-none"
          >
            <div className="size-96 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {servicesHeading}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {servicesDesc}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {serviceItems.map((item, i) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-border bg-card/50 p-8 transition-colors hover:bg-card"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    {serviceIcons[i % serviceIcons.length]}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section
          id="process"
          className="border-y border-border/60 bg-muted/20 py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {processHeading}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {processDesc}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4 lg:gap-12">
              {processSteps.map((step) => (
                <div key={step.number} className="relative">
                  <span className="text-6xl font-bold text-muted-foreground/30">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Work */}
        <section id="work" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {workHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {workDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => go(workViewAll)}
                className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {workViewAll}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workItems.map((proj) => (
                <button
                  key={proj.title}
                  type="button"
                  onClick={() => go(proj.title)}
                  className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-border text-left aspect-video"
                >
                  <Image
                    alt={proj.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent p-6 pt-20">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      {proj.tag}
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">
                      {proj.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {proj.metric}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border/60 bg-gradient-to-r from-primary/10 to-accent/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
              {statsItems.map((s) => (
                <div key={s.label}>
                  <p className="mb-2 text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent lg:text-5xl">
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

        {/* Pricing */}
        <section id="pricing" className="relative py-24 lg:py-32">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 -z-10 pointer-events-none"
          >
            <div className="size-96 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {pricingHeading}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {pricingDesc}
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8",
                    tier.featured
                      ? "border-primary/40 bg-card shadow-xl"
                      : "border-border bg-card/50",
                  )}
                >
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                  <ul className="mb-10 flex-1 space-y-4">
                    {tier.features?.map((f) => (
                      <li
                        key={f.text}
                        className={cn(
                          "flex items-start gap-3 text-sm",
                          f.included
                            ? "text-foreground/90"
                            : "text-muted-foreground",
                        )}
                      >
                        {f.included ? <CheckIcon /> : <CrossIcon />}
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(tier.cta)}
                    className={cn(
                      "w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                      tier.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                        : "border border-input text-foreground hover:border-ring hover:bg-card",
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
        <section className="border-y border-border/60 bg-muted/20 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {testimonialsHeading}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {testimonialsDesc}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonialItems.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-border bg-background p-8"
                >
                  <div className="mb-6 flex gap-1">
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                  </div>
                  <blockquote className="mb-8 text-lg leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Image
                      alt={t.avatarAlt}
                      w={120}
                      h={120}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {faqHeading}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {faqDesc}
              </p>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border bg-card/30 open:bg-card/50 transition-colors"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-foreground list-none">
                    {item.question}
                    <svg
                      className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
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

        {/* Contact CTA */}
        <section id="contact" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center lg:p-20">
              <div
                aria-hidden="true"
                className="absolute top-0 left-1/2 -z-0 -translate-x-1/2 pointer-events-none"
              >
                <div className="size-96 rounded-full bg-primary/20 blur-3xl" />
              </div>
              <div className="relative z-10 mx-auto max-w-2xl">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {contactHeading}
                </h2>
                <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                  {contactDesc}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(contactPrimary)}
                    className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-xl"
                  >
                    {contactPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(contactSecondary)}
                    className="inline-flex items-center rounded-full border border-input bg-background/50 px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-ring hover:bg-card"
                  >
                    {contactSecondary}
                  </button>
                </div>
                <p className="mt-8 text-sm text-muted-foreground/70">
                  Or email us directly at{" "}
                  <button
                    type="button"
                    onClick={() => go(nav[nav.length - 1])}
                    className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                  >
                    {contactEmail}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background pb-10 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 mb-6 text-lg font-bold tracking-tight text-foreground"
                  aria-label={`${brand} Home`}
                >
                  <LogoMark className="h-7 w-7 text-xs" />
                  {brand}
                </button>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {footerNote}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={social}
                    >
                      {social === "Twitter" && (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {social === "LinkedIn" && (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      )}
                      {social === "Instagram" && (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      )}
                      {social === "Dribbble" && (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073a42.153 42.153 0 00-.767-1.68c2.31-1 4.165-2.358 5.548-4.082a9.863 9.863 0 012.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68a46.287 46.287 0 00-3.488-5.438A9.894 9.894 0 0112 2.087c2.275 0 4.368.779 6.043 2.072zM7.527 3.166a44.59 44.59 0 013.537 5.381c-2.43.715-5.331 1.082-8.684 1.105a9.931 9.931 0 015.147-6.486zM2.087 12l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48A9.865 9.865 0 012.087 12zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027a39.137 39.137 0 012.043 7.164c-3.484 1.007-6.653.666-9.641-1.137zm11.586.268a41.098 41.098 0 00-1.92-6.897c1.876-.265 3.94-.196 6.199.196a9.923 9.923 0 01-4.279 6.701z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                  Services
                </h4>
                <ul className="space-y-3">
                  {footerServices.map((link) => (
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
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                  Company
                </h4>
                <ul className="space-y-3">
                  {footerCompany.map((link) => (
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
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                  Contact
                </h4>
                <ul className="space-y-3">
                  <li className="text-sm text-muted-foreground">
                    {footerContact.email}
                  </li>
                  <li className="text-sm text-muted-foreground">
                    {footerContact.phone}
                  </li>
                  {footerContact.address?.map((line, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground/70">
                © {new Date().getFullYear()} {brand} Inc. All rights reserved.
              </p>
              <div className="flex gap-6">
                {footerLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>

        <Sheet open={savedProjectsOpen} onOpenChange={setSavedProjectsOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="sr-only"
              aria-label="Open saved projects drawer"
            >
              Open saved projects
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Saved Projects</SheetTitle>
              <SheetDescription>
                Keep a shortlist of work references for your next {brand} brief.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const project = workItems[0]
                  if (!project) return
                  void saveProject(
                    project.title,
                    project.tag,
                    project.metric,
                    project.imageAlt,
                  )
                }}
              >
                Save featured project
              </Button>
              <div className="space-y-3">
                {savedProjects && savedProjects.length > 0 ? (
                  savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="font-semibold text-foreground">
                        {project.title}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {project.tag}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {project.metric}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => void removeProject(project.title)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No saved projects yet.
                  </div>
                )}
              </div>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet open={inquiryOpen} onOpenChange={setInquiryOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="sr-only"
              aria-label="Open project inquiry drawer"
            >
              Open project inquiry
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">{navCta}</SheetTitle>
              <SheetDescription>
                Share a project brief and keep the conversation attached to this capsule session.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  const name = String(form.get("name") ?? "").trim()
                  const email = String(form.get("email") ?? "").trim()
                  const company = String(form.get("company") ?? "").trim()
                  const message = String(form.get("message") ?? "").trim()
                  if (!name || !email || !message) return
                  void submitInquiry(name, email, company, message)
                  e.currentTarget.reset()
                }}
              >
                <input
                  name="name"
                  required
                  placeholder="Name"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  name="company"
                  placeholder="Company"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="What should we build together?"
                  className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" className="w-full rounded-full">
                  Send project brief
                </Button>
              </form>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-2xl font-bold text-foreground">
                  {inquiries?.length ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Project inquiries in this session
                </div>
              </div>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
