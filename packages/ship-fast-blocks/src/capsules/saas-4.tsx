import { useState } from "react"
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

export const SaasKimiPage4 = defineCapsule({
  name: "SaasKimiPage4",
  description:
    "Elegant, editorial-style SaaS landing page with a refined light-theme aesthetic: glassy sticky navbar with a serif-inspired brand mark, split hero with bold display typography and a product image with a floating notification card, a trusted-by logo text strip, a 6-up feature grid with dark icon medallions, numbered how-it-works steps, a masonry product gallery, a 3-tier pricing table with a dark highlighted Professional plan, a clean stats band, a 6-up testimonial grid with headshot avatars, non-accordion FAQ cards, a dark CTA banner, and a rich multi-column dark footer with social icons. This is the fourth style sibling to SaasKimiPage, designed for a more classic, typography-forward, trust-building mood — ideal for productivity tools, scheduling apps, B2B SaaS, calendar assistants, or professional services that want a polished, corporate-yet-warm feel. No gradients, no chat mockup; instead it features editorial spacing, real photography, masonry gallery, and flat card-based FAQ. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",

  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        avatars: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        demoTitle: z.string().optional(),
        demoSubtitle: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z
          .array(
            z.object({
              alt: z.string(),
              w: z.number().optional(),
              h: z.number().optional(),
              wide: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              avatarAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),

  lakebed: {
    schema: {
      subscribers: table({
        email: string(),
        source: string(),
      }),
      leads: table({
        name: string(),
        email: string(),
        company: string(),
        plan: string(),
      }),
      notifications: table({
        title: string(),
        message: string(),
        read: string(),
      }),
    },
    queries: {
      subscribers: ({ db }) => db.subscribers.orderBy('createdAt').all(),
      leads: ({ db }) => db.leads.orderBy('createdAt').all(),
      unreadNotifications: ({ db }) =>
        db.notifications.where('read', 'false').all(),
    },
    mutations: {
      subscribe: ({ db }, email: string, source: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (existing) return db.subscribers.all()

        db.subscribers.insert({ email, source })
        return db.subscribers.all()
      },
      createLead: ({ db }, name: string, email: string, company: string, plan: string) => {
        db.leads.insert({ name, email, company, plan })
        return db.leads.all()
      },
      markNotificationRead: ({ db }, id: string) => {
        db.notifications.update(id, { read: 'true' })
        return db.notifications.all()
      },
      clearNotifications: ({ db }) => {
        for (const item of db.notifications.all()) {
          db.notifications.delete(item.id)
        }
        return []
      },
    },
  },

  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [subscribeEmail, setSubscribeEmail] = useState("")
    const brand = props.brand ?? "Meridian"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Product", "Pricing", "Customers", "FAQ"]

    const heroBadge = props.hero?.badge ?? "AI-Powered Scheduling"
    const heroHeading =
      props.hero?.heading ?? "Reclaim your day. Let AI handle the calendar."
    const heroSub =
      props.hero?.subheading ??
      "Meridian reads your priorities, protects deep-work blocks, and schedules meetings at the perfect time—across every timezone."
    const heroPrimary = props.hero?.primaryCta ?? "Get started free"
    const heroSecondary = props.hero?.secondaryCta ?? "See how it works"
    const heroProof =
      props.hero?.socialProof ?? "Trusted by 12,000+ teams"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "Headshot of a product manager",
          "Headshot of a software engineer",
          "Headshot of a design director",
          "Headshot of a startup founder",
        ]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern open-plan office with natural light and a large wall calendar"
    const demoTitle = props.hero?.demoTitle ?? "Focus time protected"
    const demoSubtitle =
      props.hero?.demoSubtitle ??
      "2.5 hours blocked for deep work today"

    const logosLabel = props.logos?.label ?? "Loved by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          "Notion",
          "Figma",
          "Stripe",
          "Linear",
          "Vercel",
          "Slack",
          "Webflow",
          "Loom",
        ]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading =
      props.features?.heading ??
      "The last calendar tool you will ever need"
    const featuresDesc =
      props.features?.description ??
      "From intelligent rescheduling to cross-timezone coordination, Meridian handles the busywork so you can focus on what matters."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Scheduling",
            description:
              "Meridian analyzes attendee availability, travel time, and energy levels to find the optimal slot—automatically.",
          },
          {
            title: "Focus Time Blocks",
            description:
              "Defend deep-work hours with AI-powered focus blocks that repel low-priority meetings and batch distractions.",
          },
          {
            title: "Timezone Intelligence",
            description:
              "Coordinate across Tokyo, London, and San Francisco without the 6 AM surprises. Meridian finds humane overlap windows.",
          },
          {
            title: "Conflict Resolution",
            description:
              "Double-booked? Meridian suggests the best reschedule, drafts apology emails, and moves meetings before you even notice.",
          },
          {
            title: "Calendar Analytics",
            description:
              "See where your time really goes. Weekly reports surface meeting bloat, fragmented days, and collaboration debt.",
          },
          {
            title: "Team Coordination",
            description:
              "Sync team priorities so standups never conflict with sprints. Shared rules keep everyone aligned without micromanagement.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How it works"
    const stepsHeading =
      props.steps?.heading ?? "Set it up in minutes, not days"
    const stepsDesc =
      props.steps?.description ??
      "Connect your calendars, set your preferences, and let Meridian run in the background."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your calendars",
            description:
              "One-click sync with Google Calendar, Outlook, and Apple Calendar. Meridian reads existing events but never stores sensitive data on our servers.",
          },
          {
            title: "Teach your priorities",
            description:
              "Tell Meridian when you do your best work, which meetings are movable, and how much focus time you need. The AI learns your style over time.",
          },
          {
            title: "Reclaim your time",
            description:
              "Watch your calendar optimize itself. Conflicts resolve automatically, focus blocks appear, and you end every day with energy to spare.",
          },
        ]

    const galleryTag = props.gallery?.tag ?? "Inside the product"
    const galleryHeading =
      props.gallery?.heading ?? "A calendar that thinks ahead"
    const galleryDesc =
      props.gallery?.description ??
      "Clean, focused, and designed for the way modern teams actually work."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          {
            alt: "Dashboard showing weekly schedule analytics with colorful time-block charts on a laptop screen",
            w: 1200,
            h: 600,
            wide: true,
          },
          {
            alt: "Minimal desk calendar and notebook with coffee in a bright workspace",
            w: 800,
            h: 600,
            wide: false,
          },
          {
            alt: "Modern conference room with glass walls and comfortable chairs for team meetings",
            w: 800,
            h: 600,
            wide: false,
          },
          {
            alt: "Close-up of a tablet showing calendar and analytics graphs on a wooden desk",
            w: 1200,
            h: 600,
            wide: true,
          },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Upgrade when you need more power. No hidden fees, no surprises."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individuals getting organized.",
            price: "$0",
            period: "/month",
            features: [
              "2 connected calendars",
              "Basic smart scheduling",
              "Email support",
              "Mobile app access",
            ],
            cta: "Get started",
            popular: false,
          },
          {
            name: "Professional",
            description: "For power users and small teams.",
            price: "$12",
            period: "/user/month",
            features: [
              "Unlimited calendars",
              "AI conflict resolution",
              "Focus time blocking",
              "Weekly analytics reports",
              "Priority support",
            ],
            cta: "Start 14-day trial",
            popular: true,
          },
          {
            name: "Enterprise",
            description: "For organizations at scale.",
            price: "$39",
            period: "/user/month",
            features: [
              "Everything in Professional",
              "SSO & SCIM provisioning",
              "Custom AI rules engine",
              "Dedicated account manager",
              "SLA & audit logs",
            ],
            cta: "Contact sales",
            popular: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,000+", label: "Active teams" },
          { value: "4.2M", label: "Hours saved" },
          { value: "98.7%", label: "Uptime" },
          { value: "156", label: "Countries" },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by productive people"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Here is what leaders at fast-moving companies say about Meridian."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Sarah Chen",
            role: "VP of Product, Notion",
            quote:
              "Meridian gave me back my mornings. I used to spend 45 minutes every day shuffling meetings. Now my calendar optimizes itself and I actually have time to think.",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair wearing a navy blazer",
          },
          {
            name: "Marcus Whitfield",
            role: "Engineering Lead, Stripe",
            quote:
              "We rolled Meridian out to 200 engineers across three continents. The timezone intelligence alone saved us from countless 6 AM standups. It just works.",
            avatarAlt:
              "Professional headshot of a smiling man in a light blue dress shirt with a trimmed beard",
          },
          {
            name: "Priya Nandakumar",
            role: "Design Director, Figma",
            quote:
              "The focus time blocking is a game changer. I went from 12 fragmented meetings a day to 4 intentional ones, plus three hours of uninterrupted design work.",
            avatarAlt:
              "Professional headshot of a smiling woman with curly hair and gold earrings",
          },
          {
            name: "James Okonkwo",
            role: "CEO, Linear",
            quote:
              "We evaluated every calendar tool on the market. Meridian is the only one that actually understands priorities rather than just finding empty slots.",
            avatarAlt:
              "Professional headshot of a man in a grey suit with short dark hair and a confident smile",
          },
          {
            name: "Elena Rossi",
            role: "COO, Vercel",
            quote:
              "Our executive team uses Meridian to protect strategy days. The AI politely declines meetings on our behalf and suggests better times. It is like having an assistant.",
            avatarAlt:
              "Professional headshot of a young woman with brown hair and a warm smile wearing a white blouse",
          },
          {
            name: "David Park",
            role: "Head of People, Webflow",
            quote:
              "Rolling out Meridian to the whole company took one afternoon. Adoption was instant because people saw their calendars improve on day one.",
            avatarAlt:
              "Professional headshot of a middle-aged man with glasses and a friendly expression in a casual shirt",
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Questions? Answered."
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about getting started with Meridian."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Does Meridian replace my existing calendar?",
            answer:
              "No. Meridian sits on top of Google Calendar, Outlook, and Apple Calendar. It reads your events, suggests improvements, and writes changes back—but you keep using the apps you already know. Think of it as an intelligent layer, not a replacement.",
          },
          {
            question: "How does the AI handle sensitive meeting data?",
            answer:
              "We use end-to-end encryption for all calendar data and never train our AI models on your private information. Meridian only needs event titles, times, and attendee emails to function. We are SOC 2 Type II certified and GDPR compliant.",
          },
          {
            question: "Can I override the AI if I disagree with a suggestion?",
            answer:
              "Absolutely. Every change Meridian proposes is shown as a suggestion first. You approve, decline, or modify it with one click. Over time, the AI learns from your choices and gets better at matching your preferences.",
          },
          {
            question: "What happens when someone sends me a meeting invite?",
            answer:
              "Meridian evaluates the invite against your priorities, existing focus blocks, and travel time. If it conflicts with something important, it suggests alternative times to the sender automatically—saving you the back-and-forth.",
          },
          {
            question: "Is there a limit on how many calendars I can connect?",
            answer:
              "Starter plans include up to 2 connected calendars. Professional and Enterprise plans offer unlimited calendar connections, including shared team calendars and resource rooms.",
          },
          {
            question: "Do you offer discounts for nonprofits or educational institutions?",
            answer:
              "Yes. We offer 50% off Professional plans for verified nonprofits, students, and educators. Contact our sales team with your organization details to apply.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ??
      "Stop managing your calendar.\nStart owning your time."
    const ctaSub =
      props.cta?.subheading ??
      "Join 12,000+ teams who use Meridian to reclaim their schedules. Free forever for individuals. No credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Get started for free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to sales"
    const ctaFootnote =
      props.cta?.footnote ?? "Setup takes less than 2 minutes."

    const footerTagline =
      props.footer?.tagline ??
      "Intelligent scheduling for modern teams. Built in San Francisco, used worldwide."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Help Center",
              "Community",
              "Templates",
              "Status",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    const subscribers = lakebed.useQuery('subscribers')
    const leads = lakebed.useQuery('leads')
    const unreadNotifications = lakebed.useQuery('unreadNotifications')
    const subscribe = lakebed.useMutation('subscribe')
    const createLead = lakebed.useMutation('createLead')
    const markNotificationRead = lakebed.useMutation('markNotificationRead')
    const clearNotifications = lakebed.useMutation('clearNotifications')
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
    const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault()
      if (!subscribeEmail.trim()) return

      void subscribe(subscribeEmail, 'footer')
      setSubscribeEmail('')
    }
    const notificationCount = unreadNotifications?.length ?? 0

    const LogoMark = ({
      className,
    }: {
      className?: string
    }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-foreground text-background",
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    )

    const CheckIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
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

    const BellIcon = () => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    )

    const featureSvgs = [
      <svg
        key="f1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-background"
        aria-hidden="true"
      >
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>,
      <svg
        key="f2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-background"
        aria-hidden="true"
      >
        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="f3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-background"
        aria-hidden="true"
      >
        <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>,
      <svg
        key="f4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-background"
        aria-hidden="true"
      >
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>,
      <svg
        key="f5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-background"
        aria-hidden="true"
      >
        <path d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>,
      <svg
        key="f6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-background"
        aria-hidden="true"
      >
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>

            <ul className="hidden items-center gap-10 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4">
              <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BellIcon />
                    {notificationCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {notificationCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Notifications</SheetTitle>
                    <SheetDescription>
                      {notificationCount > 0
                        ? `${notificationCount} unread notification${notificationCount === 1 ? '' : 's'}`
                        : 'No new notifications'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {unreadNotifications && unreadNotifications.length > 0 ? (
                      <div className="space-y-4">
                        {unreadNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <p className="font-semibold text-foreground">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-3"
                              onClick={() => void markNotificationRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No notifications
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          You're all caught up!
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => void clearNotifications()}
                      disabled={!unreadNotifications || unreadNotifications.length === 0}
                    >
                      Clear all
                    </Button>
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
                        onClick={() => go('Settings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Settings
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
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Start free
              </button>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-32 lg:pt-32 lg:pb-40">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="max-w-2xl">
                  <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {heroBadge}
                  </p>
                  <h1 className="mb-8 text-5xl font-medium leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSignedIn && authEmail) {
                          void createLead(authDisplayName || 'User', authEmail, '', 'Starter')
                        }
                        go(heroPrimary)
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full bg-muted px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted/80"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex -space-x-2" aria-hidden="true">
                      {heroAvatars.map((alt, i) => (
                        <span
                          key={i}
                          className={cn(
                            "inline-block rounded-full border-2 border-background",
                            i > 0 && "-ml-2",
                          )}
                        >
                          <Image alt={alt} w={32} h={32} className="rounded-full object-cover" />
                        </span>
                      ))}
                    </div>
                    <p>{heroProof}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-8 -left-8 hidden max-w-xs rounded-xl border border-border/60 bg-card p-5 shadow-xl md:block">
                    <div className="flex items-start gap-4">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5 text-primary"
                          aria-hidden="true"
                        >
                          <polyline points="5 13 9 17 19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {demoTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {demoSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section className="border-y border-border/60 bg-muted/50" aria-label="Trusted by leading companies">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="whitespace-nowrap text-lg font-bold tracking-tight text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-24 lg:py-32" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {featuresTag}
                </p>
                <h2
                  id="features-heading"
                  className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-border hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-foreground">
                      {featureSvgs[i % featureSvgs.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-24 lg:py-32 bg-muted" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {stepsTag}
                </p>
                <h2
                  id="steps-heading"
                  className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>

              <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                      <span className="text-2xl font-semibold text-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section id="gallery" className="py-24 lg:py-32" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {galleryTag}
                </p>
                <h2
                  id="gallery-heading"
                  className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "overflow-hidden rounded-2xl border border-border/60 shadow-sm",
                      img.wide ? "md:col-span-2" : "",
                    )}
                  >
                    <Image
                      alt={img.alt}
                      w={img.w ?? 800}
                      h={img.h ?? 600}
                      className="h-80 w-full object-cover md:h-96"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="py-24 lg:py-32 bg-muted" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {pricingTag}
                </p>
                <h2
                  id="pricing-heading"
                  className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.popular
                        ? "bg-foreground text-background md:-mt-4 md:mb-4"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.popular ? (
                      <div className="absolute right-6 top-0 inline-flex -translate-y-1/2 items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold text-foreground">
                        Most popular
                      </div>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-2xl font-medium",
                        plan.popular ? "text-background" : "text-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        plan.popular
                          ? "text-background/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.description}
                    </p>
                    <div className="mb-8 flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-5xl font-medium",
                          plan.popular ? "text-background" : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.popular
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSignedIn && authEmail) {
                          void createLead(authDisplayName || 'User', authEmail, '', plan.name)
                        }
                        go(plan.cta)
                      }}
                      className={cn(
                        "mb-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                        plan.popular
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "bg-muted text-foreground hover:bg-muted/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                    <ul className="space-y-4 text-sm" role="list">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <CheckIcon />
                          <span
                            className={cn(
                              plan.popular
                                ? "text-background/80"
                                : "text-muted-foreground",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-24 lg:py-32" aria-label="Company metrics">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-12 text-center lg:grid-cols-4 lg:gap-8">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-3 text-5xl font-medium tracking-tight text-foreground md:text-6xl">
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

          {/* Testimonials */}
          <section id="testimonials" className="py-24 lg:py-32 bg-muted" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {testimonialsTag}
                </p>
                <h2
                  id="testimonials-heading"
                  className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt ?? `Headshot of ${t.name}`}
                        w={56}
                        h={56}
                        className="rounded-full object-cover"
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
                    <blockquote>
                      <p className="leading-relaxed text-foreground/90">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </blockquote>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-24 lg:py-32" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {faqTag}
                </p>
                <h2
                  id="faq-heading"
                  className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>

              <div className="space-y-6">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-border/60 bg-card p-6"
                  >
                    <h3 className="mb-3 text-lg font-medium text-foreground">
                      {item.question}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="cta" className="py-24 lg:py-32 bg-foreground" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
              <h2
                id="cta-heading"
                className="mb-8 text-4xl font-medium leading-tight tracking-tight text-background md:text-5xl lg:text-6xl"
              >
                {ctaHeading.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-background/80 md:text-xl">
                {ctaSub}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (isSignedIn && authEmail) {
                      void createLead(authDisplayName || 'User', authEmail, '', 'Professional')
                    }
                    go(ctaPrimary)
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-background/50">{ctaFootnote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3 text-xl font-semibold tracking-tight text-background"
                >
                  <LogoMark className="bg-background text-foreground" />
                  {brand}
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed">
                  {footerTagline}
                </p>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={handleSubscribe}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    aria-label="Email address for newsletter"
                    required
                    className="rounded-lg border border-background/20 bg-background/10 px-3 py-2 text-sm text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full rounded-full bg-background text-foreground hover:bg-muted"
                  >
                    Subscribe
                  </Button>
                </form>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => go("Twitter")}
                    aria-label="Twitter"
                    className="text-background/70 transition-colors hover:text-background"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go("LinkedIn")}
                    aria-label="LinkedIn"
                    className="text-background/70 transition-colors hover:text-background"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go("GitHub")}
                    aria-label="GitHub"
                    className="text-background/70 transition-colors hover:text-background"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm" role="list">
                    {col.links.map((link) => (
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
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-10 text-sm md:flex-row">
              <p>{footerCopyright}</p>
              <div className="flex gap-6">
                {["Privacy", "Terms", "Cookies", "Security"].map((link) => (
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
