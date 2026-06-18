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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import { Button } from "#/components/ui/button.tsx"

/**
 * NoCodeKimiPage — a complete, self-contained no-code / drag-and-drop app-builder
 * SaaS LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Buildr" design: a clean, bright,
 * neutral product aesthetic on a light canvas with crisp cards, soft borders, and a
 * single dark/inverse band for emphasis. It pairs a two-column hero (live-status pill +
 * stacked headline + dual CTAs + trust microcopy) with a faux drag-and-drop EDITOR
 * mockup (browser chrome, Components rail, gridded canvas with a selected block, and a
 * Properties panel) plus a floating "Published!" toast. Below it: a trusted-by logo
 * strip, a 6-up feature grid with tinted icon tiles, a 3-step "how it works" flow with
 * photos, a filterable templates GALLERY with hover-zoom and category tags, a 3-tier
 * pricing table (Starter / Pro / Enterprise) with a monthly/yearly toggle and a
 * highlighted Pro plan, a 4-up stats band, a 3-column star-rated testimonials grid, an
 * accordion FAQ, a bold inverse CTA band, and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, depth, and type hierarchy. The base surface is
 * intentionally light to preserve Buildr's airy product mood, with the brand mark, main
 * CTAs, and the highlighted Pro card rendered on the inverse foreground surface via
 * tokens. Every nav item / CTA / link / form submit routes through `useNavigate` (never
 * a dead "#"), and navbar labels match the `nav` array so PageSwitch can swap pages.
 * All content imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props at all.
 */
export const NoCodeKimiPage = defineCapsule({
  name: "NoCodeKimiPage",
  description:
    "Complete no-code / low-code drag-and-drop app & website BUILDER SaaS landing page with a clean, bright, neutral product aesthetic: light canvas, soft-bordered cards, tinted icon tiles, and one bold inverse CTA band. Includes a two-column hero (live-status pill, stacked headline, dual CTAs, no-credit-card trust microcopy) beside a faux visual-EDITOR mockup (browser chrome, Components rail, gridded drag-and-drop canvas with a selected block, Properties panel, floating 'Published!' toast), a trusted-by logo strip, a 6-up feature grid (drag-and-drop builder, 200+ templates, mobile responsive, fast CDN, security, integrations), a 3-step how-it-works flow with photos, a filterable TEMPLATES gallery with hover-zoom thumbnails and category tags, a 3-tier pricing table (Starter free / Pro / Enterprise) with monthly-yearly toggle and highlighted popular plan, a 4-up stats band, a 3-column star-rated testimonials grid, an accordion FAQ, an inverse 'ready to build' CTA, and a multi-column footer with social icons. Use as the ROOT/home page for no-code / website-builder / app-builder / page-builder / form-builder / SaaS platform products, drag-and-drop site creators, template marketplaces, or any 'build without code' startup wanting a polished, conversion-focused product landing page. Supply content only — brand, nav, hero, features, steps, templates, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Muted continuation of the headline. */
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Short trust microcopy lines under the CTAs. */
        trust: z.array(z.string()).optional(),
        /** Label shown in the editor mockup's title bar. */
        editorLabel: z.string().optional(),
        /** Floating success-toast label on the mockup. */
        toast: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** How-it-works steps. */
    steps: z
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
    /** Templates gallery. */
    templates: z
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
              tag: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        monthlyLabel: z.string().optional(),
        yearlyLabel: z.string().optional(),
        saveBadge: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              features: z.array(z.string()),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
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
    /** Testimonials grid. */
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
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing inverse CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      projects: table({
        name: string(),
        description: string(),
        status: string(),
        template: string(),
      }),
      favorites: table({
        templateName: string(),
      }),
    },
    queries: {
      projects: ({ db }) => db.projects.orderBy('createdAt').all(),
      favoriteTemplateNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.templateName)),
    },
    mutations: {
      createProject: ({ db }, name: string, template: string) => {
        db.projects.insert({
          name,
          description: `New project based on ${template}`,
          status: 'draft',
          template,
        })
        return db.projects.all()
      },
      deleteProject: ({ db }, projectId: string) => {
        db.projects.delete(projectId)
        return db.projects.all()
      },
      toggleFavorite: ({ db }, templateName: string) => {
        const existingFavorite = db.favorites
          .where('templateName', templateName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ templateName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [projectsOpen, setProjectsOpen] = useState(false)
    const brand = props.brand ?? "Buildr"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Templates", "Pricing", "Stories"]

    // Lakebed hooks
    const storedProjects = lakebed.useQuery('projects')
    const favoriteTemplateNames = lakebed.useQuery('favoriteTemplateNames')
    const auth = lakebed.useAuth()
    const createProject = lakebed.useMutation('createProject')
    const deleteProject = lakebed.useMutation('deleteProject')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
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
    const safeProjects = storedProjects ?? []
    const projectCount = safeProjects.length

    const heroBadge = props.hero?.badge ?? "Now with AI-powered components"
    const headingTop = props.hero?.headingTop ?? "Build apps without code."
    const headingAccent = props.hero?.headingAccent ?? "Drag, drop, launch."
    const heroSub =
      props.hero?.subheading ??
      "Create stunning web and mobile apps in minutes. Choose from 200+ professionally designed templates, customize with our intuitive drag-and-drop builder, and publish instantly."
    const heroPrimary = props.hero?.primaryCta ?? "Start building free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "Free forever plan"]
    const editorLabel = props.hero?.editorLabel ?? "Buildr Editor"
    const heroToast = props.hero?.toast ?? "Published!"

    const logosLabel =
      props.logos?.label ?? "Trusted by 50,000+ teams worldwide"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["stripe", "notion", "linear", "vercel", "shopify", "slack"]

    const featuresEyebrow = props.features?.eyebrow ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to build amazing apps"
    const featuresDesc =
      props.features?.description ??
      "From drag-and-drop design to powerful integrations, Buildr gives you all the tools to bring your ideas to life."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Drag & Drop Builder",
            description:
              "Intuitive visual editor with 50+ pre-built components. Simply drag elements onto your canvas and arrange them exactly how you want.",
          },
          {
            title: "200+ Templates",
            description:
              "Start with professionally designed templates for SaaS, e-commerce, portfolios, blogs, and more. Fully customizable to match your brand.",
          },
          {
            title: "Mobile Responsive",
            description:
              "Every app automatically adapts to any screen size. Preview and fine-tune your design for desktop, tablet, and mobile in real-time.",
          },
          {
            title: "Lightning Fast",
            description:
              "Apps built on Buildr load instantly with global CDN delivery, automatic image optimization, and code minification built-in.",
          },
          {
            title: "Secure by Default",
            description:
              "SSL certificates, DDoS protection, and SOC 2 compliance included. Your data and your users' data are always protected.",
          },
          {
            title: "100+ Integrations",
            description:
              "Connect with Stripe, Airtable, Zapier, Make, and more. Automate workflows and add powerful functionality without code.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "From idea to live app in 3 simple steps"
    const stepsDesc =
      props.steps?.description ??
      "No coding required. No setup headaches. Just pure creation."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose a Template",
            description:
              "Browse 200+ professionally designed templates. Filter by category, style, or industry to find your perfect starting point.",
            imageAlt: "Designer browsing template gallery on laptop screen",
          },
          {
            title: "Customize Everything",
            description:
              "Drag, drop, and edit with our visual builder. Change colors, fonts, images, and content to match your brand perfectly.",
            imageAlt:
              "Person customizing app interface with drag and drop editor",
          },
          {
            title: "Publish & Grow",
            description:
              "Hit publish and your app goes live instantly. Get a custom domain, analytics, and scale as your audience grows.",
            imageAlt:
              "Live analytics dashboard showing app performance metrics",
          },
        ]

    const templatesEyebrow = props.templates?.eyebrow ?? "Templates Gallery"
    const templatesHeading =
      props.templates?.heading ?? "Start with a proven design"
    const templatesDesc =
      props.templates?.description ??
      "Browse our collection of 200+ templates designed by industry experts. Each one is fully customizable and ready to make your own."
    const templateFilters = props.templates?.filters?.length
      ? props.templates.filters
      : [
          "All Templates",
          "SaaS",
          "E-commerce",
          "Portfolio",
          "Blog",
          "Landing Page",
        ]
    const templatesViewAll =
      props.templates?.viewAll ?? "View all 200+ templates"
    const templateItems = props.templates?.items?.length
      ? props.templates.items
      : [
          {
            title: "Analytics Dashboard",
            tag: "SaaS",
            description: "Perfect for data-driven apps",
            imageAlt: "Modern SaaS dashboard template with analytics charts",
          },
          {
            title: "Modern Shop",
            tag: "E-commerce",
            description: "Sell products with style",
            imageAlt: "E-commerce store template with product grid",
          },
          {
            title: "Creative Portfolio",
            tag: "Portfolio",
            description: "Showcase your best work",
            imageAlt: "Creative portfolio template for designers",
          },
          {
            title: "Minimal Blog",
            tag: "Blog",
            description: "Content-first design",
            imageAlt: "Minimal blog template with clean typography",
          },
          {
            title: "Startup Launch",
            tag: "Landing Page",
            description: "Convert visitors to users",
            imageAlt: "Startup landing page template",
          },
          {
            title: "Event Registration",
            tag: "Events",
            description: "Manage events seamlessly",
            imageAlt: "Event registration template with calendar",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprises."
    const monthlyLabel = props.pricing?.monthlyLabel ?? "Monthly"
    const yearlyLabel = props.pricing?.yearlyLabel ?? "Yearly"
    const saveBadge = props.pricing?.saveBadge ?? "Save 20%"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for side projects",
            price: "$0",
            period: "/month",
            cta: "Start building free",
            features: [
              "3 projects",
              "50+ templates",
              "Buildr subdomain",
              "Community support",
            ],
          },
          {
            name: "Pro",
            tagline: "For serious creators",
            price: "$29",
            period: "/month",
            cta: "Start 14-day trial",
            featured: true,
            badge: "Most Popular",
            features: [
              "Unlimited projects",
              "200+ templates",
              "Custom domain",
              "10 team members",
              "Priority support",
              "Analytics dashboard",
            ],
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            cta: "Contact sales",
            features: [
              "Everything in Pro",
              "Unlimited team members",
              "SSO & advanced security",
              "Dedicated account manager",
              "Custom SLA",
            ],
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Apps created" },
          { value: "200+", label: "Templates available" },
          { value: "99.9%", label: "Uptime guaranteed" },
          { value: "<1s", label: "Average load time" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by creators worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our community is building with Buildr."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I built my entire e-commerce store in a weekend without writing a single line of code. The templates are gorgeous and the editor is incredibly intuitive. Sales are up 40% since the redesign.",
            name: "Sarah Chen",
            role: "Founder, GreenLeaf Organics",
            avatarAlt:
              "Professional headshot of Sarah Chen, founder of GreenLeaf Organics",
          },
          {
            quote:
              "As a designer without coding skills, I was always dependent on developers. Buildr changed everything. Now I prototype and launch full products myself. The integrations with Figma are seamless.",
            name: "Marcus Johnson",
            role: "Product Designer, TechFlow",
            avatarAlt:
              "Professional headshot of Marcus Johnson, product designer at TechFlow",
          },
          {
            quote:
              "We migrated our entire agency workflow to Buildr and cut project delivery time by 60%. The collaboration features let our whole team work together seamlessly. Clients are amazed at the speed.",
            name: "Elena Rodriguez",
            role: "CEO, Brightside Agency",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, CEO of Brightside Agency",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need any coding knowledge to use Buildr?",
            a: "Not at all! Buildr is designed for everyone, regardless of technical background. Our drag-and-drop interface lets you build professional apps visually. If you do know code, you can add custom HTML, CSS, and JavaScript for advanced customization.",
          },
          {
            q: "Can I use my own custom domain?",
            a: "Yes! Pro and Enterprise plans support custom domains with free SSL certificates. Simply connect your domain in the settings, and we'll handle the DNS configuration automatically. Your site will be live on your domain within minutes.",
          },
          {
            q: "What happens if I exceed my plan limits?",
            a: "We'll notify you when you're approaching your limits. You can upgrade anytime to unlock more features. Your app will never go offline unexpectedly — we prioritize keeping your site running smoothly.",
          },
          {
            q: "Is there a free trial for paid plans?",
            a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start. You'll have full access to all features during the trial, and you can cancel anytime before being charged.",
          },
          {
            q: "Can I export my app if I want to move elsewhere?",
            a: "Absolutely. Your data belongs to you. Pro and Enterprise users can export clean, semantic HTML/CSS code of their apps anytime. We believe in building on Buildr because you love it, not because you're locked in.",
          },
          {
            q: "Do you offer refunds?",
            a: "Yes, we offer a 30-day money-back guarantee on all paid plans. If Buildr isn't the right fit for you, contact our support team within 30 days of your purchase for a full refund, no questions asked.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to build something amazing?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ creators who are already building with Buildr. Start for free, no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start building free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch 2-min demo"
    const ctaNote =
      props.cta?.note ??
      "Free forever plan available • 14-day Pro trial • Cancel anytime"

    const footerDesc =
      props.footer?.description ??
      "The no-code platform that empowers anyone to build beautiful, functional apps without writing code."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Templates",
              "Pricing",
              "Integrations",
              "Changelog",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Help Center",
              "Community",
              "Contact",
              "Status",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookies"]

    // Brand logo tile — dark inverse square with the cube glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
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
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
        aria-hidden="true"
        className={className}
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
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
        aria-hidden="true"
        className={className}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const PlayIcon = () => (
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
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 9 15 12 10 15 10 9" />
      </svg>
    )

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className="size-5"
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
        aria-hidden="true"
        className="text-chart-4"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

    // Tinted icon tiles rotate through token surfaces (the source used 6 palette hues).
    const featureIconTints = [
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
      "bg-accent text-accent-foreground",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-1/15 text-chart-1",
    ]
    const tagTints = [
      "bg-chart-1 text-background",
      "bg-chart-2 text-background",
      "bg-chart-3 text-background",
      "bg-chart-4 text-background",
      "bg-primary text-primary-foreground",
      "bg-chart-5 text-background",
    ]
    const featureIcons: ReactNode[] = [
      // cursor / drag
      <svg
        key="drag"
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
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>,
      // grid / templates
      <svg
        key="grid"
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>,
      // mobile
      <svg
        key="mobile"
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
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </svg>,
      // bolt
      <svg
        key="bolt"
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
        <polygon points="13 2 4 14 11 14 11 22 20 10 13 10 13 2" />
      </svg>,
      // shield
      <svg
        key="shield"
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>,
      // integrations / plug
      <svg
        key="plug"
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
        <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 01-10 0V7z" />
        <path d="M12 16v5" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" />
              <span className="text-xl font-semibold tracking-tight">
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
                        onClick={() => go('Projects')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Projects
                        <ArrowRight className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Settings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Settings
                        <ArrowRight className="size-4" />
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
              <Sheet open={projectsOpen} onOpenChange={setProjectsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Projects"
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
                      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                      <path d="M13 13l6 6" />
                    </svg>
                    {projectCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {projectCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">My Projects</SheetTitle>
                    <SheetDescription>
                      {projectCount > 0
                        ? `${projectCount} project${projectCount === 1 ? '' : 's'} in your workspace.`
                        : 'Start building by creating your first project.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeProjects.length ? (
                      <div className="space-y-4">
                        {safeProjects.map((project) => (
                          <div
                            key={project.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <svg
                                  className="size-8"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <path d="M3 9h18" />
                                  <path d="M9 21V9" />
                                </svg>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {project.status}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {project.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {project.template}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => go(project.name)}
                                  className="text-xs font-semibold text-foreground underline-offset-4 hover:text-muted-foreground hover:underline"
                                >
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteProject(project.id)}
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No projects yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Choose a template from the gallery to create your first project.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={() => go('Templates')}
                    >
                      Browse Templates
                    </Button>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-full"
                      >
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {heroPrimary}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
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
          <section className="relative overflow-hidden" aria-labelledby="nc-hero">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
                    <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1
                    id="nc-hero"
                    className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
                  >
                    {headingTop}{" "}
                    <span className="text-muted-foreground">
                      {headingAccent}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <PlayIcon />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor mockup (decorative product UI) */}
                <div className="relative" aria-hidden="true">
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-chart-1" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {editorLabel}
                        </span>
                      </div>
                    </div>
                    <div className="grid min-h-[400px] grid-cols-12">
                      <div className="col-span-3 space-y-3 border-r border-border bg-muted/50 p-4">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Components
                        </div>
                        {["Text", "Image", "Button", "Form"].map((c, i) => (
                          <div
                            key={c}
                            className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-sm"
                          >
                            <div
                              className={cn(
                                "grid size-8 place-items-center rounded",
                                featureIconTints[i % featureIconTints.length],
                              )}
                            >
                              <span className="size-4">
                                {featureIcons[i % featureIcons.length]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-card-foreground">
                              {c}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="relative col-span-6 bg-card p-6">
                        <div
                          className="absolute inset-0 opacity-40"
                          style={{
                            backgroundImage:
                              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                            color: "var(--border)",
                          }}
                        />
                        <div className="relative space-y-4">
                          <div className="rounded-xl border-2 border-dashed border-primary bg-foreground p-6 text-center text-background shadow-lg">
                            <h3 className="mb-2 text-xl font-semibold">
                              Welcome to My App
                            </h3>
                            <p className="mb-4 text-sm text-background/60">
                              Build something amazing today
                            </p>
                            <span className="inline-block rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground">
                              Get Started
                            </span>
                          </div>
                          <div className="rounded-lg border border-border bg-muted p-4">
                            <div className="mb-2 h-2 w-3/4 rounded bg-border" />
                            <div className="h-2 w-1/2 rounded bg-border" />
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 border-l border-border bg-muted/50 p-4">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Properties
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="mb-1.5 block text-xs text-muted-foreground">
                              Background
                            </span>
                            <div className="flex gap-1.5">
                              <div className="size-6 rounded border-2 border-primary bg-foreground" />
                              <div className="size-6 rounded border border-border bg-background" />
                              <div className="size-6 rounded border border-border bg-chart-1" />
                              <div className="size-6 rounded border border-border bg-chart-3" />
                            </div>
                          </div>
                          <div>
                            <span className="mb-1.5 block text-xs text-muted-foreground">
                              Padding
                            </span>
                            <div className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5">
                              <span className="text-sm text-card-foreground">
                                24px
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="mb-1.5 block text-xs text-muted-foreground">
                              Border Radius
                            </span>
                            <div className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5">
                              <span className="text-sm text-card-foreground">
                                12px
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-xl border border-border bg-card p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="grid size-8 place-items-center rounded-full bg-chart-2/15">
                        <Check className="size-4 text-chart-2" />
                      </div>
                      <span className="text-sm font-medium text-card-foreground">
                        {heroToast}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border bg-card py-12"
            aria-label="Trusted by companies"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center text-2xl font-semibold lowercase text-muted-foreground"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            className="bg-background py-24"
            aria-labelledby="nc-features"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {featuresEyebrow}
                </span>
                <h2
                  id="nc-features"
                  className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:shadow-lg"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                        featureIconTints[i % featureIconTints.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
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

          {/* Steps */}
          <section className="bg-muted/40 py-24" aria-labelledby="nc-steps">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {stepsEyebrow}
                </span>
                <h2
                  id="nc-steps"
                  className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-foreground text-2xl font-bold text-background">
                      {i + 1}
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
                        <Image
                          alt={step.imageAlt}
                          w={600}
                          h={340}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                      <h3 className="mb-2 text-center text-lg font-semibold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="text-center text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-border md:block"
                      >
                        <div className="absolute -top-1.5 right-0 size-3 rounded-full bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Templates gallery */}
          <section
            className="bg-background py-24"
            aria-labelledby="nc-templates"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {templatesEyebrow}
                </span>
                <h2
                  id="nc-templates"
                  className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {templatesHeading}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {templatesDesc}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {templateFilters.map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => go(f)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templateItems.map((tpl, i) => {
                  const isFavorite =
                    favoriteTemplateNames?.has(tpl.title) ?? false

                  return (
                    <div
                      key={tpl.title}
                      className="group relative block w-full overflow-hidden rounded-2xl border border-border transition-all hover:shadow-xl"
                    >
                      <div className="aspect-[4/3] bg-muted">
                        <Image
                          alt={tpl.imageAlt}
                          w={800}
                          h={600}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(tpl.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${tpl.title} from favorites`
                              : `Add ${tpl.title} to favorites`
                          }
                          className={cn(
                            'absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isFavorite
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="p-6">
                        <span
                          className={cn(
                            "mb-2 inline-block rounded px-2 py-1 text-xs font-medium",
                            tagTints[i % tagTints.length],
                          )}
                        >
                          {tpl.tag}
                        </span>
                        <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                          {tpl.title}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {tpl.description}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full rounded-full"
                          onClick={() => {
                            void createProject(`My ${tpl.title}`, tpl.title)
                            setProjectsOpen(true)
                          }}
                        >
                          Use this template
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(templatesViewAll)}
                  className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {templatesViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-24" aria-labelledby="nc-pricing">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {pricingEyebrow}
                </span>
                <h2
                  id="nc-pricing"
                  className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    {monthlyLabel}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked="false"
                    aria-label="Toggle yearly billing"
                    onClick={() => go(yearlyLabel)}
                    className="relative h-8 w-14 rounded-full bg-foreground p-1"
                  >
                    <span className="block size-6 rounded-full bg-background shadow transition-transform" />
                  </button>
                  <span className="text-sm font-medium text-muted-foreground">
                    {yearlyLabel}
                  </span>
                  <span className="rounded-full bg-chart-2/15 px-2 py-1 text-xs font-medium text-chart-2">
                    {saveBadge}
                  </span>
                </div>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => {
                  const featured = plan.featured ?? false
                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        "relative rounded-2xl p-8 shadow-sm",
                        featured
                          ? "border border-foreground bg-foreground text-background shadow-xl"
                          : "border border-border bg-card",
                      )}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "mb-1 text-lg font-semibold",
                            featured ? "text-background" : "text-card-foreground",
                          )}
                        >
                          {plan.name}
                        </h3>
                        <p
                          className={cn(
                            "text-sm",
                            featured
                              ? "text-background/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.tagline}
                        </p>
                      </div>
                      <div className="mb-6">
                        <span
                          className={cn(
                            "text-4xl font-bold",
                            featured ? "text-background" : "text-card-foreground",
                          )}
                        >
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span
                            className={
                              featured
                                ? "text-background/60"
                                : "text-muted-foreground"
                            }
                          >
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => go(plan.cta)}
                        className={cn(
                          "mb-6 block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors",
                          featured
                            ? "bg-background text-foreground hover:bg-background/90"
                            : "border border-border text-card-foreground hover:bg-accent",
                        )}
                      >
                        {plan.cta}
                      </button>
                      <ul className="space-y-3" role="list">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-3">
                            <Check
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                featured ? "text-background" : "text-chart-2",
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm",
                                featured
                                  ? "text-background/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="border-y border-border bg-background py-24"
            aria-label="Company statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-muted/40 py-24"
            aria-labelledby="nc-testimonials"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="nc-testimonials"
                  className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div
                      className="mb-4 flex gap-1"
                      aria-label="5 star rating"
                    >
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24" aria-labelledby="nc-faq">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {faqEyebrow}
                </span>
                <h2
                  id="nc-faq"
                  className="text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card transition-all open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-semibold text-card-foreground">
                        {item.q}
                      </h3>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
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

          {/* Closing CTA (inverse band) */}
          <section
            className="bg-foreground py-24 text-background"
            aria-labelledby="nc-cta"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="nc-cta"
                className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-8 py-4 text-lg font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-background/30 px-8 py-4 text-lg font-medium text-background transition-colors hover:bg-background/10"
                >
                  <PlayIcon />
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-card py-16"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold">{brand}</span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "GitHub", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="text-xs font-semibold">
                          {social.charAt(0)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-card-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
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
