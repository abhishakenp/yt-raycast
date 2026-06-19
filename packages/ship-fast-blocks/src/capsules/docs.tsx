import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
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

/**
 * DocsKimiPage — a complete, self-contained developer DOCUMENTATION / API-reference page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "StackForge Docs" design: a
 * clean, light, content-dense docs site on a neutral canvas with a sticky
 * blurred top navbar, a persistent left sidebar (search box, grouped section
 * navigation, version selector) and a wide reading column. The reading column
 * holds an intro block (status pill + title + dual CTAs — NOT a big hero band),
 * a getting-started quickstart card grid, an installation section with dark
 * code blocks (npm / pip / first API call), a full API reference (GET/POST/
 * DELETE endpoint cards with method badges, param tables and JSON bodies), an
 * authentication section (security callout, bearer-token curl block, live/test
 * key types) and a four-column footer.
 *
 * The block owns ALL layout, spacing, code styling and type hierarchy. Colors
 * map to semantic theme tokens only — neutrals → background/card/muted/border,
 * the dark code surface → foreground/background inversion, the multi-color
 * quickstart icons and HTTP method badges rotate primary/secondary/accent/
 * chart tokens. Every nav item, sidebar link, CTA, endpoint card, footer link,
 * social icon and the search form route through `useNavigate` (never a dead
 * "#"); the navbar labels match the `nav` array so PageSwitch can swap pages.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const DocsKimiPage = defineCapsule({
  name: "DocsKimiPage",
  description:
    "Complete developer DOCUMENTATION / API-reference / developer-portal page with a clean, light, content-dense docs layout: sticky blurred top navbar with search + GitHub, a persistent left sidebar (search box, grouped section navigation — Overview / Core Concepts / SDKs & Tools / Resources — and a version selector), and a wide reading column. The reading column includes an intro block (live status pill, page title, summary, Get Started + API Reference CTAs — no oversized hero), a getting-started quickstart card grid (Node.js / Python / Go / CLI / Webhooks / Errors with colored icon tiles), an installation section with dark syntax-highlighted code blocks (npm, pip, first API call) and copy buttons, a full API reference of endpoint cards (GET / POST / DELETE method badges, monospace routes, query/path parameter tables, JSON request bodies, danger callouts), an authentication section (secure-keys warning, bearer-token curl snippet, live vs test API-key types) and a four-column footer with social links. Use as a docs home, API reference, SDK guide, getting-started, developer portal, knowledge base, or technical-documentation index/detail page for an API platform, SaaS dev tool, library or framework when a structured, sidebar-driven, code-heavy reference is wanted. Supply content only — brand, nav, intro, quickstart, install, apiReference, auth, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar, sidebar context and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Left-sidebar search placeholder + grouped navigation + version options. */
    sidebar: z
      .object({
        searchPlaceholder: z.string().optional(),
        groups: z
          .array(
            z.object({
              title: z.string(),
              items: z.array(z.string()),
            }),
          )
          .optional(),
        versions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Intro block at the top of the reading column (status pill + title + CTAs). */
    intro: z
      .object({
        badge: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** Getting-started quickstart card grid. */
    quickstart: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cards: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              cta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Installation section with code blocks. */
    install: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        npm: z.string().optional(),
        pip: z.string().optional(),
        firstCallHeading: z.string().optional(),
        firstCall: z.string().optional(),
      })
      .optional(),
    /** API reference endpoint cards. */
    apiReference: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        endpoints: z
          .array(
            z.object({
              method: z.string(),
              path: z.string(),
              summary: z.string(),
              description: z.string(),
              /** Parameter table rows (name / type / description). */
              params: z
                .array(
                  z.object({
                    name: z.string(),
                    type: z.string(),
                    description: z.string(),
                  }),
                )
                .optional(),
              paramsLabel: z.string().optional(),
              /** Optional JSON request body shown in a code block. */
              body: z.string().optional(),
              /** Optional danger/confirmation note. */
              note: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Authentication section (callout + bearer block + key types). */
    auth: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        warningTitle: z.string().optional(),
        warningBody: z.string().optional(),
        bearerHeading: z.string().optional(),
        bearerDescription: z.string().optional(),
        bearerCode: z.string().optional(),
        keyTypesHeading: z.string().optional(),
        keyTypes: z
          .array(
            z.object({
              label: z.string(),
              prefix: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      recentItems: table({
        route: string(),
        title: string(),
      }),
      savedTopics: table({
        route: string(),
        title: string(),
      }),
    },
    queries: {
      recentItems: ({ db }) => db.recentItems.orderBy("createdAt").all(),
      savedTopics: ({ db }) => db.savedTopics.orderBy("createdAt").all(),
    },
    mutations: {
      recordVisit: ({ db }, title: string) => {
        const normalizedTitle = title.trim()
        if (!normalizedTitle) return db.recentItems.all()

        const existing = db.recentItems
          .where("title", normalizedTitle)
          .all()[0]

        if (existing) {
          db.recentItems.delete(existing.id)
        }

        db.recentItems.insert({
          title: normalizedTitle,
          route: normalizedTitle,
        })

        return db.recentItems.orderBy("createdAt").all()
      },
      removeRecentItem: ({ db }, id: string) => {
        const item = db.recentItems.get(id)
        if (item) {
          db.recentItems.delete(id)
        }

        return db.recentItems.orderBy("createdAt").all()
      },
      clearRecentItems: ({ db }) => {
        for (const item of db.recentItems.all()) {
          db.recentItems.delete(item.id)
        }

        return []
      },
      saveTopic: ({ db }, title: string) => {
        const normalizedTitle = title.trim()
        if (!normalizedTitle) return db.savedTopics.all()

        const exists = db.savedTopics.where("title", normalizedTitle).all()[0]
        if (!exists) {
          db.savedTopics.insert({
            title: normalizedTitle,
            route: normalizedTitle,
          })
        }

        return db.savedTopics.orderBy("createdAt").all()
      },
      removeSavedTopic: ({ db }, id: string) => {
        const topic = db.savedTopics.get(id)
        if (topic) {
          db.savedTopics.delete(id)
        }

        return db.savedTopics.orderBy("createdAt").all()
      },
      clearSavedTopics: ({ db }) => {
        for (const topic of db.savedTopics.all()) {
          db.savedTopics.delete(topic.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [activityOpen, setActivityOpen] = useState(false)
    const brand = props.brand ?? "StackForge"
    const nav = props.nav?.length
      ? props.nav
      : ["Getting Started", "API Reference", "SDKs", "Changelog"]
    const goToBrand = nav[0]

    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      (isSignedIn &&
        ((auth.user?.displayName || auth.email || auth.user?.sub || nav[0]).trim())) ||
      "Docs"
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const authLabel = auth.isLoading ? "Checking..." : isSignedIn ? "Sign out" : "Sign in"
    const authButtonLabel = isSignedIn ? `Signed in ${authDisplayName}` : "Sign in"

    const recentItems = lakebed.useQuery("recentItems")
    const savedTopics = lakebed.useQuery("savedTopics")
    const recordVisit = lakebed.useMutation("recordVisit")
    const saveTopic = lakebed.useMutation("saveTopic")
    const removeSavedTopic = lakebed.useMutation("removeSavedTopic")
    const clearSavedTopics = lakebed.useMutation("clearSavedTopics")
    const removeRecentItem = lakebed.useMutation("removeRecentItem")
    const clearRecentItems = lakebed.useMutation("clearRecentItems")

    const safeRecentItems = recentItems ?? []
    const safeSavedTopics = savedTopics ?? []

    const trackAndGo = (destination: string) => {
      if (destination.trim()) {
        void recordVisit(destination)
      }
      go(destination)
    }
    const handleSaveAndGo = (destination: string) => {
      if (destination.trim()) {
        void saveTopic(destination)
        void recordVisit(destination)
      }
      setActivityOpen(false)
      go(destination)
    }

    const searchPlaceholder =
      props.sidebar?.searchPlaceholder ?? "Search docs..."
    const sidebarGroups = props.sidebar?.groups?.length
      ? props.sidebar.groups
      : [
          {
            title: "Overview",
            items: ["Introduction", "Quick Start", "Installation"],
          },
          {
            title: "Core Concepts",
            items: [
              "Authentication",
              "Endpoints",
              "Rate Limits",
              "Error Handling",
              "Webhooks",
            ],
          },
          {
            title: "SDKs & Tools",
            items: ["Node.js SDK", "Python SDK", "Go SDK", "CLI Reference"],
          },
          {
            title: "Resources",
            items: ["Changelog", "Community", "Support"],
          },
        ]
    const versions = props.sidebar?.versions?.length
      ? props.sidebar.versions
      : ["v3.2 (Latest)", "v3.1", "v3.0", "v2.9"]

    const introBadge =
      props.intro?.badge ?? "Documentation v3.2 — Updated May 28, 2026"
    const introTitle = props.intro?.title ?? "Build APIs that scale"
    const introDesc =
      props.intro?.description ??
      "StackForge is the complete platform for building, deploying, and managing production-grade APIs. Get from zero to production in minutes, not months."
    const introPrimary = props.intro?.primaryCta ?? "Get Started"
    const introSecondary = props.intro?.secondaryCta ?? "API Reference"

    const quickstartHeading =
      props.quickstart?.heading ?? "Getting Started Cards"
    const quickstartDesc =
      props.quickstart?.description ??
      "Choose your path to integrate StackForge into your application."
    const quickstartCards = props.quickstart?.cards?.length
      ? props.quickstart.cards
      : [
          {
            title: "Node.js Quickstart",
            description:
              "Get up and running with our Node.js SDK in under 5 minutes.",
            cta: "Start building",
          },
          {
            title: "Python Quickstart",
            description:
              "Install the Python SDK and make your first API call today.",
            cta: "Start building",
          },
          {
            title: "Go Quickstart",
            description: "Lightweight and fast. Integrate with our Go SDK.",
            cta: "Start building",
          },
          {
            title: "CLI Reference",
            description:
              "Master the StackForge CLI for deployment and management.",
            cta: "View commands",
          },
          {
            title: "Webhooks Guide",
            description:
              "Configure webhooks to receive real-time event notifications.",
            cta: "Configure webhooks",
          },
          {
            title: "Error Handling",
            description:
              "Understand error codes and implement proper error handling.",
            cta: "View errors",
          },
        ]

    const installHeading = props.install?.heading ?? "Installation"
    const installDesc =
      props.install?.description ??
      "Install the StackForge SDK using your preferred package manager."
    const installNpm =
      props.install?.npm ??
      `# Install via npm
npm install @stackforge/sdk

# Or with yarn
yarn add @stackforge/sdk

# Or with pnpm
pnpm add @stackforge/sdk`
    const installPip =
      props.install?.pip ??
      `# Install via pip
pip install stackforge

# Or with poetry
poetry add stackforge

# Or with pipenv
pipenv install stackforge`
    const firstCallHeading =
      props.install?.firstCallHeading ?? "Make your first API call"
    const firstCall =
      props.install?.firstCall ??
      `// Import the SDK
import { StackForge } from '@stackforge/sdk';

// Initialize with your API key
const sf = new StackForge({
  apiKey: 'sf_live_abc123xyz789',
  environment: 'production'
});

// Create your first resource
const project = await sf.projects.create({
  name: 'My First API',
  region: 'us-east-1',
  plan: 'pro'
});

console.log(\`Project created: \${project.id}\`);`

    const apiHeading = props.apiReference?.heading ?? "API Reference"
    const apiDesc =
      props.apiReference?.description ??
      "Complete reference for all StackForge API endpoints and operations."
    const endpoints = props.apiReference?.endpoints?.length
      ? props.apiReference.endpoints
      : [
          {
            method: "GET",
            path: "/v1/projects",
            summary: "List all projects",
            description:
              "Retrieve a paginated list of all projects in your organization.",
            paramsLabel: "Query Parameters",
            params: [
              {
                name: "limit",
                type: "integer",
                description:
                  "Number of results to return (max 100, default 20)",
              },
              {
                name: "cursor",
                type: "string",
                description: "Pagination cursor for fetching next page",
              },
              {
                name: "status",
                type: "string",
                description: "Filter by status: active, paused, archived",
              },
            ],
          },
          {
            method: "POST",
            path: "/v1/projects",
            summary: "Create a new project",
            description:
              "Create a new API project with the specified configuration.",
            paramsLabel: "Request Body",
            body: `{
  "name": "E-commerce API",
  "description": "Backend API for online store",
  "region": "us-east-1",
  "plan": "pro",
  "settings": {
    "auto_scaling": true,
    "rate_limit": 10000
  }
}`,
          },
          {
            method: "GET",
            path: "/v1/projects/:id",
            summary: "Retrieve a project",
            description: "Get detailed information about a specific project.",
            paramsLabel: "Path Parameters",
            params: [
              {
                name: "id",
                type: "string *",
                description: "Unique project identifier (proj_xxxxx)",
              },
            ],
          },
          {
            method: "DELETE",
            path: "/v1/projects/:id",
            summary: "Delete a project",
            description:
              "Permanently delete a project and all associated resources. This action cannot be undone.",
            note: "Requires confirmation header: X-Confirm-Delete: true",
          },
        ]

    const authHeading = props.auth?.heading ?? "Authentication"
    const authDesc =
      props.auth?.description ??
      "StackForge uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard."
    const authWarningTitle =
      props.auth?.warningTitle ?? "Keep your API keys secure"
    const authWarningBody =
      props.auth?.warningBody ??
      "Do not expose API keys in client-side code or public repositories. Use environment variables to store keys securely."
    const bearerHeading = props.auth?.bearerHeading ?? "Bearer Token"
    const bearerDescription =
      props.auth?.bearerDescription ??
      "Include your API key in the Authorization header of every request:"
    const bearerCode =
      props.auth?.bearerCode ??
      `# Using curl
curl https://api.stackforge.io/v1/projects \\
  -H "Authorization: Bearer sf_live_abc123xyz789"`
    const keyTypesHeading = props.auth?.keyTypesHeading ?? "API Key Types"
    const keyTypes = props.auth?.keyTypes?.length
      ? props.auth.keyTypes
      : [
          {
            label: "Live",
            prefix: "sf_live_...",
            description:
              "Production environment. Full access to all API endpoints.",
          },
          {
            label: "Test",
            prefix: "sf_test_...",
            description: "Sandbox environment. Isolated from production data.",
          },
        ]

    const footerTagline =
      props.footer?.tagline ??
      "The complete platform for building, deploying, and managing production-grade APIs."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog"],
          },
          {
            title: "Developers",
            links: ["Documentation", "API Reference", "SDKs", "Status"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact"],
          },
        ]
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Cookies"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "Discord"]

    // Brand logo tile — neutral square with a stacked-blocks glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-foreground text-background",
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
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </span>
    )

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

    const ArrowRight = () => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const CopyButton = () => (
      <button
        type="button"
        aria-label="Copy to clipboard"
        onClick={() => go(nav[1])}
        className="absolute right-4 top-4 rounded-md p-2 text-background/60 opacity-0 transition-opacity hover:text-background group-hover:opacity-100"
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
          aria-hidden="true"
        >
          <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    )

    // Quickstart card icon tiles rotate token colors (multi-color decorative set).
    const cardIcons: ReactNode[] = [
      // node
      <svg
        key="node"
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
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
        <path d="M12 22V12M3.34 7L12 12l8.66-5" />
      </svg>,
      // python / braces
      <svg
        key="braces"
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
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
        <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
      </svg>,
      // go / bolt
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
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>,
      // cli / terminal
      <svg
        key="terminal"
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
      // webhooks / link
      <svg
        key="webhook"
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
      // errors / alert
      <svg
        key="alert"
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
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>,
    ]

    // Each tile gets a token tint + matching foreground text (rotates, no raw palette).
    const cardTints = [
      "bg-chart-1/10 text-chart-1 group-hover:bg-chart-1/20",
      "bg-chart-2/10 text-chart-2 group-hover:bg-chart-2/20",
      "bg-chart-3/10 text-chart-3 group-hover:bg-chart-3/20",
      "bg-muted text-foreground group-hover:bg-accent",
      "bg-chart-4/10 text-chart-4 group-hover:bg-chart-4/20",
      "bg-chart-5/10 text-chart-5 group-hover:bg-chart-5/20",
    ]

    // HTTP method badge styling per method (token-only).
    const methodBadge = (method: string) => {
      const m = method.toUpperCase()
      if (m === "POST") return "bg-chart-2/15 text-chart-2"
      if (m === "DELETE") return "bg-destructive/15 text-destructive"
      if (m === "PUT" || m === "PATCH") return "bg-chart-4/15 text-chart-4"
      return "bg-chart-1/15 text-chart-1" // GET (and default)
    }

    const socialIcon = (name: string) => {
      const n = name.toLowerCase()
      if (n.includes("git")) {
        return (
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        )
      }
      if (n.includes("discord")) {
        return (
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6521-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0025-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
        )
      }
      // twitter / x default
      return (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      )
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <LogoMark className="size-8" />
                <span className="text-lg font-semibold text-foreground">
                  {brand}
                </span>
                <span className="mx-1 text-muted-foreground/60">/</span>
                <span className="text-muted-foreground">Docs</span>
              </button>

              <div className="hidden items-center gap-6 md:flex">
                <nav className="flex items-center gap-6 text-sm">
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Search documentation"
                    onClick={() => go(nav[0])}
                    className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SearchIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="GitHub repository"
                    onClick={() => go(footerSocials.find((s) => s.toLowerCase().includes("git")) ?? nav[0])}
                    className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {socialIcon("github")}
                    </svg>
                  </button>
                </div>
              </div>

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
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
            <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
              {/* Search */}
              <form
                className="mb-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nav[0])
                }}
              >
                <label htmlFor="docs-sidebar-search" className="sr-only">
                  Search documentation
                </label>
                <div className="relative">
                  <input
                    type="search"
                    id="docs-sidebar-search"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </form>

              {/* Navigation groups */}
              <nav className="space-y-6" aria-label="Sidebar navigation">
                {sidebarGroups.map((group, gi) => (
                  <div key={group.title}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </h3>
                    <ul className="space-y-1">
                      {group.items.map((item, ii) => {
                        const active = gi === 0 && ii === 0
                        return (
                          <li key={item}>
                            <button
                              type="button"
                              onClick={() => go(item)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                active
                                  ? "bg-muted font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                              )}
                            >
                              {item}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              {/* Version selector */}
              <div className="mt-8 border-t border-border pt-6">
                <label htmlFor="docs-version" className="sr-only">
                  Documentation version
                </label>
                <select
                  id="docs-version"
                  className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {versions.map((v) => (
                    <option key={v} className="bg-background">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main reading column */}
          <main className="min-w-0 flex-1">
            {/* Intro (not a big hero band) */}
            <section className="border-b border-border px-6 py-12 lg:px-12 lg:py-16">
              <div className="max-w-3xl">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-2" />
                  {introBadge}
                </span>
                <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {introTitle}
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {introDesc}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(introPrimary)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {introPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(introSecondary)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-card-foreground transition-colors hover:bg-muted"
                  >
                    {introSecondary}
                  </button>
                </div>
              </div>
            </section>

            {/* Quickstart cards */}
            <section className="px-6 py-12 lg:px-12 lg:py-16">
              <div className="mb-12 max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                  {quickstartHeading}
                </h2>
                <p className="text-muted-foreground">{quickstartDesc}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {quickstartCards.map((card, i) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => go(card.title)}
                    className="group block rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-border hover:shadow-sm"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl transition-colors",
                        cardTints[i % cardTints.length],
                      )}
                    >
                      {cardIcons[i % cardIcons.length]}
                    </div>
                    <h3 className="mb-2 font-semibold text-card-foreground">
                      {card.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {card.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-foreground transition-transform group-hover:translate-x-1">
                      {card.cta}
                      <ChevronRight className="ml-1 size-4" />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Installation / code blocks */}
            <section className="border-y border-border bg-card px-6 py-12 lg:px-12 lg:py-16">
              <div className="mb-8 max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                  {installHeading}
                </h2>
                <p className="text-muted-foreground">{installDesc}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      npm
                    </span>
                  </div>
                  <div className="group relative">
                    <pre className="overflow-x-auto rounded-xl bg-foreground p-5 text-sm leading-relaxed text-background">
                      <code>{installNpm}</code>
                    </pre>
                    <CopyButton />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      pip
                    </span>
                  </div>
                  <div className="group relative">
                    <pre className="overflow-x-auto rounded-xl bg-foreground p-5 text-sm leading-relaxed text-background">
                      <code>{installPip}</code>
                    </pre>
                    <CopyButton />
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    {firstCallHeading}
                  </h3>
                  <div className="group relative">
                    <pre className="overflow-x-auto rounded-xl bg-foreground p-5 text-sm leading-relaxed text-background">
                      <code>{firstCall}</code>
                    </pre>
                    <CopyButton />
                  </div>
                </div>
              </div>
            </section>

            {/* API reference */}
            <section className="px-6 py-12 lg:px-12 lg:py-16">
              <div className="mb-12 max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                  {apiHeading}
                </h2>
                <p className="text-muted-foreground">{apiDesc}</p>
              </div>

              <div className="space-y-6">
                {endpoints.map((ep) => (
                  <div
                    key={`${ep.method}-${ep.path}-${ep.summary}`}
                    className="overflow-hidden rounded-xl border border-border"
                  >
                    <button
                      type="button"
                      onClick={() => go(ep.summary)}
                      className="flex w-full items-center gap-4 border-b border-border bg-muted/50 px-5 py-4 text-left transition-colors hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "rounded px-2 py-1 text-xs font-semibold",
                          methodBadge(ep.method),
                        )}
                      >
                        {ep.method}
                      </span>
                      <code className="font-mono text-sm text-foreground">
                        {ep.path}
                      </code>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {ep.summary}
                      </span>
                    </button>
                    <div className="p-5">
                      <p className="mb-4 text-sm text-muted-foreground">
                        {ep.description}
                      </p>

                      {ep.params?.length ? (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase text-muted-foreground">
                            {ep.paramsLabel ?? "Parameters"}
                          </div>
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-border">
                              {ep.params.map((p) => (
                                <tr key={p.name}>
                                  <td className="py-2 pr-4 font-mono text-foreground">
                                    {p.name.includes("*") ? (
                                      <>
                                        {p.name.replace("*", "").trim()}{" "}
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      </>
                                    ) : (
                                      p.name
                                    )}
                                  </td>
                                  <td className="py-2 pr-4 text-muted-foreground">
                                    {p.type.includes("*") ? (
                                      <>
                                        {p.type.replace("*", "").trim()}{" "}
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      </>
                                    ) : (
                                      p.type
                                    )}
                                  </td>
                                  <td className="py-2 text-muted-foreground">
                                    {p.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}

                      {ep.body ? (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase text-muted-foreground">
                            {ep.paramsLabel ?? "Request Body"}
                          </div>
                          <div className="group relative">
                            <pre className="overflow-x-auto rounded-lg bg-foreground p-4 text-xs leading-relaxed text-background">
                              <code>{ep.body}</code>
                            </pre>
                          </div>
                        </div>
                      ) : null}

                      {ep.note ? (
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="size-4 shrink-0 text-chart-4"
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
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-muted-foreground">
                            {ep.note}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Authentication */}
            <section className="border-y border-border bg-card px-6 py-12 lg:px-12 lg:py-16">
              <div className="mb-8 max-w-3xl">
                <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                  {authHeading}
                </h2>
                <p className="text-muted-foreground">{authDesc}</p>
              </div>

              <div className="max-w-3xl space-y-6">
                <div className="rounded-xl border border-chart-4/40 bg-chart-4/10 p-5">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-chart-4"
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
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <h3 className="mb-1 font-semibold text-foreground">
                        {authWarningTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {authWarningBody}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-foreground">
                    {bearerHeading}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {bearerDescription}
                  </p>
                  <div className="group relative">
                    <pre className="overflow-x-auto rounded-xl bg-foreground p-5 text-sm leading-relaxed text-background">
                      <code>{bearerCode}</code>
                    </pre>
                    <CopyButton />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-foreground">
                    {keyTypesHeading}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {keyTypes.map((kt, i) => (
                      <div
                        key={kt.label}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-xs font-medium",
                              i === 0
                                ? "bg-chart-2/15 text-chart-2"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {kt.label}
                          </span>
                          <span className="font-mono text-sm text-foreground">
                            {kt.prefix}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {kt.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border px-6 py-12 lg:px-12">
              <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <button
                    type="button"
                    onClick={() => go(nav[0])}
                    className="mb-4 flex items-center gap-2"
                  >
                    <LogoMark className="size-6" />
                    <span className="font-semibold text-foreground">
                      {brand}
                    </span>
                  </button>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {footerTagline}
                  </p>
                  <div className="flex items-center gap-4">
                    {footerSocials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
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

                {footerColumns.map((col) => (
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
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} {brand}, Inc. {footerNote}
                </p>
                <div className="flex items-center gap-6 text-sm">
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
            </footer>
          </main>
        </div>
      </div>
    )
  },
})
