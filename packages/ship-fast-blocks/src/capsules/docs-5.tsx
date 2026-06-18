import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
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
 * DocsKimiPage5 — a pastel multi-accent developer DOCUMENTATION / knowledge-base page.
 *
 * The fifth style variant in the docs family: a warm, approachable docs layout with
 * mint-wash page background, sticky blurred top navbar with brand-gradient logo tile,
 * a persistent left sidebar with grouped pastel-highlighted navigation, a prominent
 * search-hero band with popular-term pills, a colorful six-card category grid (Quick Start,
 * API Reference, Guides, CLI Tools, Community, Support — each with a distinct accent
 * tile), a step-by-step quick-start guide with dark syntax-highlighted code blocks
 * (install, configure API key, start dev server, first SDK call), an FAQ accordion with
 * colored expand icons, a gradient CTA band, and a five-column social footer.
 *
 * Use when a fresh, friendly, slightly playful docs aesthetic is desired — different
 * from DocsKimiPage's clinical API-reference style and the more serious dark-mode
 * variants. Ideal for developer-tooling startups, SaaS docs, SDK guides, or any product
 * that wants a colorful technical documentation experience. Call with just brand + nav
 * (positional); rich defaults render fully on zero args.
 */
export const DocsKimiPage5 = defineCapsule({
  name: "DocsKimiPage5",
  description:
    "Pastel multi-accent developer DOCUMENTATION / knowledge-base / developer-portal page — the fifth style sibling to DocsKimiPage. Features a sticky blurred top navbar with brand-gradient logo tile, a persistent left sidebar with grouped pastel-highlighted section navigation (Getting Started, Core Concepts, API Reference, Resources), a prominent search-hero band with popular-term pills, a colorful six-card category grid (Quick Start, API Reference, Guides, CLI Tools, Community, Support each with distinct accent-colored icon tiles), a step-by-step quick-start guide with dark syntax-highlighted code blocks (CLI install, env configuration, dev server, first SDK API call), a language-tabbed code example, an FAQ accordion with colored expand icons, a gradient CTA banner, and a five-column social footer. Use for developer-tooling startups, SaaS documentation, SDK guides, API reference, getting-started pages, or any product wanting a fresh, friendly, colorful technical documentation experience that stands apart from the more formal DocsKimiPage layout. Supply brand, nav labels, and optional content slots for search, sidebar, cards, guide, FAQ, CTA, and footer — the block owns all layout, spacing, and token-driven multi-color rotation.",
  props: z.object({
    /** Brand / product name shown in the navbar, sidebar context, and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Search hero section content. */
    search: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        placeholder: z.string().optional(),
        popularTerms: z.array(z.string()).optional(),
      })
      .optional(),
    /** Left sidebar grouped navigation labels. */
    sidebarGroups: z
      .array(
        z.object({
          title: z.string(),
          items: z.array(z.string()),
        }),
      )
      .optional(),
    /** Six category cards above the guide. */
    categoryCards: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          cta: z.string(),
        }),
      )
      .optional(),
    /** Quick-start guide with numbered steps + code blocks. */
    guide: z
      .object({
        badge: z.string().optional(),
        badgeDate: z.string().optional(),
        title: z.string().optional(),
        intro: z.string().optional(),
        steps: z
          .array(
            z.object({
              number: z.number(),
              heading: z.string(),
              body: z.string().optional(),
              codeBlock: z.string().optional(),
              codeLabel: z.string().optional(),
              isEnvFile: z.boolean().optional(),
              codeTabs: z.array(z.string()).optional(),
            }),
          )
          .optional(),
        nextStepsTitle: z.string().optional(),
        nextStepsBody: z.string().optional(),
        nextStepsLinks: z.array(z.string()).optional(),
      })
      .optional(),
    /** FAQ accordion items. */
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    /** CTA banner content. */
    cta: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
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
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      bookmarks: table({
        title: string(),
        section: string(),
        url: string(),
      }),
      searchHistory: table({
        query: string(),
      }),
    },
    queries: {
      bookmarks: ({ db }) => db.bookmarks.orderBy('createdAt').all(),
      searchHistory: ({ db }) => db.searchHistory.orderBy('createdAt').all(),
    },
    mutations: {
      addBookmark: ({ db }, title: string, section: string, url: string) => {
        const existing = db.bookmarks.where('title', title).all()[0]
        if (existing) return db.bookmarks.all()

        db.bookmarks.insert({ title, section, url })
        return db.bookmarks.all()
      },
      removeBookmark: ({ db }, title: string) => {
        for (const item of db.bookmarks.where('title', title).all()) {
          db.bookmarks.delete(item.id)
        }
        return db.bookmarks.all()
      },
      addSearchHistory: ({ db }, query: string) => {
        db.searchHistory.insert({ query })
        return db.searchHistory.all()
      },
      clearSearchHistory: ({ db }) => {
        for (const item of db.searchHistory.all()) {
          db.searchHistory.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [bookmarksOpen, setBookmarksOpen] = useState(false)
    const brand = props.brand ?? "DevKit"

    const bookmarks = lakebed.useQuery('bookmarks')
    const searchHistory = lakebed.useQuery('searchHistory')
    const addBookmark = lakebed.useMutation('addBookmark')
    const removeBookmark = lakebed.useMutation('removeBookmark')
    const addSearchHistory = lakebed.useMutation('addSearchHistory')
    const clearSearchHistory = lakebed.useMutation('clearSearchHistory')
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

    const bookmarkCount = bookmarks?.length ?? 0
    const nav = props.nav?.length
      ? props.nav
      : ["Documentation", "API Reference", "Guides", "Community"]

    const searchTitle = props.search?.title ?? "How can we help you?"
    const searchSubtitle =
      props.search?.subtitle ??
      "Search documentation, guides, and API references"
    const searchPlaceholder =
      props.search?.placeholder ?? "Search docs, APIs, guides..."
    const popularTerms = props.search?.popularTerms?.length
      ? props.search.popularTerms
      : ["Authentication", "React SDK", "Webhooks", "Deployment"]

    const sidebarGroups = props.sidebarGroups?.length
      ? props.sidebarGroups
      : [
          {
            title: "Getting Started",
            items: ["Introduction", "Quick Start", "Installation", "Configuration"],
          },
          {
            title: "Core Concepts",
            items: [
              "Architecture",
              "Components",
              "State Management",
              "Routing",
            ],
          },
          {
            title: "API Reference",
            items: ["REST API", "GraphQL", "Webhooks", "Authentication"],
          },
          {
            title: "Resources",
            items: ["CLI Reference", "Changelog", "GitHub"],
          },
        ]

    const categoryCards = props.categoryCards?.length
      ? props.categoryCards
      : [
          {
            title: "Quick Start",
            description:
              "Get up and running in under 5 minutes with our step-by-step setup guide.",
            cta: "Start building",
          },
          {
            title: "API Reference",
            description:
              "Complete REST and GraphQL API documentation with live examples.",
            cta: "Explore APIs",
          },
          {
            title: "Guides",
            description:
              "Step-by-step tutorials for common use cases and integrations.",
            cta: "View guides",
          },
          {
            title: "CLI Tools",
            description:
              "Command-line interface documentation and automation scripts.",
            cta: "CLI docs",
          },
          {
            title: "Community",
            description:
              "Join our Discord, browse the forum, and connect with other developers.",
            cta: "Join community",
          },
          {
            title: "Support",
            description:
              "Get help from our team, report bugs, and submit feature requests.",
            cta: "Get help",
          },
        ]

    const guideData = {
      badge: props.guide?.badge ?? "New in v3.2",
      badgeDate: props.guide?.badgeDate ?? "Released May 28, 2026",
      title: props.guide?.title ?? "Quick Start Guide",
      intro:
        props.guide?.intro ??
        "Get your first DevKit application running in under 5 minutes. This guide walks you through installation, configuration, and your first API call.",
      steps: props.guide?.steps?.length
        ? props.guide.steps
        : [
            {
              number: 1,
              heading: "Install the CLI",
              body: "Install the DevKit CLI globally using npm or your preferred package manager. The CLI provides scaffolding, local development server, and deployment tools.",
              codeBlock: `# Install DevKit CLI globally
npm install -g @devkit/cli

# Verify installation
devkit --version
# Output: DevKit CLI v3.2.1

# Create a new project
devkit create my-app --template react
cd my-app`,
              codeLabel: "terminal",
            },
            {
              number: 2,
              heading: "Configure your API key",
              body: "Create a \`.env.local\` file in your project root and add your DevKit API key. Get your key from the dashboard.",
              codeBlock: `# DevKit API Configuration
DEVKIT_API_KEY=dk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEVKIT_REGION=us-east-1`,
              codeLabel: ".env.local",
              isEnvFile: true,
            },
            {
              number: 3,
              heading: "Start the development server",
              body: "Run the development server with hot module replacement. The CLI will automatically detect your framework and start the appropriate server.",
              codeBlock: `# Start development server
devkit dev

# Output:
# ╔══════════════════════════════════════════╗
# ║  DevKit Dev Server v3.2.1                ║
# ║  Ready on http://localhost:3000          ║
# ║  HMR Enabled                             ║
# ╚══════════════════════════════════════════╝`,
              codeLabel: "terminal",
            },
            {
              number: 4,
              heading: "Make your first API call",
              body: "Use the DevKit JavaScript SDK to make your first authenticated API request. The SDK handles retries, caching, and error handling automatically.",
              codeBlock: `// Import the DevKit SDK
import { DevKit } from '@devkit/sdk';

// Initialize with your API key
const dk = new DevKit({
  apiKey: process.env.DEVKIT_API_KEY
});

// Create a new project
const project = await dk.projects.create({
  name: 'My First Project',
  description: 'Built with DevKit'
});

console.log(\`Created project: \${project.id}\`);`,
              codeLabel: "JavaScript",
              codeTabs: ["JavaScript", "TypeScript", "Python", "cURL"],
            },
          ],
      nextStepsTitle: props.guide?.nextStepsTitle ?? "Next Steps",
      nextStepsBody:
        props.guide?.nextStepsBody ??
        "Now that you have your first project running, explore our guides to add authentication, database connections, and deployment configurations.",
      nextStepsLinks: props.guide?.nextStepsLinks?.length
        ? props.guide.nextStepsLinks
        : ["Add Authentication", "Connect Database", "Deploy to Production"],
    }

    const faqItems = props.faq?.length
      ? props.faq
      : [
          {
            question: "What's included in the free tier?",
            answer:
              "The free tier includes up to 10,000 API requests per month, 5 projects, 3 team members, and community support. Perfect for side projects and learning DevKit.",
          },
          {
            question: "Can I self-host DevKit?",
            answer:
              "Yes, Enterprise customers can self-host DevKit on their own infrastructure. We provide Docker images, Kubernetes manifests, and Terraform modules for easy deployment.",
          },
          {
            question: "What frameworks are supported?",
            answer:
              "DevKit supports React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, and vanilla JavaScript. Our SDKs are also available for Python, Go, Ruby, and PHP.",
          },
          {
            question: "How do I report a bug or request a feature?",
            answer:
              "Report bugs through our GitHub Issues or contact support@devkit.io. For feature requests, use our public roadmap on Canny where the community can vote on ideas.",
          },
        ]

    const ctaData = {
      title: props.cta?.title ?? "Ready to start building?",
      subtitle:
        props.cta?.subtitle ??
        "Join 50,000+ developers who use DevKit to ship faster. Start free, upgrade when you need more.",
      primaryCta: props.cta?.primaryCta ?? "Get Started Free",
      secondaryCta: props.cta?.secondaryCta ?? "View Documentation",
      note: props.cta?.note ?? "No credit card required. 14-day free trial of Pro features.",
    }

    const footerData = {
      tagline:
        props.footer?.tagline ??
        "The developer platform that helps you build, deploy, and scale applications faster.",
      columns: props.footer?.columns?.length
        ? props.footer.columns
        : [
            {
              title: "Product",
              links: [
                "Documentation",
                "API Reference",
                "CLI Tools",
                "Pricing",
                "Changelog",
              ],
            },
            {
              title: "Resources",
              links: [
                "Community",
                "Support",
                "Status",
                "Partners",
                "Templates",
              ],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact", "Privacy"],
            },
          ],
      legal: props.footer?.legal?.length
        ? props.footer.legal
        : ["Terms", "Privacy", "Cookies"],
      socials: props.footer?.socials?.length
        ? props.footer.socials
        : ["GitHub", "Twitter", "Discord"],
      copyright: props.footer?.copyright ?? "DevKit Inc. All rights reserved.",
    }

    // ── Accent rotations using semantic tokens ──────────────────────────
    const cardTint = [
      "bg-primary/10 text-primary group-hover:bg-primary/20",
      "bg-secondary/10 text-secondary group-hover:bg-secondary/20",
      "bg-accent/10 text-accent group-hover:bg-accent/20",
      "bg-chart-1/10 text-chart-1 group-hover:bg-chart-1/20",
      "bg-chart-2/10 text-chart-2 group-hover:bg-chart-2/20",
      "bg-chart-3/10 text-chart-3 group-hover:bg-chart-3/20",
    ]

    const cardHovers = [
      "hover:border-primary/20",
      "hover:border-secondary/20",
      "hover:border-accent/20",
      "hover:border-chart-1/20",
      "hover:border-chart-2/20",
      "hover:border-chart-3/20",
    ]

    const stepTint = [
      "bg-primary/10 text-primary",
      "bg-secondary/10 text-secondary",
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
    ]

    const faqTint = [
      "bg-primary/10 text-primary",
      "bg-secondary/10 text-secondary",
      "bg-chart-1/10 text-chart-1",
      "bg-accent/10 text-accent",
    ]

    // ── Inline SVG icons ────────────────────────────────────────────────
    const cardIcons: ReactNode[] = [
      // Quick Start – lightning bolt
      <svg
        key="0"
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // API Reference – document
      <svg
        key="1"
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
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // Guides – book
      <svg
        key="2"
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
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // CLI Tools – terminal
      <svg
        key="3"
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
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // Community – users
      <svg
        key="4"
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
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // Support – life preserver
      <svg
        key="5"
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
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
    ]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </span>
    )

    const socialIcon = (name: string) => {
      const n = name.toLowerCase()
      if (n.includes("git")) {
        return (
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        )
      }
      if (n.includes("discord")) {
        return (
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        )
      }
      // Twitter / X
      return (
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      )
    }

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )

    const ChevronRight = ({ className }: { className?: string }) => (
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
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const CopyIcon = ({ className }: { className?: string }) => (
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
        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn('size-5', active ? 'text-primary' : 'text-muted-foreground')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
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

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* ── Navbar ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              {/* Brand */}
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <LogoMark className="size-10" />
                <span className="text-xl font-bold text-foreground">
                  {brand}
                </span>
                <span className="hidden rounded-full bg-chart-2/15 px-2 py-0.5 text-xs font-medium text-chart-2 sm:block">
                  v3.2.1
                </span>
              </button>

              {/* Desktop nav */}
              <div className="hidden items-center gap-6 md:flex">
                <nav className="flex items-center gap-6">
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <div className="flex items-center gap-3">
                  {/* Bookmarks */}
                  <Sheet open={bookmarksOpen} onOpenChange={setBookmarksOpen}>
                    <SheetTrigger asChild>
                      <button
                        type="button"
                        aria-label="Bookmarks"
                        className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <BookmarkIcon />
                        {bookmarkCount > 0 ? (
                          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                            {bookmarkCount}
                          </span>
                        ) : null}
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-full gap-0 p-0 sm:max-w-md"
                    >
                      <SheetHeader className="border-b border-border p-6">
                        <SheetTitle className="text-xl">Bookmarks</SheetTitle>
                        <SheetDescription>
                          {bookmarkCount > 0
                            ? `${bookmarkCount} bookmark${bookmarkCount === 1 ? '' : 's'} saved.`
                            : 'No bookmarks yet.'}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto px-6 py-5">
                        {bookmarks && bookmarks.length > 0 ? (
                          <div className="space-y-4">
                            {bookmarks.map((bookmark) => (
                              <div
                                key={bookmark.id}
                                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {bookmark.section}
                                  </p>
                                  <h3 className="font-semibold text-foreground">
                                    {bookmark.title}
                                  </h3>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void removeBookmark(bookmark.title)}
                                  aria-label={`Remove ${bookmark.title} from bookmarks`}
                                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
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
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                            <p className="text-base font-semibold text-foreground">
                              No bookmarks saved
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Bookmark pages to quickly access them later.
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

                  {/* Account */}
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
                          <ChevronDown className="size-4" />
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
                    onClick={() => go("Get Started")}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* Mobile menu */}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
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
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto py-8 pr-4 lg:block">
            <nav className="space-y-8" aria-label="Sidebar navigation">
              {sidebarGroups.map((group, gi) => (
                <div key={group.title}>
                  <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item, ii) => {
                      const active = gi === 0 && ii === 0
                      const isBookmarked = bookmarks?.some(
                        (b) => b.title === item,
                      )
                      return (
                        <li key={item}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => go(item)}
                              className={cn(
                                "block flex-1 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-primary",
                              )}
                            >
                              {item}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isBookmarked) {
                                  void removeBookmark(item)
                                } else {
                                  void addBookmark(item, group.title, item)
                                }
                              }}
                              aria-label={
                                isBookmarked
                                  ? `Remove ${item} from bookmarks`
                                  : `Add ${item} to bookmarks`
                              }
                              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary"
                            >
                              <BookmarkIcon active={isBookmarked} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* ── Main ────────────────────────────────────────────────── */}
          <main className="min-w-0 flex-1">

            {/* Search Section */}
            <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
              <div className="mx-auto mb-8 max-w-3xl text-center">
                <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {searchTitle}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {searchSubtitle}
                </p>
              </div>
              <div className="relative mx-auto max-w-2xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <SearchIcon className="size-5 text-muted-foreground" />
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const query = formData.get('search') as string
                    if (query) {
                      void addSearchHistory(query)
                      go(query)
                    }
                  }}
                >
                  <input
                    type="search"
                    name="search"
                    placeholder={searchPlaceholder}
                    aria-label="Search documentation"
                    className="w-full rounded-3xl border-2 border-border bg-card py-4 pl-12 pr-4 text-foreground placeholder-muted-foreground shadow-lg transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </form>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <kbd className="hidden rounded-lg border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-block">
                    ⌘K
                  </kbd>
                </div>
              </div>
              <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {popularTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => go(term)}
                    className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
                {searchHistory && searchHistory.length > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground ml-2">Recent:</span>
                    {searchHistory.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => go(item.query)}
                        className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {item.query}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </section>

            {/* Category Cards */}
            <section className="px-4 pb-12 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryCards.map((card, i) => {
                  const isBookmarked = bookmarks?.some(
                    (b) => b.title === card.title,
                  )
                  return (
                    <div
                      key={card.title}
                      className={cn(
                        "group relative rounded-3xl border-2 border-border bg-card p-6 text-left transition-all shadow-lg hover:shadow-xl",
                        cardHovers[i % cardHovers.length],
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => go(card.title)}
                        className="absolute inset-0 z-0"
                      />
                      <div
                        className={cn(
                          "mb-4 grid size-12 place-items-center rounded-2xl",
                          cardTint[i % cardTint.length],
                        )}
                      >
                        {cardIcons[i % cardIcons.length]}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {card.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {card.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
                          {card.cta}
                          <ChevronRight className="ml-1 size-4" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isBookmarked) {
                              void removeBookmark(card.title)
                            } else {
                              void addBookmark(card.title, 'Categories', card.title)
                            }
                          }}
                          aria-label={
                            isBookmarked
                              ? `Remove ${card.title} from bookmarks`
                              : `Add ${card.title} to bookmarks`
                          }
                          className="relative z-10 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <BookmarkIcon active={isBookmarked} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Quick Start Guide */}
            <section className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                    {guideData.badge}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {guideData.badgeDate}
                  </span>
                </div>
                <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
                  {guideData.title}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {guideData.intro}
                </p>

                <div className="space-y-8">
                  {guideData.steps.map((step, si) => (
                    <div key={step.number}>
                      <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold text-foreground">
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            stepTint[si % stepTint.length],
                          )}
                        >
                          {step.number}
                        </span>
                        {step.heading}
                      </h3>
                      {step.body && (
                        <p className="mb-4 text-muted-foreground">{step.body}</p>
                      )}
                      {step.codeBlock && (
                        <div className="overflow-hidden rounded-2xl bg-foreground shadow-xl">
                          {/* Code header */}
                          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="size-3 rounded-full bg-destructive" />
                              <div className="size-3 rounded-full bg-chart-2" />
                              <div className="size-3 rounded-full bg-chart-1" />
                            </div>
                            <div className="flex items-center gap-2">
                              {step.codeTabs && step.codeTabs.length > 0 ? (
                                <div className="flex items-center gap-4">
                                  {step.codeTabs.map((tab) => (
                                    <button
                                      key={tab}
                                      type="button"
                                      onClick={() => go(tab)}
                                      className={cn(
                                        "text-sm font-medium transition-colors",
                                        tab === step.codeLabel
                                          ? "text-background"
                                          : "text-muted-foreground hover:text-background",
                                      )}
                                    >
                                      {tab}
                                    </button>
                                  ))}
                                </div>
                              ) : step.isEnvFile ? (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {step.codeLabel}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {step.codeLabel}
                                </span>
                              )}
                              <button
                                type="button"
                                aria-label="Copy code"
                                onClick={() => go("Copy")}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-background"
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </div>
                          {/* Code body */}
                          <div className="overflow-x-auto p-4 sm:p-6">
                            <pre className="text-sm font-mono leading-relaxed">
                              <code className="text-background">
                                {step.codeBlock}
                              </code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Next Steps callout */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                          aria-hidden="true"
                        >
                          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-foreground">
                          {guideData.nextStepsTitle}
                        </h4>
                        <p className="mb-4 text-muted-foreground">
                          {guideData.nextStepsBody}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {guideData.nextStepsLinks.map((link) => {
                            const isBookmarked = bookmarks?.some(
                              (b) => b.title === link,
                            )
                            return (
                              <div
                                key={link}
                                className="flex items-center gap-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => go(link)}
                                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/20"
                                >
                                  {link}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isBookmarked) {
                                      void removeBookmark(link)
                                    } else {
                                      void addBookmark(link, 'Next Steps', link)
                                    }
                                  }}
                                  aria-label={
                                    isBookmarked
                                      ? `Remove ${link} from bookmarks`
                                      : `Add ${link} to bookmarks`
                                  }
                                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary"
                                >
                                  <BookmarkIcon active={isBookmarked} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqItems.map((item, fi) => (
                    <details
                      key={item.question}
                      className="group overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted/60">
                        <span className="pr-4 font-semibold text-foreground">
                          {item.question}
                        </span>
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full transition-transform group-open:rotate-180",
                            faqTint[fi % faqTint.length],
                          )}
                        >
                          <ChevronDown className="size-5" />
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-muted-foreground">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-center sm:p-12">
                <h2 className="mb-4 text-2xl font-bold text-primary-foreground sm:text-3xl">
                  {ctaData.title}
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/90">
                  {ctaData.subtitle}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaData.primaryCta)}
                    className="w-full rounded-2xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                  >
                    {ctaData.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaData.secondaryCta)}
                    className="w-full rounded-2xl border-2 border-background/30 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-background/10 sm:w-auto"
                  >
                    {ctaData.secondaryCta}
                  </button>
                </div>
                <p className="mt-6 text-sm text-primary-foreground/70">
                  {ctaData.note}
                </p>
              </div>
            </section>
          </main>
        </div>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-3"
                >
                  <LogoMark className="size-8 rounded-xl" />
                  <span className="text-lg font-bold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-sm text-muted-foreground">
                  {footerData.tagline}
                </p>
                <div className="flex items-center gap-3">
                  {footerData.socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
                        social.toLowerCase().includes("git")
                          ? "hover:bg-primary/10 hover:text-primary"
                          : social.toLowerCase().includes("twitter") ||
                              social.toLowerCase().includes("x")
                            ? "hover:bg-accent/10 hover:text-accent"
                            : "hover:bg-secondary/10 hover:text-secondary",
                      )}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        {socialIcon(social)}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerData.columns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © 2026 {footerData.copyright}
              </p>
              <div className="flex items-center gap-6 text-sm">
                {footerData.legal.map((link) => (
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
